import React, { Dispatch, useCallback, useEffect, useRef, useState, useReducer, useMemo, useContext } from "react";
import { Cell, Column, ColumnInstance, useTable, useFilters, useSortBy, usePagination, SortingRule } from "react-table";
import "./GenericTable.scss";
import { processesFilterable } from "../api/processes";
import { FilterArgument, Organization, ProcessV2, Subscription } from "../utils/types";
import { renderDateTime } from "../utils/Lookups";
import uniq from "lodash/uniq";
import ApplicationContext from "../utils/ApplicationContext";
import { organisationNameByUuid } from "../utils/Lookups";
import OrganisationSelect from "./OrganisationSelect";
import FilterDropDown from "./FilterDropDown";
import NumericInput from "react-numeric-input";
import produce from "immer";

interface IFetchData {
    (pageIndex: number, pageSize: number, sortBy: SortingRule<string>[], filterBy: FilterArgument[]): void;
}

interface GenericTableProps<T extends object> {
    columns: Column[];
    data: T[];
    fetchData: IFetchData;
    settings: TableSettings;
    settingsDispatch: Dispatch<TableSettingsAction>;
    controlledPageCount: number;
}

/*
 * Inspired by https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 */
function useInterval(callback: () => void, delay: number) {
    const savedCallback = useRef<() => void>(() => {
        return;
    }); // To satisfy typescript the initial value should be a noop callback.

    // Remember the latest function.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== -1) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

function GenericTable<T extends object>(props: GenericTableProps<T>) {
    const { columns, data, fetchData, settings, settingsDispatch, controlledPageCount } = props;
    const {
        getTableProps,
        getTableBodyProps,
        prepareRow,
        headerGroups,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        flatColumns,
        state: { pageIndex, pageSize, sortBy, hiddenColumns },
    } = useTable(
        {
            columns,
            data,
            initialState: {
                pageIndex: 0,
                pageSize: settings.pageSize,
                sortBy: settings.sortBy,
                hiddenColumns: settings.hiddenColumns
            },
            manualPagination: true,
            manualSortBy: true,
            autoResetSortBy: false,
            pageCount: controlledPageCount,
            debug: true
        },
        useSortBy,
        usePagination
    );

    /* debounce leads to strange behaviour and seems unnecessary at the moment.
     * const fetchDataDebounced = useAsyncDebounce(fetchData, 250);
     */

    // synchronize table settings with parent
    useEffect(() => {
        settingsDispatch({ type: "override", settings: { pageSize, hiddenColumns } });
    }, [pageSize, hiddenColumns]);

    // fetch new data whenever page index, size or sort changes
    useEffect(() => {
        fetchData(pageIndex, pageSize, sortBy, settings.filterBy);
    }, [fetchData, pageIndex, pageSize, sortBy, settings]);

    /*
     * poll for updates at an interval. because this is a hook the interval will be
     * removed when the table is unmounted
     */
    const autoRefreshDelay = settings.refresh ? settings.delay : -1;
    useInterval(() => {
        fetchData(pageIndex, pageSize, sortBy, settings.filterBy);
    }, autoRefreshDelay);

    const sortIcon = (col: ColumnInstance) => {
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
        <div>
            {flatColumns.map(column => (
                <div key={column.id}>
                    <label>
                        <input type="checkbox" {...column.getToggleHiddenProps()} /> {column.id}
                    </label>
                </div>
            ))}
            <table className="nwa-table" {...getTableProps()}>
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                                    {column.render("Header")}
                                    {sortIcon(column)}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {page.map((row, i) => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps([{ className: row.values.status }])}>
                                {row.cells.map(cell => {
                                    return (
                                        <td {...cell.getCellProps([{ className: cell.column.id }])}>
                                            {cell.render("Cell")}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div className="pagination">
                <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                    <i className="fa fa-angle-double-left" />
                </button>{" "}
                <button onClick={() => previousPage()} disabled={!canPreviousPage}>
                    <i className="fa fa-angle-left" />
                </button>{" "}
                <button onClick={() => nextPage()} disabled={!canNextPage}>
                    <i className="fa fa-angle-right" />
                </button>{" "}
                <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                    <i className="fa fa-angle-double-right" />
                </button>{" "}
                <span>
                    Page{" "}
                    <strong>
                        {pageIndex + 1} of {pageOptions.length}
                    </strong>{" "}
                </span>
                <span>
                    | Go to page:{" "}
                    <input
                        type="number"
                        defaultValue={(pageIndex + 1).toString()}
                        onChange={e => {
                            const page = e.target.value ? Number(e.target.value) - 1 : 0;
                            gotoPage(page);
                        }}
                    />
                </span>{" "}
                <select
                    value={pageSize}
                    onChange={e => {
                        setPageSize(Number(e.target.value));
                    }}
                >
                    {[5, 25, 50, 100].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

function renderSubscriptionsCell({ cell }: { cell: Cell }) {
    const subscriptions: Subscription[] = cell.value;
    return subscriptions.map((subscription: Subscription) => {
        return (
            <p key={subscription.subscription_id}>
                {subscription.product.name}:{" "}
                <a href={`/subscription/${subscription.subscription_id}`}>{subscription.description}</a>
            </p>
        );
    });
}

function renderCustomersCell(organisations: Organization[]) {
    return function doRenderCustomersCell({ cell }: { cell: Cell }) {
        const lookup = (uuid: string) => organisationNameByUuid(uuid, organisations);
        const subscriptions: Subscription[] = cell.value;
        return uniq(subscriptions.map(subscription => subscription.customer_id))
            .map(lookup)
            .join(", ");
    };
}

function renderTimestampCell({ cell }: { cell: Cell }) {
    const timestamp: number = cell.value;
    return renderDateTime(timestamp);
}

function renderPidCell({ cell }: { cell: Cell }) {
    const pid: string = cell.value;
    return (
        <a href={`/process/${pid}`} title={pid}>
            {pid.slice(0, 8)}
        </a>
    );
}

type ProcessStatus = "created" | "failed" | "running" | "suspended" | "aborted" | "completed";

interface TableSettings {
    hiddenColumns: string[];
    filterBy: FilterArgument[];
    sortBy: SortingRule<string>[];
    refresh: boolean;
    delay: number;
    pageSize: number;
}

type TableSettingsAction =
    | { type: "noop" }
    | { type: "override"; settings: Partial<TableSettings> }
    | { type: "filter/set"; id: string; value: string }
    | { type: "filter/unset"; id: string; value: string }
    | { type: "filter/clear"; id: string }
    | { type: "refresh/flip" }
    | { type: "refresh/disable" }
    | { type: "refresh/enable" }
    | { type: "refresh/delay"; delay: number };

const tableSettingsReducer: React.Reducer<TableSettings, TableSettingsAction> = (
    state: TableSettings,
    action: TableSettingsAction
) => {
    console.log(action);
    const newState = produce(state, draft => {
        switch (action.type) {
            case "noop":
                break;
            case "override":
                Object.assign(draft, action.settings);
                break;
            case "filter/set": {
                let index = draft.filterBy.findIndex(entry => entry.id === action.id);
                if (index === -1) {
                    draft.filterBy.push({ id: action.id, values: [action.value] });
                } else {
                    draft.filterBy[index].values.push(action.value);
                    draft.filterBy[index].values.sort();
                }
                break;
            }
            case "filter/unset": {
                let index = draft.filterBy.findIndex(entry => entry.id === action.id);
                if (index > -1) {
                    let valueIdx = draft.filterBy[index].values.findIndex(value => value === action.value);
                    if (valueIdx > -1) {
                        draft.filterBy[index].values.splice(valueIdx);
                    }
                }
                break;
            }
            case "filter/clear": {
                let index = draft.filterBy.findIndex(entry => entry.id === action.id);
                if (index > -1) {
                    draft.filterBy.splice(index);
                }
                break;
            }
            case "refresh/flip":
                draft.refresh = !draft.refresh;
                break;
            case "refresh/disable":
                draft.refresh = false;
                break;
            case "refresh/enable":
                draft.refresh = true;
                break;
            case "refresh/delay":
                draft.delay = action.delay;
                break;
            default:
                console.log(`Action ${action} not implemented`);
        }
    });
    console.log(newState);
    return newState;
};

interface ProcessesTableProps {
    name: string;
    showTasks: boolean;
    initialStatuses: ProcessStatus[];
    hiddenColumns: string[];
    initialPageSize: number;
}

function ProcessesTable(props: ProcessesTableProps) {
    const initialTableSettings = useMemo<TableSettings>(() => {
        const initialFilterBy = [
            { id: "isTask", values: [`${props.showTasks ? "true" : "false"}`] },
            { id: "status", values: props.initialStatuses }
        ];
        const initialSortBy = [{ id: "modified", desc: true }];
        return {
            hiddenColumns: [],
            filterBy: initialFilterBy,
            sortBy: initialSortBy,
            refresh: true,
            delay: 1500,
            pageSize: props.initialPageSize
        };
    }, [props.showTasks, props.initialPageSize, props.initialStatuses]);

    function initializeFromLocalStorage(current: TableSettings) {
        const settingsFromLocalStorage = JSON.parse(localStorage.getItem(`table-settings:${props.name}`) || "null");
        if (settingsFromLocalStorage) {
            return settingsFromLocalStorage as TableSettings;
        } else {
            return current;
        }
    }

    const [tableSettings, tableSettingsDispatch] = useReducer(
        tableSettingsReducer,
        initialTableSettings,
        initializeFromLocalStorage
    );

    useEffect(() => {
        localStorage.setItem(`table-settings:${props.name}`, JSON.stringify(tableSettings));
    }, [tableSettings, props.name]);

    const { organisations, redirect } = useContext(ApplicationContext);
    const columns = React.useMemo(
        () => [
            {
                Header: "pid",
                accessor: "pid",
                disableSortBy: true,
                Cell: renderPidCell
            },
            {
                Header: "Assignee",
                accessor: "assignee"
            },
            {
                Header: "Last step",
                accessor: "step",
                disableSortBy: true
            },
            {
                Header: "Status",
                accessor: "status"
            },
            {
                Header: "Workflow",
                accessor: "workflow"
            },
            {
                Header: "Customer",
                id: "customer", // Normally the accessor is used as id, but when used twice this gives a name clash.
                accessor: "subscriptions",
                disableSortBy: true,
                Cell: renderCustomersCell(organisations)
            },
            {
                Header: "Subscriptions",
                accessor: "subscriptions",
                disableSortBy: true,
                Cell: renderSubscriptionsCell
            },
            {
                Header: "Created by",
                accessor: "creator"
            },
            {
                Header: "Started",
                accessor: "started",
                Cell: renderTimestampCell
            },
            {
                Header: "Last Modified",
                accessor: "modified",
                Cell: renderTimestampCell
            }
        ],
        [organisations]
    );

    const [data, setData] = useState<ProcessV2[]>([]);
    const [loading, setLoading] = useState(false);
    const [pageCount, setPageCount] = useState(0);
    const selectedOrganisation = tableSettings.filterBy.reduce((org: string, elem: FilterArgument) => {
        return elem.id === "organisation" ? elem.values[0] : org;
    }, "");

    const filterAttributesStatus = () => {
        const statesInFilter = tableSettings.filterBy.reduce((states: ProcessStatus[], elem: FilterArgument) => {
            return elem.id === "status" ? (elem.values as ProcessStatus[]) : states;
        }, []);
        return [
            { name: "created", selected: statesInFilter.includes("created"), count: 0 },
            { name: "failed", selected: statesInFilter.includes("failed"), count: 0 },
            { name: "running", selected: statesInFilter.includes("running"), count: 0 },
            { name: "suspended", selected: statesInFilter.includes("suspended"), count: 0 },
            { name: "aborted", selected: statesInFilter.includes("aborted"), count: 0 },
            { name: "completed", selected: statesInFilter.includes("completed"), count: 0 }
        ];
    };

    const setStatusFilter = (attr: { name: string; selected: boolean; count: number }) => {
        if (attr.selected) {
            tableSettingsDispatch({ type: "filter/unset", id: "status", value: attr.name });
        } else {
            tableSettingsDispatch({ type: "filter/set", id: "status", value: attr.name });
        }
    };

    /*
     * fetchIdRef is used to track refreshes and prevent older fetches to overwrite data from newer fetches
     * entityTag is generated server side to be able to return 304 when there are no changes
     */
    const fetchIdRef = React.useRef(0);
    const entityTag = React.useRef<string | null>(null);
    const fetchData: IFetchData = useCallback((pageIndex, pageSize, sortBy, filterBy) => {
        const fetchId = ++fetchIdRef.current;

        setLoading(true);
        const startRow = pageSize * pageIndex;
        const endRow = startRow + pageSize;

        processesFilterable(startRow, endRow, sortBy, filterBy, entityTag.current)
            .then(([processes, total, eTag]) => {
                // Only update the data if this is the latest fetch and processes is not null (in case of 304 NOT MODIFIED).
                if (fetchId === fetchIdRef.current && processes) {
                    let pages = Math.ceil(total / pageSize);
                    setPageCount(pages);
                    setData(processes as ProcessV2[]);
                    entityTag.current = eTag;
                }
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                tableSettingsDispatch({ type: "refresh/disable" }); // disable autorefresh on errors to not swamp the logs with failed requests
            });
    }, []);

    const setOrgFilter = (organisation: string) =>
        tableSettingsDispatch({ type: "filter/set", id: "organisation", value: organisation });
    return (
        <section className={"processes"}>
            <div className={"processes-filter-select"}>
                <OrganisationSelect
                    id={"organisations-filter"}
                    onChange={setOrgFilter}
                    organisations={organisations}
                    organisation={selectedOrganisation}
                />
                <FilterDropDown items={filterAttributesStatus()} filterBy={setStatusFilter} label={"Status"} />
                <span
                    title={
                        tableSettings.refresh ? `Autorefresh every ${tableSettings.delay}ms` : "Autorefresh disabled"
                    }
                    onClick={() => tableSettingsDispatch({ type: "refresh/flip" })}
                    className={tableSettings.refresh ? (loading ? "pulse" : "rest") : "dead"}
                >
                    {tableSettings.refresh ? (
                        loading ? (
                            <i className={"fa fa-bullseye"} />
                        ) : (
                            <i className={"fa fa-circle"} />
                        )
                    ) : (
                        <i className={"fa fa-circle-o"} />
                    )}
                </span>
                <NumericInput
                    onChange={valueAsNumber => {
                        valueAsNumber && tableSettingsDispatch({ type: "refresh/delay", delay: valueAsNumber });
                    }}
                    min={500}
                    max={10000}
                    step={500}
                    value={tableSettings.delay}
                    strict={true}
                />
            </div>

            <GenericTable<ProcessV2>
                columns={columns}
                data={data}
                fetchData={fetchData}
                settings={tableSettings}
                settingsDispatch={tableSettingsDispatch}
                controlledPageCount={pageCount}
            />
        </section>
    );
}

export default ProcessesTable;
