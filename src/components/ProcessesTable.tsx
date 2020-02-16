import React, { Dispatch, useCallback, useEffect, useRef, useState, useReducer, useMemo, useContext } from "react";
import {
    Cell,
    Column,
    ColumnInstance,
    Row,
    useTable,
    useFilters,
    useSortBy,
    usePagination,
    SortingRule,
    TableState,
    FilterAndSort,
    TableSettings,
    LocalTableSettings,
    SessionTableSettings
} from "react-table";
import "./NwaTable.scss";
import "../stylesheets/buttons.scss";
import { filterableEndpoint } from "../api/filterable";
import { FilterArgument, Organization, ProcessV2, Subscription } from "../utils/types";
import uniq from "lodash/uniq";
import pick from "lodash/pick";
import last from "lodash/last";
import chunk from "lodash/chunk";
import omitBy from "lodash/omitBy";
import isNull from "lodash/isNull";
import toInteger from "lodash/toInteger";
import ApplicationContext from "../utils/ApplicationContext";
import OrganisationSelect from "./OrganisationSelect";
import FilterDropDown from "./FilterDropDown";
import NumericInput from "react-numeric-input";
import { useQueryParam, StringParam, ArrayParam } from "use-query-params";
import produce from "immer";
import I18n from "i18n-js";

interface IFetchData {
    (pageIndex: number, pageSize: number, sortBy: SortingRule<string>[], filterBy: FilterArgument[]): void;
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

interface INwaTableProps {
    columns: Column[];
    initialState: TableState;
    onChange: (state: TableState) => void;
    endpoint: string;
    initialTableSettings: TableSettings;
    highlight?: string;
}

function NwaTable<T extends object>({
    columns,
    initialState,
    onChange,
    endpoint,
    initialTableSettings
}: INwaTableProps) {
    const [data, setData] = useState<T[]>([]);
    const [pageCount, setPageCount] = useState(0);
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
        flatColumns,
        state,
        dispatch
    } = useTable(
        {
            columns,
            data,
            pageCount,
            manualPagination: true,
            manualSortBy: true,
            autoResetSortBy: false,
            debug: true,
            stateReducer: tableSettingsReducer,
            initialState: initialState
        },
        useSortBy,
        usePagination,
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
        minimized
    } = state;

