/*
 * Copyright 2019-2020 SURF.
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

import React, { useContext } from "react";
import { ColumnInstance, HeaderGroup, Row, TableBodyProps, TableProps } from "react-table";
import ApplicationContext from "utils/ApplicationContext";
import { DARK_ROW_BORDER_COLOR, LIGHT_ROW_BORDER_COLOR } from "utils/Colors";

interface ITableRendererProps<T extends object> {
    renderSubComponent: ({ row }: { row: Row<T> }) => JSX.Element;
    getTableProps: () => TableProps;
    getTableBodyProps: () => TableBodyProps;
    prepareRow: (row: Row<T>) => void;
    headerGroups: HeaderGroup<T>[];
    page: Row<T>[];
    visibleColumns: ColumnInstance<T>[];
}

export function TableRenderer<T extends object>({
    renderSubComponent,
    getTableProps,
    getTableBodyProps,
    prepareRow,
    headerGroups,
    page,
    visibleColumns,
}: ITableRendererProps<T>) {
    const { theme } = useContext(ApplicationContext);

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
    const rowBorderColor = theme === "light" ? LIGHT_ROW_BORDER_COLOR : DARK_ROW_BORDER_COLOR;

    return (
        <table className="nwa-table" {...getTableProps()}>
            <thead>
                {headerGroups.map((headerGroup) => (
                    <React.Fragment key={`header_fragment_${headerGroup.id}`}>
                        <tr className={"column-ids"} {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map((column) => (
                                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                                    {column.render("Header")} {sortIcon(column)}
                                </th>
                            ))}
                        </tr>
                        <tr className={"filters"} style={{ borderBottom: `1px solid ${rowBorderColor}` }}>
                            {headerGroup.headers.map((column) => (
                                <th id={`filter_headers_${column.id}`} key={column.id}>
                                    {column.canFilter && column.render("Filter")}
                                </th>
                            ))}
                        </tr>
                    </React.Fragment>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {page.map((row: Row<T>) => {
                    prepareRow(row);
                    return (
                        <React.Fragment key={`row_fragment_${row.id}`}>
                            <tr {...row.getRowProps()} style={{ borderBottom: `1px solid ${rowBorderColor}` }}>
                                {row.cells.map((cell) => {
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
                        </React.Fragment>
                    );
                })}
            </tbody>
        </table>
    );
}
