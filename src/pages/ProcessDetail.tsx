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

import "./ProcessDetail.scss";

import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiText } from "@elastic/eui";
import I18n from "i18n-js";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import ScrollUpButton from "react-scroll-up-button";
import { DecodedValueMap, NumberParam, QueryParamConfigMap, SetQuery, withQueryParams } from "use-query-params";

import { process, resumeProcess } from "../api";
import { abortProcess, deleteProcess, processSubscriptionsByProcessId, retryProcess } from "../api/index";
import ConfirmationDialog from "../components/ConfirmationDialog";
import ProcessStateDetails from "../components/ProcessStateDetails";
import UserInputFormWizard from "../components/UserInputFormWizard";
import ApplicationContext from "../utils/ApplicationContext";
import { setFlash } from "../utils/Flash";
import { organisationNameByUuid, productById, productNameById } from "../utils/Lookups";
import { CommaSeparatedNumericArrayParam } from "../utils/QueryParameters";
import { InputForm, Process, ProcessSubscription, ProcessWithDetails, Product, Step } from "../utils/types";
import { stop } from "../utils/Utils";
import { actionOptions } from "../validations/Processes";

const queryConfig: QueryParamConfigMap = { collapsed: CommaSeparatedNumericArrayParam, scrollToStep: NumberParam };

interface MatchParams {
    id: string;
}

interface IProps extends RouteComponentProps<MatchParams> {
    query: DecodedValueMap<typeof queryConfig>;
    setQuery: SetQuery<typeof queryConfig>;
    isProcess: boolean;
}

interface IState {
    process?: CustomProcessWithDetails;
    notFound: boolean;
    tabs: string[];
    selectedTab: string;
    subscriptionProcesses: ProcessSubscription[];
    loaded: boolean;
    stepUserInput?: InputForm;
    confirmationDialogOpen: boolean;
    confirmationDialogAction: (e: React.MouseEvent<HTMLButtonElement>) => void;
    confirm: (e: React.MouseEvent<HTMLButtonElement>) => void;
    confirmationDialogQuestion: string;
    product?: Product;
}

export interface CustomProcessWithDetails extends ProcessWithDetails {
    productName: string;
    customerName: string;
}

class ProcessDetail extends React.PureComponent<IProps, IState> {
    context!: React.ContextType<typeof ApplicationContext>;

    constructor(props: IProps) {
        super(props);
        this.state = {
            process: undefined,
            notFound: false,
            tabs: ["user_input", "process"],
            selectedTab: "process",
            subscriptionProcesses: [],
            loaded: false,
            stepUserInput: [],
            confirmationDialogOpen: false,
            confirmationDialogAction: (e: React.MouseEvent<HTMLButtonElement>) => {},
            confirm: (e: React.MouseEvent<HTMLButtonElement>) => {},
            confirmationDialogQuestion: ""
        };
    }

