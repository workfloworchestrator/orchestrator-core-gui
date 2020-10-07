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

import "components/tables/Paginator.scss";

import { EuiButton, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
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
        <EuiFlexGroup className="paginator">
            <EuiFlexItem grow={1}>
                <EuiFlexGroup>
                    <EuiFlexItem>
                        <EuiButton
                            onClick={() => gotoPage(0)}
                            color="primary"
                            disabled={!canPreviousPage}
                            fill
                            iconType="sortLeft"
                        />
                    </EuiFlexItem>
                    <EuiFlexItem>
                        <EuiButton
                            onClick={() => previousPage()}
                            color="primary"
                            disabled={!canPreviousPage}
                            fill
                            iconType="arrowLeft"
                        />
                    </EuiFlexItem>
                </EuiFlexGroup>
            </EuiFlexItem>
            <EuiFlexItem grow={10} className="paginator-center">
                <div className="pagination-center-wrapper">
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
                </div>
            </EuiFlexItem>
            <EuiFlexItem grow={1}>
                <EuiFlexGroup>
                    <EuiFlexItem>
                        <EuiButton
                            onClick={() => nextPage()}
                            color="primary"
                            disabled={!canNextPage}
                            fill
                            iconType="arrowRight"
                        />
                    </EuiFlexItem>
                    <EuiFlexItem>
                        <EuiButton
                            onClick={() => gotoPage(pageOptions.length - 1)}
                            color="primary"
                            disabled={!canNextPage}
                            fill
                            iconType="sortRight"
                        />
                    </EuiFlexItem>
                </EuiFlexGroup>
            </EuiFlexItem>
        </EuiFlexGroup>
    );
}

export default Paginator;
