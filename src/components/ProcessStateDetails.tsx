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

import "components/ProcessStateDetails.scss";

import { EuiButton, EuiCheckbox, EuiCopy, EuiIcon, EuiText } from "@elastic/eui";
import HighlightCode from "components/HighlightCode";
import StepDetails from "components/Step";
import { intl } from "locale/i18n";
import isEqual from "lodash/isEqual";
import { CustomProcessWithDetails } from "pages/ProcessDetail";
import React from "react";
import { capitalize, renderDateTime } from "utils/Lookups";
import { ProcessSubscription, ProcessWithDetails, State, Step, prop } from "utils/types";
import { applyIdNamingConvention, isEmpty } from "utils/Utils";

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
    traceback: boolean;
}

class ProcessStateDetails extends React.PureComponent<IProps, IState> {
    public static defaultProps = {
        collapsed: [],
    };

    state: IState = {
        raw: false,
        details: true,
        stateChanges: true,
        traceback: false,
    };

    renderRaw = (process: CustomProcessWithDetails) => {
        const json = JSON.stringify(process, null, 4);
        return (
            <section>
                <EuiCopy textToCopy={json}>
                    {(copy) => (
                        <span className="copy-to-clipboard-container">
                            <button data-for="copy-to-clipboard" onClick={copy}>
                                <i className={`far fa-clone`} />
                            </button>
                        </span>
                    )}
                </EuiCopy>
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
                                    intl.formatMessage(
                                        { id: "process_state.wording_process" },
                                        {
                                            product: process.productName,
                                            customer: process.customerName,
                                            workflow: process.workflow_name,
                                        }
                                    )}
                                {!this.props.isProcess &&
                                    intl.formatMessage(
                                        { id: "process_state.wording_task" },
                                        { workflow: process.workflow_name }
                                    )}
                            </h3>
                        </EuiText>
                    </li>
                </ul>
                <ul>
                    {!raw && (
                        <li className="toggle-details">
                            <EuiCheckbox
                                id="show-details-toggle"
                                aria-label="toggle-details"
                                name="details"
                                checked={details}
                                label={intl.formatMessage({ id: "process_state.details" })}
                                onChange={() => this.setState({ details: !details })}
                            />
                        </li>
                    )}
                    {!raw && (
                        <li className="toggle-state-changes">
                            <EuiCheckbox
                                id="show-state-delta-toggle"
                                aria-label="toggle-state-delta"
                                name="state-changes"
                                checked={stateChanges}
                                label={intl.formatMessage({ id: "process_state.stateChanges" })}
                                onChange={() => this.setState({ stateChanges: !stateChanges })}
                            />
                        </li>
                    )}
                    <li>
                        <EuiCheckbox
                            id="show-raw-json-toggle"
                            aria-label="toggle-raw-json"
                            name="raw"
                            checked={raw}
                            label={intl.formatMessage({ id: "process_state.raw" })}
                            onChange={() => this.setState({ raw: !raw })}
                        />
                    </li>
                    {process.traceback && (
                        <li>
                            <EuiCheckbox
                                id="show-traceback-toggle"
                                aria-label="toggle-traceback"
                                name="traceback"
                                checked={traceback}
                                label={intl.formatMessage({ id: "process_state.traceback" })}
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
        const newKeys = currKeys.filter((key) => prevKeys.indexOf(key) === -1 || !isEqual(prev[key], curr[key]));
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
                        <EuiButton
                            id="to-subscription"
                            href={`/subscriptions/${ps.subscription_id}`}
                            fill
                            // color="secondary"
                            iconType="link"
                        >
                            {intl.formatMessage(
                                { id: `${this.props.isProcess ? "process" : "task"}.subscription_link_txt` },
                                { target: ps.workflow_target }
                            )}
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

    displayMailConfirmation = (value: any) => {
        if (isEmpty(value)) {
            return "";
        }
        return (
            <EuiText size="s">
                <h4>To</h4>
                <p>
                    {value.to.map((v: { email: String; name: String }) => (
                        <div>
                            {v.name} &lt;<a href={`mailto: ${v.email}`}>{v.email}</a>&gt;
                        </div>
                    ))}
                </p>
                <h4>CC</h4>
                <p>
                    {value.cc.map((v: { email: String; name: String }) => (
                        <div>
                            {v.name} &lt;<a href={`mailto: ${v.email}`}>{v.email}</a>&gt;
                        </div>
                    ))}
                </p>
                <h4>Subject</h4>
                <p>{value.subject}</p>
                <h4>Message</h4>
                <div dangerouslySetInnerHTML={{ __html: value.message }}></div>
            </EuiText>
        );
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
                Object.keys(step.form.properties as {})
                    .sort()
                    .reduce<{ [index: string]: any }>((acc, field) => {
                        acc[field] = "";
                        return acc;
                    }, {});

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
                            {Object.keys(json).map((key) => (
                                <tr key={key}>
                                    <td id={`${index}-${applyIdNamingConvention(key)}-k`} className="key">
                                        {key}
                                    </td>
                                    <td id={`${index}-${applyIdNamingConvention(key)}-v`} className="value">
                                        {key === "confirmation_mail"
                                            ? this.displayMailConfirmation(json[key])
                                            : this.displayStateValue(json[key])}
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
            "last_modified",
        ];
        return (
            <section className="process-overview">
                {details && (
                    <section className="process-summary">
                        <table>
                            <tbody>
                                {summaryKeys.map((key) => (
                                    <tr key={key}>
                                        <td className="title">
                                            {intl.formatMessage({ id: `process_state.summary.${key}` })}
                                        </td>
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
