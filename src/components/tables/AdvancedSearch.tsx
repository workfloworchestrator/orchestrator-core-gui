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

import { EuiFieldSearch, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { ActionType, TableSettingsAction } from "components/tables/NwaTable";
import I18n from "i18n-js";
import React, { Dispatch } from "react";
import { TableState } from "react-table";

interface IProps<T extends object> {
    dispatch: Dispatch<TableSettingsAction<T>>;
    state: TableState<T>;
}

function AdvancedSearch<T extends object>({ state, dispatch }: IProps<T>) {
    return (
        <EuiFlexGroup alignItems="center" className="advanced-search-container">
            <EuiFlexItem>
                <b>Advanced search</b>
            </EuiFlexItem>
            <EuiFlexItem grow={10}>
                <EuiFieldSearch
                    placeholder={I18n.t("subscriptions.advancedSearchPlaceHolder")}
                    value={state.filterBy.find((column) => column.id === "tsv")?.values[0] ?? ""}
                    onChange={(searchPhrase) => {
                        if (searchPhrase) {
                            if (searchPhrase.target.value) {
                                dispatch({
                                    type: ActionType.FILTER_REPLACE,
                                    id: "tsv",
                                    values: [searchPhrase.target.value],
                                });
                            } else {
                                dispatch({
                                    type: ActionType.FILTER_CLEAR,
                                    id: "tsv",
                                });
                            }
                        }
                    }}
                    isClearable={true}
                    fullWidth
                />
            </EuiFlexItem>
        </EuiFlexGroup>
    );
}

export default AdvancedSearch;
