import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import {stop} from "../utils/Utils";
import ContactPersons from "../components/ContactPersons";
import {terminateSubscription, subscriptionsDetail} from "../api/index";
import {setFlash} from "../utils/Flash";
import ReadOnlySubscriptionView from "../components/ReadOnlySubscriptionView";

import "./TerminateSubscription.scss";

export default class TerminateSubscription extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            contactPersons: [{email: "", name: "", phone: ""}],
            processing: false,
            organisationId: null,
            productTag: null
        };
    }

    componentDidMount = () => {
        subscriptionsDetail(this.props.subscriptionId)
            .then(sub => this.setState({
                organisationId: sub.customer_id,
                productTag: sub.product.tag
            }));
    };

    cancel = e => {
        stop(e);
        this.props.history.push("/subscription/" + this.props.subscriptionId);
    };

    renderButtons = () => {
        const invalid = false;
        return (<section className="buttons">
            <a className="button" onClick={this.cancel}>
                {I18n.t("terminate_subscription.cancel")}
            </a>
            <a tabIndex={0} className={`button ${invalid ? "grey disabled" : "blue"}`} onClick={this.submit}>
                {I18n.t("terminate_subscription.submit")}
            </a>
        </section>);
    };

    submit = () => {
        this.setState({processing: true});
        terminateSubscription({
            subscription_id: this.props.subscriptionId,
            contact_persons: this.state.contactPersons
        }).then(res => {
            this.props.history.push(`/processes`);
            setFlash(I18n.t("process.flash.create", {name: this.props.subscriptionId}));
        });
    };

    changeUserInput = value => {
        this.setState({contactPersons: [...value]});
    };

    render() {
        //TODO use the form_input from workflow to render UserForm
        const {contactPersons, organisationId, productTag} = this.state;
        const {subscriptionId, products, organisations} = this.props;


        return (
            <div className="mod-terminate-subscription">
                <section className="card">
                    <h1>{I18n.t("subscription.terminate")}</h1>
                    {productTag === "Node" &&
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
                    }

                    <section className="form-step">
                        <ReadOnlySubscriptionView subscriptionId={subscriptionId}
                                                  products={products} organisations={organisations}/>
                    </section>

                    {productTag !== 'IP_PREFIX' && productTag !== 'Node' && productTag !== 'Corelink' &&
                        <section className="form-step">
                            <section className="form-divider">
                                {<label htmlFor="name">{I18n.t("process.contact_persons")}</label>}
                                {<em>{I18n.t("process.contact_persons")}</em>}
                                <ContactPersons persons={contactPersons} onChange={this.changeUserInput}
                                                organisationId={organisationId}/>
                            </section>
                        </section>
                    }
                    {this.renderButtons()}
                </section>
            </div>
        );
    }
}

TerminateSubscription.propTypes = {
    history: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    organisations: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired,
    subscriptionId: PropTypes.string
};
