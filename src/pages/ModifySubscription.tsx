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
import { startProcess, catchErrorStatus } from "../api/index";
import { setFlash } from "../utils/Flash";
import ApplicationContext from "../utils/ApplicationContext";
import UserInputFormWizard from "../components/UserInputFormWizard";

import "./ModifySubscription.scss";
import { InputField, FormNotCompleteResponse } from "../utils/types";

interface IProps {
    subscriptionId: string;
    workflowName: string;
}

interface IState {
    stepUserInput?: InputField[];
}

export default class ModifySubscription extends React.Component<IProps, IState> {
    context!: React.ContextType<typeof ApplicationContext>;
    state: IState = {};

    componentDidMount = () => {
        const { subscriptionId, workflowName } = this.props;

        let promise = startProcess(workflowName, [{ subscription_id: subscriptionId }]).then(res => {
            this.context.redirect(`/processes?highlight=${res.id}`);
            setFlash(I18n.t("process.flash.create", { name: subscriptionId, pid: res.id }));
        });
        catchErrorStatus<FormNotCompleteResponse>(promise, 510, json => {
            this.setState({ stepUserInput: json.form });
        });
    };

    cancel = () => {
        this.context.redirect("/subscription/" + this.props.subscriptionId);
    };

    submit = (processInput: {}[]) => {
        const { subscriptionId, workflowName } = this.props;

        return startProcess(workflowName, [{ subscription_id: subscriptionId }, ...processInput]).then(res => {
            this.context.redirect(`/processes?highlight=${res.id}`);
            setFlash(I18n.t("process.flash.create", { name: subscriptionId, pid: res.id }));
        });
    };

    render() {
        const { stepUserInput } = this.state;
        const { workflowName } = this.props;

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

ModifySubscription.contextType = ApplicationContext;
