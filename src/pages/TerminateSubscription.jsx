import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import { stop } from "../utils/Utils";
import ContactPersons from "../components/ContactPersons";
import { startProcess, subscriptionsDetail, productById } from "../api/index";
import { setFlash } from "../utils/Flash";
import ReadOnlySubscriptionView from "../components/ReadOnlySubscriptionView";
import ApplicationContext from "../utils/ApplicationContext";

import "./TerminateSubscription.scss";
import { TARGET_TERMINATE } from "../validations/Products";

export default class TerminateSubscription extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contactPersons: [{ email: "", name: "", phone: "" }],
            processing: false,
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

    renderButtons = () => {
        const invalid = false;
        return (
            <section className="buttons">
                <button className="button" onClick={this.cancel}>
                    {I18n.t("terminate_subscription.cancel")}
                </button>
                <button tabIndex={0} className={`button ${invalid ? "grey disabled" : "blue"}`} onClick={this.submit}>
                    {I18n.t("terminate_subscription.submit")}
                </button>
            </section>
        );
    };

    submit = () => {
        const { product } = this.state;
        const terminate_workflow = product.workflows.find(wf => wf.target === TARGET_TERMINATE);

        if (terminate_workflow) {
            this.setState({ processing: true });
            startProcess(terminate_workflow.name, {
                subscription_id: this.props.subscriptionId,
                contact_persons: this.state.contactPersons
            }).then(res => {
                this.context.redirect(`/processes`);
                setFlash(I18n.t("process.flash.create", { name: this.props.subscriptionId }));
            });
        }
    };

    changeUserInput = value => {
        this.setState({ contactPersons: [...value] });
    };

    render() {
        //TODO use the form_input from workflow to render UserForm
        const { contactPersons, organisationId, product } = this.state;
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

                    <section className="form-step">
                        <ReadOnlySubscriptionView subscriptionId={subscriptionId} />
                    </section>

                    {product.tag !== "IP_PREFIX" && product.tag !== "Node" && product.tag !== "Corelink" && (
                        <section className="form-step">
                            <section className="form-divider">
                                {<label htmlFor="name">{I18n.t("process.contact_persons")}</label>}
                                {<em>{I18n.t("process.contact_persons")}</em>}
                                <ContactPersons
                                    persons={contactPersons}
                                    onChange={this.changeUserInput}
                                    organisationId={organisationId}
                                />
                            </section>
                        </section>
                    )}
                    {this.renderButtons()}
                </section>
            </div>
        );
    }
}

TerminateSubscription.propTypes = {
    subscriptionId: PropTypes.string
};

TerminateSubscription.contextType = ApplicationContext;
