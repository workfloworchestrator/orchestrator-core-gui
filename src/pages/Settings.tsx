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

import "./Settings.scss";

import I18n from "i18n-js";
import React from "react";
import Select, { ValueType } from "react-select";

import { clearCache, getGlobalStatus, setGlobalStatus } from "../api";
import { setFlash } from "../utils/Flash";
import { EngineStatus, Option, OptionBool } from "../utils/types";
import { stop } from "../utils/Utils";

interface IProps {}

interface IState {
    cache: string;
    lockSettings: boolean;
    engineStatus?: EngineStatus;
}

const CACHES: string[] = ["ims", "crm", "api", "all"];

const LOCKSETTINGS: boolean[] = [true, false];

export default class Settings extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            cache: "ims",
            lockSettings: false,
            engineStatus: undefined
        };
    }

    componentDidMount = () => {
        window.setInterval(this.getEngineStatus, 3000);
        this.getEngineStatus();
    };

    clearCache = (e: React.MouseEvent<HTMLButtonElement>) => {
        stop(e);
        clearCache(this.state.cache).then(res =>
            setFlash(
                I18n.t("settings.cache.flushed", {
                    name: I18n.t(`settings.cache.name.${this.state.cache}`)
                })
            )
        );
    };

    setNewEngineStatus = (e: React.MouseEvent<HTMLButtonElement>) => {
        stop(e);
        setGlobalStatus(this.state.lockSettings).then(res =>
            setFlash(I18n.t(`settings.status.engine.${this.state.lockSettings}`))
        );
    };

    getEngineStatus = () => {
        getGlobalStatus().then(res => this.setState({ engineStatus: res }));
    };

    changeCache = (option: Option) => this.setState({ cache: option.value });

    changeEngineStatus = (option: OptionBool) => this.setState({ lockSettings: option.value });

    render() {
        const { cache, lockSettings, engineStatus } = this.state;
        const cacheOptions: Option[] = CACHES.map(val => ({
            value: val,
            label: I18n.t(`settings.cache.name.${val}`)
        }));
        const cacheValue = cacheOptions.find(option => option.value === cache);

        const engineStatusOptions: OptionBool[] = LOCKSETTINGS.map(val => ({
            value: val,
            label: I18n.t(`settings.status.options.${val}`)
        }));

        const engineStatusValue = engineStatusOptions.find(option => option.value === lockSettings);

        return [
            <div className="mod-cache">
                <section className="card">
                    <section className="form-step">
                        <section className="form-divider">
                            <label>{I18n.t("settings.cache.remove")}</label>
                            <em>{I18n.t("settings.cache.remove_info")}</em>
                            <section className="cache-select-section">
                                <Select
                                    onChange={this.changeCache as (option: ValueType<Option>) => void}
                                    options={cacheOptions}
                                    isSearchable={false}
                                    value={cacheValue}
                                    isClearable={false}
                                    isDisabled={false}
                                />
                                <button className="new button orange" onClick={this.clearCache}>
                                    {I18n.t("settings.cache.clear")}
                                    <i className="fa fa-eraser" />
                                </button>
                            </section>
                        </section>
                    </section>
                </section>
            </div>,
            <div className="mod-cache">
                <section className="card">
                    <section className="form-step">
                        <section className="form-divider">
                            <label>{I18n.t("settings.status.info")}</label>
                            <em>{I18n.t("settings.status.info_detail")}</em>
                            <section className="engine-select-section">
                                <Select
                                    onChange={this.changeEngineStatus as (option: ValueType<OptionBool>) => void}
                                    options={engineStatusOptions}
                                    isSearchable={false}
                                    value={engineStatusValue}
                                    isClearable={false}
                                    isDisabled={false}
                                />
                                <button className="new button orange" onClick={this.setNewEngineStatus}>
                                    {I18n.t("settings.status.submit")}
                                </button>
                            </section>
                            <section className="engine-select-section">
                                <ul className="status">
                                    <li>
                                        <b>{I18n.t("settings.status.processes")} </b> {engineStatus?.running_processes}
                                    </li>
                                    <li>
                                        <b>{I18n.t("settings.status.status")}</b> {engineStatus?.global_status}
                                    </li>
                                </ul>
                            </section>
                        </section>
                    </section>
                </section>
            </div>
        ];
    }
}
