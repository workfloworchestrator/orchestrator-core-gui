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

import "pages/ProcessDetail.scss";

import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiPage, EuiPageBody, EuiPanel, EuiText } from "@elastic/eui";
import UserInputFormWizard from "components/inputForms/UserInputFormWizard";
import ProcessStateDetails from "components/ProcessStateDetails";
import ConfirmationDialogContext, {
    ConfirmDialogActions,
    ShowConfirmDialogType,
} from "contextProviders/ConfirmationDialogProvider";
import RunningProcessesContext from "contextProviders/runningProcessesProvider";
import React from "react";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";
import { RouteComponentProps } from "react-router-dom";
import ScrollUpButton from "react-scroll-up-button";
import { DecodedValueMap, NumberParam, QueryParamConfigMap, SetQuery, withQueryParams } from "use-query-params";
import ApplicationContext from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";
import { organisationNameByUuid, productById, productNameById } from "utils/Lookups";
import { CommaSeparatedNumericArrayParam } from "utils/QueryParameters";
import { InputForm, ProcessSubscription, ProcessWithDetails, Product, Step, WsProcessV2 } from "utils/types";
import { stop } from "utils/Utils";
import { actionOptions } from "validations/Processes";

const queryConfig: QueryParamConfigMap = { collapsed: CommaSeparatedNumericArrayParam, scrollToStep: NumberParam };

interface MatchParams {
    id: string;
}

interface IProps extends RouteComponentProps<MatchParams>, WrappedComponentProps {
    query: DecodedValueMap<typeof queryConfig>;
    setQuery: SetQuery<typeof queryConfig>;
}

