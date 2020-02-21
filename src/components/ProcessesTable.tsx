import React, { Dispatch, useCallback, useEffect, useRef, useState, useMemo, useContext } from "react";
import useTraceUpdate from "use-trace-update";
import {
    Cell,
    Column,
    ColumnInstance,
    Row,
    useTable,
    useFilters,
    useSortBy,
    usePagination,
    useExpanded,
    SortingRule,
    TableState,
    FilterAndSort,
    TableSettings,
    LocalTableSettings,
    SessionTableSettings,
    RowPropGetter
} from "react-table";
import "./NwaTable.scss";
import "../stylesheets/buttons.scss";
import { filterableEndpoint, cancel } from "../api/filterable";
import { FilterArgument, Organization, ProcessV2, Subscription } from "../utils/types";
import uniq from "lodash/uniq";
import last from "lodash/last";
import chunk from "lodash/chunk";
import omitBy from "lodash/omitBy";
import isNull from "lodash/isNull";
import debounce from "lodash/debounce";
import sortedUniq from "lodash/sortedUniq";
import ApplicationContext from "../utils/ApplicationContext";
import OrganisationSelect from "./OrganisationSelect";
import NumericInput from "react-numeric-input";
import { useQueryParam, StringParam } from "use-query-params";
import { CommaSeparatedStringArrayParam, CommaSeparatedNumericArrayParam } from "../utils/QueryParameters.js";
import produce from "immer";
import I18n from "i18n-js";
import axios from "axios";
import Select from "react-select";

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
    MAXIMIZE = "table/maximize",
    UPDATE_DATA = "data/update"
}

type TableSettingsAction<T extends object> =
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
    | { type: ActionType.MAXIMIZE }
    | { type: ActionType.UPDATE_DATA; data: T[]; pageCount: number };

interface IFetchData<T extends object> {
    (
        dispatch: Dispatch<TableSettingsAction<T>>,
        pageIndex: number,
        pageSize: number,
        sortBy: SortingRule<string>[],
        filterBy: FilterArgument[]
    ): void;
}




function useFilterableDataFetcher<T extends object>(endpoint: string): [T[], number, IFetchData<T>] {
    const [pageCount, setPageCount] = useState(0);
    const [data, setData] = useState<T[]>([]);
    /*
     * fetchIdRef is used to track refreshes and prevent older fetches to overwrite data from newer fetches
     * entityTag is generated server side to be able to return 304 when there are no changes
     */
    const fetchIdRef = useRef(0);
    const entityTag = useRef<string | null>(null);
    const fetchData = useCallback((dispatch, pageIndex, pageSize, sortBy, filterBy) => {
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
                    setData(processes as T[]);
                    entityTag.current = eTag;
                }
                dispatch({ type: ActionType.LOADING_STOP });
            })
            .catch(error => {
                if (!axios.isCancel(error)) {
                    // don't call dispatch on cancellation, the hook was unmounted.
                    dispatch({ type: ActionType.LOADING_STOP });
                    dispatch({ type: ActionType.REFRESH_DISABLE }); // disable autorefresh on errors to not swamp the logs with failed requests
                }
            });
        return () => {
            fetchIdRef.current = 0;
            entityTag.current = null;
            cancel.cancel();
        }; // clean up prevents state update after mount and 304 on return.
    }, [endpoint]);
    return [data, pageCount, fetchData];
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

/* this type guard makes it possible to differentiate between the settings meant for localStorage
 * vs. the session and URL. It only checks for hiddenColumns, but as all invocations of persistSettings are type safe
 * this is enough.
 */
function isLocalTableSettings<T>(
    settings: LocalTableSettings<T> | SessionTableSettings
): settings is LocalTableSettings<T> {
    return (settings as LocalTableSettings<T>).hiddenColumns !== undefined;
}

/*
 * Reusable NWA table implementation using react-table 7. */

interface INwaTableProps<T extends object> {
    columns: Column<T>[];
    initialState: TableState<T>;
    persistSettings: (state: LocalTableSettings<T> | SessionTableSettings) => void;
    endpoint: string;
    initialTableSettings: TableSettings<T>;
    extraRowPropGetter: RowPropGetter<T>;
    renderSubComponent: ({ row }: { row: Row<T> }) => JSX.Element;
}

