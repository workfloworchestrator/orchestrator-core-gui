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

import { EuiPage, EuiPageBody } from "@elastic/eui";
import UserInputFormWizard from "components/inputForms/UserInputFormWizard";
import React from "react";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";
import { Redirect, RouteComponentProps, withRouter } from "react-router-dom";
import { setFlash } from "utils/Flash";
import { FormNotCompleteResponse, InputForm } from "utils/types";

import ApplicationContext from "../utils/ApplicationContext";
import { modifySubscriptionsStyling } from "./ModifySubscriptionStyling";

interface IProps extends RouteComponentProps, WrappedComponentProps {
    subscriptionId: string;
    workflowName: string;
}

interface IState {
    stepUserInput?: InputForm;
    processId?: string;
}

class ModifySubscription extends React.Component<IProps, IState> {
    static contextType = ApplicationContext;
    context!: React.ContextType<typeof ApplicationContext>;

    state: IState = {};

    componentDidMount = () => {
        const { subscriptionId, workflowName } = this.props;

        let promise = this.context.apiClient
            .startProcess(workflowName, [{ subscription_id: subscriptionId }])
            .then((res: { id: string }) => {
                this.setState({ processId: res.id });
            });
        // @ts-ignore
        this.context.apiClient.catchErrorStatus<FormNotCompleteResponse>(promise, 510, (json) => {
            this.setState({ stepUserInput: json.form });
        });
    };

    cancel = () => {
        this.props.history.push("/subscriptions/" + this.props.subscriptionId);
    };

    submit = (processInput: {}[]) => {
        const { subscriptionId, workflowName } = this.props;

        return this.context.apiClient
            .startProcess(workflowName, [{ subscription_id: subscriptionId }, ...processInput])
            .then((res: { id: string }) => {
                this.setState({ processId: res.id });
            });
    };

    render() {
        const { stepUserInput, processId } = this.state;
        const { subscriptionId, workflowName, intl } = this.props;

        if (processId) {
            setFlash(
                intl.formatMessage(
                    { id: "process.flash.create_modify" },
                    {
                        name: intl.formatMessage({ id: `workflow.${workflowName}` }),
                        subscriptionId: subscriptionId,
                        processId: processId,
                    }
                )
            );
            return <Redirect to={`/processes/${processId}`} />;
        }

        if (!stepUserInput) {
            return null;
        }

        return (
            <EuiPage css={modifySubscriptionsStyling}>
                <EuiPageBody component="div" className="mod-modify-subscription">
                    <section className="card">
                        <h1>
                            <FormattedMessage id={`workflow.${workflowName}`} />
                        </h1>
                        <UserInputFormWizard
                            stepUserInput={stepUserInput}
                            validSubmit={this.submit}
                            cancel={this.cancel}
                            hasNext={false}
                        />
                    </section>
                </EuiPageBody>
            </EuiPage>
        );
    }
}

export default injectIntl(withRouter(ModifySubscription));
