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

import "pages/ProcessDetail.scss";

import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiPage, EuiPageBody, EuiPanel, EuiText } from "@elastic/eui";
import UserInputFormWizard from "components/inputForms/UserInputFormWizard";
import ConfirmationDialog from "components/modals/ConfirmationDialog";
import ProcessStateDetails from "components/ProcessStateDetails";
import React from "react";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";
import { RouteComponentProps } from "react-router-dom";
import ScrollUpButton from "react-scroll-up-button";
import { DecodedValueMap, NumberParam, QueryParamConfigMap, SetQuery, withQueryParams } from "use-query-params";
import ApplicationContext from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";
import { organisationNameByUuid, productById, productNameById } from "utils/Lookups";
import { CommaSeparatedNumericArrayParam } from "utils/QueryParameters";
import { InputForm, ProcessSubscription, ProcessWithDetails, Product, Step } from "utils/types";
import { stop } from "utils/Utils";
import { actionOptions } from "validations/Processes";
import { WebSocketCodes, websocketService } from "websocketService";

const queryConfig: QueryParamConfigMap = { collapsed: CommaSeparatedNumericArrayParam, scrollToStep: NumberParam };

interface MatchParams {
    id: string;
}

interface IProps extends RouteComponentProps<MatchParams>, WrappedComponentProps {
    query: DecodedValueMap<typeof queryConfig>;
    setQuery: SetQuery<typeof queryConfig>;
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
            confirmationDialogOpen: false,
            confirmationDialogAction: (e: React.MouseEvent<HTMLButtonElement>) => {},
            confirm: (e: React.MouseEvent<HTMLButtonElement>) => {},
            confirmationDialogQuestion: "",
        };
    }

    initialize = (processInstance: ProcessWithDetails) => {
        /**
         * Ensure correct user memberships and populate UserInput form with values
         */

        const { organisations, products } = this.context;

        let enrichedProcess = processInstance as CustomProcessWithDetails;
        enrichedProcess.customerName = organisationNameByUuid(enrichedProcess.customer, organisations);
        enrichedProcess.productName = productNameById(enrichedProcess.product, products);

        const stepUserInput: InputForm | undefined = enrichedProcess.form;
        const tabs = stepUserInput ? this.state.tabs : ["process"];
        const selectedTab = stepUserInput ? "user_input" : "process";

        this.setState({
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

    updateProcessStep = (step: Step) => {
        const enrichedProcess = this.state.process as CustomProcessWithDetails;
        this.setState({
            process: {
                ...enrichedProcess,
                steps: enrichedProcess.steps.map((process_step) => {
                    if (process_step.name === step.name) {
                        return { ...process_step, ...step };
                    }
                    return process_step;
                }),
            },
        });
    };

    closeOnLastStep = (client: WebSocket, step: Step) => {
        const process = this.state.process as CustomProcessWithDetails;
        const stepIndex = process.steps.findIndex((process_step) => process_step.name === step.name);

        if (process.steps.length - 1 === stepIndex) {
            client.close();
        }
    };

    handleWebsocketError = (error: any) => {
        setFlash(error.detail, "error");
    };

    componentDidMount = () => {
        // this.context.apiClient.process(this.props.match.params.id).then(this.initialize);

        if (!this.props.match.params.id) {
            return;
        }
        const client = websocketService.connect(`api/processes/test/${this.props.match.params.id}`);
        client.onmessage = ({ data }) => {
            if (typeof data === "string") {
                try {
                    const json = JSON.parse(data);
                    const process = json.process;
                    const step: Step = json.step;
                    const error = json.error;
                    if (process) {
                        this.initialize(process);
                    }
                    if (step) {
                        this.updateProcessStep(step);
                        this.closeOnLastStep(client, step);
                    }
                    if (error) {
                        this.handleWebsocketError(error);
                    }
                } catch (e) {
                    console.log(data);
                    console.log(e);
                }
                return;
            }
        };
        client.onerror = () => {
            // api call fallback if websocket closes with an error.
            this.context.apiClient.process(this.props.match.params.id).then(this.initialize);
        };
    };

    handleDeleteProcess = (process: CustomProcessWithDetails) => (e: React.MouseEvent<HTMLButtonElement>) => {
        stop(e);
        const { intl } = this.props;

        let message;
        if (!process.is_task) {
            message = intl.formatMessage(
                { id: "processes.deleteConfirmation" },
                { name: process.productName, customer: process.customerName }
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
                        { name: process.productName }
                    )
                );
            })
        );
    };

    handleAbortProcess = (process: CustomProcessWithDetails) => (e: React.MouseEvent<HTMLButtonElement>) => {
        stop(e);
        const { intl } = this.props;

        let message;
        if (!process.is_task) {
            message = intl.formatMessage(
                { id: "processes.abortConfirmation" },
                { name: process.productName, customer: process.customerName }
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
                        { name: process.productName }
                    )
                );
            })
        );
    };

    handleRetryProcess = (process: CustomProcessWithDetails) => (e: React.MouseEvent<HTMLButtonElement>) => {
        stop(e);
        const { intl } = this.props;

        let message;
        if (!process.is_task) {
            message = intl.formatMessage(
                { id: "processes.retryConfirmation" },
                { name: process.productName, customer: process.customerName }
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
                        { name: process.productName }
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

    cancelConfirmation = () => this.setState({ confirmationDialogOpen: false });

    confirmation = (question: string, action: (e: React.MouseEvent<HTMLButtonElement>) => void) =>
        this.setState({
            confirmationDialogOpen: true,
            confirmationDialogQuestion: question,
            confirmationDialogAction: (e: React.MouseEvent<HTMLButtonElement>) => {
                this.cancelConfirmation();
                action(e);
            },
        });

    renderActions = (process: CustomProcessWithDetails) => {
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
                                color={option.danger ? "danger" : "secondary"}
                                iconType={option.danger ? "cross" : "refresh"}
                                iconSide="right"
                                onClick={option.action}
                            >
                                {intl.formatMessage({ id: `processes.actions.${option.label}` }).toUpperCase()}
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
                <section>
                    <EuiPanel>
                        {this.renderActions(process)}
                        <ProcessStateDetails
                            process={process}
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
                                        values={{ name: step.name, product: productName || "" }}
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
            confirmationDialogQuestion,
        } = this.state;
        if (!process) {
            return null;
        }

        const step = process.steps.find((step: Step) => step.status === "pending");
        const renderNotFound = loaded && notFound;
        const renderContent = loaded && !notFound;
        return (
            <EuiPage>
                <EuiPageBody component="div" className="mod-process-detail">
                    <ConfirmationDialog
                        isOpen={confirmationDialogOpen}
                        cancel={this.cancelConfirmation}
                        confirm={confirmationDialogAction}
                        question={confirmationDialogQuestion}
                    />
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
