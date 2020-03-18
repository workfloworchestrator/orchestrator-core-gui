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
import I18n from "i18n-js";

import "./Settings.scss";
import { stop } from "../utils/Utils";
import { clearCache, ping } from "../api";
import Select, { ValueType } from "react-select";
import { setFlash } from "../utils/Flash";
import { Option } from "../utils/types";

interface IProps {}

interface IState {
    cache: string;
}

const CACHES: string[] = ["ims", "crm", "api", "all"];

export default class Settings extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            cache: "ims"
        };
    }

    componentDidMount = () => ping();

    clearCache = (e: React.MouseEvent<HTMLButtonElement>) => {
        stop(e);
        clearCache(this.state.cache).then(res =>
            setFlash(
                I18n.t("cache.flushed", {
                    name: I18n.t(`cache.name.${this.state.cache}`)
                })
            )
        );
    };

    changeCache = (option: Option) => this.setState({ cache: option.value });

    render() {
        const { cache } = this.state;
        const options: Option[] = CACHES.map(val => ({
            value: val,
            label: I18n.t(`cache.name.${val}`)
        }));
        const value = options.find(option => option.value === cache);

        return (
            <div className="mod-cache">
                <section className="card">
                    <section className="form-step">
                        <section className="form-divider">
                            <label>{I18n.t("cache.remove")}</label>
                            <em>{I18n.t("cache.remove_info")}</em>
                            <section className="cache-select-section">
                                <Select
                                    onChange={this.changeCache as (option: ValueType<Option>) => void}
                                    options={options}
                                    isSearchable={false}
                                    value={value}
                                    isClearable={false}
                                    isDisabled={false}
                                />
                                <button className="new button orange" onClick={this.clearCache}>
                                    {I18n.t("cache.clear")}
                                    <i className="fa fa-eraser" />
                                </button>
                            </section>
                        </section>
                    </section>
                </section>
            </div>
        );
    }
}
