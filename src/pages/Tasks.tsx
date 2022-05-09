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

import "pages/Tasks.scss";

import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiPage, EuiPageBody } from "@elastic/eui";
import DropDownActions from "components/DropDownActions";
import Explain from "components/Explain";
import {
    ProcessesTable,
    initialProcessTableSettings,
    initialProcessesFilterAndSort,
} from "components/tables/Processes";
import ConfirmationDialogContext, {
    ConfirmDialogActions,
    ShowConfirmDialogType,
} from "contextProviders/ConfirmationDialogProvider";
import React from "react";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";
import ScrollUpButton from "react-scroll-up-button";
import ApplicationContext from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";
import { organisationNameByUuid } from "utils/Lookups";
import { ProcessV2 } from "utils/types";
import { stop } from "utils/Utils";
import { actionOptions } from "validations/Processes";

interface IProps extends WrappedComponentProps {}
interface IState {
    showExplanation: boolean;
    showConfirmDialog: ShowConfirmDialogType;
}
class Tasks extends React.PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            showExplanation: false,
            showConfirmDialog: () => {},
        };
    }

    newTask = () => {
        this.context.redirect("/new-task");
    };

    runAllTasks = () => {
        const { intl } = this.props;
        this.state.showConfirmDialog({
            question: intl.formatMessage({ id: "tasks.runallConfirmation" }),
            confirmAction: () => {
                this.context.apiClient
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

    handleAbortProcess = (process: ProcessV2) => (e: React.MouseEvent) => {
        stop(e);
        const { intl } = this.props;

        const product_name = process.subscriptions[0].product.name;
        const customer_name = organisationNameByUuid(process.subscriptions[0].customer_id, this.context.organisations);
        this.state.showConfirmDialog({
            question: intl.formatMessage(
                { id: "processes.abortConfirmation" },
                { name: product_name, customer: customer_name }
            ),
            confirmAction: () =>
                this.context.apiClient.abortProcess(process.pid).then(() => {
                    setFlash(intl.formatMessage({ id: "processes.flash.abort" }, { name: product_name }));
                }),
        });
    };

    handleDeleteProcess = (process: ProcessV2) => (e: React.MouseEvent) => {
        stop(e);
        const { intl } = this.props;

        const workflow_name = process.workflow;
        this.state.showConfirmDialog({
            question: intl.formatMessage({ id: "tasks.deleteConfirmation" }, { name: workflow_name }),
            confirmAction: () =>
                this.context.apiClient.deleteProcess(process.pid).then(() => {
                    setFlash(intl.formatMessage({ id: "tasks.flash.delete" }, { name: workflow_name }));
                }),
        });
    };

    handleRetryProcess = (process: ProcessV2) => (e: React.MouseEvent) => {
        stop(e);
        const { intl } = this.props;

        const product_name = process.subscriptions[0].product.name;
        const customer_name = organisationNameByUuid(process.subscriptions[0].customer_id, this.context.organisations);
        this.state.showConfirmDialog({
            question: intl.formatMessage(
                { id: "processes.retryConfirmation" },
                { name: product_name, customer: customer_name }
            ),
            confirmAction: () =>
                this.context.apiClient.retryProcess(process.pid).then(() => {
                    setFlash(intl.formatMessage({ id: "processes.flash.retry" }, { name: product_name }));
                }),
        });
    };

    showProcess = (process: ProcessV2) => () => {
        this.context.redirect("/task/" + process.pid);
    };

    renderActions = (process: ProcessV2) => {
        let options = actionOptions(
            this.context.allowed,
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

    addConfirmDialogActions = ({ showConfirmDialog }: ConfirmDialogActions) => {
        this.setState({ showConfirmDialog });
        return <></>;
    };

    render() {
        const { allowed } = this.context;

        const tasksSettings = initialProcessTableSettings(
            "table.tasks",
            initialProcessesFilterAndSort(true, ["running", "failed", "api_unavailable", "inconsistent_data"]),
            ["abbrev", "customer", "pid", "product", "target", "tag"],
            { refresh: true }
        );
        return (
            <EuiPage>
                <ConfirmationDialogContext.Consumer>
                    {(cdc) => this.addConfirmDialogActions(cdc)}
                </ConfirmationDialogContext.Consumer>
                <EuiPageBody component="div" className="tasks-container">
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
                            browser. If you want to reset the settings to the default, click on the gear icon and then
                            on the reset button.
                        </p>
                    </Explain>
                    <EuiFlexGroup className="actions actions-buttons">
                        {allowed("/orchestrator/processes/all-tasks/retry") && (
                            <EuiFlexItem>
                                <EuiButton onClick={this.runAllTasks} fill color="primary" iconType="refresh">
                                    <FormattedMessage id="tasks.runall" />
                                </EuiButton>
                            </EuiFlexItem>
                        )}
                        {allowed("/orchestrator/processes/create/task") && (
                            <EuiFlexItem>
                                <EuiButton onClick={this.newTask} fill color="text" iconType="plusInCircle">
                                    <FormattedMessage id="tasks.new" />
                                </EuiButton>
                            </EuiFlexItem>
                        )}
                        <EuiFlexItem className="explain">{this.renderExplain()}</EuiFlexItem>
                    </EuiFlexGroup>
                    <ProcessesTable initialTableSettings={tasksSettings} renderActions={this.renderActions} />
                    <ScrollUpButton />
                </EuiPageBody>
            </EuiPage>
        );
    }
}

Tasks.contextType = ApplicationContext;

export default injectIntl(Tasks);
