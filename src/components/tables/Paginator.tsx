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

import "./Paginator.scss";

import I18n from "i18n-js";
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
            <div className="paginator-left">
                <button
                    onClick={() => gotoPage(0)}
                    disabled={!canPreviousPage}
                    title={I18n.t("Go to first page")}
                    className={canPreviousPage ? "button blue" : "button grey"}
                >
                    <i className="fa fa-angle-double-left" />
                </button>{" "}
                <button
                    onClick={() => previousPage()}
                    disabled={!canPreviousPage}
                    className={canPreviousPage ? "button blue" : "button grey"}
                >
                    <i className="fa fa-angle-left" />
                </button>
            </div>
            <div className="paginator-center">
                <span className="page-info">
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
                    {[5, 10, 25, 50, 100].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </div>
            <div className="paginator-right">
                <button
                    onClick={() => nextPage()}
                    disabled={!canNextPage}
                    className={canNextPage ? "button blue" : "button grey"}
                >
                    <i className="fa fa-angle-right" />
                </button>{" "}
                <button
                    onClick={() => gotoPage(pageOptions.length - 1)}
                    disabled={!canNextPage}
                    className={canNextPage ? "button blue" : "button grey"}
                >
                    <i className="fa fa-angle-double-right" />
                </button>{" "}
            </div>
        </div>
    );
}

export default Paginator;
