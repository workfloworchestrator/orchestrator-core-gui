/*
 * Copyright 2019-2022 SURF.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import "stylesheets/buttons.scss";

import { EuiFlexGroup, EuiFlexItem, EuiPanel } from "@elastic/eui";
import AdvancedSearch from "components/tables/AdvancedSearch";
import MiniPaginator from "components/tables/MiniPaginator";
import { nwaTableStyling } from "components/tables/NwaTableStyling";
import Paginator from "components/tables/Paginator";
import Preferences from "components/tables/Preferences";
import { TableRenderer } from "components/tables/TableRenderer";
import useFilterableDataFetcher from "components/tables/useFilterableDataFetcher";
import RunningProcessesContext from "contextProviders/runningProcessesProvider";
import { produce } from "immer";
import { useContext, useEffect } from "react";
import { FormattedMessage } from "react-intl";
import {
    Column,
    Hooks,
    LocalTableSettings,
    Row,
    RowPropGetter,
    SessionTableSettings,
    TableSettings,
    TableState,
    useExpanded,
    useFilters,
    usePagination,
    useSortBy,
    useTable,
} from "react-table";
import useHttpIntervalFallback from "utils/useHttpIntervalFallback";

/*
 * Reusable NWA table implementation using react-table 7.
 *
 */

export enum ActionType {
    OVERRIDE = "override",
    FILTER_ADD = "filter/add",
    FILTER_REMOVE = "filter/remove",
    FILTER_REPLACE = "filter/replace",
    FILTER_CLEAR = "filter/clear",
    LOADING_START = "loading/start",
    LOADING_STOP = "loading/stop",
    REFRESH_TOGGLE = "refresh/toggle",
    REFRESH_ENABLE = "refresh/enable",
    REFRESH_DISABLE = "refresh/disable",
    REFRESH_DELAY = "refresh/delay",
    SHOW_SETTINGS_TOGGLE = "show-settings/toggle",
    SHOW_PAGINATOR_TOGGLE = "show-paginator/toggle",
    MINIMIZE = "table/minimize",
    MAXIMIZE = "table/maximize",
}

export type TableSettingsAction<T extends object> =
    | { type: ActionType.FILTER_ADD; id: string; value: string }
    | { type: ActionType.FILTER_CLEAR; id: string }
    | { type: ActionType.FILTER_REMOVE; id: string; value: string }
    | { type: ActionType.FILTER_REPLACE; id: string; values: string[] }
    | { type: ActionType.LOADING_START }
    | { type: ActionType.LOADING_STOP }
    | { type: ActionType.OVERRIDE; settings: Partial<TableSettings<T>> }
    | { type: ActionType.REFRESH_DELAY; delay: number }
    | { type: ActionType.REFRESH_DISABLE }
    | { type: ActionType.REFRESH_ENABLE }
    | { type: ActionType.REFRESH_TOGGLE }
    | { type: ActionType.SHOW_SETTINGS_TOGGLE }
    | { type: ActionType.SHOW_PAGINATOR_TOGGLE }
    | { type: ActionType.MINIMIZE }
    | { type: ActionType.MAXIMIZE };

/* this type guard makes it possible to differentiate between the settings meant for localStorage
 * vs. the session and URL. It only checks for hiddenColumns, but as all invocations of persistSettings are type safe
 * this is enough.
 */
export function isLocalTableSettings<T>(
    settings: LocalTableSettings<T> | SessionTableSettings
): settings is LocalTableSettings<T> {
    return (settings as LocalTableSettings<T>).hiddenColumns !== undefined;
}

export function tableSettingsReducer<T extends object>(
    newState: TableState<T>,
    action: TableSettingsAction<T>,
    prevState: TableState<T>
) {
    // Uncomment to see all the actions in the console.
    // console.log(action);
    const changedState = produce(newState, (draft) => {
        switch (action.type) {
            case ActionType.OVERRIDE:
                Object.assign(draft, action.settings);
                break;
            case ActionType.FILTER_ADD: {
                let index = draft.filterBy.findIndex((entry) => entry.id === action.id);
                if (index === -1) {
                    draft.filterBy.push({ id: action.id, values: [action.value] });
                    draft.filterBy.sort(); // keep list sorted to keep URL's stable.
                } else {
                    draft.filterBy[index].values.push(action.value);
                    draft.filterBy[index].values.sort();
                }
                break;
            }
            case ActionType.FILTER_REMOVE: {
                let index = draft.filterBy.findIndex((entry) => entry.id === action.id);
                if (index > -1) {
                    let valueIdx = draft.filterBy[index].values.findIndex((value: string) => value === action.value);
                    if (valueIdx > -1) {
                        if (draft.filterBy[index].values.length > 1) {
                            draft.filterBy[index].values.splice(valueIdx, 1);
                        } else {
                            draft.filterBy.splice(index, 1);
                        }
                    }
                }
                break;
            }
            case ActionType.FILTER_REPLACE: {
                let index = draft.filterBy.findIndex((entry) => entry.id === action.id);
                if (index === -1) {
                    draft.filterBy.push({ id: action.id, values: action.values });
                } else {
                    draft.filterBy[index].values = action.values;
                }
                draft.pageIndex = 0;
                break;
            }
            case ActionType.FILTER_CLEAR: {
                let index = draft.filterBy.findIndex((entry) => entry.id === action.id);
                if (index > -1) {
                    draft.filterBy.splice(index, 1);
                }
                break;
            }
            case ActionType.REFRESH_TOGGLE:
                draft.refresh = !draft.refresh;
                break;
            case ActionType.REFRESH_DISABLE:
                draft.refresh = false;
                break;
            case ActionType.REFRESH_ENABLE:
                draft.refresh = true;
                break;
            case ActionType.SHOW_SETTINGS_TOGGLE:
                draft.showSettings = !draft.showSettings;
                break;
            case ActionType.SHOW_PAGINATOR_TOGGLE:
                draft.showPaginator = !draft.showPaginator;
                break;
            case ActionType.LOADING_START:
                draft.loading = true;
                break;
            case ActionType.LOADING_STOP:
                draft.loading = false;
                break;
            default:
            // Uncomment to see unhandled actions in the console
            // console.log(action);
        }
    });
    // Uncomment to compare the states in the console.
    // console.log(newState, changedState);
    return changedState;
}

