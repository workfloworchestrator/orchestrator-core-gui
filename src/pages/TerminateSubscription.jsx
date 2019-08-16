import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import { stop } from "../utils/Utils";
import { startProcess, subscriptionsDetail, productById } from "../api/index";
import { setFlash } from "../utils/Flash";
import ApplicationContext from "../utils/ApplicationContext";
import UserInputForm from "../components/UserInputForm";

import "./TerminateSubscription.scss";
import { TARGET_TERMINATE } from "../validations/Products";

export default class TerminateSubscription extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            organisationId: null,
            product: { tag: "", workflows: [] }
        };
    }

    componentDidMount = () => {
        subscriptionsDetail(this.props.subscriptionId).then(sub =>
            productById(sub.product.product_id).then(product =>
                this.setState({
                    organisationId: sub.customer_id,
                    product: product
                })
            )
        );
    };

    cancel = e => {
        stop(e);
        this.context.redirect("/subscription/" + this.props.subscriptionId);
    };

    submit = processInput => {
        const { product } = this.state;
        const terminate_workflow = product.workflows.find(wf => wf.target === TARGET_TERMINATE);

        return startProcess(terminate_workflow.name, processInput).then(res => {
            this.context.redirect(`/processes`);
            setFlash(I18n.t("process.flash.create", { name: this.props.subscriptionId }));
        });
    };

    changeUserInput = value => {
        this.setState({ contactPersons: [...value] });
    };

    render() {
        const { organisationId, product } = this.state;
        const { subscriptionId } = this.props;

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

                    <UserInputForm
                        stepUserInput={
                            product.tag !== "IP_PREFIX" && product.tag !== "Node" && product.tag !== "Corelink"
                                ? [
                                      { name: "subscription_id", type: "subscription_id", value: subscriptionId },
                                      { name: "contact_persons", type: "contact_persons", organisation: organisationId }
                                  ]
                                : [{ name: "subscription_id", type: "subscription_id", value: subscriptionId }]
                        }
                        validSubmit={this.submit}
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