function NwaTable<T extends object>({
    columns,
    initialState,
    persistSettings,
    endpoint,
    initialTableSettings,
    extraRowPropGetter,
    renderSubComponent
}: INwaTableProps<T>) {
    useTraceUpdate({columns, initialState, persistSettings, endpoint, initialTableSettings, extraRowPropGetter, renderSubComponent});
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
    }, [persistSettings, showSettings, showPaginator, hiddenColumns, delay, filterBy, sortBy ]);

    useEffect(() => {
        persistSettings({ showSettings, showPaginator, hiddenColumns, delay, filterBy, sortBy });
    }, [persistSettings, showSettings, showPaginator, hiddenColumns, delay, filterBy, sortBy ]);

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
            <TablePreferences<T> {...preferencesProps} />
            {!minimized && (
                <>
                    <table className="nwa-table" {...getTableProps()}>
                        <caption>{I18n.t(name)}</caption>
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

function DropDownContainer({filtering, title, content}: { filtering: boolean, title: string; content: (disabled: boolean) => JSX.Element }) {
    const [active, setActive] = useState(false);
    const [hover, setHover] = useState(false);
    return (
	<div className={"dropdown-container"}>
            <button
		className={filtering ? "filtering": "not-filtering"}
                onClick={() => {if(active) { setActive(false); setHover(false);} else {setActive(true)}}}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                title={title}
            >
		
	    {active ? <i className={"fa fa-toggle-on"} /> : hover ? <i className={"fa fa-toggle-off"} />: filtering ? <i className={"fa fa-filter"} />: <i className={"fa fa-list-alt"} />}
            </button>
            <div
                className={active ? "dropdown open" : hover ? "dropdown open" : "dropdown"}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
		onClick={() => {if (!active) {setActive(true)}}}
            >
                {content(!active)}
            </div>
        </div>
    );
}

function renderCustomersFilter({
    state,
    dispatch,
    column
}: {
    state: TableState<ProcessV2>;
    dispatch: Dispatch<TableSettingsAction<ProcessV2>>;
    column: ColumnInstance;
}) {
    /*
     * Note: The organisation UUID contains hyphens and hyphens are used as separators for the filter values
     * in the URL. To track the organisation filter value we either needed to keep an extra state value, pick another
     * separator string (with new edge cases) or embrace the separator and see the organisation as an array of
     * UUID parts. The last option is used here.
     */
    const current = state.filterBy.find(filter => filter.id === "organisation");
    const selectedOrganisation = current ? current.values.join("-") : null;
    return (
        <DropDownContainer
	    filtering={(selectedOrganisation !== null)}
            title={column.id}
            content={disabled => (
                <OrganisationSelect
                    id={`${state.name}.filter.${column.id}`}
                    organisation={selectedOrganisation}
                    onChange={(selected, action) => {
                        // See https://github.com/JedWatson/react-select/issues/2902 why we need this.
                        if (Array.isArray(selected)) {
                            throw new Error("Expected a single value from react-select");
                        }
                        if (action.action === "select-option" && selected) {
                            dispatch({
                                type: ActionType.FILTER_REPLACE,
                                id: "organisation",
                                values: (selected as { value: string; label: string }).value.split("-")
                            });
                        } else if (action.action === "clear") {
                            dispatch({ type: ActionType.FILTER_CLEAR, id: "organisation" });
                        }
                    }}
                    placeholder={I18n.t(`table.filter_placeholder.${column.id}`)}
                    abbreviate={column.id === "abbrev"}
                    disabled={disabled}
                />
            )}
        />
    );
}


function renderMultiSelectFilter(
    allOptions: string[],
    {
        state,
        dispatch,
        column
    }: {
        state: TableState<ProcessV2>;
        dispatch: Dispatch<TableSettingsAction<ProcessV2>>;
        column: ColumnInstance;
    }
) {
    const current = state.filterBy.find(filter => filter.id === column.id);
    const currentFilter = current ? current.values : null;
    const options = allOptions.map(val => ({ value: val, label: val }));
    const selected = currentFilter ? options.filter(({ value }) => currentFilter.includes(value)) : [];
    const onChange = (selected: any, action: any) => {
        console.log(action);
        if (action && action.action === "select-option") {
            dispatch({ type: ActionType.FILTER_ADD, id: column.id, value: action.option.value });
        } else if (action.action === "remove-value") {
            dispatch({ type: ActionType.FILTER_REMOVE, id: column.id, value: action.removedValue.value });
        } else if (action.action === "clear") {
            dispatch({ type: ActionType.FILTER_CLEAR, id: column.id });
        }
    };
    return (
        <DropDownContainer
	    filtering={(selected.length > 0)}
            title={column.id}
            content={disabled => (
                <Select
                    isDisabled={disabled}
                    isMulti
                    defaultValue={selected}
                    name={"multi-select"}
                    options={options}
                    onChange={onChange}
                    placeholder={I18n.t(`table.filter_placeholder.${column.id}`)}
                />
            )}
        />
    );
}

const debouncedFilterReplace = debounce((dispatch, id, values) => {
    dispatch({ type: ActionType.FILTER_REPLACE, id, values });
}, 300);

function renderILikeFilter({
    state,
    dispatch,
    column
}: {
    state: TableState<ProcessV2>;
    dispatch: Dispatch<TableSettingsAction<ProcessV2>>;
    column: ColumnInstance;
}) {
    const current = state.filterBy.find(filter => filter.id === column.id);
    const currentFilter = current ? current.values[0] : null;
    if (column.filterValue && column.filterValue.length > 1 && column.filterValue !== currentFilter) {
        debouncedFilterReplace(dispatch, column.id, [column.filterValue]);
    } else if (!column.filterValue && currentFilter) {
        dispatch({ type: ActionType.FILTER_CLEAR, id: column.id });
    }
    return (
        <input
            value={column.filterValue}
            onChange={e => {
                column.setFilter(e.target.value || undefined);
            }}
            placeholder={I18n.t(`table.filter_placeholder.${column.id}`)}
        />
    );
}


function tableSettingsReducer<T extends object>(
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
            case ActionType.UPDATE_DATA:
                draft.data = action.data as [];
                draft.pageCount = action.pageCount;
                draft.loading = false;
                break;
            default:
                console.log(action);
        }
    });
    console.log(newState);
    return changedState;
}

