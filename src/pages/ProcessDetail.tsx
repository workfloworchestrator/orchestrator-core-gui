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

import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiPage, EuiPageBody, EuiPanel, EuiText } from "@elastic/eui";
import UserInputFormWizard from "components/inputForms/UserInputFormWizard";
import ProcessStateDetails from "components/ProcessStateDetails";
import ConfirmationDialogContext from "contextProviders/ConfirmationDialogProvider";
import RunningProcessesContext from "contextProviders/runningProcessesProvider";
import { useLocalStorage } from "hooks/useLocalStorage";
import { intl } from "locale/i18n";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";
import { useQuery } from "react-query";
import { RouteComponentProps } from "react-router-dom";
import ScrollUpButton from "react-scroll-up-button";
import { DecodedValueMap, NumberParam, QueryParamConfigMap, SetQuery, withQueryParams } from "use-query-params";
import ApplicationContext from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";
import { organisationNameByUuid, productNameById } from "utils/Lookups";
import { CommaSeparatedNumericArrayParam } from "utils/QueryParameters";
import { InputForm, ProcessSubscription, ProcessWithDetails, Step, WsProcessV2 } from "utils/types";
import { stop } from "utils/Utils";
import { actionOptions } from "validations/Processes";

import { processDetailStyling } from "./ProcessDetailStyling";

const queryConfig: QueryParamConfigMap = { collapsed: CommaSeparatedNumericArrayParam, scrollToStep: NumberParam };

interface MatchParams {
    id: string;
}

