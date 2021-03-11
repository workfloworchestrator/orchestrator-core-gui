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

import "components/tables/Preferences.scss";

import { EuiButton, EuiCheckbox, EuiFlexGroup, EuiFlexItem, EuiText } from "@elastic/eui";
import { ActionType, TableSettingsAction } from "components/tables/NwaTable";
import React, { Dispatch } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import NumericInput from "react-numeric-input";
import { ColumnInstance, TableSettings, TableState } from "react-table";

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
    const { name, minimized, refresh, delay, loading, showSettings, showPaginator } = state;
    const intl = useIntl();

    return (
        <span key={`preferences_${name}`}>
            <div className={`table-preferences-icon-bar${minimized ? " minimized" : ""}`}>
                <span className="table-name">
                    <FormattedMessage id={name} />
                    {minimized && <FormattedMessage id="table.is_minimized" />}
                </span>
                {"   "}
                <span
                    title={
                        refresh
                            ? intl.formatMessage({ id: "table.preferences.refresh" }, { delay: delay })
                            : intl.formatMessage({ id: "table.preferences.norefresh" })
                    }
                    onClick={() => dispatch({ type: ActionType.REFRESH_TOGGLE })}
                    className={refresh ? (loading ? "pulse" : "rest") : "dead"}
                >
                    {refresh ? (
                        loading ? (
                            <i className={"fa fa-bullseye"} />
                        ) : (
                            <i className={"fa fa-circle"} />
                        )
                    ) : (
                        <i className={"far fa-circle"} />
                    )}
                </span>
                {"   "}
                <span
                    title={intl.formatMessage({ id: "table.preferences.edit" })}
                    onClick={() => dispatch({ type: ActionType.SHOW_SETTINGS_TOGGLE })}
                >
                    <i className={showSettings ? "fa fa-cog active" : "fa fa-cog"} />
                </span>
                {"   "}

                {minimized ? (
                    <span
                        title={intl.formatMessage({ id: "table.preferences.maximize" })}
                        onClick={() => dispatch({ type: ActionType.MAXIMIZE })}
                    >
                        <i className={"fa fa-caret-up"} />
                    </span>
                ) : (
                    <span
                        title={intl.formatMessage({ id: "table.preferences.minimize" })}
                        onClick={() => dispatch({ type: ActionType.MINIMIZE })}
                    >
                        <i className={"fa fa-caret-down"} />
                    </span>
                )}
            </div>
            {showSettings && (
                <div className={"preferences"}>
                    <EuiFlexGroup className="buttons">
                        <EuiFlexItem>
                            <EuiButton
                                onClick={() => dispatch({ type: ActionType.OVERRIDE, settings: initialTableSettings })}
                                color="warning"
                                iconType="refresh"
                            >
                                <FormattedMessage id="table.preferences.reset" />
                            </EuiButton>
                        </EuiFlexItem>
                        <EuiFlexItem>
                            <EuiButton
                                onClick={() => dispatch({ type: ActionType.SHOW_PAGINATOR_TOGGLE })}
                                color="primary"
                            >
                                <FormattedMessage
                                    id={
                                        showPaginator
                                            ? "table.preferences.hide_paginator"
                                            : "table.preferences.show_paginator"
                                    }
                                />
                            </EuiButton>
                        </EuiFlexItem>
                    </EuiFlexGroup>
                    <EuiText size="s">
                        <h4>
                            <FormattedMessage id="table.preferences.autorefresh" />
                        </h4>
                    </EuiText>
                    <NumericInput
                        onChange={(valueAsNumber) => {
                            valueAsNumber && dispatch({ type: ActionType.REFRESH_DELAY, delay: valueAsNumber });
                        }}
                        min={500}
                        max={10000}
                        step={500}
                        value={state.delay}
                        strict={true}
                    />
                    <EuiText size="s">
                        <h4>
                            <FormattedMessage id="table.preferences.hidden_columns" />
                        </h4>
                    </EuiText>
                    {allColumns
                        .filter((column) => !excludeInFilter.includes(column.id))
                        .map((column) => {
                            return <EuiCheckbox id={column.id} {...column.getToggleHiddenProps()} label={column.id} />;
                        })}
                </div>
            )}
        </span>
    );
}

export default Preferences;
