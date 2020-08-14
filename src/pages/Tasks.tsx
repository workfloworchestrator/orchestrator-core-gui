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

import "./Tasks.scss";

import I18n from "i18n-js";
import React from "react";
import ScrollUpButton from "react-scroll-up-button";

import { abortProcess, deleteProcess, retryProcess } from "../api";
import { filterableEndpoint } from "../api/filterable";
import ConfirmationDialog from "../components/ConfirmationDialog";
import DropDownActions from "../components/DropDownActions";
import Explain from "../components/Explain";
import {
    ProcessesTable,
    initialProcessTableSettings,
    initialProcessesFilterAndSort
} from "../components/tables/Processes";
import ApplicationContext from "../utils/ApplicationContext";
import { setFlash } from "../utils/Flash";
import { organisationNameByUuid } from "../utils/Lookups";
import { ProcessV2 } from "../utils/types";
import { stop } from "../utils/Utils";
import { actionOptions } from "../validations/Processes";

interface IState {
    confirmationDialogOpen: boolean;
    confirmationDialogAction: (e: React.MouseEvent) => void;
    confirm: () => void;
    confirmationDialogQuestion: string;
    showExplanation: boolean;
}

export default class Tasks extends React.PureComponent<{}, IState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            confirmationDialogOpen: false,
            confirmationDialogAction: () => {},
            confirm: () => {},
            confirmationDialogQuestion: "",
            showExplanation: false
        };
    }

    cancelConfirmation = () => this.setState({ confirmationDialogOpen: false });

    newTask = () => {
        this.context.redirect("/new-task");
    };

    runAllTasks = () => {
        this.confirmation(I18n.t("tasks.runallConfirmation"), () => {
            filterableEndpoint<ProcessV2>(
                "processes",
                null,
                null,
                null,
                [
                    { id: "isTask", values: ["true"] },
                    { id: "status", values: ["running", "failed", "waiting", "api_unavailable", "inconsistent_data"] }
                ],
                null
            )
                .then(([tasks]) => {
                    if (tasks && tasks.length > 0) {
                        return Promise.all(tasks.map(task => retryProcess(task.pid)));
                    } else {
                        return Promise.reject();
                    }
                })
                .then(
                    () => setFlash(I18n.t("tasks.flash.runall")),
                    () => setFlash(I18n.t("tasks.flash.runallfailed"))
                );
        });
    };

    confirmation = (question: string, action: (e: React.MouseEvent) => void) =>
        this.setState({
            confirmationDialogOpen: true,
            confirmationDialogQuestion: question,
            confirmationDialogAction: (e: React.MouseEvent) => {
                this.cancelConfirmation();
                action(e);
            }
        });

    handleAbortProcess = (process: ProcessV2) => (e: React.MouseEvent) => {
        stop(e);
        const product_name = process.subscriptions[0].product.name;
        const customer_name = organisationNameByUuid(process.subscriptions[0].customer_id, this.context.organisations);
        this.confirmation(
            I18n.t("processes.abortConfirmation", {
                name: product_name,
                customer: customer_name
            }),
            () =>
                abortProcess(process.pid).then(() => {
                    setFlash(I18n.t("processes.flash.abort", { name: product_name }));
                })
        );
    };

    handleDeleteProcess = (process: ProcessV2) => (e: React.MouseEvent) => {
        stop(e);
        const workflow_name = process.workflow;
        this.confirmation(I18n.t("tasks.deleteConfirmation", { name: workflow_name }), () =>
            deleteProcess(process.pid).then(() => {
                setFlash(I18n.t("tasks.flash.delete", { name: workflow_name }));
            })
        );
    };

    handleRetryProcess = (process: ProcessV2) => (e: React.MouseEvent) => {
        stop(e);
        const product_name = process.subscriptions[0].product.name;
        const customer_name = organisationNameByUuid(process.subscriptions[0].customer_id, this.context.organisations);
        this.confirmation(
            I18n.t("processes.retryConfirmation", {
                name: product_name,
                customer: customer_name
            }),
            () =>
                retryProcess(process.pid).then(() => {
                    setFlash(I18n.t("processes.flash.retry", { name: product_name }));
                })
        );
    };

    showProcess = (process: ProcessV2) => () => {
        this.context.redirect("/task/" + process.pid);
    };

    renderActions = (process: ProcessV2) => {
        let options = actionOptions(
            process,
            this.showProcess(process),
            this.handleRetryProcess(process),
            this.handleDeleteProcess(process),
            this.handleAbortProcess(process)
        );
        return <DropDownActions options={options} i18nPrefix="processes.actions" />;
    };

    renderExplain() {
        return (
            <span className="explain" onClick={() => this.setState({ showExplanation: true })}>
                <i className="fa fa-question-circle" />
            </span>
        );
    }

    render() {
        const { confirmationDialogOpen, confirmationDialogAction, confirmationDialogQuestion } = this.state;

        const tasksSettings = initialProcessTableSettings(
            "table.tasks",
            initialProcessesFilterAndSort(true, ["running", "failed", "api_unavailable", "inconsistent_data"]),
            ["abbrev", "customer", "pid", "product", "step", "started", "tags"],
            { refresh: true }
        );
        return (
            <div className="tasks-container">
                <Explain
                    close={() => this.setState({ showExplanation: false })}
                    isVisible={this.state.showExplanation}
                    title="Tasks Help"
                >
                    <h1>Task</h1>
                    <p>The Tasks page will show running tasks and tasks with errors by default.</p>
                    <h2>Settings storage</h2>
                    <p>
                        The tables will store the setting for your filters and columns in the local storage of your
                        browser. If you want to reset the settings to the default, click on the gear icon and then on
                        the reset button.
                    </p>
                </Explain>
                <ConfirmationDialog
                    isOpen={confirmationDialogOpen}
                    cancel={this.cancelConfirmation}
                    confirm={confirmationDialogAction}
                    question={confirmationDialogQuestion}
                />
                <div className="actions">
                    <button className="button blue" onClick={this.runAllTasks}>
                        {I18n.t("tasks.runall")}
                        <i className="fa fa-sync" />
                    </button>
                    <button className="new button green" onClick={this.newTask}>
                        {I18n.t("tasks.new")} <i className="fa fa-plus" />
                    </button>
                    {this.renderExplain()}
                </div>
                <ProcessesTable
                    initialTableSettings={tasksSettings}
                    renderActions={this.renderActions}
                    isProcess={false}
                />
                <ScrollUpButton />
            </div>
        );
    }
}

Tasks.contextType = ApplicationContext;
