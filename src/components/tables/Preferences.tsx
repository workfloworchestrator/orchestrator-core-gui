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

import { ActionType, TableSettingsAction } from "components/tables/NwaTable";
import I18n from "i18n-js";
import React, { Dispatch } from "react";
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
    excludeInFilter
}: IProps<T>) {
    const { name, minimized, refresh, delay, loading, showSettings, showPaginator } = state;

    return (
        <React.Fragment key={`preferences_${name}`}>
            <div className={`table-preferences-icon-bar${minimized ? " minimized" : ""}`}>
                <span className="table-name">
                    {I18n.t(name)}
                    {minimized && I18n.t("table.is_minimized")}
                </span>
                {"   "}
                <span
                    title={
                        refresh
                            ? I18n.t("table.preferences.refresh", { delay: delay })
                            : I18n.t("table.preferences.norefresh")
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
                    title={I18n.t("table.preferences.edit")}
                    onClick={() => dispatch({ type: ActionType.SHOW_SETTINGS_TOGGLE })}
                >
                    <i className={showSettings ? "fa fa-cog active" : "fa fa-cog"} />
                </span>
                {"   "}

                {minimized ? (
                    <span
                        title={I18n.t("table.preferences.maximize")}
                        onClick={() => dispatch({ type: ActionType.MAXIMIZE })}
                    >
                        <i className={"fa fa-caret-up"} />
                    </span>
                ) : (
                    <span
                        title={I18n.t("table.preferences.minimize")}
                        onClick={() => dispatch({ type: ActionType.MINIMIZE })}
                    >
                        <i className={"fa fa-caret-down"} />
                    </span>
                )}
            </div>
            {showSettings && (
                <div className={"preferences"}>
                    <button
                        className={"button red"}
                        onClick={() => dispatch({ type: ActionType.OVERRIDE, settings: initialTableSettings })}
                    >
                        {I18n.t("table.preferences.reset")}
                        <i className={"fa fa-sync"} />
                    </button>
                    <button className={"button"} onClick={() => dispatch({ type: ActionType.SHOW_PAGINATOR_TOGGLE })}>
                        {showPaginator
                            ? I18n.t("table.preferences.hide_paginator")
                            : I18n.t("table.preferences.show_paginator")}
                    </button>
                    <h1>{I18n.t("table.preferences.autorefresh")}</h1>
                    <NumericInput
                        onChange={valueAsNumber => {
                            valueAsNumber && dispatch({ type: ActionType.REFRESH_DELAY, delay: valueAsNumber });
                        }}
                        min={500}
                        max={10000}
                        step={500}
                        value={state.delay}
                        strict={true}
                    />
                    <h2>{I18n.t("table.preferences.hidden_columns")}</h2>
                    {allColumns
                        .filter(column => !excludeInFilter.includes(column.id))
                        .map(column => {
                            return (
                                <label key={column.id}>
                                    <input type="checkbox" {...column.getToggleHiddenProps()} /> {column.id}
                                </label>
                            );
                        })}
                </div>
            )}
        </React.Fragment>
    );
}

export default Preferences;
