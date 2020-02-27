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
import ScrollUpButton from "react-scroll-up-button";

import { abortProcess, deleteProcess, retryProcess } from "api";
import { filterableEndpoint } from "api/filterable";
import { stop } from "utils/Utils";
import ConfirmationDialog from "components/ConfirmationDialog";
import DropDownActions from "components/DropDownActions";
import { setFlash } from "utils/Flash";
import { actionOptions } from "validations/Processes";
import ApplicationContext from "utils/ApplicationContext";
import { ShowActions, ProcessV2 } from "utils/types";
import {
    initialProcessesFilterAndSort,
    initialProcessTableSettings,
    ProcessesTable
} from "components/tables/Processes";
import { organisationNameByUuid } from "utils/Lookups";

import "./Tasks.scss";

interface IState {
    confirmationDialogOpen: boolean;
    confirmationDialogAction: (e: React.MouseEvent) => void;
    confirm: () => void;
    confirmationDialogQuestion: string;
}

export default class Tasks extends React.PureComponent<{}, IState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            confirmationDialogOpen: false,
            confirmationDialogAction: () => {},
            confirm: () => {},
            confirmationDialogQuestion: ""
        };
    }

    cancelConfirmation = () => this.setState({ confirmationDialogOpen: false });

    showTask = (task: ProcessV2) => () => {
        this.context.redirect("/task/" + task.pid);
    };

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
                [{ id: "status", values: ["failed", "api_unavailable", "inconsistend_data"] }],
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
        this.context.redirect("/process/" + process.pid);
    };

    renderActions = (process: ProcessV2) => {
        const actionId = process.pid;
        let options = actionOptions(
            process.status,
            this.showProcess(process),
            this.handleRetryProcess(process),
            e => {
                console.log("What the hell? You want to delete me???");
            },
            this.handleAbortProcess(process)
        );
        return <DropDownActions options={options} i18nPrefix="processes" />;
    };

    render() {
        const { confirmationDialogOpen, confirmationDialogAction, confirmationDialogQuestion } = this.state;

        const tasksSettings = initialProcessTableSettings(
            "table.tasks",
            initialProcessesFilterAndSort(true, ["running", "failed", "api_unavailable", "inconsistent_data"]),
            ["abbrev", "customer", "pid", "product", "step", "started", "tags"],
            { refresh: true }
        );
        return (
            <div className="mod-tasks">
                <ConfirmationDialog
                    isOpen={confirmationDialogOpen}
                    cancel={this.cancelConfirmation}
                    confirm={confirmationDialogAction}
                    question={confirmationDialogQuestion}
                />
                <div className="card">
                    <div className="options">
                        <button className="button blue" onClick={this.runAllTasks}>
                            {I18n.t("tasks.runall")}
                            <i className="fa fa-refresh" />
                        </button>
                        <button className="new button green" onClick={this.newTask}>
                            {I18n.t("tasks.new")} <i className="fa fa-plus" />
                        </button>
                    </div>
                </div>
                <ProcessesTable initialTableSettings={tasksSettings} renderActions={this.renderActions} />
                <ScrollUpButton />
            </div>
        );
    }
}

Tasks.contextType = ApplicationContext;
