/*
 * Reusable NWA table implementation using react-table 7.
 *
 */

import React, { useEffect } from "react";
import {
    Column,
    ColumnInstance,
    Row,
    useTable,
    useFilters,
    useSortBy,
    usePagination,
    useExpanded,
    TableState,
    TableSettings,
    LocalTableSettings,
    SessionTableSettings,
    RowPropGetter
} from "react-table";
import "./NwaTable.scss";
import "stylesheets/buttons.scss";
import produce from "immer";
import I18n from "i18n-js";
import Paginator from "./Paginator";
import Preferences from "./Preferences";
import useInterval from "./useInterval";
import useFilterableDataFetcher from "./useFilterableDataFetcher";

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
    MAXIMIZE = "table/maximize"
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
    console.log(action);
    const changedState = produce(newState, draft => {
        switch (action.type) {
            case ActionType.OVERRIDE:
                Object.assign(draft, action.settings);
                break;
            case ActionType.FILTER_ADD: {
                let index = draft.filterBy.findIndex(entry => entry.id === action.id);
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
                let index = draft.filterBy.findIndex(entry => entry.id === action.id);
                if (index > -1) {
                    let valueIdx = draft.filterBy[index].values.findIndex((value: string) => value === action.value);
                    if (valueIdx > -1) {
                        if (draft.filterBy[index].values.length > 1) {
                            draft.filterBy[index].values.splice(valueIdx);
                        } else {
                            draft.filterBy.splice(index);
                        }
                    }
                }
                break;
            }
            case ActionType.FILTER_REPLACE: {
                let index = draft.filterBy.findIndex(entry => entry.id === action.id);
                if (index === -1) {
                    draft.filterBy.push({ id: action.id, values: action.values });
                } else {
                    draft.filterBy[index].values = action.values;
                }
                break;
            }
            case ActionType.FILTER_CLEAR: {
                let index = draft.filterBy.findIndex(entry => entry.id === action.id);
                if (index > -1) {
                    draft.filterBy.splice(index);
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
            case ActionType.REFRESH_DELAY:
                draft.delay = action.delay;
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
            case ActionType.MINIMIZE:
                draft.minimized = true;
                draft.refresh = false;
                draft.showSettings = false;
                break;
            case ActionType.MAXIMIZE:
                draft.minimized = false;
                draft.refresh = true;
                break;
            default:
                console.log(action);
        }
    });
    console.log(newState);
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
}

export function NwaTable<T extends object>({
    columns,
    initialState,
    persistSettings,
    endpoint,
    initialTableSettings,
    extraRowPropGetter,
    renderSubComponent
}: INwaTableProps<T>) {
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
        dispatch
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
            autoResetExpanded: false,
            debug: true,
            stateReducer: tableSettingsReducer,
            initialState: initialState
        },
        hooks => {
            hooks.getRowProps.push(extraRowPropGetter);
        },
        useFilters,
        useSortBy,
        useExpanded,
        usePagination
    );
    const {
        sortBy,
        filterBy,
        showSettings,
        showPaginator,
        refresh,
        delay,
        hiddenColumns,
        pageIndex,
        pageSize,
        minimized
    } = state;

    const preferencesProps = {
        state,
        allColumns,
        dispatch,
        initialTableSettings
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
        setPageSize
    };

    /*
     * Update localStorage, sessionStorage and URL.
     */

    useEffect(() => {
        persistSettings({ showSettings, showPaginator, hiddenColumns, delay, filterBy, sortBy });
    }, [persistSettings, showSettings, showPaginator, hiddenColumns, delay, filterBy, sortBy]);

    useEffect(() => {
        persistSettings({ pageSize, pageIndex, filterBy, sortBy, refresh, minimized });
    }, [persistSettings, pageSize, pageIndex, filterBy, sortBy, refresh, minimized]);

    // fetch new data whenever page index, size sort or filter changes
    useEffect(() => {
        fetchData(dispatch, pageIndex, pageSize, sortBy, filterBy);
    }, [fetchData, dispatch, pageIndex, pageSize, sortBy, filterBy]);

    /*
     * poll for updates at an interval. because this is a hook the interval will be
     * removed when the table is unmounted
     */
    const autoRefreshDelay = refresh ? delay : -1;
    useInterval(() => {
        fetchData(dispatch, pageIndex, pageSize, sortBy, filterBy);
    }, autoRefreshDelay);

    const sortIcon = (col: ColumnInstance<T>) => {
        if (!col.canSort) {
            return "";
        }
        if (col.isSorted) {
            if (col.isSortedDesc) {
                return <i className="fa fa-sort-down" />;
            } else {
                return <i className="fa fa-sort-up" />;
            }
        } else {
            return <i className="fa fa-sort" />;
        }
    };

    return (
        <>
            <Preferences<T> {...preferencesProps} />
            {!minimized && (
                <>
                    <table className="nwa-table" {...getTableProps()}>
                        <caption>
                            {filterBy.find(({ id }) => id === "isTask").values[0] === "true" ? "Tasks" : "Processes"}
                            {" with status "}
                            {filterBy.find(({ id }) => id === "status").values.join(", ")}
                            {" filtered on "}
                            {filterBy
                                .filter(({ id }) => id !== "status" && id !== "isTask")
                                .map(({ id, values }) => `${id}~=${values.join("-")}`)
                                .join(", ")}
                            {" and sorted by "}
                            {sortBy.map(({ id, desc }) => `${id} ${desc ? "descending" : "ascending"}`).join(", ")}
                        </caption>
                        <thead>
                            {headerGroups.map(headerGroup => (
                                <>
                                    <tr {...headerGroup.getHeaderGroupProps()}>
                                        {headerGroup.headers.map(column => (
                                            <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                                                {column.render("Header")}
                                                {sortIcon(column)}
                                            </th>
                                        ))}
                                    </tr>
                                    <tr>
                                        {headerGroup.headers.map(column => (
                                            <th>{column.canFilter && column.render("Filter")}</th>
                                        ))}
                                    </tr>
                                </>
                            ))}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {page.map((row: Row<T>, i) => {
                                prepareRow(row);
                                return (
                                    <>
                                        <tr {...row.getRowProps()}>
                                            {row.cells.map(cell => {
                                                return (
                                                    <td {...cell.getCellProps([{ className: cell.column.id }])}>
                                                        {cell.render("Cell")}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                        {row.isExpanded && (
                                            <tr>
                                                <td colSpan={visibleColumns.length}>{renderSubComponent({ row })}</td>
                                            </tr>
                                        )}
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                    {data.length === 0 && <div className={"no-results"}>{I18n.t("table.no_results")}</div>}
                    {showPaginator && <Paginator {...paginatorProps} />}
                </>
            )}
        </>
    );
}
