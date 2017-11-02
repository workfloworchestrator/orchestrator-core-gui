import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import "./NewProcess.css";
import {productById, subscriptionsDetail} from "../api";
import {isEmpty, stop} from "../utils/Utils";
import "./ProcessDetail.css";
import "highlight.js/styles/default.css";
import ContactPersons from "../components/ContactPersons";
import {terminateSubscription} from "../api/index";
import {setFlash} from "../utils/Flash";
import "./TerminateSubscription.css";
import {enrichSubscription} from "../utils/Lookups";
import {validEmailRegExp} from "../validations/Subscriptions";

export default class TerminateSubscription extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            product: {},
            contactPersons: [{email: "", name: "", tel: ""}],
            subscription: {},
            processing: false
        };
    }

    componentDidMount = () => {
        const {subscriptionId, organisations, products} = this.props;
        subscriptionsDetail(subscriptionId).then(subscription => {
            enrichSubscription(subscription, organisations, products);
            this.setState({subscription: subscription});
            productById(subscription.product_id).then(product =>
                this.setState({product: product}))
        });
    };

    cancel = e => {
        stop(e);
        this.props.history.push("/subscription/" + this.state.subscription.subscription_id);
    };

    renderButtons = () => {
        const {processing, contactPersons} = this.state;
        const invalid = processing || contactPersons.some(x => isEmpty(x.email) || !validEmailRegExp.test(x.email));
        return (<section className="buttons">
            <a className="button" onClick={this.cancel}>
                {I18n.t("subscription.cancel")}
            </a>
            <a tabIndex={0} className={`button ${invalid ? "grey disabled" : "blue"}`} onClick={this.submit}>
                {I18n.t("subscription.submit")}
            </a>
        </section>);
    };


    submit = () => {
        const {product, subscription, contactPersons} = this.state;
        this.setState({processing: true});
        terminateSubscription({subscription: subscription.subscription_id, contact_persons: contactPersons})
            .then(() => {
                this.props.history.push(`/processes`);
                setFlash(I18n.t("process.flash.create", {name: product.name}));
            });
    };

    changeUserInput = value => {
        this.setState({contactPersons: [...value]});
    };


    renderSubscriptionDetail = subscription =>
        <section className="details">
            <h3>{I18n.t("subscription.subscription")}</h3>
            <div className="form-container-parent">
                <section className="form-container">
                    <section>
                        <label className="title">{I18n.t("subscriptions.customer_name")}</label>
                        <input type="text" readOnly={true} value={subscription.customer_name}/>
                    </section>
                    <section>
                        <label className="title">{I18n.t("subscriptions.status")}</label>
                        <input type="text" readOnly={true} value={subscription.status}/>
                    </section>
                </section>
            </div>
        </section>;


    renderProduct = product => {
        if (isEmpty(product)) {
            return null;
        }
        return <section className="details">
            <h3>{I18n.t("subscription.product_title")}</h3>
            <div className="form-container-parent">
                <section className="form-container">
                    <section>
                        <label className="title">{I18n.t("subscription.product.name")}</label>
                        <input type="text" readOnly={true} value={product.name}/>
                        <label className="title">{I18n.t("subscription.product.description")}</label>
                        <input type="text" readOnly={true} value={product.description}/>
                    </section>
                    <section>
                        <label className="title">{I18n.t("subscription.product.product_type")}</label>
                        <input type="text" readOnly={true} value={product.product_type}/>
                        <label className="title">{I18n.t("subscription.product.workflow")}</label>
                        <input type="text" readOnly={true} value={product.terminate_subscription_workflow_key}/>
                    </section>
                </section>
            </div>
        </section>
    };


    render() {
        //TODO use the form_input from workflow to render UserForm
        const {product, subscription, contactPersons} = this.state;
        return (
            <div className="mod-terminate-subscription">
                <section className="card">
                    <h1>{I18n.t("subscription.terminate")}</h1>
                    <section className="form-step">
                        {this.renderSubscriptionDetail(subscription)}
                        {this.renderProduct(product)}
                    </section>
                    <section className="form-step">
                        <section className="form-divider">
                            {<label htmlFor="name">{I18n.t("process.contact_persons")}</label>}
                            {<em>{I18n.t("process.contact_persons")}</em>}
                            <ContactPersons persons={contactPersons} onChange={this.changeUserInput}/>
                        </section>
                    </section>
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
