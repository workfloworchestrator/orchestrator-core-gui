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

export default class TerminateSubscription extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            product: {},
            userInput: [{name: "contact_persons", value: [{email: "", name: "", tel: ""}]}],
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
        const invalid = isEmpty(this.state.userInput) || this.state.processing;
        return (<section className="buttons">
            <a className="button" onClick={this.cancel}>
                {I18n.t("process.cancel")}
            </a>
            <a tabIndex={0} className={`button ${invalid ? "grey disabled" : "blue"}`} onClick={this.submit}>
                {I18n.t("process.submit")}
            </a>
        </section>);
    };


    submit = () => {
        const {product, subscription, userInput} = this.state;
        const process = {
            organisation: subscription.client_id,
            subscription: subscription.subscription_id,
            contact_persons: userInput.find(u => u.name === "contact_persons").value,
            product: product.product_id
        };
        debugger;
        terminateSubscription(process)
            .then(() => {
                this.props.history.push(`/processes`);
                setFlash(I18n.t("process.flash.create", {name: product.name}));
            });
    };


    changeUserInput = name => value => {
        const userInput = [...this.state.userInput];
        userInput.find(input => input.name === name).value = value;
        this.setState({user_input: userInput});
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
        const {product, subscription, userInput} = this.state;
        const persons = userInput.find(u => u.name === "contact_persons").value;
        return (
            <div className="mod-terminate-subscription">
                <section className="card">
                    <h1>{I18n.t("subscription.terminate")}</h1>
                    <section className="form-step">
                        {this.renderProduct(product)}
                        {this.renderSubscriptionDetail(subscription)}
                    </section>
                    <section className="form-step">
                        <section className="form-divider">
                            {<label htmlFor="name">{I18n.t("process.contact_persons")}</label>}
                            {<em>{I18n.t("process.contact_persons")}</em>}
                            <ContactPersons
                                persons={persons}
                                onChange={this.changeUserInput("contact_persons")}/>
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