interface IProps extends RouteComponentProps<MatchParams>, WrappedComponentProps {
    query: DecodedValueMap<typeof queryConfig>;
    setQuery: SetQuery<typeof queryConfig>;
}
function ProcessDetail({ match, query, setQuery }: IProps) {
    const actionsRef = useRef(null);
    const { apiClient, redirect, allowed, organisations, products } = useContext(ApplicationContext);
    const { runningProcesses } = useContext(RunningProcessesContext);
    const { showConfirmDialog } = useContext(ConfirmationDialogContext);

    const [process, setProcess] = useState<ProcessWithDetails | undefined>(undefined);
    const [notFound, setNotFound] = useState<boolean>(false);
    const [tabs, setTabs] = useState<string[]>(["user_input", "process"]);
    const [selectedTab, setSelectedTab] = useState<string>("process");
    const [subscriptionProcesses, setSubscriptionProcesses] = useState<ProcessSubscription[]>([]);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [stepUserInput, setStepUserInput] = useState<InputForm | undefined>(undefined);
    const [wsProcess, setWsProcess] = useState<WsProcessV2 | undefined>(undefined);
    const [productName, setProductName] = useState<string>("");
    const [customerName, setCustomerName] = useState<string>("");
    const [isActionsMenuOnScreen, setIsActionsMenuOnScreen] = useState<boolean>(true);
    const [observer, setObserver] = useState<IntersectionObserver | undefined>(undefined);
    const [autoScrollToLast, setAutoScrollToLast] = useLocalStorage("process-autoscroll", true);

    useQuery(["process"], () => apiClient.process(match.params.id), {
        onSuccess: (processInstance) => {
            let enrichedProcess = processInstance as ProcessWithDetails;
            const localStepUserInput: InputForm | undefined = enrichedProcess.form;
            const localTabs = localStepUserInput ? tabs : ["process"];
            const localSelectedTab = localStepUserInput ? "user_input" : "process";

            setProductName(productNameById(enrichedProcess.product, products));
            setCustomerName(organisationNameByUuid(enrichedProcess.customer, organisations));
            setProcess(enrichedProcess);
            setStepUserInput(localStepUserInput);
            setTabs(localTabs);
            setSelectedTab(localSelectedTab);
        },
        onError: (err: any) => {
            if (err.response.status === 404) {
                setNotFound(true);
                setLoaded(true);
            } else {
                throw err;
            }
        },
        retry: false,
    });

    useQuery(
        [`process_subscriptions-${match.params.id}`],
        () => apiClient.processSubscriptionsByProcessId(match.params.id),
        {
            enabled: !!process,
            onSuccess: (res) => {
                setSubscriptionProcesses(res);
                setLoaded(true);
                if (process!.step !== "Done") {
                }
            },
        }
    );
    const scrollToLast = () => {
        const finished_steps = process?.steps.filter((step) => step.status !== "pending");
        if (finished_steps) {
            handleScrollTo(finished_steps.length - 1);
        }
    };

    useEffect(() => {
        const el = actionsRef.current;
        if (observer || !actionsRef.current) {
            return;
        }

        const localObserver = new IntersectionObserver(([entry]) => {
            setIsActionsMenuOnScreen(entry.isIntersecting);
        });
        if (el) {
            localObserver.observe(el);
        }
        setObserver(localObserver);

        if (autoScrollToLast && loaded && process!.step !== "Done") {
            console.log("Auto scroll enabled; scrolling to last");
            const finished_steps = process?.steps.filter((step) => step.status !== "pending");
            if (finished_steps) {
                // Handle the scroll on load here so the dependencies will be simpler
                console.log("Found finished steps:", finished_steps);
                const el = document.getElementById(`step-index-${finished_steps.length - 1}`);
                if (!el) {
                    return;
                }
                el?.scrollIntoView();
            }
        }
    }, [autoScrollToLast, loaded, observer, process]);

    const handleUpdateProcess = (runningProcesses: WsProcessV2[]) => {
        const localProcess = runningProcesses.find((p) => p.pid === match.params.id);
        if (wsProcess === localProcess || !localProcess) {
            return <></>;
        }
        const enrichedProcess = { ...(process as ProcessWithDetails), ...localProcess };
        const localStepUserInput: InputForm | undefined = localProcess.form;
        const localTabs = localStepUserInput ? ["user_input", "process"] : ["process"];
        const localSelectedTab = localStepUserInput ? "user_input" : "process";

        setWsProcess(localProcess);
        setProcess(enrichedProcess);
        setStepUserInput(localStepUserInput);
        setTabs(localTabs);
        setSelectedTab(localSelectedTab);

        if (autoScrollToLast) {
            scrollToLast();
        }
        return <></>;
    };

    const confirmation = (question: string, confirmAction: (e: React.MouseEvent) => void) =>
        showConfirmDialog({ question, confirmAction });

    const handleDeleteProcess = (processParam: ProcessWithDetails) => (e: React.MouseEvent<HTMLButtonElement>) => {
        stop(e);
        let message;

        if (!processParam.is_task) {
            message = intl.formatMessage(
                { id: "processes.deleteConfirmation" },
                { name: productName, customer: customerName }
            );
        } else {
            message = intl.formatMessage({ id: "tasks.deleteConfirmation" }, { name: processParam.workflow_name });
        }

        confirmation(message, () =>
            apiClient.deleteProcess(processParam.id).then(() => {
                redirect(`/${processParam.is_task ? "tasks" : "processes"}`);
                setFlash(
                    intl.formatMessage(
                        { id: `${processParam.is_task ? "tasks" : "processes"}.flash.delete` },
                        { name: productName }
                    )
                );
            })
        );
    };

    const handleAbortProcess = (processParam: ProcessWithDetails) => (e: React.MouseEvent<HTMLButtonElement>) => {
        stop(e);

        let message;
        if (!processParam.is_task) {
            message = intl.formatMessage(
                { id: "processes.abortConfirmation" },
                { name: productName, customer: customerName }
            );
        } else {
            message = intl.formatMessage({ id: "tasks.abortConfirmation" }, { name: processParam.workflow_name });
        }

        confirmation(message, () =>
            apiClient.abortProcess(processParam.id).then(() => {
                redirect(processParam.is_task ? "/tasks" : "/processes");
                setFlash(
                    intl.formatMessage(
                        { id: `${processParam.is_task ? "tasks" : "processes"}.flash.abort` },
                        { name: productName }
                    )
                );
            })
        );
    };

    const handleRetryProcess = (processParam: ProcessWithDetails) => (e: React.MouseEvent<HTMLButtonElement>) => {
        stop(e);

        let message;
        if (!processParam.is_task) {
            message = intl.formatMessage(
                { id: "processes.retryConfirmation" },
                { name: productName, customer: customerName }
            );
        } else {
            message = intl.formatMessage({ id: "tasks.retryConfirmation" }, { name: processParam.workflow_name });
        }

        confirmation(message, () =>
            apiClient.retryProcess(processParam.id).then(() => {
                redirect(processParam.is_task ? "/tasks" : `/processes?highlight=${processParam.id}`);
                setFlash(
                    intl.formatMessage(
                        { id: `${processParam.is_task ? "tasks" : "processes"}.flash.retry` },
                        { name: productName }
                    )
                );
            })
        );
    };

    const handleCollapse = (step: number) => {
        let { collapsed } = query;
        if (collapsed && collapsed.includes(step)) {
            setQuery({ collapsed: collapsed.filter((item: number) => item !== step) }, "replaceIn");
        } else {
            if (!collapsed) {
                collapsed = [];
            }

            collapsed.push(step);
            setQuery({ collapsed: collapsed }, "replaceIn");
        }
    };

    const handleCollapseAll = () => {
        if (process) {
            setQuery({ collapsed: process.steps.map((i: any, index: number) => index) }, "replaceIn");
        }
    };

    const handleExpandAll = () => {
        setQuery({ collapsed: [] }, "replaceIn");
    };

    const handleScrollTo = (step: number) => {
        const el = document.getElementById(`step-index-${step}`);

        // Todo: this function is called to early
        if (!el) {
            return;
        }
        el?.scrollIntoView();
    };

    const setIsAutoScrollToLast = (on: boolean) => {
        setAutoScrollToLast(on);
        if (on) {
            scrollToLast();
        }
    };

    const renderActions = (processParam: ProcessWithDetails) => {
        let options = actionOptions(
            allowed,
            processParam,
            () => false,
            handleRetryProcess(processParam),
            handleDeleteProcess(processParam),
            handleAbortProcess(processParam)
        ).filter((option) => option.label !== "user_input" && option.label !== "details");

        if (!processParam.is_task) {
            options = options.filter((option) => option.label !== "delete");
        }
        return (
            <section ref={actionsRef} className="process-actions">
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
                        <EuiButton fill iconType="minimize" iconSide="right" onClick={handleCollapseAll}>
                            COLLAPSE
                        </EuiButton>
                    </EuiFlexItem>
                    <EuiFlexItem grow={true}>
                        <EuiButton fill iconType="expand" iconSide="right" onClick={handleExpandAll}>
                            EXPAND
                        </EuiButton>
                    </EuiFlexItem>
                    <EuiFlexItem grow={true}>
                        <EuiButton fill iconType="sortDown" iconSide="right" onClick={() => scrollToLast()}>
                            SCROLL TO LAST
                        </EuiButton>
                    </EuiFlexItem>
                    <EuiFlexItem grow={true}>
                        <EuiButton
                            fill
                            iconType={autoScrollToLast ? "checkInCircleFilled" : "crossInACircleFilled"}
                            iconSide="right"
                            onClick={() => setIsAutoScrollToLast(!autoScrollToLast)}
                        >
                            AUTO SCROLL TO LAST
                        </EuiButton>
                    </EuiFlexItem>
                </EuiFlexGroup>
            </section>
        );
    };

    const validSubmit = (processInput: {}[]) => {
        if (!process) {
            return Promise.reject();
        }

        return apiClient.resumeProcess(process.id, processInput).then(() => {
            setFlash(
                intl.formatMessage(
                    { id: `${process.is_task ? "task" : "process"}.flash.update` },
                    { name: process.workflow_name }
                )
            );
        });
    };

    const switchTab = (tab: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
        stop(e);
        setSelectedTab(tab);
    };

    const renderFixedTabMenu = (
        selectedTabParam: string,
        processParam: ProcessWithDetails,
        stepParam: Step | undefined,
        stepUserInputParam: InputForm | undefined
    ) => {
        if (!stepParam || !stepUserInputParam || selectedTabParam === "process") {
            return <div className="fixed_tab_menu">{renderActions(processParam)}</div>;
        }
    };

    const renderTabContent = (
        selectedTabParam: string,
        processParam: ProcessWithDetails,
        stepParam: Step | undefined,
        stepUserInputParam: InputForm | undefined,
        subscriptionProcessesParam: ProcessSubscription[]
    ) => {
        if (!stepParam || !stepUserInputParam || selectedTabParam === "process") {
            return (
                <section>
                    <EuiPanel>
                        {renderActions(processParam)}
                        <ProcessStateDetails
                            process={processParam}
                            productName={productName}
                            customerName={customerName}
                            subscriptionProcesses={subscriptionProcessesParam}
                            collapsed={query.collapsed}
                            onChangeCollapsed={handleCollapse}
                            isProcess={!processParam.is_task}
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
                                        id={`${processParam.is_task ? "task" : "process"}.workflow`}
                                        values={{ name: processParam.workflow_name }}
                                    />
                                    <br />
                                    <FormattedMessage
                                        id={`${processParam.is_task ? "task" : "process"}.userInput`}
                                        values={{ name: stepParam.name, product: productName || "" }}
                                    />
                                </h3>
                            </EuiText>
                        </section>
                        <UserInputFormWizard
                            stepUserInput={stepUserInputParam}
                            validSubmit={validSubmit}
                            hasNext={false}
                            cancel={() => redirect(`/${processParam.is_task ? "tasks" : "processes"}`)}
                        />
                    </EuiPanel>
                </section>
            );
        }
    };

    const renderTab = (tabParam: string, selectedTabParam: string) => (
        <span
            id={tabParam}
            key={tabParam}
            className={tabParam === selectedTabParam ? "active" : ""}
            onClick={switchTab(tabParam)}
        >
            <FormattedMessage id={`process.tabs.${tabParam}`} />
        </span>
    );

    if (!process) {
        return null;
    }

    const step = process.steps.find((step: Step) => step.status === "pending");
    const renderNotFound = loaded && notFound;
    const renderContent = loaded && !notFound;
    handleUpdateProcess(runningProcesses);

    return (
        <EuiPage css={processDetailStyling}>
            <EuiPageBody component="div" className="mod-process-detail">
                <section className="tabs">{tabs.map((tab) => renderTab(tab, selectedTab))}</section>
                {renderContent && renderTabContent(selectedTab, process, step, stepUserInput, subscriptionProcesses)}
                {renderContent &&
                    !isActionsMenuOnScreen &&
                    renderFixedTabMenu(selectedTab, process, step, stepUserInput)}
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

export default injectIntl(withQueryParams(queryConfig, ProcessDetail));
