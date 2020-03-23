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

import "./ReadOnlySubscriptionView.scss";

import I18n from "i18n-js";
import PropTypes from "prop-types";
import React from "react";

import { getResourceTypeInfo, productById, subscriptionsDetail } from "../api/index";
import ApplicationContext from "../utils/ApplicationContext";
import { enrichSubscription } from "../utils/Lookups";
import { applyIdNamingConvention, isEmpty } from "../utils/Utils";
import { port_subscription_id, subscriptionInstanceValues } from "../validations/Subscriptions";

export default class ReadOnlySubscriptionView extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            product: {},
            subscription: { instances: [] },
            childSubscriptions: []
        };
    }

    componentWillMount() {
        const { subscriptionId } = this.props;
        const { organisations, products } = this.context;
        subscriptionsDetail(subscriptionId).then(subscription => {
            enrichSubscription(subscription, organisations, products);
            this.setState({ subscription: subscription });
            const values = subscriptionInstanceValues(subscription);
            const portSubscriptionResourceTypes = values.filter(
                val => val.resource_type.resource_type === port_subscription_id
            );
            const promises = [productById(subscription.product_id)].concat(
                portSubscriptionResourceTypes.map(rt => getResourceTypeInfo(port_subscription_id, rt.value))
            );

            Promise.all(promises).then(results => {
                const children = results.slice(1).map(obj => obj.json);
                children.forEach(sub => enrichSubscription(sub, organisations, products));
                this.setState({ product: results[0], childSubscriptions: children });
            });
        });
    }

    renderSubscriptionChilds = (circuits, product) => {
        if (isEmpty(circuits)) {
            return null;
        }
        return (
            <section className="details">
                <h3>
                    {I18n.t("terminate_subscription.subscription_childs", {
                        product: product.name
                    })}
                </h3>
                {circuits.map((subscription, index) =>
                    this.renderSingleSubscription(
                        subscription,
                        index === circuits.length - 1 ? "child last" : "child not-last",
                        index
                    )
                )}
            </section>
        );
    };

    renderSingleSubscription = (subscription, className = "", index = 0) => (
        <div key={`${subscription.subscription_id}_${index}`} className={`form-container ${className}`}>
            <section className="part">
                <label htmlFor="input-subscription-customer-name" className="title">
                    {I18n.t("subscriptions.customer_name")}
                </label>
                <input
                    id="input-subscription-customer-name"
                    type="text"
                    readOnly={true}
                    value={subscription.customer_name}
                />
                <label htmlFor="input-subscription-name" className="title">
                    {I18n.t("subscriptions.name")}
                </label>
                <input id="input-subscription-name" type="text" readOnly={true} value={subscription.name} />
            </section>
            <section className="part">
                <label htmlFor="input-subscription-status" className="title">
                    {I18n.t("subscriptions.status")}
                </label>
                <input id="input-subscription-status" type="text" readOnly={true} value={subscription.status} />
                <label htmlFor="input-subscription-description" className="title">
                    {I18n.t("subscriptions.description")}
                </label>
                <input
                    id="input-subscription-description"
                    type="text"
                    readOnly={true}
                    value={subscription.description}
                />
            </section>
        </div>
    );

    renderSubscriptionDetail = subscription => (
        <section className="details">
            <h3>{I18n.t("subscription.subscription")}</h3>
            {this.renderSingleSubscription(subscription)}
        </section>
    );

    renderSubscriptionInstanceValue = (val, index) => (
        <div key={index}>
            <label htmlFor={`${applyIdNamingConvention(val.resource_type.resource_type)}`} className="title">
                {val.resource_type.resource_type}
                {val.instance_label ? ` : ${val.instance_label}` : ""}
            </label>
            <input
                id={`${applyIdNamingConvention(val.resource_type.resource_type)}`}
                type="text"
                readOnly={true}
                value={val.value}
            />
        </div>
    );

    renderSubscriptionResourceTypes = subscription => {
        const values = subscriptionInstanceValues(subscription);
        if (isEmpty(values)) {
            return null;
        }
        const nbrLeft = Math.ceil(values.length / 2);
        return (
            <section className="details">
                <h3>{I18n.t("subscription.resource_types")}</h3>
                <em>{I18n.t("subscription.resource_types_info")}</em>
                <div className="form-container">
                    <section className="part">
                        {values.slice(0, nbrLeft).map(this.renderSubscriptionInstanceValue)}
                    </section>
                    <section className="part">
                        {values.slice(nbrLeft).map(this.renderSubscriptionInstanceValue)}
                    </section>
                </div>
            </section>
        );
    };

    renderProduct = product => {
        if (isEmpty(product)) {
            return null;
        }
        return (
            <section className="details">
                <h3>{I18n.t("subscription.product_title")}</h3>
                <div className="form-container">
                    <section className="part">
                        <label htmlFor="input-product-name" className="title">
                            {I18n.t("subscription.product.name")}
                        </label>
                        <input id="input-product-name" type="text" readOnly={true} value={product.name} />
                        <label htmlFor="input-product-description" className="title">
                            {I18n.t("subscription.product.description")}
                        </label>
                        <input id="input-product-description" type="text" readOnly={true} value={product.description} />
                    </section>
                    <section className="part">
                        <label htmlFor="input-product-type" className="title">
                            {I18n.t("subscription.product.product_type")}
                        </label>
                        <input id="input-product-type" type="text" readOnly={true} value={product.product_type} />
                        <label htmlFor="input-product-tag" className="title">
                            {I18n.t("subscription.product.tag")}
                        </label>
                        <input id="input-product-tag" type="text" readOnly={true} value={product.tag} />
                    </section>
                </div>
            </section>
        );
    };

    render() {
        const { childSubscriptions, product, subscription } = this.state;
        const className = this.props.className || "";
        return (
            <div className={`mod-read-only-subscription-view ${className}`}>
                {this.renderSubscriptionDetail(subscription)}
                {this.renderSubscriptionResourceTypes(subscription)}
                {this.renderProduct(product)}
                {this.renderSubscriptionChilds(childSubscriptions, product)}
            </div>
        );
    }
}

ReadOnlySubscriptionView.propTypes = {
    subscriptionId: PropTypes.string.isRequired,
    className: PropTypes.string
};

ReadOnlySubscriptionView.contextType = ApplicationContext;
