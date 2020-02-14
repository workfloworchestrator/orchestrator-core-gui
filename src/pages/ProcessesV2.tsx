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
} from "../components/ProcessesTable";
import ConfirmationDialog from "../components/ConfirmationDialog";
import ApplicationContext from "../utils/ApplicationContext";

import "./Processes.scss";

interface IProps {
}

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

    render() {
        const completedSettings = initialProcessTableSettings(
            "table.processes.completed",
            initialProcessesFilterAndSort(false, ["completed"]),
            ["pid", "step", "status", "assignee", "creator", "started", "abbrev"]
        );
        const activeSettings = initialProcessTableSettings(
            "table.processes.active",
            initialProcessesFilterAndSort(false, ["created", "running", "suspended", "failed"]),
            ["pid", "step", "tags", "customer"]
        );

        return (
            <div className="mod-processes">
                <ConfirmationDialog
                    isOpen={this.state.confirmationDialogOpen}
                    cancel={this.cancelConfirmation}
                    confirm={this.state.confirmationDialogAction}
                    question={this.state.confirmationDialogQuestion}
                />
                <ProcessesTable initialTableSettings={activeSettings} />
                <ProcessesTable initialTableSettings={completedSettings} />
            </div>
        );
    }
}

Processes.contextType = ApplicationContext;
