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
import PropTypes from "prop-types";
import CopyToClipboard from "react-copy-to-clipboard";
import I18n from "i18n-js";
import isEqual from "lodash/isEqual";
import ReactTooltip from "react-tooltip";
import CheckBox from "./CheckBox";
import Step from "./Step";
import { capitalize, renderDateTime } from "../utils/Lookups";
import { isEmpty } from "../utils/Utils";
import HighlightCode from "./HighlightCode";

import "./TaskStateDetails.scss";
import { NavLink } from "react-router-dom";

export default class TaskStateDetails extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            raw: false,
            details: true,
            stateChanges: true,
            copiedToClipboard: false
        };
    }

    copiedToClipboard = () => {
        this.setState({ copiedToClipboard: true });
        setTimeout(() => this.setState({ copiedToClipboard: false }), 5000);
    };

    renderRaw = task => {
        const { copiedToClipboard } = this.state;
        const copiedToClipBoardClassName = copiedToClipboard ? "copied" : "";
        const tooltip = I18n.t(copiedToClipboard ? "task_state.copied" : "task_state.copy");
        const json = JSON.stringify(task, null, 4);
        return (
            <section>
                <CopyToClipboard text={json} onCopy={this.copiedToClipboard}>
                    <span className="copy-to-clipboard-container">
                        <button data-for="copy-to-clipboard" data-tip>
                            <i className={`fa fa-clone ${copiedToClipBoardClassName}`} />
                        </button>
                        <ReactTooltip id="copy-to-clipboard" place="right" getContent={[() => tooltip, 500]} />
                    </span>
                </CopyToClipboard>
                <HighlightCode data={JSON.stringify(task, null, 4)} />
            </section>
        );
    };

    renderTaskHeaderInformation = task => {
        const { raw, details, stateChanges } = this.state;
        return (
            <section className="header-information">
                <ul>
                    <li className="task-wording">
                        <h3>
                            {I18n.t("task_state.wording", {
                                workflow: task.workflow
                            })}
                        </h3>
                    </li>
                </ul>
                <ul>
                    {!raw && (
                        <li className="toggle-details">
                            <CheckBox
                                name="details"
                                value={details}
                                info={I18n.t("task_state.details")}
                                onChange={() => this.setState({ details: !details })}
                            />
                        </li>
                    )}
                    {!raw && (
                        <li className="toggle-state-changes">
                            <CheckBox
                                name="state-changes"
                                value={stateChanges}
                                info={I18n.t("task_state.stateChanges")}
                                onChange={() => this.setState({ stateChanges: !stateChanges })}
                            />
                        </li>
                    )}
                    <li>
                        <CheckBox
                            name="raw"
                            value={raw}
                            info={I18n.t("task_state.raw")}
                            onChange={() => this.setState({ raw: !raw })}
                        />
                    </li>
                </ul>
            </section>
        );
    };

    renderSummaryValue = value => (typeof value === "string" ? capitalize(value) : renderDateTime(value));

    stateDelta = (prev, curr) => {
        const prevKeys = Object.keys(prev);
        const currKeys = Object.keys(curr);
        const newKeys = currKeys.filter(key => prevKeys.indexOf(key) === -1 || !isEqual(prev[key], curr[key]));
        const newState = newKeys.reduce((acc, key) => {
            if (curr[key] === Object(curr[key]) && !Array.isArray(curr[key]) && prev[key]) {
                acc[key] = this.stateDelta(prev[key], curr[key]);
            } else {
                acc[key] = curr[key];
            }
            return acc;
        }, {});
        return newState;
    };

    renderSubscriptionLink = task => {
        if (task.current_state.hasOwnProperty("subscription_id")) {
            return (
                <section className="subscription-link">
                    <NavLink to={`/subscription/${task.current_state.subscription_id}`} className="button green">
                        <i className="fa fa-link" />
                        {I18n.t("task.subscription_link_txt")}
                    </NavLink>
                </section>
            );
        }
        return null;
    };

    displayStateValue = value => {
        if (isEmpty(value)) {
            return "";
        }
        return typeof value === "object" ? <HighlightCode data={JSON.stringify(value, null, 3)} /> : value.toString();
    };

    renderStateChanges = (steps, index) => {
        const step = steps[index];
        const status = step.status;
        let json = {};
        switch (status) {
            case "suspend":
            case "abort":
            case "skipped":
                return null;
            case "pending":
                if (isEmpty(step.form)) {
                    return null;
                }
                json = step.form.reduce((acc, field) => {
                    acc[field.name] = "";
                    return acc;
                }, {});
                break;
            case "failed":
                json = step.state;
                break;
            case "success":
                if (index > 0) {
                    let prev_index = index - 1;
                    while (
                        prev_index > 0 &&
                        (steps[prev_index].status === "failed" || steps[prev_index].status === "waiting")
                    ) {
                        prev_index--;
                    }

                    json = this.stateDelta(steps[prev_index].state, step.state);
                } else {
                    json = step.state;
                }
                break;
            default:
        }
        if (isEmpty(json)) {
            return null;
        }
        const iconName = index === 0 || steps[index - 1].status === "suspend" ? "fa fa-user" : "fa fa-cloud";
        return (
            <section className="state-changes">
                <section className="state-divider">
                    <i className={iconName} />
                </section>
                <section className="state-delta">
                    <table>
                        <tbody>
                            {Object.keys(json).map((key, index) => (
                                <tr key={key}>
                                    <td className="key">{key}</td>
                                    <td className="value">{this.displayStateValue(json[key])}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </section>
        );
    };

    renderTaskOverview = (task, details, stateChanges) => {
        const last = i => i === task.steps.length - 1;
        const summaryKeys = ["last_status", "created_by", "last_step", "started_at", "last_modified_at"];
        return (
            <section className="task-overview">
                {details && (
                    <section className="task-summary">
                        <table>
                            <tbody>
                                {summaryKeys.map(key => (
                                    <tr key={key}>
                                        <td className="title">{I18n.t(`task_state.summary.${key}`)}</td>
                                        <td className="value">{this.renderSummaryValue(task[key])}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}
                <section className="steps">
                    {task.steps.map((step, index) => {
                        return (
                            <div key={index} className="details-container">
                                <div className="step-container">
                                    <Step step={step} />
                                    {!last(index) && (
                                        <section className="step-divider">
                                            <i className="fa fa-arrow-down" />
                                        </section>
                                    )}
                                </div>
                                {stateChanges && this.renderStateChanges(task.steps, index)}
                            </div>
                        );
                    })}
                </section>
            </section>
        );
    };

    render() {
        const { task } = this.props;
        const { raw, details, stateChanges } = this.state;
        return (
            <section className="task-state-detail">
                {this.renderTaskHeaderInformation(task)}
                {this.renderSubscriptionLink(task)}
                {raw ? this.renderRaw(task) : this.renderTaskOverview(task, details, stateChanges)}
            </section>
        );
    }
}

TaskStateDetails.propTypes = {
    task: PropTypes.object.isRequired
};