interface INwaTableProps<T extends object> {
    columns: Column<T>[];
    initialState: TableState<T>;
    persistSettings: (state: LocalTableSettings<T> | SessionTableSettings) => void;
    endpoint: string;
    initialTableSettings: TableSettings<T>;
    extraRowPropGetter: RowPropGetter<T>;
    renderSubComponent: ({ row }: { row: Row<T> }) => JSX.Element;
    excludeInFilter: string[];
    advancedSearch: boolean;
}

export function NwaTable<T extends object>({
    columns,
    initialState,
    persistSettings,
    endpoint,
    initialTableSettings,
    extraRowPropGetter,
    renderSubComponent,
    excludeInFilter,
    advancedSearch,
}: INwaTableProps<T>) {
    const { runningProcesses, useFallback } = useContext(RunningProcessesContext);
    const [data, pageCount, fetchData] = useFilterableDataFetcher<T>(endpoint);
    const {
        getTableProps,
        getTableBodyProps,
        prepareRow,
        headerGroups,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        allColumns,
        visibleColumns,
        state,
        dispatch,
    } = useTable<T>(
        {
            columns,
            data,
            pageCount,
            manualFilters: true,
            manualPagination: true,
            manualSortBy: true,
            autoResetFilters: false,
            autoResetSortBy: false,
            autoResetExpanded: true,
            debug: true,
            // @ts-ignore Compiler expects id and value even on ActionTypes without them
            stateReducer: tableSettingsReducer,
            initialState: initialState,
        },
        (hooks: Hooks<T>) => {
            hooks.getRowProps.push(extraRowPropGetter);
        },
        useFilters,
        useSortBy,
        useExpanded,
        usePagination
    );
    const {
        name,
        sortBy,
        filterBy,
        showSettings,
        showPaginator,
        refresh,
        delay,
        hiddenColumns,
        pageIndex,
        pageSize,
        minimized,
    } = state;

    const preferencesProps = {
        state,
        allColumns,
        dispatch,
        initialTableSettings,
        excludeInFilter,
    };
    const advancedSearchProps = {
        state,
        dispatch,
    };
    const TableRendererProps = {
        getTableProps,
        getTableBodyProps,
        prepareRow,
        headerGroups,
        page,
        visibleColumns,
        renderSubComponent,
    };
    const paginatorProps = {
        canNextPage,
        canPreviousPage,
        gotoPage,
        nextPage,
        pageCount,
        pageIndex,
        pageOptions,
        pageSize,
        previousPage,
        setPageSize,
    };
    useHttpIntervalFallback(useFallback, () => fetchData(dispatch, pageIndex, pageSize, sortBy, filterBy));

    // Update localStorage
    useEffect(() => {
        persistSettings({ showSettings, showPaginator, hiddenColumns, delay, filterBy, sortBy });
    }, [persistSettings, showSettings, showPaginator, hiddenColumns, delay, filterBy, sortBy]);

    // Update session storage and URL
    useEffect(() => {
        persistSettings({ pageSize, pageIndex, filterBy, sortBy, refresh, minimized });
    }, [persistSettings, pageSize, pageIndex, filterBy, sortBy, refresh, minimized]);

    // fetch new data whenever page index, size sort or filter changes
    useEffect(() => {
        fetchData(dispatch, pageIndex, pageSize, sortBy, filterBy);
    }, [fetchData, dispatch, pageIndex, pageSize, sortBy, filterBy]);

    useEffect(() => {
        fetchData(dispatch, pageIndex, pageSize, sortBy, filterBy);
    }, [runningProcesses]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <EuiPanel css={nwaTableStyling} id={name} style={{ marginBottom: "20px" }}>
            <EuiFlexGroup>
                <EuiFlexItem grow={false} component="span">
                    <Preferences<T> {...preferencesProps} />
                </EuiFlexItem>
                {!showSettings && (
                    <EuiFlexItem grow={false} component="span">
                        <MiniPaginator {...paginatorProps} />
                    </EuiFlexItem>
                )}
            </EuiFlexGroup>
            {advancedSearch && <AdvancedSearch {...advancedSearchProps} />}
            {<TableRenderer {...TableRendererProps} />}
            {data.length === 0 && (
                <div className={"no-results"}>
                    <FormattedMessage id="table.no_results" />
                </div>
            )}
            {showPaginator && <Paginator {...paginatorProps} />}
        </EuiPanel>
    );
}
