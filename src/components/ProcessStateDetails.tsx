/*
 * Copyright 2019-2023 SURF.
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

import {
    EuiButtonIcon,
    EuiCheckbox,
    EuiCopy,
    EuiFlexGroup,
    EuiFlexItem,
    EuiFlyout,
    EuiFlyoutBody,
    EuiFlyoutHeader,
    EuiIcon,
    EuiLoadingChart,
    EuiPanel,
    EuiResizableContainer,
    EuiSpacer,
    EuiText,
    EuiTitle,
} from "@elastic/eui";
import HighlightCode from "components/HighlightCode";
import ProcessSubscriptionLink from "components/ProcessSubscriptionLink";
import StepDetails from "components/Step";
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import { capitalize, renderDateTime } from "utils/Lookups";
import { ProcessSubscription, ProcessWithDetails, Step, prop } from "utils/types";
import { applyIdNamingConvention, isEmpty, stateDelta } from "utils/Utils";

import { processStateDetailsStyling } from "./ProcessStateDetailsStyling";

const HIDDEN_KEYS = ["label_", "divider_", "__"];

function StateChanges({
    steps,
    index,
    collapsed = false,
    showHiddenKeys,
}: {
    steps: Step[];
    index: number;
    collapsed?: boolean;
    showHiddenKeys: boolean;
}) {
    const displayStateValue = (value: any) => {
        if (isEmpty(value)) {
            return "";
        }
        return typeof value === "object" ? <HighlightCode data={JSON.stringify(value, null, 3)} /> : value.toString();
    };

    const displayMailConfirmation = (value: any) => {
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
                <div className="emailMessage" dangerouslySetInnerHTML={{ __html: value.message }}></div>
            </EuiText>
        );
    };

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

            json = stateDelta(prevState, step.state);
            break;
        default:
    }
    if (isEmpty(json)) {
        return null;
    }
    const iconName = index === 0 || steps[index - 1].status === "suspend" ? "user" : "pipelineApp";
    let data = Object.keys(json);
    if (!showHiddenKeys) {
        data = data.filter((key) => !HIDDEN_KEYS.some((word) => key.startsWith(word)));
    }

    return (
        <section className="state-changes">
            <section className="state-divider">
                <EuiIcon type={iconName} size="xxl" className="step-type" color="primary" fill="dark" />
            </section>

            <section className={collapsed ? "state-delta collapsed" : "state-delta"}>
                <table>
                    <tbody>
                        {data.map((key) => (
                            <tr key={key}>
                                <td id={`${index}-${applyIdNamingConvention(key)}-k`} className="key">
                                    {key}
                                </td>
                                <td id={`${index}-${applyIdNamingConvention(key)}-v`} className="value">
                                    {key === "confirmation_mail"
                                        ? displayMailConfirmation(json[key])
                                        : displayStateValue(json[key])}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </section>
    );
}

function ProcessOverview({
    steps,
    stateChanges,
    onChangeCollapsed,
    collapsed,
    showHiddenKeys,
}: {
    steps: Step[];
    stateChanges: boolean;
    onChangeCollapsed?: (index: number) => void;
    collapsed?: number[];
    showHiddenKeys: boolean;
}) {
    const last = (i: number) => i === steps.length - 1;

    return (
        <section className="process-overview">
            <section className="steps">
                {steps.map((step: Step, index: number) => {
                    return (
                        <div key={index} id={`step-index-${index}`} className="details-container">
                            <div
                                className="step-container"
                                onClick={onChangeCollapsed ? () => onChangeCollapsed(index) : undefined}
                            >
                                <StepDetails step={step} />
                                {!last(index) && (
                                    <section className="step-divider">
                                        <i className="fa fa-arrow-down" />
                                    </section>
                                )}
                            </div>
                            {stateChanges && (
                                <StateChanges
                                    steps={steps}
                                    key={index}
                                    index={index}
                                    collapsed={collapsed && collapsed.includes(index)}
                                    showHiddenKeys={showHiddenKeys}
                                />
                            )}
                        </div>
                    );
                })}
            </section>
        </section>
    );
}

interface IProps {
    process: ProcessWithDetails;
    productName: string;
    customerName: string;
    subscriptionProcesses: ProcessSubscription[];
    collapsed?: number[];
    onChangeCollapsed: (index: number) => void; // when provided it will toggle the collapse functionality
    isProcess: boolean;
}

interface ISubscriptionDelta {
    modalOpen: boolean;
    subscriptionId: string;
    before: any;
    now: any;
}

function ProcessStateDetails({
    process,
    productName,
    customerName,
    subscriptionProcesses,
    isProcess,
    onChangeCollapsed,
    collapsed = [],
}: IProps) {
    const [raw, setRaw] = useState(false);
    const [details, setDetails] = useState(true);
    const [stateChanges, setStateChanges] = useState(true);
    const [traceback, setTraceback] = useState(false);
    const [showHiddenKeys, setShowHiddenKeys] = useState(false);
    const [loading, setLoading] = useState(false);
    const [collapsedDeltaPanel, setCollapsedDeltaPanel] = useState(false);
    const [subscriptionDelta, setSubscriptionDelta] = useState<ISubscriptionDelta>({
        modalOpen: false,
        subscriptionId: "",
        before: {},
        now: {},
    });

    const closeSubscriptionDeltaModal = () => {
        setSubscriptionDelta({ modalOpen: false, subscriptionId: "", before: {}, now: {} });
        setLoading(false);
    };

    const openSubscriptionDeltaModal = (subscriptionId: string, before: any, now: any) => {
        setLoading(true);
        setSubscriptionDelta({ modalOpen: true, subscriptionId: subscriptionId, before: before, now: now });
    };

    const summaryKeys: (keyof ProcessWithDetails)[] = [
        "status",
        isProcess ? "assignee" : "created_by",
        "step",
        "started",
        "last_modified",
    ];
    const renderSummaryValue = (value: string | number | any) =>
        typeof value === "string" ? capitalize(value) : typeof value === "number" ? renderDateTime(value) : value;

    const renderRaw = (process: ProcessWithDetails) => {
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
    const handleDeltaClick = (subscriptionId: string, before: any, now: any) => {
        openSubscriptionDeltaModal(subscriptionId, before, now);
    };

    const renderProcessHeaderInformation = (process: ProcessWithDetails) => {
        return (
            <section className="header-information">
                <ul>
                    <li className="process-wording">
                        <EuiText>
                            <h3>
                                {isProcess && (
                                    <FormattedMessage
                                        id="process_state.wording_process"
                                        values={{
                                            product: productName,
                                            customer: customerName,
                                            workflow: process.workflow_name,
                                        }}
                                    />
                                )}
                                {!isProcess && (
                                    <FormattedMessage
                                        id="process_state.wording_task"
                                        values={{ workflow: process.workflow_name }}
                                    />
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
                                label={<FormattedMessage id="process_state.details" />}
                                onChange={() => setDetails(!details)}
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
                                label={<FormattedMessage id="process_state.stateChanges" />}
                                onChange={() => setStateChanges(!stateChanges)}
                            />
                        </li>
                    )}
                    <li>
                        <EuiCheckbox
                            id="show-raw-json-toggle"
                            aria-label="toggle-raw-json"
                            name="raw"
                            checked={raw}
                            label={<FormattedMessage id="process_state.raw" />}
                            onChange={() => setRaw(!raw)}
                        />
                    </li>
                    <li>
                        <EuiCheckbox
                            id="toggle-hidden-keys"
                            aria-label="toggle-hidden-keys"
                            name="toggle-hidden-keys"
                            checked={showHiddenKeys}
                            label={<FormattedMessage id="process_state.show_hidden_keys" />}
                            onChange={() => setShowHiddenKeys(!showHiddenKeys)}
                        />
                    </li>
                    {process.traceback && (
                        <li>
                            <EuiCheckbox
                                id="show-traceback-toggle"
                                aria-label="toggle-traceback"
                                name="traceback"
                                checked={traceback}
                                label={<FormattedMessage id="process_state.traceback" />}
                                onChange={() => setTraceback(!traceback)}
                            />
                        </li>
                    )}
                </ul>
            </section>
        );
    };

    return (
        <EuiPanel hasShadow={false} css={processStateDetailsStyling}>
            <section className="process-state-detail">
                {subscriptionDelta.modalOpen && (
                    <EuiFlyout size={window.window.innerWidth} onClose={closeSubscriptionDeltaModal}>
                        <EuiFlyoutHeader hasBorder aria-labelledby="subscription-delta-modal">
                            <EuiTitle>
                                <h3 id="subscription-delta-modal-header">
                                    Inspect subscription changes for {subscriptionDelta.subscriptionId}
                                </h3>
                            </EuiTitle>
                        </EuiFlyoutHeader>
                        <EuiFlyoutBody>
                            <>
                                <EuiFlexGroup gutterSize="s">
                                    <EuiFlexItem grow={false}>
                                        <EuiText>
                                            <h4>Delta</h4>
                                        </EuiText>
                                    </EuiFlexItem>
                                    <EuiFlexItem grow={false}>
                                        <EuiButtonIcon
                                            iconType={collapsedDeltaPanel ? "arrowRight" : "arrowDown"}
                                            aria-label="Toggle related subscriptions"
                                            onClick={() => setCollapsedDeltaPanel(!collapsedDeltaPanel)}
                                        />
                                    </EuiFlexItem>
                                    <EuiFlexItem></EuiFlexItem>
                                </EuiFlexGroup>
                                {!collapsedDeltaPanel && (
                                    <EuiPanel color="transparent" hasBorder={true}>
                                        <HighlightCode
                                            data={JSON.stringify(
                                                stateDelta(subscriptionDelta.before, subscriptionDelta.now),
                                                null,
                                                2
                                            )}
                                        />
                                    </EuiPanel>
                                )}

                                <EuiResizableContainer style={{ height: "100%" }}>
                                    {(EuiResizablePanel, EuiResizableButton) => (
                                        <>
                                            <EuiResizablePanel
                                                initialSize={window.window.innerWidth / 2}
                                                style={{ marginLeft: "-15px" }}
                                            >
                                                <EuiText>
                                                    <h4>Before</h4>
                                                </EuiText>
                                                <HighlightCode
                                                    data={JSON.stringify(subscriptionDelta.before, null, 2)}
                                                />
                                            </EuiResizablePanel>

                                            <EuiResizableButton />

                                            <EuiResizablePanel initialSize={window.window.innerWidth / 2}>
                                                <EuiText>
                                                    <h4>Now</h4>
                                                </EuiText>
                                                <HighlightCode data={JSON.stringify(subscriptionDelta.now, null, 2)} />
                                            </EuiResizablePanel>
                                        </>
                                    )}
                                </EuiResizableContainer>
                            </>
                        </EuiFlyoutBody>
                    </EuiFlyout>
                )}

                {renderProcessHeaderInformation(process)}
                {traceback && (
                    <section className="traceback-container">
                        <pre>{process.traceback}</pre>
                    </section>
                )}
                {raw ? (
                    renderRaw(process)
                ) : (
                    <>
                        {details && (
                            <section className="process-summary">
                                <table>
                                    <tbody>
                                        {summaryKeys.map((key) => (
                                            <tr key={key}>
                                                <td className="title">
                                                    <FormattedMessage id={`process_state.summary.${key}`} />
                                                </td>
                                                <td className="value">{renderSummaryValue(prop(process, key))}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>
                        )}
                        {loading && <EuiLoadingChart size="xl" mono />}
                        {!loading && (
                            <ProcessSubscriptionLink
                                subscriptionProcesses={subscriptionProcesses}
                                isProcess={isProcess}
                                currentState={process.current_state}
                                handleDeltaClick={handleDeltaClick}
                            />
                        )}
                        <EuiSpacer />
                        <ProcessOverview
                            steps={process.steps}
                            stateChanges={stateChanges}
                            onChangeCollapsed={onChangeCollapsed}
                            collapsed={collapsed}
                            showHiddenKeys={showHiddenKeys}
                        />
                    </>
                )}
            </section>
        </EuiPanel>
    );
}

export default ProcessStateDetails;
