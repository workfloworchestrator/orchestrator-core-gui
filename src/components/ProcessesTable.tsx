import React from "react";
import { Cell, Column, ColumnInstance, useTable, useFilters, useSortBy, usePagination, useAsyncDebounce } from "react-table";
import "./ProcessesTable.scss";
import { processesFilterable } from "../api/index.js";
import { ProcessV2, Subscription } from "../utils/types";
import { renderDateTime } from "../utils/Lookups";

interface GenericTableProps {
    columns: Column[];
    data: object[];
    fetchData(options: object): any;
    controlledPageCount: number;
}


interface FilterArgument {
	id: string;
        values: string[];
}

function GenericTable(props: GenericTableProps) {
    const { columns, data, fetchData, controlledPageCount } = props;
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


    //const fetchDataDebounced = useAsyncDebounce(fetchData, 250);

    React.useEffect(() => {
        fetchData({ pageIndex, pageSize, sortBy });
    }, [fetchData, pageIndex, pageSize, sortBy]);

    const sortIcon = (col: ColumnInstance) => {
	if (!col.canSort) {
		return "";
	}
	if (col.isSorted) {
		if (col.isSortedDesc) {
			return <i className="fa fa-sort-down"></i>;
		} else {
			return <i className="fa fa-sort-up"></i>;
		}
	} else {
		return <i className="fa fa-sort"></i>;
	}
    }

    return (
        <div>
            <table className="processes" {...getTableProps()}>
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps(column.getSortByToggleProps())} >
                                    {column.render("Header")}{sortIcon(column)}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {page.map((row, i) => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div className="pagination">
                <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                    {"<<"}
                </button>{" "}
                <button onClick={() => previousPage()} disabled={!canPreviousPage}>
                    {"<"}
                </button>{" "}
                <button onClick={() => nextPage()} disabled={!canNextPage}>
                    {">"}
                </button>{" "}
                <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                    {">>"}
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
                        style={{ width: "100px" }}
                    />
                </span>{" "}
                <select
                    value={pageSize}
                    onChange={e => {
                        setPageSize(Number(e.target.value));
                    }}
                >
                    {[25, 50, 100].map(pageSize => (
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
                {subscription.product.name}: <a href={`/subscriptions/${subscription.subscription_id}`}>
                    {subscription.description}
                </a>
            </p>
        );
    });
}

function renderCustomersCell({ cell }: { cell: Cell }) {
    const subscriptions: Subscription[] = cell.value;
    return subscriptions.map(subscription => subscription.customer_id).join(", ");
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

function ProcessesTable() {
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
                accessor: "status",
            },
            {
                Header: "Workflow",
                accessor: "workflow",
            },
            {
                Header: "Customer",
                accessor: "subscriptions",
                disableSortBy: true,
                Cell: renderCustomersCell
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
        []
    );

    const [data, setData] = React.useState<ProcessV2[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [pageCount, setPageCount] = React.useState(0);
    const fetchIdRef = React.useRef(0);
    const [filterBy, setFilterBy] = React.useState<FilterArgument[]>([
	    {id: "status", values: ["running", "suspended", "failed"]},
	    {id: "is_task", values: ["false"]}
    ])

    const fetchData = React.useCallback(({ pageSize, pageIndex, sortBy}) => {
        const fetchId = ++fetchIdRef.current;

        setLoading(true);
        setPageCount(99);
        const startRow = pageSize * pageIndex;
        const endRow = startRow + pageSize;

        processesFilterable(startRow, endRow, sortBy, filterBy).then(processes => {
            // Only update the data if this is the latest fetch.
            if (fetchId === fetchIdRef.current) {
                setData(processes);
                setLoading(false);
            }
        });
    }, [filterBy]);

    return (
        <div className="mod-processes">
            <GenericTable columns={columns} data={data} fetchData={fetchData} controlledPageCount={pageCount} />
        </div>
    );
}

export default ProcessesTable;
