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

import { EuiPage, EuiPageBody, EuiPanel } from "@elastic/eui";
import ConfirmationDialog from "components/modals/ConfirmationDialog";
import SubscriptionDetail from "components/subscriptionDetail/SubscriptionDetail";
import React from "react";
import { RouteComponentProps } from "react-router";

interface IState {
    confirmationDialogOpen: boolean;
    confirmationDialogAction: (e: React.MouseEvent) => void;
    confirmationDialogQuestion: string;
}

interface MatchParams {
    id: string;
}

interface IProps extends Partial<RouteComponentProps<MatchParams>> {
    subscriptionId?: string;
}

export default class SubscriptionDetailPage extends React.PureComponent<IProps, IState> {
    state = {
        confirmationDialogOpen: false,
        confirmationDialogAction: () => {},
        confirmationDialogQuestion: "",
    };

    render() {
        const { confirmationDialogOpen, confirmationDialogAction, confirmationDialogQuestion } = this.state;

        const cancelConfirmation = () => this.setState({ confirmationDialogOpen: false });

        const confirmation = (question: string, action: (e: React.MouseEvent) => void) =>
            this.setState({
                confirmationDialogOpen: true,
                confirmationDialogQuestion: question,
                confirmationDialogAction: (e: React.MouseEvent) => {
                    cancelConfirmation();
                    action(e);
                },
            });

        return (
            <EuiPage>
                <EuiPageBody component="div">
                    <EuiPanel>
                        <ConfirmationDialog
                            isOpen={confirmationDialogOpen}
                            cancel={cancelConfirmation}
                            confirm={confirmationDialogAction}
                            question={confirmationDialogQuestion}
                        />
                        <SubscriptionDetail subscriptionId={this.props.match!.params.id} confirmation={confirmation} />
                    </EuiPanel>
                </EuiPageBody>
            </EuiPage>
        );
    }
}
