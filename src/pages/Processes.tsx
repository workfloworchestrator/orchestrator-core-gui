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

import "pages/Processes.scss";

import { EuiPage, EuiPageBody } from "@elastic/eui";
import DropDownActions from "components/DropDownActions";
import Explain from "components/Explain";
import ConfirmationDialog from "components/modals/ConfirmationDialog";
import {
    ProcessesTable,
    initialProcessTableSettings,
    initialProcessesFilterAndSort,
} from "components/tables/Processes";
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import ScrollUpButton from "react-scroll-up-button";
import ApplicationContext from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";
import { organisationNameByUuid } from "utils/Lookups";
import { ProcessV2 } from "utils/types";
import { stop } from "utils/Utils";
import { actionOptions } from "validations/Processes";
import { WebSocketCodes, websocketService, websocketReconnectTime } from "websocketService";

interface IProps extends WrappedComponentProps {}

interface IState {
    confirmationDialogOpen: boolean;
    confirmationDialogAction: (e: React.MouseEvent) => void;
    confirm: () => void;
    confirmationDialogQuestion: string;
    showExplanation: boolean;
    client: WebSocket | undefined;
    wsTimeout: NodeJS.Timeout | undefined;
    showTables: boolean;
}

class Processes extends React.PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this,
            confirm: () => this,
            confirmationDialogQuestion: "",
            showExplanation: false,
            client: undefined,
            wsTimeout: undefined,
            showTables: true,
        };
    }

    componentDidMount = () => {
        const client = websocketService.connect('api/processes/all/');
        this.setState({ client: client });

        client.onmessage = ({ data }) => {
            const json = JSON.parse(data);
            if (json.process) {
                this.setState({ showTables: false });
                this.setState({ showTables: true });
            }
        };

        client.onclose = () => {
            this.setState({ client: undefined });
        };

        const timeout = setTimeout(() => {
            client.close(WebSocketCodes.NORMAL_CLOSURE);
            this.componentDidMount();
        }, websocketReconnectTime);

        this.setState({ wsTimeout: timeout });
    };

    componentWillUnmount = () => {
        if (this.state.wsTimeout) {
            clearTimeout(this.state.wsTimeout);
        }
        this.state.client?.close();
    };

    cancelConfirmation = () => this.setState({ confirmationDialogOpen: false });

    confirmation = (question: string, action: (e: React.MouseEvent) => void) =>
        this.setState({
            confirmationDialogOpen: true,
            confirmationDialogQuestion: question,
            confirmationDialogAction: (e: React.MouseEvent) => {
                this.cancelConfirmation();
                action(e);
            },
        });

    handleAbortProcess = (process: ProcessV2) => (e: React.MouseEvent) => {
        stop(e);
        const { intl } = this.props;
        const product_name = process.subscriptions[0].product.name;
        const customer_name = organisationNameByUuid(process.subscriptions[0].customer_id, this.context.organisations);
        this.confirmation(
            intl.formatMessage({ id: "processes.abortConfirmation" }, { name: product_name, customer: customer_name }),
            () =>
                this.context.apiClient.abortProcess(process.pid).then(() => {
                    setFlash(intl.formatMessage({ id: "processes.flash.abort" }, { name: product_name }));
                })
        );
    };

    handleRetryProcess = (process: ProcessV2) => (e: React.MouseEvent) => {
        stop(e);
        const { intl } = this.props;
        const product_name = process.subscriptions[0].product.name;
        const customer_name = organisationNameByUuid(process.subscriptions[0].customer_id, this.context.organisations);
        this.confirmation(
            intl.formatMessage({ id: "processes.retryConfirmation" }, { name: product_name, customer: customer_name }),
            () =>
                this.context.apiClient.retryProcess(process.pid).then(() => {
                    setFlash(intl.formatMessage({ id: "processes.flash.retry" }, { name: product_name }));
                })
        );
    };

    showProcess = (process: ProcessV2) => () => {
        this.context.redirect("/processes/" + process.pid);
    };

    renderActions = (process: ProcessV2) => {
        let options = actionOptions(
            this.context.allowed,
            process,
            this.showProcess(process),
            this.handleRetryProcess(process),
            () => null,
            this.handleAbortProcess(process)
        );
        return <DropDownActions options={options} i18nPrefix="processes.actions" />;
    };

    renderExplain() {
        return (
            <section className="explain">
                <i className="fa fa-question-circle" onClick={() => this.setState({ showExplanation: true })} />
            </section>
        );
    }

    render() {
        const activeSettings = initialProcessTableSettings(
            "table.processes.active",
            initialProcessesFilterAndSort(false, ["running", "suspended", "failed", "created", "waiting"]),
            ["pid", "step", "tag", "creator", "customer", "product"],
            { showSettings: false, pageSize: 10, refresh: false }
        );
        const completedSettings = initialProcessTableSettings(
            "table.processes.completed",
            initialProcessesFilterAndSort(false, ["completed"]),
            ["pid", "step", "status", "assignee", "creator", "started", "abbrev"],
            { showSettings: false, pageSize: 5, refresh: false }
        );

        return (
            <EuiPage>
                <EuiPageBody component="div" className="process-container">
                    <Explain
                        close={() => this.setState({ showExplanation: false })}
                        isVisible={this.state.showExplanation}
                        title="Processes Help"
                    >
                        <h1>Processes</h1>
                        <p>
                            The processes are split into 2 different tables. The upper one shows all active processes
                            and the lower one shows processes that are done/complete.
                        </p>
                        <h2>Settings storage</h2>
                        <p>
                            The tables will store the setting for your filters and columns in the local storage of your
                            browser. If you want to reset the settings to the default, click on the gear icon and then
                            on the reset button.
                        </p>
                    </Explain>
                    <ConfirmationDialog
                        isOpen={this.state.confirmationDialogOpen}
                        cancel={this.cancelConfirmation}
                        confirm={this.state.confirmationDialogAction}
                        question={this.state.confirmationDialogQuestion}
                    />
                    <div className="actions">{this.renderExplain()}</div>
                    { this.state.showTables &&
                        <>
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
                        </>
                    }
                    <ScrollUpButton />
                </EuiPageBody>
            </EuiPage>
        );
    }
}

Processes.contextType = ApplicationContext;

export default injectIntl(Processes);
