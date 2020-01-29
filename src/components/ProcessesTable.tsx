import React from "react";
import { Cell, Column, useTable, useFilters, useSortBy, usePagination } from "react-table";
import "./ProcessesTable.scss";
import { processesFilterable } from "../api/index.js";
import { Subscription } from "../utils/types";
import {renderDateTime} from "../utils/Lookups";

interface GenericTableProps {
	columns: Column[]
	data: object[]
	fetchData(options: object): any
}

function GenericTable(props: GenericTableProps) {
    // const { columns, data, fetchData, pageCount } = props;
    const { columns, data, fetchData } = props;
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
        state: { pageIndex, pageSize }
    } = useTable(
        {
            columns,
            data,
            initialState: { pageIndex: 0 }, 
        },
        usePagination
    );


    React.useEffect(() => {
	    fetchData({ pageIndex, pageSize })
    }, [fetchData, pageIndex, pageSize])

    return (
        <div>
            <table className="processes" {...getTableProps()}>
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps()}>{column.render("Header")}</th>
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
                    {[10, 20, 30, 40, 50].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

function renderSubscriptionsCell({cell}: {cell: Cell}) {
	const subscriptions: Subscription[] = cell.value;
	return subscriptions.map((subscription: Subscription) => {
		return (<p key={subscription.subscription_id}>
			<a href={`/subscriptions/${subscription.subscription_id}`}>
			{subscription.description}
			</a>
			</p>)});
}

function renderProductsCell({cell}: {cell: Cell}) {
	const subscriptions: Subscription[] = cell.value;
	return subscriptions.map((subscription) => subscription.product.name).join(", ");
}

function renderTimestampCell({cell}: {cell: Cell}) {
	const timestamp: number = cell.value;
	return renderDateTime(timestamp);

}

function renderPidCell({cell}: {cell: Cell}) {
	const pid: string = cell.value;
	return (<a href={`/process/${pid}`} title={pid}>{pid.slice(0,8)}</a>)
}

function ProcessesTable() {
	const columns = React.useMemo(
		() => [
			{
				Header: "pid",
				accessor: "pid",
				Cell: renderPidCell,
			},
			{
				Header: "Assignee",
				accessor: "assignee",
			},
			{
				Header: "Last step",
				accessor: "step",
			},
			{
				Header: "Status",
				accessor: "status",
			},
			{
				Header: "Workflow",
				accessor:"workflow",
			},
			{
				Header: "Product(s)",
				accessor: "subscriptions",
				Cell: renderProductsCell,
			},
			{
				Header: "Subscriptions",
				accessor: "subscriptions",
				Cell: renderSubscriptionsCell,
			},
			{
				Header: "Started",
				accessor: "started",
				Cell: renderTimestampCell,
			},
			{
				Header: "Last Modified",
				accessor: "modified",
				Cell: renderTimestampCell,
			}
		], []
	)

	const [data, setData] = React.useState([]);
	const [loading, setLoading] = React.useState(false);
	// const [pageCount, setPageCount] = React.useState(0);
	const fetchIdRef = React.useRef(0);

	const fetchData = React.useCallback(({ pageSize, pageIndex }) => {
		const fetchId = ++fetchIdRef.current;

		setLoading(true);

		const startRow = pageSize * pageIndex;
		const endRow = startRow + pageSize;
		
		processesFilterable().then((processes) => {
			setData(processes);
			setLoading(false);
		});
	}, []);

	return <GenericTable columns={columns} data={data} fetchData={fetchData} />
}


export default ProcessesTable;
