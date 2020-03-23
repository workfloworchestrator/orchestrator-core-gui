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

import "./TerminateSubscription.scss";

import I18n from "i18n-js";
import React from "react";

import { catchErrorStatus, productById, startProcess, subscriptionsDetail } from "../api/index";
import UserInputFormWizard from "../components/UserInputFormWizard";
import ApplicationContext from "../utils/ApplicationContext";
import { setFlash } from "../utils/Flash";
import { FormNotCompleteResponse, InputField, Product, Workflow } from "../utils/types";
import { TARGET_TERMINATE } from "../validations/Products";

interface IProps {
    subscriptionId: string;
}

interface IState {
    product?: Product;
    stepUserInput?: InputField[];
}

export default class TerminateSubscription extends React.Component<IProps, IState> {
    context!: React.ContextType<typeof ApplicationContext>;

    state: IState = {};

    componentDidMount = () => {
        const { subscriptionId } = this.props;

        subscriptionsDetail(subscriptionId).then(sub =>
            productById(sub.product.product_id).then(product => {
                const terminate_workflow = product.workflows.find((wf: Workflow) => wf.target === TARGET_TERMINATE)!;
                let promise = startProcess(terminate_workflow.name, [{ subscription_id: subscriptionId }]).then(res => {
                    this.context.redirect(`/processes?highlight=${res.id}`);
                    setFlash(
                        I18n.t("process.flash.create_modify", {
                            name: I18n.t(`workflow.${terminate_workflow.name}`),
                            subscriptionId: subscriptionId,
                            pid: res.id
                        })
                    );
                });
                catchErrorStatus<FormNotCompleteResponse>(promise, 510, json => {
                    this.setState({ stepUserInput: json.form, product: product });
                });
            })
        );
    };

    cancel = () => {
        this.context.redirect("/subscription/" + this.props.subscriptionId);
    };

    submit = (processInput: {}[]) => {
        const { subscriptionId } = this.props;
        const { product } = this.state;
        const terminate_workflow = product!.workflows.find(wf => wf.target === TARGET_TERMINATE)!;

        return startProcess(terminate_workflow.name, [{ subscription_id: subscriptionId }, ...processInput]).then(
            res => {
                this.context.redirect(`/processes?highlight=${res.id}`);
                setFlash(
                    I18n.t("process.flash.create_modify", {
                        name: I18n.t(`workflow.${terminate_workflow.name}`),
                        subscriptionId: subscriptionId,
                        pid: res.id
                    })
                );
            }
        );
    };

    render() {
        const { stepUserInput, product } = this.state;

        if (!stepUserInput || !product) {
            return null;
        }

        return (
            <div className="mod-terminate-subscription">
                <section className="card">
                    <h1>{I18n.t("subscription.terminate")}</h1>

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

TerminateSubscription.contextType = ApplicationContext;
