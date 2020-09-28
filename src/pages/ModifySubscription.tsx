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

import "pages/ModifySubscription.scss";

import { catchErrorStatus, startProcess } from "api/index";
import UserInputFormWizard from "components/inputForms/UserInputFormWizard";
import I18n from "i18n-js";
import React from "react";
import { Redirect, RouteComponentProps, withRouter } from "react-router-dom";
import { setFlash } from "utils/Flash";
import { FormNotCompleteResponse, InputForm } from "utils/types";

interface IProps extends RouteComponentProps {
    subscriptionId: string;
    workflowName: string;
}

interface IState {
    stepUserInput?: InputForm;
    pid?: string;
}

class ModifySubscription extends React.Component<IProps, IState> {
    state: IState = {};

    componentDidMount = () => {
        const { subscriptionId, workflowName } = this.props;

        let promise = startProcess(workflowName, [{ subscription_id: subscriptionId }]).then(res => {
            this.setState({ pid: res.id });
        });
        catchErrorStatus<FormNotCompleteResponse>(promise, 510, json => {
            this.setState({ stepUserInput: json.form });
        });
    };

    cancel = () => {
        this.props.history.push("/subscriptions/" + this.props.subscriptionId);
    };

    submit = (processInput: {}[]) => {
        const { subscriptionId, workflowName } = this.props;

        return startProcess(workflowName, [{ subscription_id: subscriptionId }, ...processInput]).then(res => {
            this.setState({ pid: res.id });
        });
    };

    render() {
        const { stepUserInput, pid } = this.state;
        const { subscriptionId, workflowName } = this.props;

        if (pid) {
            setFlash(
                I18n.t("process.flash.create_modify", {
                    name: I18n.t(`workflow.${workflowName}`),
                    subscriptionId: subscriptionId,
                    pid: pid
                })
            );
            return <Redirect to={workflowName.startsWith("validate") ? "/tasks" : `/processes?highlight=${pid}`} />;
        }

        if (!stepUserInput) {
            return null;
        }

        return (
            <div className="mod-modify-subscription">
                <section className="card">
                    <h1>{I18n.t(`workflow.${workflowName}`)}</h1>
                    <UserInputFormWizard
                        stepUserInput={stepUserInput}
                        validSubmit={this.submit}
                        cancel={this.cancel}
                        hasNext={false}
                    />
                </section>
            </div>
        );
    }
}

export default withRouter(ModifySubscription);
