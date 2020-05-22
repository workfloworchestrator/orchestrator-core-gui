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

import "./ProcessStateDetails.scss";

import { EuiButton, EuiIcon, EuiText } from "@elastic/eui";
import I18n from "i18n-js";
import isEqual from "lodash/isEqual";
import sortBy from "lodash/sortBy";
import React from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import ReactTooltip from "react-tooltip";

import { CustomProcessWithDetails } from "../pages/ProcessDetail";
import { capitalize, renderDateTime } from "../utils/Lookups";
import { ProcessSubscription, ProcessWithDetails, State, Step, prop } from "../utils/types";
import { applyIdNamingConvention, isEmpty } from "../utils/Utils";
import CheckBox from "./CheckBox";
import HighlightCode from "./HighlightCode";
import StepDetails from "./Step";

interface IProps {
    process: CustomProcessWithDetails;
    subscriptionProcesses: ProcessSubscription[];
    collapsed?: number[];
    onChangeCollapsed: (index: number) => void; // when provided it will toggle the collapse functionality
    isProcess: boolean;
}

interface IState {
    raw: boolean;
    details: boolean;
    stateChanges: boolean;
    copiedToClipboard: boolean;
    traceback: boolean;
}

class ProcessStateDetails extends React.PureComponent<IProps, IState> {
    public static defaultProps = {
        collapsed: []
    };

    state: IState = {
        raw: false,
        details: true,
        stateChanges: true,
        copiedToClipboard: false,
        traceback: false
    };

    copiedToClipboard = () => {
        this.setState({ copiedToClipboard: true });
        setTimeout(() => this.setState({ copiedToClipboard: false }), 5000);
    };

    renderRaw = (process: CustomProcessWithDetails) => {
        const { copiedToClipboard } = this.state;
        const copiedToClipBoardClassName = copiedToClipboard ? "copied" : "";
        const tooltip = I18n.t(copiedToClipboard ? `process_state.copied` : `process_state.copy`);
        const json = JSON.stringify(process, null, 4);
        return (
            <section>
                <CopyToClipboard text={json} onCopy={this.copiedToClipboard}>
                    <span className="copy-to-clipboard-container">
                        <button data-for="copy-to-clipboard" data-tip>
                            <i className={`far fa-clone ${copiedToClipBoardClassName}`} />
                        </button>
                        <ReactTooltip id="copy-to-clipboard" place="right" getContent={[() => tooltip, 500]} />
                    </span>
                </CopyToClipboard>
                <HighlightCode data={JSON.stringify(process, null, 2)} />
            </section>
        );
    };

    renderProcessHeaderInformation = (process: CustomProcessWithDetails) => {
        const { raw, traceback, details, stateChanges } = this.state;
        return (
            <section className="header-information">
                <ul>
                    <li className="process-wording">
                        <EuiText>
                            <h3>
                                {this.props.isProcess &&
                                    I18n.t("process_state.wording_process", {
                                        product: process.productName,
                                        customer: process.customerName,
                                        workflow: process.workflow_name
                                    })}
                                {!this.props.isProcess &&
                                    I18n.t("process_state.wording_task", {
                                        workflow: process.workflow_name
                                    })}
                            </h3>
                        </EuiText>
                    </li>
                </ul>
                <ul>
                    {!raw && (
                        <li className="toggle-details">
                            <CheckBox
                                name="details"
                                value={details}
                                info={I18n.t(`process_state.details`)}
                                onChange={() => this.setState({ details: !details })}
                            />
                        </li>
                    )}
                    {!raw && (
                        <li className="toggle-state-changes">
                            <CheckBox
                                name="state-changes"
                                value={stateChanges}
                                info={I18n.t(`process_state.stateChanges`)}
                                onChange={() => this.setState({ stateChanges: !stateChanges })}
                            />
                        </li>
                    )}
                    <li>
                        <CheckBox
                            name="raw"
                            value={raw}
                            info={I18n.t(`process_state.raw`)}
                            onChange={() => this.setState({ raw: !raw })}
                        />
                    </li>
                    {process.traceback && (
                        <li>
                            <CheckBox
                                name="traceback"
                                value={traceback}
                                info={I18n.t(`process_state.traceback`)}
                                onChange={() => this.setState({ traceback: !traceback })}
                            />
                        </li>
                    )}
                </ul>
            </section>
        );
    };

    renderSummaryValue = (value: string | number | any) =>
        typeof value === "string" ? capitalize(value) : typeof value === "number" ? renderDateTime(value) : value;

    stateDelta = (prev: State, curr: State) => {
        const prevKeys = Object.keys(prev);
        const currKeys = Object.keys(curr);
        const newKeys = currKeys.filter(key => prevKeys.indexOf(key) === -1 || !isEqual(prev[key], curr[key]));
        const newState = newKeys.sort().reduce((acc: State, key) => {
            if (curr[key] === Object(curr[key]) && !Array.isArray(curr[key]) && prev[key]) {
                acc[key] = this.stateDelta(prev[key], curr[key]);
            } else {
                acc[key] = curr[key];
            }
            return acc;
        }, {});
        return newState;
    };