    const preferencesProps = {
        state,
        flatColumns,
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
     * fetchIdRef is used to track refreshes and prevent older fetches to overwrite data from newer fetches
     * entityTag is generated server side to be able to return 304 when there are no changes
     */
    const fetchIdRef = React.useRef(0);
    const entityTag = React.useRef<string | null>(null);
    const fetchData: IFetchData = useCallback((pageIndex, pageSize, sortBy, filterBy) => {
        const fetchId = ++fetchIdRef.current;

        dispatch({ type: ActionType.LOADING_START });
        const startRow = pageSize * pageIndex;
        const endRow = startRow + pageSize;

        filterableEndpoint(endpoint, startRow, endRow, sortBy, filterBy, entityTag.current)
            .then(([processes, total, eTag]) => {
                // Only update the data if this is the latest fetch and processes is not null (in case of 304 NOT MODIFIED).
                if (fetchId === fetchIdRef.current && processes) {
                    let pages = Math.ceil(total / pageSize);
                    setPageCount(pages);
                    setData(processes);
                    entityTag.current = eTag;
                }
                dispatch({ type: ActionType.LOADING_STOP });
            })
            .catch(() => {
                dispatch({ type: ActionType.LOADING_STOP });
                dispatch({ type: ActionType.REFRESH_DISABLE }); // disable autorefresh on errors to not swamp the logs with failed requests
            });
        return () => {
            fetchIdRef.current = 0;
            entityTag.current = null;
        }; // clean up prevents state update after mount and 304 on return.
    }, []);

    /* debounce leads to strange behaviour and seems unnecessary at the moment.
     * const fetchDataDebounced = useAsyncDebounce(fetchData, 250);
     */

    useEffect(() => {
        onChange(state);
    }, [
        onChange,
        showSettings,
        showPaginator,
        hiddenColumns,
        delay,
        filterBy,
        sortBy,
        pageIndex,
        pageSize,
        refresh,
        delay,
        filterBy,
        sortBy,
        minimized
    ]);

    // fetch new data whenever page index, size or sort changes
    useEffect(() => {
        fetchData(pageIndex, pageSize, sortBy, filterBy);
    }, [fetchData, pageIndex, pageSize, sortBy, filterBy]);

    /*
     * poll for updates at an interval. because this is a hook the interval will be
     * removed when the table is unmounted
     */
    const autoRefreshDelay = refresh ? delay : -1;
    useInterval(() => {
        fetchData(pageIndex, pageSize, sortBy, filterBy);
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
            <TablePreferences {...preferencesProps} />
            {!minimized && (
                <>
                    <table className="nwa-table" {...getTableProps()}>
                        <caption>{I18n.t(name)}</caption>
                        <thead>
                            {headerGroups.map(headerGroup => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map(column => (
                                        <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                                            {column.render("Header")}
                                            {sortIcon(column)}
					    <div>{column.canFilter && column.render("Filter")}</div>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {page.map((row: Row, i) => {
                                prepareRow(row);
                                return row.allCells[0].render("HyperLinkedRow");
                            })}
                        </tbody>
                    </table>
                    {data.length === 0 && <div className={"noResults"}>No Results found.</div>}
                    {showPaginator && <Paginator {...paginatorProps} />}
                </>
            )}
        </div>
    );
}

interface IPaginatorProps {
    canNextPage: boolean;
    canPreviousPage: boolean;
    gotoPage: (arg: number) => void;
    nextPage: () => void;
    pageIndex: number;
    pageOptions: number[];
    pageSize: number;
    previousPage: () => void;
    setPageSize: (arg: number) => void;
}

function Paginator({
    canNextPage,
    canPreviousPage,
    gotoPage,
    nextPage,
    pageIndex,
    pageOptions,
    pageSize,
    previousPage,
    setPageSize
}: IPaginatorProps) {
    return (
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
            <button onClick={() => gotoPage(pageOptions.length - 1)} disabled={!canNextPage}>
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
                <NumericInput
                    min={1}
                    max={pageOptions.length}
                    value={pageIndex + 1}
                    onChange={valueAsNumber => {
                        valueAsNumber && gotoPage(valueAsNumber - 1);
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
    );
}

function renderSubscriptionsCell({ cell }: { cell: Cell }) {
    const subscriptions: Subscription[] = cell.value;
    return subscriptions.map((subscription: Subscription) => {
        return (
            <p key={subscription.subscription_id}>
                <a href={`/subscription/${subscription.subscription_id}`}>{subscription.description}</a>
            </p>
        );
    });
}

function renderProductsCell({ cell }: { cell: Cell }) {
    const subscriptions: Subscription[] = cell.value;
    return uniq(subscriptions.map((subscription: Subscription) => subscription.product.name)).map(
        (product_name, idx) => <p key={`product_${idx}`}>{product_name}</p>
    );
}

function renderCustomersCell(organisations: Organization[], abbreviate: boolean) {
    function lookup(uuid: string) {
        const organisation: Organization | undefined = organisations.find(org => org.uuid === uuid);
        return organisation ? (abbreviate ? organisation.abbr : organisation.name) : uuid;
    }
    return function doRenderCustomersCell({ cell }: { cell: Cell }) {
        const subscriptions: Subscription[] = cell.value;
        return uniq(subscriptions.map(subscription => subscription.customer_id))
            .map(lookup)
            .join(", ");
    };
}

function renderTimestampCell({ cell }: { cell: Cell }) {
    const timestamp: number = cell.value;
    const datetime = new Date(timestamp * 1000);
    const today = new Date();
    if (
        datetime.getFullYear() === today.getFullYear() &&
        datetime.getMonth() === today.getMonth() &&
        datetime.getDay() === today.getDay()
    ) {
        return datetime.toLocaleTimeString("nl-NL").substring(0, 5) + " CET";
    } else {
        return datetime.toLocaleDateString("nl-NL");
    }
}

function renderPidCell({ cell }: { cell: Cell }) {
    const pid: string = cell.value;
    return (
        <a href={`/process/${pid}`} title={pid}>
            {pid.slice(0, 8)}
        </a>
    );
}

function renderProductTag({ cell }: { cell: Cell }) {
    const subscriptions: Subscription[] = cell.value;
    return uniq(
        subscriptions.map((subscription: Subscription) => {
            return subscription.product.tag;
        })
    ).join(", ");
}

type ProcessStatus = "created" | "failed" | "running" | "suspended" | "aborted" | "completed";

enum ActionType {
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

type TableSettingsAction =
    | { type: ActionType.FILTER_ADD; id: string; value: string }
    | { type: ActionType.FILTER_CLEAR; id: string }
    | { type: ActionType.FILTER_REMOVE; id: string; value: string }
    | { type: ActionType.FILTER_REPLACE; id: string; value: string }
    | { type: ActionType.LOADING_START }
    | { type: ActionType.LOADING_STOP }
    | { type: ActionType.OVERRIDE; settings: Partial<TableSettings> }
    | { type: ActionType.REFRESH_DELAY; delay: number }
    | { type: ActionType.REFRESH_DISABLE }
    | { type: ActionType.REFRESH_ENABLE }
    | { type: ActionType.REFRESH_TOGGLE }
    | { type: ActionType.SHOW_SETTINGS_TOGGLE }
    | { type: ActionType.SHOW_PAGINATOR_TOGGLE }
    | { type: ActionType.MINIMIZE }
    | { type: ActionType.MAXIMIZE };

const tableSettingsReducer = (newState: TableState, action: TableSettingsAction, prevState: TableState) => {
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
                        draft.filterBy[index].values.splice(valueIdx);
                    }
                }
                break;
            }
            case ActionType.FILTER_REPLACE: {
                let index = draft.filterBy.findIndex(entry => entry.id === action.id);
                if (index === -1) {
                    draft.filterBy.push({ id: action.id, values: [action.value] });
                } else {
                    draft.filterBy[index].values = [action.value];
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
};

interface ProcessesTableProps {
    initialTableSettings: TableSettings;
}

export function initialProcessesFilterAndSort(showTasks: boolean, statuses: ProcessStatus[]) {
    const initialFilterBy = [
        { id: "isTask", values: [`${showTasks ? "true" : "false"}`] },
        { id: "status", values: statuses }
    ];
    const initialSortBy = [{ id: "modified", desc: true }];
    return { filterBy: initialFilterBy, sortBy: initialSortBy };
}

export function initialProcessTableSettings(
    name: string,
    filterAndSort: FilterAndSort,
    hiddenColumns: string[],
    optional?: Partial<TableSettings>
): TableSettings {
    const defaults = {
        showSettings: true,
        showPaginator: true,
        refresh: false,
        delay: 3000,
        pageSize: 25,
        pageIndex: 0,
        minimized: false
    };
    let rest = optional ? Object.assign(defaults, optional) : defaults;
    return {
        ...filterAndSort,
        name: name,
        hiddenColumns: hiddenColumns,
        ...rest
    };
}

export function ProcessesTable({ initialTableSettings }: ProcessesTableProps) {
    const { name } = initialTableSettings;
    const queryNameSpace = last(name.split("."));
    const [highlightQ, setHighlightQ] = useQueryParam("highlight", StringParam);
    const [pageQ, setPageQ] = useQueryParam(queryNameSpace + "Page", StringParam);
    const [sortQ, setSortQ] = useQueryParam(queryNameSpace + "Sort", StringParam);
    const [filterQ, setFilterQ] = useQueryParam(queryNameSpace + "Filter", StringParam);

    const initialize = useMemo(
        () =>
            function(current: TableSettings): TableState {
                // First get LocalState from LocalStorage
                const settingsFromLocalStorage: LocalTableSettings | {} = JSON.parse(
                    localStorage.getItem(`table-settings:${current.name}`) || "{}"
                );
                // Then get settings from SessionStorage
                const settingsFromSessionStorage: SessionTableSettings | {} = JSON.parse(
                    sessionStorage.getItem(`table-settings:${current.name}`) || "{}"
                );
                // TODO: Then get settings from URL
                let pageIndex: number | null = null;
                let pageSize: number | null = null;
                let sortBy: { id: string; desc: boolean }[] | null = null;
                let filterBy: { id: string; values: string[] }[] | null = null;
                if (pageQ) {
                    let args = pageQ.split("s").map(toInteger);
                    if (args.length == 2) {
                        pageIndex = args[0];
                        pageSize = args[1];
                    }
                }
                try {
                    if (sortQ) {
                        sortBy = chunk(sortQ.split(","), 2).map(([id, desc]) => ({ id, desc: desc === "d" }));
                    }
                    if (filterQ) {
                        filterBy = chunk(filterQ.split(","), 2).map(([id, values]) => ({
                            id: id,
                            values: values.split("-")
                        }));
                    }
                } catch (err) {
                    console.log(err);
                }
                const settingsFromURL = omitBy(
                    { pageIndex: pageIndex, pageSize: pageSize, sortBy: sortBy, filterBy: filterBy },
                    isNull
                );
                // merge everything and return as new controlled table state. Each object from left to right can override keys from the previous object.
                return Object.assign(
                    { loading: true, pageCount: 0 },
                    current,
                    settingsFromLocalStorage,
                    settingsFromSessionStorage,
                    settingsFromURL
                );
            },
        []
    );

    const initialState = useMemo(() => initialize(initialTableSettings), [initialTableSettings]);
    const { organisations, redirect } = useContext(ApplicationContext);
    const columns = React.useMemo(
        () => [
            {
                Header: "pid",
                accessor: "pid",
                disableSortBy: true,
                Cell: renderPidCell,
                HyperLinkedRow: ({ cell, row }: { cell: Cell; row: Row }) => {
                    let highlighted = row.values.pid === highlightQ ? " highlighted" : "";
                    return (
                        <tr
                            onClick={() => {
                                redirect(`/process/${cell.value}`);
                            }}
                            {...row.getRowProps([{ className: `${row.values.status}${highlighted}` }])}
                        >
                            {row.cells.map(cell => {
                                return (
                                    <td {...cell.getCellProps([{ className: cell.column.id }])}>
                                        {cell.render("Cell")}
                                    </td>
                                );
                            })}
                        </tr>
                    );
                }
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
                Cell: renderCustomersCell(organisations, false)
            },
            {
                Header: "Abbr.",
                id: "abbrev",
                accessor: "subscriptions",
                disableSortBy: true,
                Cell: renderCustomersCell(organisations, true)
            },
            {
                Header: "Product(s)",
                id: "products",
                accessor: "subscriptions",
                disableSortBy: true,
                Cell: renderProductsCell
            },
            {
                Header: "Tag(s)",
                id: "tags",
                accessor: "subscriptions",
                disableSortBy: true,
                Cell: renderProductTag
            },
            {
                Header: "Subscription(s)",
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
                Header: "Modified",
                accessor: "modified",
                Cell: renderTimestampCell
            },
            {
                Header: <i className={"fa fa-bug"} />,
                accessor: "failure",
                disableSortBy: true,
                Cell: ({ row, cell }: { row: Row; cell: Cell }) => (
                    <span {...row.getExpandedToggleProps()}>
                        {cell.value ? (
                            row.isExpanded ? (
                                <i className={"fa fa-exclamation-triangle"} />
                            ) : (
                                <i className={"fa fa-window-close"} />
                            )
                        ) : (
                            ""
                        )}
                    </span>
                )
            }
        ],
        [organisations, highlightQ]
    );

    const saveState = useCallback(state => {
        const local: LocalTableSettings = pick(state, [
            "showSettings",
            "showPaginator",
            "hiddenColumns",
            "delay",
            "filterBy",
            "sortBy"
        ]);
        localStorage.setItem(`table-settings:${state.name}`, JSON.stringify(local));
        const session: SessionTableSettings = pick(state, [
            "pageIndex",
            "pageSize",
            "refresh",
            "filterBy",
            "sortBy",
            "minimized"
        ]);
        sessionStorage.setItem(`table-settings:${state.name}`, JSON.stringify(session));
        setPageQ(`${session.pageIndex}s${session.pageSize}`);
        setSortQ(
            session.sortBy
                .map(({ id, desc }) => [id, desc ? "d" : "a"])
                .flat()
                .join(",")
        );
        setFilterQ(
            session.filterBy
                .map(({ id, values }) => [id, values.join("-")])
                .flat()
                .join(",")
        );
    }, []);

    return (
        <div className={"card"}>
            <section className={"nwa-table"}>
                <NwaTable<ProcessV2>
                    columns={columns}
                    initialState={initialState}
                    onChange={saveState}
                    endpoint={"/v2/processes"}
                    initialTableSettings={initialTableSettings}
                />
            </section>
        </div>
    );
}

//const selectedOrganisation = tableSettings.filterBy.reduce((org: string, elem: FilterArgument) => {
//return elem.id === "organisation" ? elem.values[0] : org;
//}, "");

//const filterAttributesStatus = () => {
//const statesInFilter = tableSettings.filterBy.reduce((states: ProcessStatus[], elem: FilterArgument) => {
//return elem.id === "status" ? (elem.values as ProcessStatus[]) : states;
//}, []);
//return [
//{ name: "created", selected: statesInFilter.includes("created"), count: 0 },
//{ name: "failed", selected: statesInFilter.includes("failed"), count: 0 },
//{ name: "running", selected: statesInFilter.includes("running"), count: 0 },
//{ name: "suspended", selected: statesInFilter.includes("suspended"), count: 0 },
//{ name: "aborted", selected: statesInFilter.includes("aborted"), count: 0 },
//{ name: "completed", selected: statesInFilter.includes("completed"), count: 0 }
//];
//};

//const setStatusFilter = (attr: { name: string; selected: boolean; count: number }) => {
//if (attr.selected) {
//tableSettingsDispatch({ type: "filter/remove", id: "status", value: attr.name });
//} else {
//tableSettingsDispatch({ type: "filter/add", id: "status", value: attr.name });
//}
//};
//const setOrgFilter = (option: any) => {
//if (option && option.value) {
//console.log(option.value);
//tableSettingsDispatch({ type: "filter/replace", id: "organisation", value: option.value });
//} else {
//tableSettingsDispatch({ type: "filter/clear", id: "organisation" });
//}
//};
//function OrganisationFilter(props) {

//<OrganisationSelect
//id={"organisations-filter"}
//onChange={setOrgFilter}
//organisations={organisations}
//organisation={selectedOrganisation}
///>
//}

//function ProcessStatusFilter(props) {

//<FilterDropDown items={filterAttributesStatus()} filterBy={setStatusFilter} label={"Status"} />
//}

interface ITablePreferencesProps {
    dispatch: Dispatch<TableSettingsAction>;
    flatColumns: ColumnInstance[];
    initialTableSettings: TableSettings;
    state: TableState;
}

function TablePreferences({ flatColumns, state, dispatch, initialTableSettings }: ITablePreferencesProps) {
    const { name, minimized, refresh, delay, loading, showSettings, showPaginator } = state;
    return (
        <>
            <div className={`table-preferences-icon-bar${minimized ? " minimized" : ""}`}>
                <span
                    title={I18n.t("table.preferences.edit")}
                    onClick={() => dispatch({ type: ActionType.SHOW_SETTINGS_TOGGLE })}
                >
                    <i className={"fa fa-edit"} />
                </span>
                {"   "}
                <span
                    title={
                        refresh
                            ? I18n.t("table.preferences.refresh", { delay: delay })
                            : I18n.t("table.preferences.norefresh")
                    }
                    onClick={() => dispatch({ type: ActionType.REFRESH_TOGGLE })}
                    className={refresh ? (loading ? "pulse" : "rest") : "dead"}
                >
                    {refresh ? (
                        loading ? (
                            <i className={"fa fa-bullseye"} />
                        ) : (
                            <i className={"fa fa-circle"} />
                        )
                    ) : (
                        <i className={"fa fa-circle-o"} />
                    )}
                </span>
                {"   "}
                <span className={"table-name"}>
                    {I18n.t(name)}
                    {minimized && I18n.t("table.is_minimized")}
                </span>
                {minimized ? (
                    <span
                        className={"icon-right"}
                        title={I18n.t("table.preferences.maximize")}
                        onClick={() => dispatch({ type: ActionType.MAXIMIZE })}
                    >
                        <i className={"fa fa-window-maximize"} />
                    </span>
                ) : (
                    <span
                        className={"icon-right"}
                        title={I18n.t("table.preferences.minimize")}
                        onClick={() => dispatch({ type: ActionType.MINIMIZE })}
                    >
                        <i className={"fa fa-window-minimize"} />
                    </span>
                )}
            </div>
            {showSettings && (
                <div className={"preferences"}>
                    <button
                        className={"button red"}
                        onClick={() => dispatch({ type: ActionType.OVERRIDE, settings: initialTableSettings })}
                    >
                        {I18n.t("table.preferences.reset")}
                        <i className={"fa fa-refresh"} />
                    </button>
                    <button className={"button"} onClick={() => dispatch({ type: ActionType.SHOW_PAGINATOR_TOGGLE })}>
                        {showPaginator
                            ? I18n.t("table.preferences.hide_paginator")
                            : I18n.t("table.preferences.show_paginator")}
                    </button>
                    <h1>{I18n.t("table.preferences.autorefresh")}</h1>
                    <NumericInput
                        onChange={valueAsNumber => {
                            valueAsNumber && dispatch({ type: ActionType.REFRESH_DELAY, delay: valueAsNumber });
                        }}
                        min={500}
                        max={10000}
                        step={500}
                        value={state.delay}
                        strict={true}
                    />
                    <h2>{I18n.t("table.preferences.hidden_columns")}</h2>
                    {flatColumns.map(column => {
                        return (
                            <label key={column.id}>
                                <input type="checkbox" {...column.getToggleHiddenProps()} /> {column.id}
                            </label>
                        );
                    })}
                </div>
            )}
        </>
    );
}

export default ProcessesTable;
