/*
 * Copyright 2019 SURF.
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

import React from "react";
import NumericInput from "react-numeric-input";

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

export default Paginator;
