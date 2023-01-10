/*
 * Copyright 2019-2023 SURF.
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

import { EuiButton, EuiCheckbox, EuiFlexGroup, EuiFlexItem, EuiText } from "@elastic/eui";
import { ActionType, TableSettingsAction } from "components/tables/NwaTable";
import { Dispatch } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { ColumnInstance, TableSettings, TableState } from "react-table";

import { preferencesStyling } from "./PreferencesStyling";

interface IProps<T extends object> {
    dispatch: Dispatch<TableSettingsAction<T>>;
    allColumns: ColumnInstance<T>[];
    initialTableSettings: TableSettings<T>;
    state: TableState<T>;
    excludeInFilter: string[];
}

function Preferences<T extends object>({
    allColumns,
    state,
    dispatch,
    initialTableSettings,
    excludeInFilter,
}: IProps<T>) {
    const { name, showSettings } = state;
    const intl = useIntl();

    return (
        <EuiFlexItem css={preferencesStyling}>
            <span key={`preferences_${name}`}>
                <div className={"table-preferences-icon-bar"}>
                    <span className="table-name">
                        <FormattedMessage id={name} />
                    </span>
                    {"   "}
                    <span
                        title={intl.formatMessage({ id: "table.preferences.edit" })}
                        onClick={() => dispatch({ type: ActionType.SHOW_SETTINGS_TOGGLE })}
                    >
                        <i className={showSettings ? "fa fa-cog active" : "fa fa-cog"} />
                    </span>
                    {"   "}
                </div>
                {showSettings && (
                    <div className={"preferences"}>
                        <EuiFlexGroup className="buttons">
                            <EuiFlexItem>
                                <EuiButton
                                    onClick={() =>
                                        dispatch({ type: ActionType.OVERRIDE, settings: initialTableSettings })
                                    }
                                    iconType="refresh"
                                >
                                    <FormattedMessage id="table.preferences.reset" />
                                </EuiButton>
                            </EuiFlexItem>
                        </EuiFlexGroup>
                        <EuiText size="s">
                            <h4>
                                <FormattedMessage id="table.preferences.hidden_columns" />
                            </h4>
                        </EuiText>
                        {allColumns
                            .filter((column) => !excludeInFilter.includes(column.id))
                            .map((column) => {
                                return (
                                    <EuiCheckbox id={column.id} {...column.getToggleHiddenProps()} label={column.id} />
                                );
                            })}
                    </div>
                )}
            </span>
        </EuiFlexItem>
    );
}

export default Preferences;
