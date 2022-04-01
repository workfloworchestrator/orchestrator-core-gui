/*
 * Copyright 2019-2022 SURF.
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

import "components/FixedInputConfiguration.scss";

import CheckBox from "components/CheckBox";
import React from "react";
import { FormattedMessage } from "react-intl";
import ApplicationContext from "utils/ApplicationContext";
import { FixedInputConfiguration as iFixedInputConfiguration } from "utils/types";

interface IState {
    configuration: iFixedInputConfiguration;
}

export default class FixedInputConfiguration extends React.Component<{}, IState> {
    state: IState = {
        configuration: { by_tag: {}, fixed_inputs: [] },
    };

    componentDidMount = () =>
        this.context.apiClient
            .fixedInputConfiguration()
            .then((res: iFixedInputConfiguration) => this.setState({ configuration: res }));

    fixedInputValues = (name: string, configuration: iFixedInputConfiguration) => {
        return configuration.fixed_inputs.find((fi) => fi.name === name)!.values.join(", ");
    };

    fixedInputDescription = (name: string, configuration: iFixedInputConfiguration) => {
        return configuration.fixed_inputs.find((fi) => fi.name === name)!.description;
    };

    render() {
        const { configuration } = this.state;
        return Object.keys(configuration.by_tag).map((tag, index) => (
            <section className="fixed-input-configuration" key={index}>
                <h3 className="description">
                    <FormattedMessage id="metadata.fixedInputs.tags" values={{ tag: tag }} />
                </h3>
                <table>
                    <thead>
                        <tr>
                            <th className={"fixed-input"}>
                                <FormattedMessage id="metadata.fixedInputs.fixedInput" />
                            </th>
                            <th className={"values"}>
                                <FormattedMessage id="metadata.fixedInputs.values" />
                            </th>
                            <th className={"description"}>
                                <FormattedMessage id="metadata.fixedInputs.description" />
                            </th>
                            <th className={"required"}>
                                <FormattedMessage id="metadata.fixedInputs.required" />
                            </th>
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
FixedInputConfiguration.contextType = ApplicationContext;
