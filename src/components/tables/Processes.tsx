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

import { EuiPanel } from "@elastic/eui";
import ActionContainer from "components/ActionContainer";
import {
    renderCustomersCell,
    renderPidCell,
    renderProductTagCell,
    renderProductsCell,
    renderSubscriptionsCell,
    renderTimestampCell,
    renderWorkflowNameCell,
} from "components/tables/cellRenderers";
import { renderCustomersFilter, renderILikeFilter, renderMultiSelectFilter } from "components/tables/filterRenderers";
import { NwaTable, isLocalTableSettings } from "components/tables/NwaTable";
import { processesStyling } from "components/tables/ProcessesStyling";
import chunk from "lodash/chunk";
import isNull from "lodash/isNull";
import last from "lodash/last";
import omitBy from "lodash/omitBy";
import sortedUniq from "lodash/sortedUniq";
import React, { useCallback, useContext, useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
    Cell,
    Column,
    FilterAndSort,
    LocalTableSettings,
    Row,
    RowPropGetter,
    SessionTableSettings,
    TableSettings,
    TableState,
} from "react-table";
import { StringParam, useQueryParam } from "use-query-params";
import ApplicationContext from "utils/ApplicationContext";
import { CommaSeparatedNumericArrayParam, CommaSeparatedStringArrayParam } from "utils/QueryParameters";
import { ProcessV2 } from "utils/types";

export function initialProcessesFilterAndSort(showTasks: boolean, statuses: string[]) {
    const initialFilterBy = [
        { id: "isTask", values: [`${showTasks ? "true" : "false"}`] },
        { id: "status", values: statuses },
    ];
    const initialSortBy = [{ id: "modified", desc: true }];
    return { filterBy: initialFilterBy, sortBy: initialSortBy };
}

export function initialProcessTableSettings(
    name: string,
    filterAndSort: FilterAndSort,
    hiddenColumns: string[],
    optional?: Partial<TableSettings<ProcessV2>>
): TableSettings<ProcessV2> {
    const defaults = {
        showSettings: false,
        showPaginator: true,
        refresh: false,
        delay: 3000,
        pageSize: 25,
        pageIndex: 0,
        minimized: false,
    };
    let rest = optional ? Object.assign(defaults, optional) : defaults;
    return {
        ...filterAndSort,
        name: name,
        hiddenColumns: hiddenColumns,
        ...rest,
    };
}

interface ProcessesTableProps {
    initialTableSettings: TableSettings<ProcessV2>;
    renderActions: (process: ProcessV2) => JSX.Element;
}

interface FilterParams {
    toggleAllRowsExpanded: () => void;
}

