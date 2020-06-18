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

import "./FixedInputConfiguration.scss";

import I18n from "i18n-js";
import React from "react";

import { fixedInputConfiguration } from "../api";
import CheckBox from "./CheckBox";

export default class FixedInputConfiguration extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            configuration: { by_tag: {}, fixed_inputs: [] }
        };
    }

    componentDidMount = () => fixedInputConfiguration().then(res => this.setState({ configuration: res }));

    fixedInputValues = (name, configuration) => {
        return configuration.fixed_inputs.find(fi => fi.name === name).values.join(", ");
    };

    fixedInputDescription = (name, configuration) => {
        return configuration.fixed_inputs.find(fi => fi.name === name).description;
    };

    render() {
        const { configuration } = this.state;
        return Object.keys(configuration.by_tag).map((tag, index) => (
            <section className="fixed-input-configuration" key={index}>
                <h3 className="description">{I18n.t("metadata.fixedInputs.tags", { tag: tag })}</h3>
                <table>
                    <thead>
                        <tr>
                            <th className={"fixed-input"}>{I18n.t("metadata.fixedInputs.fixedInput")}</th>
                            <th className={"values"}>{I18n.t("metadata.fixedInputs.values")}</th>
                            <th className={"description"}>{I18n.t("metadata.fixedInputs.description")}</th>
                            <th className={"required"}>{I18n.t("metadata.fixedInputs.required")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {configuration.by_tag[tag].map((fi, index) => (
                            <tr key={index}>
                                <td>{Object.keys(fi)[0]}</td>
                                <td>{this.fixedInputValues(Object.keys(fi)[0], configuration)}</td>
                                <td>{this.fixedInputDescription(Object.keys(fi)[0], configuration)}</td>
                                <td>
                                    <CheckBox name={Object.keys(fi)[0]} value={Object.values(fi)[0]} readOnly={true} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        ));
    }
}
