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

import "./Processes.scss";

import {
    ProcessesTable,
    initialProcessTableSettings,
    initialProcessesFilterAndSort
} from "components/tables/Processes";
import I18n from "i18n-js";
import React from "react";
import ScrollUpButton from "react-scroll-up-button";

import { abortProcess, retryProcess } from "../api";
import ConfirmationDialog from "../components/ConfirmationDialog";
import DropDownActions from "../components/DropDownActions";
import Explain from "../components/Explain";
import ApplicationContext from "../utils/ApplicationContext";
import { setFlash } from "../utils/Flash";
import { organisationNameByUuid } from "../utils/Lookups";
import { ProcessV2 } from "../utils/types";
import { stop } from "../utils/Utils";
import { actionOptions } from "../validations/Processes";

interface IProps {}

interface IState {
    confirmationDialogOpen: boolean;
    confirmationDialogAction: (e: React.MouseEvent) => void;
    confirm: () => void;
    confirmationDialogQuestion: string;
    showExplanation: boolean;
}

export default class Processes extends React.PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this,
            confirm: () => this,
            confirmationDialogQuestion: "",
            showExplanation: false
        };
    }

    cancelConfirmation = () => this.setState({ confirmationDialogOpen: false });

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
        this.context.redirect("/processes/" + process.pid);
    };

    renderActions = (process: ProcessV2) => {
        let options = actionOptions(
            process,
            this.showProcess(process),
            this.handleRetryProcess(process),
            () => null,
            this.handleAbortProcess(process)
        );
        return <DropDownActions options={options} i18nPrefix="processes" />;
    };

    renderExplain() {
        return (
            <section className="explain" onClick={() => this.setState({ showExplanation: true })}>
                <i className="fa fa-question-circle" />
            </section>
        );
    }

    render() {
        const activeSettings = initialProcessTableSettings(
            "table.processes.active",
            initialProcessesFilterAndSort(false, ["running", "suspended", "failed", "created", "waiting"]),
            ["pid", "step", "tag", "creator", "customer", "product"],
            { showSettings: false, refresh: true, pageSize: 10 }
        );
        const completedSettings = initialProcessTableSettings(
            "table.processes.completed",
            initialProcessesFilterAndSort(false, ["completed"]),
            ["pid", "step", "status", "assignee", "creator", "started", "abbrev"],
            { showSettings: false, showPaginator: false, pageSize: 5, refresh: true }
        );

        return (
            <div className="processes-container">
                <Explain
                    close={() => this.setState({ showExplanation: false })}
                    render={() => (
                        <React.Fragment>
                            <h1>Processes</h1>
                            <p>
                                The processes are split into 2 different tables. The upper one shows all active
                                processes and the lower one shows processes that are done/complete.
                            </p>
                            <p>
                                Note: if you need pagination for completed processes you can toggle it from the table
                                settings, via the gear icon.
                            </p>
                            <h2>Settings storage</h2>
                            <p>
                                The tables will store the setting for your filters and columns in the local storage of
                                your browser. If you want to reset the settings to the default, click on the gear icon
                                and then on the reset button.
                            </p>
                        </React.Fragment>
                    )}
                    isVisible={this.state.showExplanation}
                    title="Processes Help"
                />
                <ConfirmationDialog
                    isOpen={this.state.confirmationDialogOpen}
                    cancel={this.cancelConfirmation}
                    confirm={this.state.confirmationDialogAction}
                    question={this.state.confirmationDialogQuestion}
                />
                <div className="actions">{this.renderExplain()}</div>
                <ProcessesTable
                    key={"active"}
                    initialTableSettings={activeSettings}
                    renderActions={this.renderActions}
                    isProcess={true}
                />
                <ProcessesTable
                    key={"completed"}
                    initialTableSettings={completedSettings}
                    renderActions={this.renderActions}
                    isProcess={true}
                />
                <ScrollUpButton />
            </div>
        );
    }
}

Processes.contextType = ApplicationContext;
