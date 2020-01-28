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
import PropTypes from "prop-types";
import { startProcess, subscriptionsDetail, productById, catchErrorStatus } from "../api/index";
import { setFlash } from "../utils/Flash";
import ApplicationContext from "../utils/ApplicationContext";
import UserInputFormWizard from "../components/UserInputFormWizard";

import "./TerminateSubscription.scss";
import { TARGET_TERMINATE } from "../validations/Products";
import { ProductWithDetails, InputField, FormNotCompleteResponse, Workflow } from "../utils/types";

interface IProps {
    subscriptionId: string;
}

interface IState {
    organisationId?: string;
    product?: ProductWithDetails;
    stepUserInput: InputField[];
}

export default class TerminateSubscription extends React.Component<IProps, IState> {
    static propTypes: {};
    state: IState = {
        stepUserInput: []
    };

    componentDidMount = () => {
        subscriptionsDetail(this.props.subscriptionId).then(sub =>
            productById(sub.product.product_id).then(product => {
                const terminate_workflow = product.workflows!.find((wf: Workflow) => wf.target === TARGET_TERMINATE)!;
                let promise = startProcess(terminate_workflow.name, [{ subscription_id: this.props.subscriptionId }]);
                catchErrorStatus(promise, 510, (json: FormNotCompleteResponse) => {
                    this.setState({ stepUserInput: json.form, organisationId: sub.customer_id, product: product });
                });
            })
        );
    };

    cancel = () => {
        this.context.redirect("/subscription/" + this.props.subscriptionId);
    };

    submit = (processInput: {}[]) => {
        const { product } = this.state;
        const terminate_workflow = product!.workflows!.find(wf => wf.target === TARGET_TERMINATE)!;

        let result = startProcess(terminate_workflow.name, [
            { subscription_id: this.props.subscriptionId },
            ...processInput
        ]);
        result.then(res => {
            this.context.redirect(`/processes?highlight=${res.id}`);
            setFlash(I18n.t("process.flash.create", { name: this.props.subscriptionId, pid: res.id }));
        });
        result.catch(error => {
            // Todo: handle errors in a more uniform way. The error dialog is behind stack trace when enabled. This catch shouldn't be needed.
        });
        return result;
    };

    render() {
        const { product } = this.state;

        if (!product) {
            return null;
        }

        return (
            <div className="mod-terminate-subscription">
                <section className="card">
                    <h1>{I18n.t("subscription.terminate")}</h1>
                    {product.tag === "Node" && (
                        <section className="message-container">
                            <section className="message">
                                <section className="status-icon">
                                    <i className="fa fa-exclamation-triangle" />
                                </section>
                                <section className="status-info">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>{I18n.t("subscription.node_terminate_warning")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>{I18n.t("subscription.node_terminate_warning_info")}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </section>
                            </section>
                        </section>
                    )}

                    <UserInputFormWizard
                        stepUserInput={this.state.stepUserInput}
                        validSubmit={this.submit}
                        cancel={this.cancel}
                        hasNext={false}
                    />
                </section>
            </div>
        );
    }
}

TerminateSubscription.propTypes = {
    subscriptionId: PropTypes.string
};

TerminateSubscription.contextType = ApplicationContext;
