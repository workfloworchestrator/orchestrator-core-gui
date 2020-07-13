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

import "./SubscriptionField.scss";

import { SubscriptionsContext } from "components/subscriptionContext";
import I18n from "i18n-js";
import get from "lodash/get";
import React, { useContext, useEffect, useMemo, useState } from "react";
import ReactSelect, { ValueType } from "react-select";
import { connectField, filterDOMProps, useForm } from "uniforms";
import ApplicationContext from "utils/ApplicationContext";
import { productById } from "utils/Lookups";
import { filterProductsByBandwidth } from "validations/Products";

import {
    Option,
    Organization,
    Product,
    ServicePortSubscription,
    Subscription as iSubscription
} from "../../../utils/types";
import { FieldProps } from "./types";

export function makeLabel(subscription: iSubscription, products: Product[], organisations?: Organization[]) {
    const organisation = organisations && organisations.find(org => org.uuid === subscription.customer_id);
    const organisationName = organisation ? organisation.name : subscription.customer_id.substring(0, 8);
    const product = subscription.product || productById(subscription.product_id!, products);
    const description = subscription.description || I18n.t("forms.widgets.subscription.missingDescription");
    const subscription_substring = subscription.subscription_id.substring(0, 8);

    if (["Node"].includes(product.tag)) {
        const description = subscription.description || I18n.t("forms.widgets.subscription.missingDescription");
        return `${subscription.subscription_id.substring(0, 8)} ${description.trim()}`;
    } else if (["MSP", "MSPNL", "SSP"].includes(product.tag)) {
        const crm_port_id =
            (subscription as ServicePortSubscription).crm_port_id ||
            I18n.t("forms.widgets.subscription.missingCrmPortId");
        return `${crm_port_id} - ${subscription_substring} ${description.trim()} ${organisationName}`;
    } else if (["SP", "SPNL", "AGGSP", "AGGSPNL", "MSC", "MSCNL"].includes(product.tag)) {
        let portSubscription = subscription as ServicePortSubscription;
        const portMode = getPortMode(portSubscription, products);
        return `${subscription_substring} ${portMode.toUpperCase()} ${description.trim()} ${organisationName}`;
    } else {
        return description.trim();
    }
}

export function getPortMode(subscription: ServicePortSubscription, products: Product[]) {
    const product = subscription.product || productById(subscription.product_id!, products);

    return subscription?.port_mode || (["MSP", "MSPNL", "MSC", "MSCNL"].includes(product.tag!) ? "tagged" : "untagged");
}

filterDOMProps.register(
    "productIds",
    "excludedSubscriptionIds",
    "organisationId",
    "organisationKey",
    "visiblePortMode",
    "bandwidth",
    "bandwidthKey",
    "tags",
    "statuses"
);

export type SubscriptionFieldProps = FieldProps<
    string,
    {
        productIds?: string[];
        excludedSubscriptionIds?: string[];
        organisationId?: string;
        organisationKey?: string;
        visiblePortMode?: string;
        bandwidth?: number;
        bandwidthKey?: string;
        tags?: string[]; // There is an assumption that using tags means you want port subscriptions
        statuses?: string[];
    }
>;

function Subscription({
    disabled,
    id,
    inputRef,
    label,
    description,
    name,
    onChange,
    placeholder,
    required,
    type,
    value,
    error,
    showInlineError,
    errorMessage,
    className = "",
    productIds,
    excludedSubscriptionIds,
    organisationId,
    organisationKey,
    visiblePortMode = "all",
    bandwidth,
    bandwidthKey,
    tags,
    statuses,
    ...props
}: SubscriptionFieldProps) {
    const { model } = useForm();

    let [subscriptions, updateSubscriptions] = useState<iSubscription[]>([]);
    let [loading, setLoading] = useState<boolean>(false);
    const { organisations, products: allProducts } = useContext(ApplicationContext);
    const { getSubscriptions, clearSubscriptions } = useContext(SubscriptionsContext);

    const usedBandwith = bandwidth || get(model, bandwidthKey!);
    const usedOrganisationId = organisationId || get(model, organisationKey!);

    const filteredProductIds = useMemo(() => {
        let products = allProducts;
        if (tags?.length) {
            products = allProducts.filter(product => tags?.includes(product.tag));
        }

        if (productIds?.length) {
            products = allProducts.filter(product => productIds?.includes(product.product_id));
        }

        if (usedBandwith) {
            products = filterProductsByBandwidth(products, usedBandwith);
        }

        return products.length !== allProducts.length ? products.map(product => product.product_id) : [];
    }, [allProducts, usedBandwith, productIds, tags]);

    useEffect(() => {
        getSubscriptions(tags, statuses).then(result => updateSubscriptions(result));
    }, [getSubscriptions, tags, statuses]);

    // Filter by product, needed because getSubscriptions might return more than we want
    subscriptions =
        filteredProductIds.length === allProducts.length
            ? subscriptions
            : subscriptions.filter(sp => filteredProductIds.includes(sp.product.product_id));

    if (excludedSubscriptionIds) {
        subscriptions = subscriptions.filter(item => !excludedSubscriptionIds.includes(item.subscription_id));
    }

    // Port mode filter
    if (visiblePortMode !== "all") {
        if (visiblePortMode === "normal") {
            subscriptions = subscriptions.filter(
                item => getPortMode(item, allProducts) === "tagged" || getPortMode(item, allProducts) === "untagged"
            );
        } else {
            subscriptions = subscriptions.filter(item => getPortMode(item, allProducts) === visiblePortMode);
        }
    }

    // Customer filter toggle
    if (usedOrganisationId) {
        subscriptions = subscriptions.filter(item => item.customer_id === usedOrganisationId);
    }

    const options = subscriptions.map((subscription: iSubscription) => ({
        label: makeLabel(subscription, allProducts, organisations),
        value: subscription.subscription_id
    }));

    const selectedValue = options.find((option: Option) => option.value === value);

    return (
        <section {...filterDOMProps(props)} className={`${className} subscription-field`}>
            {label && (
                <label htmlFor={id}>
                    {label}
                    <em>{description}</em>
                </label>
            )}
            <div>
                {!disabled && (
                    <div className="refresh-subscriptions">
                        <i
                            className={`fa fa-sync ${loading ? "loading" : ""}`}
                            onClick={() => {
                                setLoading(true);
                                clearSubscriptions();
                                getSubscriptions(tags, statuses).then(result => {
                                    updateSubscriptions(result);
                                    setLoading(false);
                                });
                            }}
                        />
                    </div>
                )}
                <ReactSelect
                    id={id}
                    name={name}
                    onChange={(option: ValueType<Option>) => {
                        onChange((option as Option | null)?.value);
                    }}
                    options={options}
                    value={selectedValue}
                    isSearchable={true}
                    isClearable={false}
                    placeholder={I18n.t("forms.widgets.subscription.placeholder")}
                    isDisabled={disabled}
                    required={required}
                    inputRef={inputRef}
                    className="subscription-field-select"
                />
            </div>

            {error && showInlineError && (
                <em className="error">
                    <div className="backend-validation">{errorMessage}</div>
                </em>
            )}
        </section>
    );
}

export default connectField(Subscription, { kind: "leaf" });
