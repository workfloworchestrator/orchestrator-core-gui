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
import ProcessesTable from "../components/ProcessesTable";
import ConfirmationDialog from "../components/ConfirmationDialog";
import ApplicationContext from "../utils/ApplicationContext";

import "./Processes.scss";

interface IProps {
    highlight: string;
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
        return (
            <div className="mod-processes">
                <ConfirmationDialog
                    isOpen={this.state.confirmationDialogOpen}
                    cancel={this.cancelConfirmation}
                    confirm={this.state.confirmationDialogAction}
                    question={this.state.confirmationDialogQuestion}
                />
                <ProcessesTable
                    name={"completed-processes"}
                    showTasks={false}
                    initialStatuses={["completed"]}
                    hiddenColumns={["status", "assignee"]}
                    initialPageSize={5}
                />

                <ProcessesTable
                    name={"active-processes"}
                    showTasks={false}
                    initialStatuses={["created", "running", "suspended", "failed"]}
                    hiddenColumns={[]}
                    initialPageSize={25}
                />
            </div>
        );
    }
}

Processes.contextType = ApplicationContext;