export function ProcessesTable({ initialTableSettings, renderActions }: ProcessesTableProps) {
    const intl = useIntl();
    const { name } = initialTableSettings;
    const queryNameSpace = last(name.split("."));
    const highlightQ = useQueryParam("highlight", StringParam)[0]; // only use the getter
    const [pageQ, setPageQ] = useQueryParam(queryNameSpace + "Page", CommaSeparatedNumericArrayParam);
    const [sortQ, setSortQ] = useQueryParam(queryNameSpace + "Sort", CommaSeparatedStringArrayParam);
    const [filterQ, setFilterQ] = useQueryParam(queryNameSpace + "Filter", CommaSeparatedStringArrayParam);
    const { organisations, products, assignees, processStatuses } = useContext(ApplicationContext);

    const initialize = useMemo(
        () =>
            function (current: TableSettings<ProcessV2>): TableState<ProcessV2> {
                // First get LocalState from LocalStorage
                const settingsFromLocalStorage: LocalTableSettings<ProcessV2> | {} = JSON.parse(
                    localStorage.getItem(`table-settings:${current.name}`) || "{}"
                );
                // Then get settings from SessionStorage
                const settingsFromSessionStorage: SessionTableSettings | {} = JSON.parse(
                    sessionStorage.getItem(`table-settings:${current.name}`) || "{}"
                );
                // Then get settings from URL
                let pageIndex: number | null = null;
                let pageSize: number | null = null;
                let sortBy: { id: string; desc: boolean }[] | null = null;
                let filterBy: { id: string; values: string[] }[] | null = null;
                try {
                    if (pageQ) {
                        pageIndex = pageQ[0];
                        pageSize = pageQ[1];
                    }
                    if (sortQ) {
                        sortBy = chunk(sortQ, 2).map(([id, desc]) => ({ id, desc: desc === "desc" }));
                    }
                    if (filterQ) {
                        filterBy = chunk(filterQ, 2).map(([id, values]) => ({
                            id: id,
                            values: values.split("-"),
                        }));
                    }
                } catch (err) {
                    console.log(err);
                }
                const settingsFromURL = omitBy(
                    { pageIndex: pageIndex, pageSize: pageSize, sortBy: sortBy, filterBy: filterBy },
                    isNull
                );
                // merge everything and return as new table state. Each object from left to right can override keys from the previous object.
                return Object.assign(
                    { loading: true, pageCount: 0, data: [] },
                    current,
                    settingsFromLocalStorage,
                    settingsFromSessionStorage,
                    settingsFromURL
                );
            },
        [filterQ, pageQ, sortQ]
    );

    const extraRowPropGetter: RowPropGetter<ProcessV2> = useCallback(
        (props, { row }) => {
            const highlighted = row.values.pid === highlightQ ? " highlighted" : "";
            return {
                ...props,
                id: row.values.pid,
                className: `${row.values.status}${highlighted}`,
            };
        },
        [highlightQ]
    );

    const renderSubComponent = useCallback(({ row }: { row: Row<ProcessV2> }) => {
        const { status, step, info } = row.values;
        return (
            <div className={"expanded-row"}>
                <h2>
                    <FormattedMessage id={`table.expanded_row.${status}`} values={{ step: step }} />
                </h2>
                <pre>{info}</pre>
            </div>
        );
    }, []);

    const initialState = useMemo(() => initialize(initialTableSettings), [initialTableSettings, initialize]);
    const columns: Column<ProcessV2>[] = useMemo(
        () => [
            {
                Header: "",
                id: "info",
                accessor: "failed_reason",
                disableSortBy: true,
                Filter: ({ toggleAllRowsExpanded }: FilterParams) => (
                    <i className="fa fa-arrows-alt-v" onClick={() => toggleAllRowsExpanded()} />
                ),
                Cell: ({ row, cell }: { row: Row; cell: Cell }) => {
                    const caret = row.values.pid === highlightQ ? <i className={"fa fa-caret-right"} /> : null;
                    const button = row.isExpanded ? (
                        <i className={`fa fa-minus-circle ${row.values.status}`} />
                    ) : (
                        <i className={`fa fa-plus-circle ${row.values.status}`} />
                    );
                    return (
                        <div
                            {...row.getToggleRowExpandedProps()}
                            onClick={(e) => {
                                e.stopPropagation();
                                row.toggleRowExpanded();
                            }}
                        >
                            {caret}
                            {button}
                        </div>
                    );
                },
            },
            {
                Header: "pid",
                accessor: "pid",
                disableSortBy: true,
                disableFilters: true,
                Cell: renderPidCell,
            },
            {
                Header: "Assignee",
                accessor: "assignee",
                Filter: renderMultiSelectFilter.bind(null, assignees, "assignees"),
            },
            {
                Header: "Last step",
                id: "step",
                accessor: "last_step",
                disableSortBy: true,
                disableFilters: true,
            },
            {
                Header: "Status",
                id: "status",
                accessor: "last_status",
                Filter: renderMultiSelectFilter.bind(null, processStatuses, "process_statuses"),
                Cell: ({ cell }: { cell: Cell }) => {
                    return intl.formatMessage({ id: `process_statuses.${cell.value}` });
                },
            },
            {
                Header: "Workflow",
                accessor: "workflow",
                Filter: renderILikeFilter,
                Cell: renderWorkflowNameCell,
            },
            {
                Header: "Target",
                id: "target",
                accessor: "workflow_target",
                disableSortBy: true,
                Filter: renderMultiSelectFilter.bind(null, ["CREATE", "MODIFY", "TERMINATE", "SYSTEM"], null),
            },
            {
                Header: "Customer",
                id: "customer", // Normally the accessor is used as id, but when used twice this gives a name clash.
                accessor: "subscriptions",
                disableSortBy: true,
                Cell: renderCustomersCell(organisations, false),
                Filter: renderCustomersFilter,
            },
            {
                Header: "Abbr.",
                id: "abbrev",
                accessor: "subscriptions",
                disableSortBy: true,
                Cell: renderCustomersCell(organisations, true),
                Filter: renderCustomersFilter,
            },
            {
                Header: "Product(s)",
                id: "product",
                accessor: "subscriptions",
                disableSortBy: true,
                Cell: renderProductsCell,
                Filter: renderILikeFilter,
            },
            {
                Header: "Tag(s)",
                id: "tag",
                accessor: "subscriptions",
                disableSortBy: true,
                Cell: renderProductTagCell,
                Filter: renderMultiSelectFilter.bind(null, sortedUniq(products.map((p) => p.tag).sort()), null),
            },
            {
                Header: "Subscription(s)",
                accessor: "subscriptions",
                disableSortBy: true,
                Filter: renderILikeFilter,
                Cell: renderSubscriptionsCell,
            },
            {
                Header: "Created by",
                id: "creator",
                accessor: "created_by",
                Filter: renderILikeFilter,
            },
            {
                Header: "Started",
                id: "started",
                accessor: "started_at",
                Cell: renderTimestampCell,
                disableFilters: true,
            },
            {
                Header: "Modified",
                id: "modified",
                accessor: "last_modified_at",
                Cell: renderTimestampCell,
                disableFilters: true,
            },
            {
                Header: "",
                accessor: (originalRow: ProcessV2, index: number) => originalRow,
                id: "actions",
                Cell: ({ cell }: { cell: Cell }) => (
                    <ActionContainer
                        title={"Actions"}
                        renderButtonContent={(active) => {
                            const classes = ["dropdown-button-content", active ? "active" : ""].join(" ");
                            return (
                                <span className={classes}>
                                    <i className={"fa fa-bars"} />
                                </span>
                            );
                        }}
                        renderContent={(disabled) => renderActions(cell.value)}
                    />
                ),
                disableFilters: true,
                disableSortBy: true,
            },
        ],
        [organisations, highlightQ, assignees, processStatuses, products, renderActions, intl]
    );

    const persistSettings = useCallback(
        (settings: LocalTableSettings<ProcessV2> | SessionTableSettings) => {
            if (isLocalTableSettings(settings)) {
                localStorage.setItem(`table-settings:${name}`, JSON.stringify(settings));
            } else {
                sessionStorage.setItem(`table-settings:${name}`, JSON.stringify(settings));
                setPageQ([settings.pageIndex, settings.pageSize]);
                setSortQ(settings.sortBy.map(({ id, desc }) => [id, desc ? "desc" : "asc"]).flat());
                setFilterQ(settings.filterBy.map(({ id, values }) => [id, values.join("-")]).flat());
            }
        },
        [name, setFilterQ, setPageQ, setSortQ]
    );

    const excludeInFilter = ["info", "workflow"];
    return (
        <div key={name}>
            <EuiPanel css={processesStyling} className="nwa-table" id={`${name}-processes`}>
                <NwaTable<ProcessV2>
                    columns={columns}
                    initialState={initialState as TableState<ProcessV2>}
                    persistSettings={persistSettings}
                    endpoint={"processes/"}
                    initialTableSettings={initialTableSettings}
                    extraRowPropGetter={extraRowPropGetter}
                    renderSubComponent={renderSubComponent}
                    excludeInFilter={excludeInFilter}
                    advancedSearch={false}
                />
            </EuiPanel>
        </div>
    );
}