    componentDidMount = () => {
        process(this.props.match.params.id).then((processInstance: Process) => {
            /**
             * Ensure correct user memberships and populate UserInput form with values
             */

            const { organisations, products } = this.context;

            let enrichedProcess = processInstance as CustomProcessWithDetails;
            enrichedProcess.customerName = organisationNameByUuid(enrichedProcess.customer, organisations);
            enrichedProcess.productName = productNameById(enrichedProcess.product, products);

            const step = enrichedProcess.steps.find(
                step => step.name === enrichedProcess.step && step.status === "pending"
            );
            const stepUserInput: InputForm | undefined = step && step.form;
            const tabs = stepUserInput ? this.state.tabs : ["process"];
            const selectedTab = stepUserInput ? "user_input" : "process";

            this.setState({
                process: enrichedProcess,
                stepUserInput: stepUserInput,
                tabs: tabs,
                selectedTab: selectedTab,
                product: productById(enrichedProcess.product, products)
            });
            processSubscriptionsByProcessId(enrichedProcess.id)
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

    handleDeleteProcess = (process: CustomProcessWithDetails) => (e: React.MouseEvent<HTMLButtonElement>) => {
        stop(e);

        let message;
        if (this.props.isProcess) {
            message = I18n.t("processes.deleteConfirmation", {
                name: process.productName,
                customer: process.customerName
            });
        } else {
            message = I18n.t("tasks.deleteConfirmation", {
                name: process.workflow_name
            });
        }

        this.confirmation(message, () =>
            deleteProcess(process.id).then(() => {
                this.context.redirect(`/${this.props.isProcess ? "processes" : "tasks"}`);
                setFlash(
                    I18n.t(`${this.props.isProcess ? "processes" : "tasks"}.flash.delete`, {
                        name: process.productName
                    })
                );
            })
        );
    };

    handleAbortProcess = (process: CustomProcessWithDetails) => (e: React.MouseEvent<HTMLButtonElement>) => {
        stop(e);

        let message;
        if (this.props.isProcess) {
            message = I18n.t("processes.abortConfirmation", {
                name: process.productName,
                customer: process.customerName
            });
        } else {
            message = I18n.t("tasks.abortConfirmation", {
                name: process.workflow_name
            });
        }

        this.confirmation(message, () =>
            abortProcess(process.id).then(() => {
                this.context.redirect(`/${this.props.isProcess ? "processes" : "tasks"}`);
                setFlash(
                    I18n.t(`${this.props.isProcess ? "processes" : "tasks"}.flash.abort`, {
                        name: process.productName
                    })
                );
            })
        );
    };

    handleRetryProcess = (process: CustomProcessWithDetails) => (e: React.MouseEvent<HTMLButtonElement>) => {
        stop(e);

        let message;
        if (this.props.isProcess) {
            message = I18n.t("processes.retryConfirmation", {
                name: process.productName,
                customer: process.customerName
            });
        } else {
            message = I18n.t("tasks.retryConfirmation", {
                name: process.workflow_name
            });
        }

        this.confirmation(message, () =>
            retryProcess(process.id).then(() => {
                this.context.redirect(`/${this.props.isProcess ? `processes?highlight=${process.id}` : "tasks"}`);
                setFlash(
                    I18n.t(`${this.props.isProcess ? "processes" : "tasks"}.flash.retry`, {
                        name: process.productName
                    })
                );
            })
        );
    };

    handleCollapse = (step: number) => {
        let { collapsed } = this.props.query;
        if (collapsed && collapsed.includes(step)) {
            this.props.setQuery({ collapsed: collapsed.filter((item: number) => item !== step) }, "replaceIn");
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
            this.props.setQuery(
                { collapsed: this.state.process.steps.map((i: any, index: number) => index) },
                "replaceIn"
            );
        }
    };

    handleExpandAll = () => {
        this.props.setQuery({ collapsed: [] }, "replaceIn");
    };

    handleScrollTo = (step: number) => {
        const el = document.getElementById(`step-index-${step}`);
        if (!el) {
            return;
        }

        el.scrollIntoView();
        this.props.setQuery({ scrollToStep: step }, "replaceIn");
    };

    cancelConfirmation = () => this.setState({ confirmationDialogOpen: false });

    confirmation = (question: string, action: (e: React.MouseEvent<HTMLButtonElement>) => void) =>
        this.setState({
            confirmationDialogOpen: true,
            confirmationDialogQuestion: question,
            confirmationDialogAction: (e: React.MouseEvent<HTMLButtonElement>) => {
                this.cancelConfirmation();
                action(e);
            }
        });

    renderActions = (process: CustomProcessWithDetails) => {
        let options = actionOptions(
            process,
            () => false,
            this.handleRetryProcess(process),
            this.handleDeleteProcess(process),
            this.handleAbortProcess(process)
        ).filter(option => option.label !== "user_input" && option.label !== "details");

        if (this.props.isProcess) {
            options = options.filter(option => option.label !== "delete");
        }

        const lastStepIndex = process.steps.findIndex((item: Step) => item.name === process.step);

        return (
            <section className="process-actions">
                <EuiFlexGroup gutterSize="s" alignItems="center">
                    {options.map((option, index) => (
                        <EuiFlexItem grow={true}>
                            <EuiButton
                                id={option.label}
                                key={index}
                                fill
                                color={option.danger ? "danger" : "secondary"}
                                iconType={option.danger ? "cross" : "refresh"}
                                iconSide="right"
                                onClick={option.action}
                            >
                                {I18n.t(`processes.${option.label}`)}
                            </EuiButton>
                        </EuiFlexItem>
                    ))}
                    <EuiFlexItem grow={true}>
                        <EuiButton iconType="minimize" iconSide="right" onClick={this.handleCollapseAll}>
                            COLLAPSE
                        </EuiButton>
                    </EuiFlexItem>
                    <EuiFlexItem grow={true}>
                        <EuiButton iconType="expand" iconSide="right" onClick={this.handleExpandAll}>
                            EXPAND
                        </EuiButton>
                    </EuiFlexItem>
                    <EuiFlexItem grow={true}>
                        <EuiButton
                            iconType="sortDown"
                            iconSide="right"
                            onClick={() => this.handleScrollTo(lastStepIndex)}
                        >
                            SCROLL TO LAST
                        </EuiButton>
                    </EuiFlexItem>
                </EuiFlexGroup>
            </section>
        );
    };

    validSubmit = (processInput: {}[]) => {
        const { process } = this.state;
        if (!process) {
            return Promise.reject();
        }

        return resumeProcess(process.id, processInput).then(e => {
            this.context.redirect(`/${this.props.isProcess ? `processes?highlight=${process.id}` : "tasks"}`);
            setFlash(
                I18n.t(`${this.props.isProcess ? "process" : "task"}.flash.update`, { name: process.workflow_name })
            );
        });
    };

    switchTab = (tab: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
        stop(e);
        this.setState({ selectedTab: tab });
    };

    renderTabContent = (
        selectedTab: string,
        process: CustomProcessWithDetails,
        step: Step | undefined,
        stepUserInput: InputForm | undefined,
        subscriptionProcesses: ProcessSubscription[]
    ) => {
        const { products } = this.context;
        const product: Product | undefined = products.find((prod: Product) => prod.product_id === process.product);
        const productName = product && product.name;
        if (!step || !stepUserInput || selectedTab === "process") {
            return (
                <section className="card">
                    {this.renderActions(process)}
                    <ProcessStateDetails
                        process={process}
                        subscriptionProcesses={subscriptionProcesses}
                        collapsed={this.props.query.collapsed}
                        onChangeCollapsed={this.handleCollapse}
                        isProcess={this.props.isProcess}
                    />
                </section>
            );
        } else {
            return (
                <section className="card">
                    <section className="header-info">
                        <EuiText>
                            <h3>
                                {I18n.t(`${this.props.isProcess ? "process" : "task"}.workflow`, {
                                    name: process.workflow_name
                                })}
                                {I18n.t(`${this.props.isProcess ? "process" : "task"}.userInput`, {
                                    name: step.name,
                                    product: productName || ""
                                })}
                            </h3>
                        </EuiText>
                    </section>
                    <UserInputFormWizard
                        stepUserInput={stepUserInput}
                        validSubmit={this.validSubmit}
                        hasNext={false}
                        cancel={() => this.context.redirect(`/${this.props.isProcess ? "processes" : "tasks"}`)}
                    />
                </section>
            );
        }
    };

    renderTab = (tab: string, selectedTab: string) => (
        <span id={tab} key={tab} className={tab === selectedTab ? "active" : ""} onClick={this.switchTab(tab)}>
            {I18n.t(`${this.props.isProcess ? "process" : "task"}.tabs.${tab}`)}
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
        if (!process) {
            return null;
        }

        const step = process.steps.find((step: Step) => step.status === "pending");
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
                        <h1>{I18n.t(`${this.props.isProcess ? "process" : "task"}.notFound`)}</h1>
                    </section>
                )}
                <ScrollUpButton />
            </div>
        );
    }
}

ProcessDetail.contextType = ApplicationContext;

export default withQueryParams(queryConfig, ProcessDetail);
