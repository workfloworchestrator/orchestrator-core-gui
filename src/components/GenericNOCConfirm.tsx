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

import "./GenericNOCConfirm.scss";

import I18n from "i18n-js";
import React from "react";

import CheckBox from "./CheckBox";

interface IProps {
    name: string;
    data?: any[][];
    onChange: (value: string) => any;
}

interface IState {
    checks: { [key: number]: boolean };
    skip_workflow: boolean;
}

export default class GenericNOCConfirm extends React.PureComponent<IProps, IState> {
    readonly state: IState = { checks: {}, skip_workflow: false };

    onChangeInternal = (index: number, skip: boolean = false) => {
        return (e: React.FormEvent<HTMLInputElement>) => {
            let { checks, skip_workflow } = this.state;
            let { data } = this.props;
            if (!data) {
                // Legacy mode
                data = [
                    ["", "label"],
                    ["", "info"],
                    ["", "checkbox"]
                ];
            }

            const target = e.target as HTMLInputElement;

            if (!skip) {
                checks[index] = target.checked;
            } else {
                skip_workflow = target.checked;
                checks = {};
            }

            // We intentionally skip optional checkboxes here
            const allValid = data
                .map((entry: string[], index: number) => [entry, checks[index] || false])
                .filter((entry: (boolean | string[])[]) => (entry[0] as string[])[1].endsWith("checkbox"))
                .map((entry: (boolean | string[])[]) => entry[1] as boolean)
                .every((check: boolean) => check);

            this.props.onChange(skip_workflow ? "SKIPPED" : allValid ? "ACCEPTED" : "INCOMPLETE");

            this.setState({ checks: checks, skip_workflow: skip_workflow });
        };
    };

    renderCheck(index: number, name: string, type: string, i18n_params: { [key: string]: any }, legacy = false) {
        const { checks, skip_workflow } = this.state;

        const label = legacy ? I18n.t(`process.${name}`, i18n_params) : I18n.t(`process.accept.${name}`, i18n_params);

        switch (type) {
            case "label":
                return (
                    <div key={index}>
                        <label>{label}</label>
                    </div>
                );
            case "info":
                return (
                    <div key={index}>
                        <em>{label}</em>
                    </div>
                );
            case "url":
                return (
                    <div key={index}>
                        <a href={name} target="_blank" rel="noopener noreferrer">
                            {name}
                        </a>
                    </div>
                );
            case "warning":
                return (
                    <div key={index}>
                        <label className="warning">{label}</label>
                    </div>
                );
            case "skip":
                return (
                    <CheckBox
                        key={index}
                        name={name}
                        onChange={this.onChangeInternal(index, true)}
                        value={skip_workflow}
                        info={label}
                        className={"skip"}
                    />
                );
            default:
                return (
                    <CheckBox
                        key={index}
                        name={name + (legacy ? "" : index)} // Index needed to allow checkboxes with same name (we can skip this in legacy mode)
                        className={type.startsWith(">") ? "level_2" : undefined}
                        onChange={this.onChangeInternal(index)}
                        value={checks[index]}
                        info={label}
                        readOnly={skip_workflow}
                        ref={name + index}
                    />
                );
        }
    }

    render() {
        const { name, data: propData } = this.props;

        const data = propData || [
            [name, "label", {}, true],
            [`${name}_info`, "info", {}, true],
            [name, "checkbox", {}, true]
        ];

        return (
            <section>
                {data.map((entry: any[], index: number) =>
                    this.renderCheck(index, entry[0], entry[1], entry[2], entry[3])
                )}
            </section>
        );
    }
}
