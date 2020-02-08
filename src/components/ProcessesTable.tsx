import React, { ChangeEvent, useCallback, useEffect, useRef, useState, useReducer } from "react";
import { Cell, Column, ColumnInstance, useTable, useFilters, useSortBy, usePagination } from "react-table";
import "./GenericTable.scss";
import { processesFilterable } from "../api/processes";
import { FilterArgument, Organization, ProcessV2, Subscription } from "../utils/types";
import { renderDateTime } from "../utils/Lookups";
import uniq from "lodash/uniq";
import ApplicationContext from "../utils/ApplicationContext";
import { organisationNameByUuid } from "../utils/Lookups";
import OrganisationSelect from "./OrganisationSelect";
import FilterDropDown from "./FilterDropDown";
import CheckBox from "./CheckBox";
import NumericInput from "react-numeric-input";

interface GenericTableProps {
    columns: Column[];
    data: object[];
    fetchData(options: object): any;
    controlledPageCount: number;
    autoRefreshDelay: number;
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

function GenericTable(props: GenericTableProps) {
    const { columns, data, fetchData, controlledPageCount, autoRefreshDelay } = props;
    // const { columns, data, fetchData } = props;
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
        state: { pageIndex, pageSize, sortBy }
    } = useTable(
        {
            columns,
            data,
            initialState: { pageIndex: 0, pageSize: 25, sortBy: [{ id: "modified", desc: true }] },
            manualPagination: true,
            manualSortBy: true,
            autoResetSortBy: false,
            pageCount: controlledPageCount
        },
        useSortBy,
        usePagination
    );

    // const fetchDataDebounced = useAsyncDebounce(fetchData, 250);

    useEffect(() => {
        fetchData({ pageIndex, pageSize, sortBy });
    }, [pageIndex, pageSize, sortBy]);

    useInterval(() => {
        fetchData({ pageIndex, pageSize, sortBy });
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
                    {[5, 10, 25, 50, 100].map(pageSize => (
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

enum ProcessStatus {
    CREATED = "created",
    FAILED = "failed",
    RUNNING = "running",
    SUSPENDED = "suspended",
    ABORTED = "aborted",
    COMPLETED = "completed"
}

type FilterAction =
    | { type: "organisation"; organisation: string }
    | { type: "status"; selected: boolean; status: string };

function filterReducer(state: FilterArgument[], action: FilterAction) {
    console.log(state, action);
    switch (action.type) {
        case "organisation":
            return [
                ...state.filter(elem => elem.id !== "organisation"),
                { id: "organisation", values: [action.organisation] }
            ];
        case "status":
            const filterArg = state.find(elem => elem.id === "status");
            console.log("Current filterArg:", filterArg);
            if (filterArg === undefined && !action.selected) {
                return [...state, { id: "status", values: [action.status] }];
            } else if (filterArg && filterArg.values.includes(action.status) && action.selected) {
                if (filterArg.values.length === 1) {
                    console.log("Remove status filter", filterArg);
                    return state.filter(elem => elem.id !== "status");
                } else {
                    console.log("Remove status from filter", filterArg);
                    return [
                        ...state.filter(elem => elem.id !== "status"),
                        { id: "status", values: filterArg.values.filter(elem => elem !== action.status) }
                    ];
                }
            } else if (filterArg) {
                console.log("Add the status to the filter", filterArg);
                return [
                    ...state.filter(elem => elem.id !== "status"),
                    { id: "status", values: [...filterArg.values, action.status] }
                ];
            } else {
                return state;
            }
        default:
            throw new Error();
    }
}

function resetFilter(filter: FilterArgument[]) {
    return [{ id: "isTask", values: ["false"] }];
}

function ProcessesTable() {
    const { organisations } = React.useContext(ApplicationContext);
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
    const [refresh, setRefresh] = useState(true);
    const [delay, setDelay] = useState(1500);
    const [pageCount, setPageCount] = useState(0);
    const fetchIdRef = React.useRef(0);
    const entityTag = React.useRef<string | null>(null);
    const [filterBy, filterDispatch] = useReducer(filterReducer, [], resetFilter);
    const selectedOrganisation = filterBy.reduce((org: string, elem: FilterArgument) => {
        return elem.id === "organisation" ? elem.values[0] : org;
    }, "");

    const setOrganisationFilter = ({ value }: { value: string }) =>
        filterDispatch({ type: "organisation", organisation: value });

    const filterAttributesStatus = () => {
        const statesInFilter = filterBy.reduce((states: ProcessStatus[], elem: FilterArgument) => {
            return elem.id === "status" ? (elem.values as ProcessStatus[]) : states;
        }, []);
        console.log("statesInFilter:", statesInFilter);
        return [
            { name: ProcessStatus.CREATED, selected: statesInFilter.includes(ProcessStatus.CREATED), count: 0 },
            { name: ProcessStatus.FAILED, selected: statesInFilter.includes(ProcessStatus.FAILED), count: 0 },
            { name: ProcessStatus.RUNNING, selected: statesInFilter.includes(ProcessStatus.RUNNING), count: 0 },
            { name: ProcessStatus.SUSPENDED, selected: statesInFilter.includes(ProcessStatus.SUSPENDED), count: 0 },
            { name: ProcessStatus.ABORTED, selected: statesInFilter.includes(ProcessStatus.ABORTED), count: 0 },
            { name: ProcessStatus.COMPLETED, selected: statesInFilter.includes(ProcessStatus.COMPLETED), count: 0 }
        ];
    };

    const setStatusFilter = (attr: { name: string; selected: boolean; count: number }) => {
        console.log(attr);
        filterDispatch({ type: "status", selected: attr.selected, status: attr.name });
    };

    const fetchData = React.useCallback(
        ({ pageSize, pageIndex, sortBy }) => {
            const fetchId = ++fetchIdRef.current;

            setLoading(true);
            const startRow = pageSize * pageIndex;
            const endRow = startRow + pageSize;

            processesFilterable(startRow, endRow, sortBy, filterBy, entityTag.current).then(
                ([processes, total, eTag]) => {
                    // Only update the data if this is the latest fetch and processes is not null (in case of 304 NOT MODIFIED).
                    if (fetchId === fetchIdRef.current && processes) {
                        setPageCount(Math.ceil(total / pageSize));
                        setData(processes);
                        entityTag.current = eTag;
                    }
                    setLoading(false);
                }
            );
        },
        [filterBy]
    );

    return (
        <section className={"processes"}>
            <div className={"processes-filter-select"}>
                <OrganisationSelect
                    id={"organisations-filter"}
                    onChange={setOrganisationFilter}
                    organisations={organisations}
                    organisation={selectedOrganisation}
                />
                <FilterDropDown items={filterAttributesStatus()} filterBy={setStatusFilter} label={"Status"} />
	    <span title={refresh ? `Autorefresh every ${delay}ms`: "Autofresh disabled" } onClick={() => setRefresh(!refresh)} className={refresh ? loading ? "pulse": "rest": "dead"}>
	    { refresh ? <i className={"fa fa-heart"} /> : <i className={"fa fa-heart-broken"} /> }
	    </span>
		<NumericInput  onChange={(valueAsNumber, valuesAsString, inputElement) => {valueAsNumber && setDelay(valueAsNumber)}} min={500} max={10000} step={500} value={delay} strict={true} />
            </div>

            <GenericTable columns={columns} data={data} fetchData={fetchData} controlledPageCount={pageCount} autoRefreshDelay={refresh ? delay: -1} />
        </section>
    );
}

export default ProcessesTable;
