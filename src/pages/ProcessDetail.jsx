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
import PropTypes from "prop-types";

import { process, resumeProcess } from "../api";
import { isEmpty, stop } from "../utils/Utils";
import { setFlash } from "../utils/Flash";
import UserInputFormWizard from "../components/UserInputFormWizard";
import ProcessStateDetails from "../components/ProcessStateDetails";
import { organisationNameByUuid, productById, productNameById } from "../utils/Lookups";
import { abortProcess, deleteProcess, retryProcess, processSubscriptionsByProcessId } from "../api/index";

import "./ProcessDetail.scss";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { actionOptions } from "../validations/Processes";
import ScrollUpButton from "react-scroll-up-button";
import ApplicationContext from "../utils/ApplicationContext";
import { withQueryParams, NumberParam } from "use-query-params";
import { CommaSeparatedNumericArrayParam } from "../utils/QueryParameters";

const queryConfig = { collapsed: CommaSeparatedNumericArrayParam, scrollToStep: NumberParam };

class ProcessDetail extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            process: { steps: [] },
            notFound: false,
            tabs: ["user_input", "process"],
            selectedTab: "process",
            subscriptionProcesses: [],
            loaded: false,
            subscriptions: [],
            stepUserInput: [],
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this,
            confirm: () => this,
            confirmationDialogQuestion: ""
        };
    }

    componentDidMount = () => {
        process(this.props.match.params.id).then(processInstance => {
            /**
             * Ensure correct user memberships and populate UserInput form with values
             */

            const { configuration, currentUser, organisations, products } = this.context;

            processInstance.customerName = organisationNameByUuid(processInstance.customer, organisations);
            processInstance.productName = productNameById(processInstance.product, products);

            const userInputAllowed =
                currentUser || currentUser.memberships.find(membership => membership === requiredTeamMembership);
            let stepUserInput = [];
            if (userInputAllowed) {
                const step = processInstance.steps.find(
                    step => step.name === processInstance.step && step.status === "pending"
                );
                stepUserInput = step && step.form;
            }
            const requiredTeamMembership = configuration[processInstance.assignee];
            const tabs = !isEmpty(stepUserInput) ? this.state.tabs : ["process"];
            const selectedTab = !isEmpty(stepUserInput) ? "user_input" : "process";

            this.setState({
                process: processInstance,
                stepUserInput: stepUserInput,
                tabs: tabs,
                selectedTab: selectedTab,
                product: productById(processInstance.product, products)
            });
            processSubscriptionsByProcessId(processInstance.id)
                .then(res => {
                    this.setState({ subscriptionProcesses: res, loaded: true });
                })
                .catch(err => {
                    if (err.response && err.response.status === 404) {
                        this.setState({ notFound: true, loaded: true });
                    } else {
                        throw err;
                    }
                });
        });
    };

    handleDeleteProcess = process => e => {
        stop(e);
        this.confirmation(
            I18n.t("processes.deleteConfirmation", {
                name: process.productName,
                customer: process.customerName
            }),
            () =>
                deleteProcess(process.id).then(() => {
                    this.context.redirect(`/processes`);
                    setFlash(I18n.t("processes.flash.delete", { name: process.productName }));
                })
        );
    };

    handleAbortProcess = process => e => {
        stop(e);
        this.confirmation(
            I18n.t("processes.abortConfirmation", {
                name: process.productName,
                customer: process.customerName
            }),
            () =>
                abortProcess(process.id).then(() => {
                    this.context.redirect(`/processes`);
                    setFlash(I18n.t("processes.flash.abort", { name: process.productName }));
                })
        );
    };

    handleRetryProcess = process => e => {
        stop(e);
        this.confirmation(
            I18n.t("processes.retryConfirmation", {
                name: process.productName,
                customer: process.customerName
            }),
            () =>
                retryProcess(process.id).then(() => {
                    this.context.redirect(`/processes`);
                    setFlash(I18n.t("processes.flash.retry", { name: process.productName }));
                })
        );
    };

    handleCollapse = step => {
        let { collapsed } = this.props.query;
        if (collapsed && collapsed.includes(step)) {
            this.props.setQuery({ collapsed: collapsed.filter(item => item !== step) }, "replaceIn");
        } else {
            if (!collapsed) {
                collapsed = [];
            }

            collapsed.push(step);
            this.props.setQuery({ collapsed: collapsed }, "replaceIn");
        }
    };

    handleCollapseAll = () => {
        if (this.state.process) {
            this.props.setQuery({ collapsed: this.state.process.steps.map((i, index) => index) }, "replaceIn");
        }
    };

    handleExpandAll = () => {
        this.props.setQuery({ collapsed: [] }, "replaceIn");
    };

    handleScrollTo = step => {
        const el = document.getElementById(`step-index-${step}`);
        if (!el) {
            return;
        }

        el.scrollIntoView();
        this.props.setQuery({ scrollToStep: step }, "replaceIn");
    };

    cancelConfirmation = () => this.setState({ confirmationDialogOpen: false });

    confirmation = (question, action) =>
        this.setState({
            confirmationDialogOpen: true,
            confirmationDialogQuestion: question,
            confirmationDialogAction: () => {
                this.cancelConfirmation();
                action();
            }
        });

    renderActions = process => {
        const options = actionOptions(
            process,
            () => false,
            this.handleRetryProcess(process),
            this.handleDeleteProcess(process),
            this.handleAbortProcess(process)
        ).filter(option => option.label !== "user_input" && option.label !== "details" && option.label !== "delete");

        const lastStepIndex = process.steps.findIndex(item => item.name === process.step);

        return (
            <section className="process-actions">
                {options.map((option, index) => (
                    <button
                        id={option.label}
                        key={index}
                        className={`button ${option.danger ? " red" : " blue"}`}
                        onClick={option.action}
                    >
                        {I18n.t(`processes.${option.label}`)}
                    </button>
                ))}
                <button className="button" onClick={this.handleCollapseAll}>
                    Collapse
                </button>
                <button className="button" onClick={this.handleExpandAll}>
                    Expand
                </button>
                <button className="button" onClick={() => this.handleScrollTo(lastStepIndex)}>
                    Scroll to Last
                </button>
            </section>
        );
    };

    validSubmit = processInput => {
        const { process } = this.state;
        let result = resumeProcess(process.id, processInput);
        result
            .then(e => {
                this.context.redirect(`/processes`);
                setFlash(I18n.t("process.flash.update", { name: process.workflow_name }));
            })
            .catch(error => {
                // Todo: handle errors in a more uniform way. The error dialog is behind stack trace when enabled. This catch shouldn't be needed.
            });
        return result;
    };

    switchTab = tab => e => {
        stop(e);
        this.setState({ selectedTab: tab });
    };

    renderTabContent = (selectedTab, process, step, stepUserInput, subscriptionProcesses) => {
        const { products } = this.context;
        const product = products.find(prod => prod.product_id === process.product);
        const productName = product.name;
        if (selectedTab === "process") {
            return (
                <section className="card">
                    {this.renderActions(process)}
                    <ProcessStateDetails
                        process={process}
                        subscriptionProcesses={subscriptionProcesses}
                        collapsed={this.props.query.collapsed}
                        onChangeCollapsed={this.handleCollapse}
                    />
                </section>
            );
        } else {
            return (
                <section className="card">
                    <section className="header-info">
                        <h3>{I18n.t("process.workflow", { name: process.workflow_name })}</h3>
                        <h3>
                            {I18n.t("process.userInput", {
                                name: step.name,
                                product: productName
                            })}
                        </h3>
                    </section>
                    <UserInputFormWizard stepUserInput={stepUserInput} validSubmit={this.validSubmit} />
                </section>
            );
        }
    };

    renderTab = (tab, selectedTab) => (
        <span id={tab} key={tab} className={tab === selectedTab ? "active" : ""} onClick={this.switchTab(tab)}>
            {I18n.t(`process.tabs.${tab}`)}
        </span>
    );

    render() {
        const {
            loaded,
            notFound,
            process,
            tabs,
            stepUserInput,
            selectedTab,
            subscriptionProcesses,
            confirmationDialogOpen,
            confirmationDialogAction,
            confirmationDialogQuestion
        } = this.state;
        const step = process.steps.find(step => step.status === "pending");
        const renderNotFound = loaded && notFound;
        const renderContent = loaded && !notFound;
        return (
            <div className="mod-process-detail">
                <ConfirmationDialog
                    isOpen={confirmationDialogOpen}
                    cancel={this.cancelConfirmation}
                    confirm={confirmationDialogAction}
                    question={confirmationDialogQuestion}
                />
                <section className="tabs">{tabs.map(tab => this.renderTab(tab, selectedTab))}</section>
                {renderContent &&
                    this.renderTabContent(selectedTab, process, step, stepUserInput, subscriptionProcesses)}
                {renderNotFound && (
                    <section className="not-found card">
                        <h1>{I18n.t("process.notFound")}</h1>
                    </section>
                )}
                <ScrollUpButton />
            </div>
        );
    }
}

ProcessDetail.propTypes = {
    // URL query controlled
    query: PropTypes.object,
    setQuery: PropTypes.func
};

ProcessDetail.defaultProps = {};

ProcessDetail.contextType = ApplicationContext;

export default withQueryParams(queryConfig, ProcessDetail);
