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

import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiPage, EuiPageBody } from "@elastic/eui";
import DropDownActions from "components/DropDownActions";
import Explain from "components/Explain";
import {
    ProcessesTable,
    initialProcessTableSettings,
    initialProcessesFilterAndSort,
} from "components/tables/Processes";
import ConfirmationDialogContext from "contextProviders/ConfirmationDialogProvider";
import { intl } from "locale/i18n";
import React, { useContext, useState } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import ScrollUpButton from "react-scroll-up-button";
import ApplicationContext from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";
import { organisationNameByUuid } from "utils/Lookups";
import { ProcessV2 } from "utils/types";
import { stop } from "utils/Utils";
import { actionOptions } from "validations/Processes";

import { tasksStyling } from "./TasksStyling";

function Tasks() {
    const { apiClient, redirect, allowed, organisations } = useContext(ApplicationContext);
    const { showConfirmDialog } = useContext(ConfirmationDialogContext);
    const [showExplanation, setShowExplanation] = useState<boolean>(false);

    const newTask = () => {
        redirect("/new-task");
    };

    const runAllTasks = () => {
        showConfirmDialog({
            question: intl.formatMessage({ id: "tasks.runallConfirmation" }),
            confirmAction: () => {
                apiClient
                    .resumeAllProcesses()
                    .then((res: { count: number }) => {
                        setFlash(intl.formatMessage({ id: "tasks.flash.runallbulk" }, { count: res.count }));
                    })
                    .catch((err: any) => {
                        if (err.response && err.response.status === 409) {
                            setFlash(intl.formatMessage({ id: "tasks.flash.runallinprogress" }), "warning");
                        } else {
                            setFlash(intl.formatMessage({ id: "tasks.flash.runallfailed" }), "error");
                            throw err;
                        }
                    });
            },
        });
    };

    const handleAbortProcess = (process: ProcessV2) => (e: React.MouseEvent) => {
        stop(e);
        let message: string;
        let workflow_name: string;
        if (!process.is_task) {
            workflow_name = process.subscriptions[0].product.name;
            const customer_name = organisationNameByUuid(process.subscriptions[0].customer_id, organisations);
            message = intl.formatMessage(
                { id: "processes.abortConfirmation" },
                { name: workflow_name, customer: customer_name }
            );
        } else {
            workflow_name = process.workflow;
            message = intl.formatMessage({ id: "tasks.abortConfirmation" }, { name: workflow_name });
        }
        showConfirmDialog({
            question: message,
            confirmAction: () =>
                apiClient.abortProcess(process.pid).then(() => {
                    setFlash(
                        intl.formatMessage(
                            { id: `${process.is_task ? "tasks" : "processes"}.flash.abort` },
                            { name: workflow_name }
                        )
                    );
                }),
        });
    };

    const handleDeleteProcess = (process: ProcessV2) => (e: React.MouseEvent) => {
        stop(e);
        const workflow_name = process.workflow;
        showConfirmDialog({
            question: intl.formatMessage({ id: "tasks.deleteConfirmation" }, { name: workflow_name }),
            confirmAction: () =>
                apiClient.deleteProcess(process.pid).then(() => {
                    setFlash(intl.formatMessage({ id: "tasks.flash.delete" }, { name: workflow_name }));
                }),
        });
    };

    const handleRetryProcess = (process: ProcessV2) => (e: React.MouseEvent) => {
        stop(e);
        let message: string;
        let workflow_name: string;
        if (!process.is_task) {
            workflow_name = process.subscriptions[0].product.name;
            const customer_name = organisationNameByUuid(process.subscriptions[0].customer_id, organisations);
            message = intl.formatMessage(
                { id: "processes.retryConfirmation" },
                { name: workflow_name, customer: customer_name }
            );
        } else {
            workflow_name = process.workflow;
            message = intl.formatMessage({ id: "tasks.retryConfirmation" }, { name: workflow_name });
        }
        showConfirmDialog({
            question: message,
            confirmAction: () =>
                apiClient.retryProcess(process.pid).then(() => {
                    setFlash(
                        intl.formatMessage(
                            { id: `${process.is_task ? "tasks" : "processes"}.flash.retry` },
                            { name: workflow_name }
                        )
                    );
                }),
        });
    };

    const showProcess = (process: ProcessV2) => () => {
        redirect("/task/" + process.pid);
    };

    const renderActions = (process: ProcessV2) => {
        let options = actionOptions(
            allowed,
            process,
            showProcess(process),
            handleRetryProcess(process),
            handleDeleteProcess(process),
            handleAbortProcess(process)
        );
        return <DropDownActions options={options} i18nPrefix="processes.actions" />;
    };

    const renderExplain = () => {
        return (
            <span className="explain" onClick={() => setShowExplanation(true)}>
                <i className="fa fa-question-circle" />
            </span>
        );
    };

    const tasksSettings = initialProcessTableSettings(
        "table.tasks",
        initialProcessesFilterAndSort(true, ["running", "failed", "api_unavailable", "inconsistent_data"]),
        ["abbrev", "customer", "pid", "product", "target", "tag"],
        { refresh: true }
    );

    return (
        <EuiPage css={tasksStyling}>
            <EuiPageBody component="div" className="tasks-container">
                <Explain close={() => setShowExplanation(false)} isVisible={showExplanation} title="Tasks Help">
                    <h1>Task</h1>
                    <p>The Tasks page will show running tasks and tasks with errors by default.</p>
                    <h2>Settings storage</h2>
                    <p>
                        The tables will store the setting for your filters and columns in the local storage of your
                        browser. If you want to reset the settings to the default, click on the gear icon and then on
                        the reset button.
                    </p>
                </Explain>
                <EuiFlexGroup className="actions actions-buttons">
                    {allowed("/orchestrator/processes/all-tasks/retry") && (
                        <EuiFlexItem>
                            <EuiButton onClick={runAllTasks} fill color="primary" iconType="refresh">
                                <FormattedMessage id="tasks.runall" />
                            </EuiButton>
                        </EuiFlexItem>
                    )}
                    {allowed("/orchestrator/processes/create/task") && (
                        <EuiFlexItem>
                            <EuiButton onClick={newTask} fill color="text" iconType="plusInCircle">
                                <FormattedMessage id="tasks.new" />
                            </EuiButton>
                        </EuiFlexItem>
                    )}
                    <EuiFlexItem className="explain">{renderExplain()}</EuiFlexItem>
                </EuiFlexGroup>
                <ProcessesTable initialTableSettings={tasksSettings} renderActions={renderActions} />
                <ScrollUpButton />
            </EuiPageBody>
        </EuiPage>
    );
}

export default injectIntl(Tasks);
