/*
 * Copyright 2019 SURF.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the Licene
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
import {
    initialProcessesFilterAndSort,
    initialProcessTableSettings,
    ProcessesTable
} from "components/tables/Processes";
import { abortProcess, retryProcess } from "../api";
import ConfirmationDialog from "../components/ConfirmationDialog";
import ApplicationContext from "../utils/ApplicationContext";
import ScrollUpButton from "react-scroll-up-button";
import DropDownActions from "../components/DropDownActions";
import { ProcessV2 } from "../utils/types";
import { stop } from "../utils/Utils";
import { setFlash } from "../utils/Flash";
import { organisationNameByUuid } from "../utils/Lookups";
import { actionOptions } from "../validations/Processes";

import "./Processes.scss";

interface IProps {}

interface IState {
    confirmationDialogOpen: boolean;
    confirmationDialogAction: (e: React.MouseEvent) => void;
    confirm: () => void;
    confirmationDialogQuestion: string;
}

export default class Processes extends React.PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this,
            confirm: () => this,
            confirmationDialogQuestion: ""
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
        this.context.redirect("/process/" + process.pid);
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

    render() {
        const activeSettings = initialProcessTableSettings(
            "table.processes.active",
            initialProcessesFilterAndSort(false, ["running", "suspended", "failed"]),
            ["pid", "step", "tags", "customer"],
            { showSettings: false, refresh: true }
        );
        const completedSettings = initialProcessTableSettings(
            "table.processes.completed",
            initialProcessesFilterAndSort(false, ["completed"]),
            ["pid", "step", "status", "assignee", "creator", "started", "abbrev"],
            { showSettings: false, showPaginator: false, pageSize: 5, refresh: true }
        );

        return (
            <div className="mod-processes">
                <ConfirmationDialog
                    isOpen={this.state.confirmationDialogOpen}
                    cancel={this.cancelConfirmation}
                    confirm={this.state.confirmationDialogAction}
                    question={this.state.confirmationDialogQuestion}
                />
                <ProcessesTable
                    key={"active"}
                    initialTableSettings={activeSettings}
                    renderActions={this.renderActions}
                />
                <ProcessesTable
                    key={"completed"}
                    initialTableSettings={completedSettings}
                    renderActions={this.renderActions}
                />
                <ScrollUpButton />
            </div>
        );
    }
}

Processes.contextType = ApplicationContext;
