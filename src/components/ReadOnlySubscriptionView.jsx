import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import {isEmpty} from "../utils/Utils";
import {contacts, imsService, productById, subscriptionsDetail} from "../api/index";
import {enrichSubscription} from "../utils/Lookups";
import {port_subscription_id, subscriptionInstanceValues} from "../validations/Subscriptions";

import "./ReadOnlySubscriptionView.css";
import {organisationContactsKey} from "./OrganisationSelect";

export default class ReadOnlySubscriptionView extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            product: {},
            subscription: {instances: []},
            childSubscriptions: []
        };
    }

    componentWillMount() {
        const {subscriptionId, organisations, products} = this.props;
        subscriptionsDetail(subscriptionId).then(subscription => {
            if (this.props.storeInterDependentState) {
                contacts(subscription.customer_id).then(result =>
                    this.props.storeInterDependentState(organisationContactsKey, result));
            }
            enrichSubscription(subscription, organisations, products);
            this.setState({subscription: subscription});
            const values = subscriptionInstanceValues(subscription);
            const portSubscriptionResourceTypes = values.filter(val => val.resource_type.resource_type === port_subscription_id);
            const promises = [productById(subscription.product_id)]
                .concat(portSubscriptionResourceTypes.map(rt => imsService(port_subscription_id, rt.value)));

            Promise.all(promises).then(results => {
                const children = results.slice(1).map(obj => obj.json);
                children.forEach(sub => enrichSubscription(sub, organisations, products));
                this.setState({product: results[0], childSubscriptions: children});
            });
        })
    }

    renderSubscriptionChilds = (circuits, product) => {
        if (isEmpty(circuits)) {
            return null;
        }
        return <section className="details">
            <h3>{I18n.t("terminate_subscription.subscription_childs", {product: product.name})}</h3>
            {circuits.map((subscription, index) =>
                this.renderSingleSubscription(subscription, index === circuits.length - 1 ? "child last" : "child not-last"))}
        </section>;
    };


    renderSingleSubscription = (subscription, className = "") =>
        <div key={subscription.subscription_id} className={`form-container ${className}`}>
            <section className="part">
                <label className="title">{I18n.t("subscriptions.customer_name")}</label>
                <input type="text" readOnly={true} value={subscription.customer_name}/>
                <label className="title">{I18n.t("subscriptions.name")}</label>
                <input type="text" readOnly={true} value={subscription.name}/>
            </section>
            <section className="part">
                <label className="title">{I18n.t("subscriptions.status")}</label>
                <input type="text" readOnly={true} value={subscription.status}/>
                <label className="title">{I18n.t("subscriptions.description")}</label>
                <input type="text" readOnly={true} value={subscription.description}/>
            </section>
        </div>;

    renderSubscriptionDetail = subscription =>
        <section className="details">
            <h3>{I18n.t("subscription.subscription")}</h3>
            {this.renderSingleSubscription(subscription)}
        </section>;


    renderProduct = product => {
        if (isEmpty(product)) {
            return null;
        }
        return <section className="details">
            <h3>{I18n.t("subscription.product_title")}</h3>
            <div className="form-container">
                <section className="part">
                    <label className="title">{I18n.t("subscription.product.name")}</label>
                    <input type="text" readOnly={true} value={product.name}/>
                    <label className="title">{I18n.t("subscription.product.description")}</label>
                    <input type="text" readOnly={true} value={product.description}/>
                </section>
                <section className="part">
                    <label className="title">{I18n.t("subscription.product.product_type")}</label>
                    <input type="text" readOnly={true} value={product.product_type}/>
                    <label className="title">{I18n.t("subscription.product.tag")}</label>
                    <input type="text" readOnly={true} value={product.tag}/>
                    <label className="title">{I18n.t("subscription.product.workflow")}</label>
                    <input type="text" readOnly={true} value={product.terminate_subscription_workflow_key}/>
                </section>
            </div>
        </section>
    };


    render() {
        const {childSubscriptions, product, subscription} = this.state;
        const className = this.props.className || "";
        return (
            <div className={`mod-read-only-subscription-view ${className}`}>
                {this.renderSubscriptionDetail(subscription)}
                {this.renderProduct(product)}
                {this.renderSubscriptionChilds(childSubscriptions, product)}
            </div>
        );
    }
}

ReadOnlySubscriptionView.propTypes = {
    organisations: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired,
    subscriptionId: PropTypes.string.isRequired,
    storeInterDependentState: PropTypes.func,
    className: PropTypes.string
};