interface ProcessesTableProps {
    initialTableSettings: TableSettings<ProcessV2>;
}

export function initialProcessesFilterAndSort(showTasks: boolean, statuses: string[]) {
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
    optional?: Partial<TableSettings<ProcessV2>>
): TableSettings<ProcessV2> {
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
    const highlightQ = useQueryParam("highlight", StringParam)[0]; // only use the getter
    const [pageQ, setPageQ] = useQueryParam(queryNameSpace + "Page", CommaSeparatedNumericArrayParam);
    const [sortQ, setSortQ] = useQueryParam(queryNameSpace + "Sort", CommaSeparatedStringArrayParam);
    const [filterQ, setFilterQ] = useQueryParam(queryNameSpace + "Filter", CommaSeparatedStringArrayParam);
    const { organisations, products, assignees, processStatuses, redirect } = useContext(ApplicationContext);

    const initialize = useMemo(
        () =>
            function(current: TableSettings<ProcessV2>): TableState<ProcessV2> {
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

    const extraRowPropGetter: RowPropGetter<ProcessV2> = useCallback((props, { row }) => {
        const highlighted = row.values.pid === highlightQ ? " highlighted" : "";
        return {
            ...props,
            onClick: () => {
                redirect(`/process/${row.values.pid}`);
            },
            className: `${row.values.status}${highlighted}`
        };
    }, [highlightQ, redirect]
    )

    const renderSubComponent = useCallback(({ row }: { row: Row<ProcessV2> }) => {
        return (
            <div className={"expanded-failure"}>
                <h2>
                    {I18n.t("table.failure_step", { step: row.values.step })}
                    <span
                        style={{ float: "right" }}
                        onClick={e => {
                            e.stopPropagation();
                            row.toggleRowExpanded();
                        }}
                    >
                        <i className={"fa fa-window-close"} />
                    </span>
                </h2>
                <pre>{row.values.failure}</pre>
            </div>
        );
    }, []
    )

    const initialState = useMemo(() => initialize(initialTableSettings), [initialTableSettings, initialize]);
    const columns: Column<ProcessV2>[] = useMemo(
        () => [
            {
                Header: <i className={"fa fa-info"} />,
                accessor: "failure",
                disableSortBy: true,
                disableFilters: true,
                Cell: ({ row, cell }: { row: Row; cell: Cell }) => {
                    const caret =
                        row.values.pid === highlightQ ? <i className={"fa fa-caret-right"} /> : <span> </span>;
                    if (cell.value) {
                        return (
                            <div
                                {...row.getToggleRowExpandedProps()}
                                onClick={e => {
                                    e.stopPropagation();
                                    row.toggleRowExpanded();
                                }}
                            >
                                {caret}
                                <i className={"fa fa-exclamation-triangle"} />
                            </div>
                        );
                    } else {
                        return caret;
                    }
                }
            },
            {
                Header: "pid",
                accessor: "pid",
                disableSortBy: true,
                disableFilters: true,
                Cell: renderPidCell
            },
            {
                Header: "Assignee",
                accessor: "assignee",
                Filter: renderMultiSelectFilter.bind(null, assignees)
            },
            {
                Header: "Last step",
                accessor: "step",
                disableSortBy: true,
                disableFilters: true
            },
            {
                Header: "Status",
                accessor: "status",
                Filter: renderMultiSelectFilter.bind(null, processStatuses)
            },
            {
                Header: "Workflow",
                accessor: "workflow",
                Filter: renderILikeFilter
            },
            {
                Header: "Customer",
                id: "customer", // Normally the accessor is used as id, but when used twice this gives a name clash.
                accessor: "subscriptions",
                disableSortBy: true,
                Cell: renderCustomersCell(organisations, false),
                Filter: renderCustomersFilter
            },
            {
                Header: "Abbr.",
                id: "abbrev",
                accessor: "subscriptions",
                disableSortBy: true,
                Cell: renderCustomersCell(organisations, true),
                Filter: renderCustomersFilter
            },
            {
                Header: "Product(s)",
                id: "product",
                accessor: "subscriptions",
                disableSortBy: true,
                Cell: renderProductsCell,
                Filter: renderILikeFilter
            },
            {
                Header: "Tag(s)",
                id: "tag",
                accessor: "subscriptions",
                disableSortBy: true,
                Cell: renderProductTag,
		Filter: renderMultiSelectFilter.bind(null, sortedUniq(products.map((p) => p.tag).sort()))
            },
            {
                Header: "Subscription(s)",
                accessor: "subscriptions",
                disableSortBy: true,
                disableFilters: true,
                Cell: renderSubscriptionsCell
            },
            {
                Header: "Created by",
                accessor: "creator",
                Filter: renderILikeFilter
            },
            {
                Header: "Started",
                accessor: "started",
                Cell: renderTimestampCell,
                disableFilters: true
            },
            {
                Header: "Modified",
                accessor: "modified",
                Cell: renderTimestampCell,
                disableFilters: true
            }
        ],
        [organisations, highlightQ, assignees, processStatuses, products]
    );

    const persistSettings = useCallback((settings: LocalTableSettings<ProcessV2> | SessionTableSettings) => {
	console.log("persistSettings called");
        if (isLocalTableSettings(settings)) {
            localStorage.setItem(`table-settings:${name}`, JSON.stringify(settings));
        } else {
            sessionStorage.setItem(`table-settings:${name}`, JSON.stringify(settings));
            setPageQ([settings.pageIndex, settings.pageSize]);
            setSortQ(settings.sortBy.map(({ id, desc }) => [id, desc ? "desc" : "asc"]).flat());
            setFilterQ(settings.filterBy.map(({ id, values }) => [id, values.join("-")]).flat());
        }
    }, [name, setFilterQ, setPageQ, setSortQ]);

    return (
        <div className={"card"}>
            <section className={"nwa-table"} id={name} key={name}>
                <NwaTable<ProcessV2>
                    columns={columns}
                    initialState={initialState as TableState<ProcessV2>}
                    persistSettings={persistSettings}
                    endpoint={"processes"}
                    initialTableSettings={initialTableSettings}
                    extraRowPropGetter={extraRowPropGetter}
                    renderSubComponent={renderSubComponent}
                />
            </section>
        </div>
    );
}

interface ITablePreferencesProps<T extends object> {
    dispatch: Dispatch<TableSettingsAction<T>>;
    allColumns: ColumnInstance<T>[];
    initialTableSettings: TableSettings<T>;
    state: TableState<T>;
}

function TablePreferences<T extends object>({
    allColumns,
    state,
    dispatch,
    initialTableSettings
}: ITablePreferencesProps<T>) {
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
                    {allColumns.map(column => {
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