interface IState {
    process?: ProcessWithDetails;
    notFound: boolean;
    tabs: string[];
    selectedTab: string;
    subscriptionProcesses: ProcessSubscription[];
    loaded: boolean;
    stepUserInput?: InputForm;
    product?: Product;
    httpIntervalFallback: NodeJS.Timeout | undefined;
    wsProcess?: WsProcessV2;
    productName: string;
    customerName: string;
    showConfirmDialog: ShowConfirmDialogType;
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
            httpIntervalFallback: undefined,
            wsProcess: undefined,
            productName: "",
            customerName: "",
            showConfirmDialog: () => {},
        };
    }

    initializeProcessDetails = (processInstance: ProcessWithDetails) => {
        /**
         * Ensure correct user memberships and populate UserInput form with values
         */

        const { organisations, products } = this.context;

        let enrichedProcess = processInstance as ProcessWithDetails;

        const stepUserInput: InputForm | undefined = enrichedProcess.form;
        const tabs = stepUserInput ? this.state.tabs : ["process"];
        const selectedTab = stepUserInput ? "user_input" : "process";

        this.setState({
            productName: productNameById(enrichedProcess.product, products),
            customerName: organisationNameByUuid(enrichedProcess.customer, organisations),
            process: enrichedProcess,
            stepUserInput: stepUserInput,
            tabs: tabs,
            selectedTab: selectedTab,
            product: productById(enrichedProcess.product, products),
        });
        this.context.apiClient
            .processSubscriptionsByProcessId(enrichedProcess.id)
            .then((res) => {
                this.setState({ subscriptionProcesses: res, loaded: true });
            })
            .catch((err) => {
                if (err.response && err.response.status === 404) {
                    this.setState({ notFound: true, loaded: true });
                } else {
                    throw err;
                }
            });
    };

    updateProcessHttp = (processInstance: ProcessWithDetails) => {
        let enrichedProcess = processInstance as ProcessWithDetails;

        const stepUserInput: InputForm | undefined = enrichedProcess.form;
        const tabs = stepUserInput ? this.state.tabs : ["process"];
        const selectedTab = stepUserInput ? "user_input" : "process";

        this.setState({
            process: { ...this.state.process, ...enrichedProcess },
            stepUserInput: stepUserInput,
            tabs: tabs,
            selectedTab: selectedTab,
        });

        if (enrichedProcess.status === "completed" && this.state.httpIntervalFallback) {
            clearInterval(this.state.httpIntervalFallback);
        }
    };

    handleWebsocketError = (error: any) => {
        setFlash(error.detail, "error");
    };

    httpfallback = () => {
        if (this.state?.process?.status !== "completed" && !this.state.httpIntervalFallback) {
            const httpIntervalFallback = setInterval(() => {
                this.context.apiClient.process(this.props.match.params.id).then(this.updateProcessHttp);
            }, 3000);
            this.setState({ httpIntervalFallback });
        }
    };

    componentDidMount = () => {
        this.context.apiClient.process(this.props.match.params.id).then(this.initializeProcessDetails);
    };

    handleUpdateProcess = (runningProcesses: WsProcessV2[]) => {
        const process = runningProcesses.find((p) => p.pid === this.props.match.params.id);
        if (this.state.wsProcess === process || !process) {
            return <></>;
        }

        const enrichedProcess = { ...(this.state.process as ProcessWithDetails), ...process };
        const stepUserInput: InputForm | undefined = process.form;
        const tabs = stepUserInput ? this.state.tabs : ["process"];
        const selectedTab = stepUserInput ? "user_input" : "process";
        this.setState({
            wsProcess: process,
            process: enrichedProcess,
            stepUserInput: stepUserInput,
            tabs: tabs,
            selectedTab: selectedTab,
        });
        return <></>;
    };

    handleDeleteProcess = (process: ProcessWithDetails) => (e: React.MouseEvent<HTMLButtonElement>) => {
        stop(e);
        const { intl } = this.props;

        let message;
        if (!process.is_task) {
            message = intl.formatMessage(
                { id: "processes.deleteConfirmation" },
                { name: this.state.productName, customer: this.state.customerName }
            );
        } else {
            message = intl.formatMessage({ id: "tasks.deleteConfirmation" }, { name: process.workflow_name });
        }

        this.confirmation(message, () =>
            this.context.apiClient.deleteProcess(process.id).then(() => {
                this.context.redirect(`/${process.is_task ? "tasks" : "processes"}`);
                setFlash(
                    intl.formatMessage(
                        { id: `${process.is_task ? "tasks" : "processes"}.flash.delete` },
                        { name: this.state.productName }
                    )
                );
            })
        );
    };

    handleAbortProcess = (process: ProcessWithDetails) => (e: React.MouseEvent<HTMLButtonElement>) => {
        stop(e);
        const { intl } = this.props;

        let message;
        if (!process.is_task) {
            message = intl.formatMessage(
                { id: "processes.abortConfirmation" },
                { name: this.state.productName, customer: this.state.customerName }
            );
        } else {
            message = intl.formatMessage({ id: "tasks.abortConfirmation" }, { name: process.workflow_name });
        }

        this.confirmation(message, () =>
            this.context.apiClient.abortProcess(process.id).then(() => {
                this.context.redirect(process.is_task ? "/tasks" : "/processes");
                setFlash(
                    intl.formatMessage(
                        { id: `${process.is_task ? "tasks" : "processes"}.flash.abort` },
                        { name: this.state.productName }
                    )
                );
            })
        );
    };

    handleRetryProcess = (process: ProcessWithDetails) => (e: React.MouseEvent<HTMLButtonElement>) => {
        stop(e);
        const { intl } = this.props;

        let message;
        if (!process.is_task) {
            message = intl.formatMessage(
                { id: "processes.retryConfirmation" },
                { name: this.state.productName, customer: this.state.customerName }
            );
        } else {
            message = intl.formatMessage({ id: "tasks.retryConfirmation" }, { name: process.workflow_name });
        }

        this.confirmation(message, () =>
            this.context.apiClient.retryProcess(process.id).then(() => {
                this.context.redirect(process.is_task ? "/tasks" : `/processes?highlight=${process.id}`);
                setFlash(
                    intl.formatMessage(
                        { id: `${process.is_task ? "tasks" : "processes"}.flash.retry` },
                        { name: this.state.productName }
                    )
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

    confirmation = (question: string, confirmAction: (e: React.MouseEvent) => void) =>
        this.state.showConfirmDialog({ question, confirmAction });

    renderActions = (process: ProcessWithDetails) => {
        const { intl } = this.props;
        const { allowed } = this.context;

        let options = actionOptions(
            allowed,
            process,
            () => false,
            this.handleRetryProcess(process),
            this.handleDeleteProcess(process),
            this.handleAbortProcess(process)
        ).filter((option) => option.label !== "user_input" && option.label !== "details");

        if (!process.is_task) {
            options = options.filter((option) => option.label !== "delete");
        }

        const lastStepIndex = process.steps.findIndex((item: Step) => item.name === process.step);

        return (
            <section className="process-actions">
                <EuiFlexGroup gutterSize="s" alignItems="center">
                    {options.map((option, index) => (
                        <EuiFlexItem grow={true} key={index}>
                            <EuiButton
                                id={option.label}
                                fill
                                color={option.danger ? "danger" : "accent"}
                                iconType={option.danger ? "cross" : "refresh"}
                                iconSide="right"
                                onClick={option.action}
                            >
                                {intl.formatMessage({ id: `processes.actions.${option.label}` }).toUpperCase()}
                            </EuiButton>
                        </EuiFlexItem>
                    ))}
                    <EuiFlexItem grow={true}>
                        <EuiButton fill iconType="minimize" iconSide="right" onClick={this.handleCollapseAll}>
                            COLLAPSE
                        </EuiButton>
                    </EuiFlexItem>
                    <EuiFlexItem grow={true}>
                        <EuiButton fill iconType="expand" iconSide="right" onClick={this.handleExpandAll}>
                            EXPAND
                        </EuiButton>
                    </EuiFlexItem>
                    <EuiFlexItem grow={true}>
                        <EuiButton
                            fill
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
        const { intl } = this.props;
        const { process } = this.state;
        if (!process) {
            return Promise.reject();
        }

        return this.context.apiClient.resumeProcess(process.id, processInput).then((e) => {
            this.context.redirect(`/${process.is_task ? "tasks" : `processes?highlight=${process.id}`}`);

            setFlash(
                intl.formatMessage(
                    { id: `${process.is_task ? "task" : "process"}.flash.update` },
                    { name: process.workflow_name }
                )
            );
        });
    };

    switchTab = (tab: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
        stop(e);
        this.setState({ selectedTab: tab });
    };

    renderTabContent = (
        selectedTab: string,
        process: ProcessWithDetails,
        step: Step | undefined,
        stepUserInput: InputForm | undefined,
        subscriptionProcesses: ProcessSubscription[]
    ) => {
        const { productName, customerName } = this.state;
        if (!step || !stepUserInput || selectedTab === "process") {
            return (
                <section>
                    <EuiPanel>
                        {this.renderActions(process)}
                        <ProcessStateDetails
                            process={process}
                            productName={productName}
                            customerName={customerName}
                            subscriptionProcesses={subscriptionProcesses}
                            collapsed={this.props.query.collapsed}
                            onChangeCollapsed={this.handleCollapse}
                            isProcess={!process.is_task}
                        />
                    </EuiPanel>
                </section>
            );
        } else {
            return (
                <section>
                    <EuiPanel>
                        <section className="header-info">
                            <EuiText>
                                <h3>
                                    <FormattedMessage
                                        id={`${process.is_task ? "task" : "process"}.workflow`}
                                        values={{ name: process.workflow_name }}
                                    />
                                    <br />
                                    <FormattedMessage
                                        id={`${process.is_task ? "task" : "process"}.userInput`}
                                        values={{ name: step.name, product: this.state.productName || "" }}
                                    />
                                </h3>
                            </EuiText>
                        </section>
                        <UserInputFormWizard
                            stepUserInput={stepUserInput}
                            validSubmit={this.validSubmit}
                            hasNext={false}
                            cancel={() => this.context.redirect(`/${process.is_task ? "tasks" : "processes"}`)}
                        />
                    </EuiPanel>
                </section>
            );
        }
    };

    renderTab = (tab: string, selectedTab: string) => (
        <span id={tab} key={tab} className={tab === selectedTab ? "active" : ""} onClick={this.switchTab(tab)}>
            <FormattedMessage id={`process.tabs.${tab}`} />
        </span>
    );

    addConfirmDialogActions = ({ showConfirmDialog }: ConfirmDialogActions) => {
        this.setState({ showConfirmDialog });
        return <></>;
    };

    render() {
        const { loaded, notFound, process, tabs, stepUserInput, selectedTab, subscriptionProcesses } = this.state;
        if (!process) {
            return null;
        }

        const step = process.steps.find((step: Step) => step.status === "pending");
        const renderNotFound = loaded && notFound;
        const renderContent = loaded && !notFound;
        return (
            <EuiPage>
                <RunningProcessesContext.Consumer>
                    {(rpc: any) => this.handleUpdateProcess(rpc.runningProcesses)}
                </RunningProcessesContext.Consumer>
                <ConfirmationDialogContext.Consumer>
                    {(cdc) => this.addConfirmDialogActions(cdc)}
                </ConfirmationDialogContext.Consumer>
                <EuiPageBody component="div" className="mod-process-detail">
                    <section className="tabs">{tabs.map((tab) => this.renderTab(tab, selectedTab))}</section>
                    {renderContent &&
                        this.renderTabContent(selectedTab, process, step, stepUserInput, subscriptionProcesses)}
                    {renderNotFound && (
                        <section className="not-found">
                            <EuiPanel>
                                <h1>
                                    <FormattedMessage id="process.notFound" />
                                </h1>
                            </EuiPanel>
                        </section>
                    )}
                    <ScrollUpButton />
                </EuiPageBody>
            </EuiPage>
        );
    }
}

ProcessDetail.contextType = ApplicationContext;

export default injectIntl(withQueryParams(queryConfig, ProcessDetail));
