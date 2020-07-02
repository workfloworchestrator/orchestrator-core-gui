/*
 * Copyright 2019-2020 SURF.
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
import { getResourceTypeInfo, productById, subscriptionsDetail } from "api";
import I18n from "i18n-js";
import React, { HTMLProps, useContext, useEffect, useState } from "react";
import { Override, connectField, filterDOMProps } from "uniforms";
import ApplicationContext from "utils/ApplicationContext";
import { enrichSubscription } from "utils/Lookups";
import { Product, Subscription, SubscriptionWithDetails } from "utils/types";
import { applyIdNamingConvention, isEmpty } from "utils/Utils";
import { InstanceValueWithLabel, subscriptionInstanceValues } from "validations/Subscriptions";

export type SubscriptionSummaryFieldProps = Override<
    Omit<HTMLProps<HTMLDivElement>, "onChange">,
    {
        id?: string;
        label?: string;
        name?: string;
        value?: string;
        description?: string;
    }
>;

function SubscriptionSummary({ id, name, label, description, value, ...props }: SubscriptionSummaryFieldProps) {
    const { organisations, products } = useContext(ApplicationContext);
    const [subscription, setSubscription] = useState<SubscriptionWithDetails | undefined>(undefined);
    const [product, setProduct] = useState<Product | undefined>(undefined);
    const [childSubscriptions, setChildSubscriptions] = useState<SubscriptionWithDetails[] | undefined>(undefined);

    useEffect(() => {
        if (!value) {
            return;
        }

        subscriptionsDetail(value).then(subscription => {
            const enrichedSubscription = enrichSubscription(subscription, organisations, products);
            setSubscription(enrichedSubscription);
            const values = subscriptionInstanceValues(enrichedSubscription);
            const portSubscriptionResourceTypes = values.filter(
                val => val.resource_type.resource_type === "port_subscription_id"
            );
            let promises: Promise<any>[] = [productById(subscription.product_id)];
            promises.concat(
                portSubscriptionResourceTypes.map(rt => getResourceTypeInfo("port_subscription_id", rt.value))
            );

            Promise.all(promises).then(results => {
                const children = results.slice(1).map((obj: any) => obj.json);
                children.forEach((sub: Subscription) => enrichSubscription(sub, organisations, products));
                setProduct(results[0] as Product);
                setChildSubscriptions(children);
            });
        });
    }, [value, organisations, products]);

    function renderSingleSubscription(
        subscription: SubscriptionWithDetails,
        className: string = "",
        index: number = 0
    ): JSX.Element {
        return (
            <div key={`${subscription.subscription_id}_${index}`} className={`form-container ${className}`}>
                <section className="part">
                    <label htmlFor="input-subscription-customer-name" className="title">
                        {I18n.t("forms.widgets.subscriptionSummary.customerName")}
                    </label>
                    <input
                        id="input-subscription-customer-name"
                        type="text"
                        readOnly={true}
                        value={subscription.customer_name}
                    />
                    <label htmlFor="input-subscription-name" className="title">
                        {I18n.t("forms.widgets.subscriptionSummary.name")}
                    </label>
                    <input id="input-subscription-name" type="text" readOnly={true} value={subscription.name} />
                </section>
                <section className="part">
                    <label htmlFor="input-subscription-status" className="title">
                        {I18n.t("forms.widgets.subscriptionSummary.status")}
                    </label>
                    <input id="input-subscription-status" type="text" readOnly={true} value={subscription.status} />
                    <label htmlFor="input-subscription-description" className="title">
                        {I18n.t("forms.widgets.subscriptionSummary.description")}
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
    }

    function renderSubscriptionChilds(circuits: SubscriptionWithDetails[], product: Product) {
        if (isEmpty(circuits)) {
            return null;
        }
        return (
            <section className="details">
                <h3>
                    {I18n.t("forms.widgets.subscriptionSummary.subscriptionChildren", {
                        product: product.name
                    })}
                </h3>
                {circuits.map((subscription, index) =>
                    renderSingleSubscription(
                        subscription,
                        index === circuits.length - 1 ? "child last" : "child not-last",
                        index
                    )
                )}
            </section>
        );
    }

    function renderSubscriptionDetail(subscription: SubscriptionWithDetails): JSX.Element {
        return (
            <section className="details">
                <h3>{I18n.t("forms.widgets.subscriptionSummary.subscription")}</h3>
                {renderSingleSubscription(subscription)}
            </section>
        );
    }

    function renderSubscriptionInstanceValue(val: InstanceValueWithLabel, index: number): JSX.Element {
        return (
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
    }

    function renderSubscriptionResourceTypes(subscription: SubscriptionWithDetails): JSX.Element | null {
        const values = subscriptionInstanceValues(subscription);
        if (isEmpty(values)) {
            return null;
        }
        const nbrLeft = Math.ceil(values.length / 2);
        return (
            <section className="details">
                <h3>{I18n.t("forms.widgets.subscriptionSummary.resourceTypes")}</h3>
                <em>{I18n.t("forms.widgets.subscriptionSummary.resourceTypesInfo")}</em>
                <div className="form-container">
                    <section className="part">{values.slice(0, nbrLeft).map(renderSubscriptionInstanceValue)}</section>
                    <section className="part">{values.slice(nbrLeft).map(renderSubscriptionInstanceValue)}</section>
                </div>
            </section>
        );
    }

    function renderProduct(product: Product): JSX.Element | null {
        if (isEmpty(product)) {
            return null;
        }
        return (
            <section className="details">
                <h3>{I18n.t("forms.widgets.subscriptionSummary.productTitle")}</h3>
                <div className="form-container">
                    <section className="part">
                        <label htmlFor="input-product-name" className="title">
                            {I18n.t("forms.widgets.subscriptionSummary.product.name")}
                        </label>
                        <input id="input-product-name" type="text" readOnly={true} value={product.name} />
                        <label htmlFor="input-product-description" className="title">
                            {I18n.t("forms.widgets.subscriptionSummary.product.description")}
                        </label>
                        <input id="input-product-description" type="text" readOnly={true} value={product.description} />
                    </section>
                    <section className="part">
                        <label htmlFor="input-product-type" className="title">
                            {I18n.t("forms.widgets.subscriptionSummary.product.productType")}
                        </label>
                        <input id="input-product-type" type="text" readOnly={true} value={product.product_type} />
                        <label htmlFor="input-product-tag" className="title">
                            {I18n.t("forms.widgets.subscriptionSummary.product.tag")}
                        </label>
                        <input id="input-product-tag" type="text" readOnly={true} value={product.tag} />
                    </section>
                </div>
            </section>
        );
    }

    if (!subscription || !childSubscriptions || !product) {
        return null;
    }

    return (
        <section {...filterDOMProps(props)}>
            {label && (
                <label htmlFor={id}>
                    {label}
                    {description && <em>{description}</em>}
                </label>
            )}

            <div className={`mod-read-only-subscription-view indent`}>
                {renderSubscriptionDetail(subscription)}
                {renderSubscriptionResourceTypes(subscription)}
                {renderProduct(product)}
                {renderSubscriptionChilds(childSubscriptions, product)}
            </div>
        </section>
    );
}

export default connectField(SubscriptionSummary, { kind: "leaf" });
