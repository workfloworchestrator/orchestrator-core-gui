import React from "react";
import I18n from "i18n-js";

import "./FixedInputConfiguration.css";
import {fixedInputConfiguration} from "../api";
import CheckBox from "./CheckBox";

export default class FixedInputConfiguration extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            configuration: {"by_tag": {}, "fixed_inputs": []}
        };
    }

    componentDidMount = () => fixedInputConfiguration().then(res => this.setState({configuration: res}));

    fixedInputValues = (name, configuration) => {
        return configuration.fixed_inputs.find(fi => fi.name === name).values.join(", ")
    };

    render() {
        const {configuration} = this.state;
        return Object.keys(configuration.by_tag).map(tag =>
            <section className="fixed-input-configuration">
                <h3 className="description">{I18n.t("metadata.fixedInputs.tags", {tag: tag})}</h3>
                <table>
                    <thead>
                    <tr>
                        <th className={"fixed-input"}>{I18n.t("metadata.fixedInputs.fixedInput")}</th>
                        <th className={"values"}>{I18n.t("metadata.fixedInputs.values")}</th>
                        <th className={"required"}>{I18n.t("metadata.fixedInputs.required")}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {configuration.by_tag[tag].map((fi, index) => <tr key={index}>
                        <td>{Object.keys(fi)[0]}</td>
                        <td>{this.fixedInputValues(Object.keys(fi)[0], configuration)}</td>
                        <td><CheckBox name={Object.keys(fi)[0]} value={Object.values(fi)[0]} readOnly={true}/></td>
                    </tr>)
                    }
                    </tbody>
                </table>
            </section>
        )

    }
}