    renderProcessSubscriptionLink = (subscriptionProcesses: ProcessSubscription[]) => {
        if (isEmpty(subscriptionProcesses)) {
            return null;
        }
        return (
            <section className="subscription-link">
                {subscriptionProcesses.map((ps, index: number) => (
                    <div key={index}>
                        <EuiButton href={`/subscriptions/${ps.subscription_id}`} fill color="secondary" iconType="link">
                            {I18n.t(`${this.props.isProcess ? "process" : "task"}.subscription_link_txt`, {
                                target: ps.workflow_target
                            })}
                        </EuiButton>
                    </div>
                ))}
            </section>
        );
    };

    displayStateValue = (value: any) => {
        if (isEmpty(value)) {
            return "";
        }
        return typeof value === "object" ? <HighlightCode data={JSON.stringify(value, null, 3)} /> : value.toString();
    };

    renderStateChanges = (steps: Step[], index: number) => {
        const step = steps[index];
        const status = step.status;
        let json: {
            [index: string]: any;
        } = {};
        switch (status) {
            case "suspend":
            case "abort":
            case "skipped":
                return null;
            case "pending":
                if (!step.form) {
                    return null;
                }
                if (Array.isArray(step.form)) {
                    json = sortBy(step.form, ["name"]).reduce<{ [index: string]: any }>((acc, field) => {
                        acc[field.name] = "";
                        return acc;
                    }, {});
                } else {
                    Object.keys(step.form.properties as {})
                        .sort()
                        .reduce<{ [index: string]: any }>((acc, field) => {
                            acc[field] = "";
                            return acc;
                        }, {});
                }
                break;
            case "failed":
            case "waiting":
                json = step.state;
                break;
            case "success":
                let prevState = {};

                if (index > 0) {
                    let prev_index = index - 1;
                    while (
                        prev_index > 0 &&
                        (steps[prev_index].status === "failed" || steps[prev_index].status === "waiting")
                    ) {
                        prev_index--;
                    }
                    prevState = steps[prev_index].state;
                }

                json = this.stateDelta(prevState, step.state);
                break;
            default:
        }
        if (isEmpty(json)) {
            return null;
        }
        const iconName = index === 0 || steps[index - 1].status === "suspend" ? "user" : "pipelineApp";
        const stepIsCollapsed = this.props.collapsed && this.props.collapsed.includes(index);

        return (
            <section className="state-changes">
                <section className="state-divider">
                    <EuiIcon type={iconName} size="xxl" className="step-type" color="primary" fill="dark" />
                </section>

                <section className={stepIsCollapsed ? "state-delta collapsed" : "state-delta"}>
                    <table>
                        <tbody>
                            {Object.keys(json).map(key => (
                                <tr key={key}>
                                    <td id={`${index}-${applyIdNamingConvention(key)}-k`} className="key">
                                        {key}
                                    </td>
                                    <td id={`${index}-${applyIdNamingConvention(key)}-v`} className="value">
                                        {this.displayStateValue(json[key])}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </section>
        );
    };

    toggleStep = (index: number) => {
        if (this.props.onChangeCollapsed) {
            // console.log(`Calling provided prop function with step: ${index}`)
            this.props.onChangeCollapsed(index);
        }
    };

    renderProcessOverview = (process: CustomProcessWithDetails, details: boolean, stateChanges: boolean) => {
        const last = (i: number) => i === process.steps.length - 1;
        const summaryKeys: (keyof ProcessWithDetails)[] = [
            "status",
            this.props.isProcess ? "assignee" : "created_by",
            "step",
            "started",
            "last_modified"
        ];
        return (
            <section className="process-overview">
                {details && (
                    <section className="process-summary">
                        <table>
                            <tbody>
                                {summaryKeys.map(key => (
                                    <tr key={key}>
                                        <td className="title">{I18n.t(`process_state.summary.${key}`)}</td>
                                        <td className="value">{this.renderSummaryValue(prop(process, key))}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}
                <section className="steps">
                    {process.steps.map((step: Step, index: number) => {
                        return (
                            <div key={index} id={`step-index-${index}`} className="details-container">
                                <div className="step-container" onClick={() => this.toggleStep(index)}>
                                    <StepDetails step={step} />
                                    {!last(index) && (
                                        <section className="step-divider">
                                            <i className="fa fa-arrow-down" />
                                        </section>
                                    )}
                                </div>
                                {stateChanges && this.renderStateChanges(process.steps, index)}
                            </div>
                        );
                    })}
                </section>
            </section>
        );
    };

    renderTraceback = (process: CustomProcessWithDetails) => {
        return (
            <section className="traceback-container">
                <pre>{process.traceback}</pre>
            </section>
        );
    };

    render() {
        const { process, subscriptionProcesses } = this.props;
        const { raw, details, stateChanges, traceback } = this.state;
        return (
            <section className="process-state-detail">
                {this.renderProcessHeaderInformation(process)}
                {this.renderProcessSubscriptionLink(subscriptionProcesses)}
                {traceback && this.renderTraceback(process)}
                {raw ? this.renderRaw(process) : this.renderProcessOverview(process, details, stateChanges)}
            </section>
        );
    }
}

export default ProcessStateDetails;
