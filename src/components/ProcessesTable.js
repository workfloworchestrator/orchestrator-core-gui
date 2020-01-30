"use strict";
var __assign =
    (this && this.__assign) ||
    function() {
        __assign =
            Object.assign ||
            function(t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
                }
                return t;
            };
        return __assign.apply(this, arguments);
    };
exports.__esModule = true;
var react_1 = require("react");
var react_table_1 = require("react-table");
require("./GenericTable.scss");
var index_js_1 = require("../api/index.js");
var Lookups_1 = require("../utils/Lookups");
var uniq_1 = require("lodash/uniq");
var ApplicationContext_1 = require("../utils/ApplicationContext");
var Lookups_2 = require("../utils/Lookups");
function GenericTable(props) {
    var columns = props.columns,
        data = props.data,
        fetchData = props.fetchData,
        controlledPageCount = props.controlledPageCount;
    // const { columns, data, fetchData } = props;
    var _a = react_table_1.useTable(
            {
                columns: columns,
                data: data,
                initialState: { pageIndex: 0, pageSize: 25, sortBy: [{ id: "modified", desc: true }] },
                manualPagination: true,
                manualSortBy: true,
                autoResetSortBy: false,
                pageCount: controlledPageCount
            },
            react_table_1.useSortBy,
            react_table_1.usePagination
        ),
        getTableProps = _a.getTableProps,
        getTableBodyProps = _a.getTableBodyProps,
        prepareRow = _a.prepareRow,
        headerGroups = _a.headerGroups,
        page = _a.page,
        canPreviousPage = _a.canPreviousPage,
        canNextPage = _a.canNextPage,
        pageOptions = _a.pageOptions,
        pageCount = _a.pageCount,
        gotoPage = _a.gotoPage,
        nextPage = _a.nextPage,
        previousPage = _a.previousPage,
        setPageSize = _a.setPageSize,
        _b = _a.state,
        pageIndex = _b.pageIndex,
        pageSize = _b.pageSize,
        sortBy = _b.sortBy;
    //const fetchDataDebounced = useAsyncDebounce(fetchData, 250);
    react_1["default"].useEffect(
        function() {
            fetchData({ pageIndex: pageIndex, pageSize: pageSize, sortBy: sortBy });
        },
        [fetchData, pageIndex, pageSize, sortBy]
    );
    var sortIcon = function(col) {
        if (!col.canSort) {
            return "";
        }
        if (col.isSorted) {
            if (col.isSortedDesc) {
                return react_1["default"].createElement("i", { className: "fa fa-sort-down" });
            } else {
                return react_1["default"].createElement("i", { className: "fa fa-sort-up" });
            }
        } else {
            return react_1["default"].createElement("i", { className: "fa fa-sort" });
        }
    };
    return react_1["default"].createElement(
        "div",
        null,
        react_1["default"].createElement(
            "table",
            __assign({ className: "nwa-table" }, getTableProps()),
            react_1["default"].createElement(
                "thead",
                null,
                headerGroups.map(function(headerGroup) {
                    return react_1["default"].createElement(
                        "tr",
                        __assign({}, headerGroup.getHeaderGroupProps()),
                        headerGroup.headers.map(function(column) {
                            return react_1["default"].createElement(
                                "th",
                                __assign({}, column.getHeaderProps(column.getSortByToggleProps())),
                                column.render("Header"),
                                sortIcon(column)
                            );
                        })
                    );
                })
            ),
            react_1["default"].createElement(
                "tbody",
                __assign({}, getTableBodyProps()),
                page.map(function(row, i) {
                    prepareRow(row);
                    return react_1["default"].createElement(
                        "tr",
                        __assign({}, row.getRowProps()),
                        row.cells.map(function(cell) {
                            return react_1["default"].createElement(
                                "td",
                                __assign({}, cell.getCellProps([{ className: cell.column.id }])),
                                cell.render("Cell")
                            );
                        })
                    );
                })
            )
        ),
        react_1["default"].createElement(
            "div",
            { className: "pagination" },
            react_1["default"].createElement(
                "button",
                {
                    onClick: function() {
                        return gotoPage(0);
                    },
                    disabled: !canPreviousPage
                },
                react_1["default"].createElement("i", { className: "fa fa-angle-double-left" })
            ),
            " ",
            react_1["default"].createElement(
                "button",
                {
                    onClick: function() {
                        return previousPage();
                    },
                    disabled: !canPreviousPage
                },
                react_1["default"].createElement("i", { className: "fa fa-angle-left" })
            ),
            " ",
            react_1["default"].createElement(
                "button",
                {
                    onClick: function() {
                        return nextPage();
                    },
                    disabled: !canNextPage
                },
                react_1["default"].createElement("i", { className: "fa fa-angle-right" })
            ),
            " ",
            react_1["default"].createElement(
                "button",
                {
                    onClick: function() {
                        return gotoPage(pageCount - 1);
                    },
                    disabled: !canNextPage
                },
                react_1["default"].createElement("i", { className: "fa fa-angle-double-right" })
            ),
            " ",
            react_1["default"].createElement(
                "span",
                null,
                "Page",
                " ",
                react_1["default"].createElement("strong", null, pageIndex + 1, " of ", pageOptions.length),
                " "
            ),
            react_1["default"].createElement(
                "span",
                null,
                "| Go to page:",
                " ",
                react_1["default"].createElement("input", {
                    type: "number",
                    defaultValue: (pageIndex + 1).toString(),
                    onChange: function(e) {
                        var page = e.target.value ? Number(e.target.value) - 1 : 0;
                        gotoPage(page);
                    },
                    style: { width: "100px" }
                })
            ),
            " ",
            react_1["default"].createElement(
                "select",
                {
                    value: pageSize,
                    onChange: function(e) {
                        setPageSize(Number(e.target.value));
                    }
                },
                [25, 50, 100].map(function(pageSize) {
                    return react_1["default"].createElement(
                        "option",
                        { key: pageSize, value: pageSize },
                        "Show ",
                        pageSize
                    );
                })
            )
        )
    );
}
function renderSubscriptionsCell(_a) {
    var cell = _a.cell;
    var subscriptions = cell.value;
    return subscriptions.map(function(subscription) {
        return react_1["default"].createElement(
            "p",
            { key: subscription.subscription_id },
            subscription.product.name,
            ": ",
            react_1["default"].createElement(
                "a",
                { href: "/subscriptions/" + subscription.subscription_id },
                subscription.description
            )
        );
    });
}
function renderCustomersCell(organisations) {
    return function render(_a) {
        var cell = _a.cell;
        var lookup = function(uuid) {
            return Lookups_2.organisationNameByUuid(uuid, organisations);
        };
        var subscriptions = cell.value;
        return uniq_1["default"](
            subscriptions.map(function(subscription) {
                return subscription.customer_id;
            })
        )
            .map(lookup)
            .join(", ");
    };
}
function renderTimestampCell(_a) {
    var cell = _a.cell;
    var timestamp = cell.value;
    return Lookups_1.renderDateTime(timestamp);
}
function renderPidCell(_a) {
    var cell = _a.cell;
    var pid = cell.value;
    return react_1["default"].createElement("a", { href: "/process/" + pid, title: pid }, pid.slice(0, 8));
}
function ProcessesTable() {
    var organisations = react_1["default"].useContext(ApplicationContext_1["default"]).organisations;
    var columns = react_1["default"].useMemo(function() {
        return [
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
                id: "customer",
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
        ];
    }, []);
    var _a = react_1["default"].useState([]),
        data = _a[0],
        setData = _a[1];
    var _b = react_1["default"].useState(false),
        loading = _b[0],
        setLoading = _b[1];
    var _c = react_1["default"].useState(0),
        pageCount = _c[0],
        setPageCount = _c[1];
    var fetchIdRef = react_1["default"].useRef(0);
    var _d = react_1["default"].useState([
            { id: "status", values: ["running", "suspended", "failed"] },
            { id: "is_task", values: ["false"] }
        ]),
        filterBy = _d[0],
        setFilterBy = _d[1];
    var fetchData = react_1["default"].useCallback(
        function(_a) {
            var pageSize = _a.pageSize,
                pageIndex = _a.pageIndex,
                sortBy = _a.sortBy;
            var fetchId = ++fetchIdRef.current;
            setLoading(true);
            setPageCount(99);
            var startRow = pageSize * pageIndex;
            var endRow = startRow + pageSize;
            index_js_1.processesFilterable(startRow, endRow, sortBy, filterBy).then(function(processes) {
                // Only update the data if this is the latest fetch.
                if (fetchId === fetchIdRef.current) {
                    setData(processes);
                    setLoading(false);
                }
            });
        },
        [filterBy]
    );
    return react_1["default"].createElement(GenericTable, {
        columns: columns,
        data: data,
        fetchData: fetchData,
        controlledPageCount: pageCount
    });
}
exports["default"] = ProcessesTable;
