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

import I18n from "i18n-js";
import get from "lodash/get";
import { createElement, useContext, useEffect, useState } from "react";
import { connectField, filterDOMProps } from "uniforms";
import { productById } from "utils/Lookups";
import { filterProductsByBandwidth } from "validations/Products";

import { allSubscriptions, portSubscriptions, subscriptionsByProductId } from "../../../../api";
import ApplicationContext from "../../../../utils/ApplicationContext";
import { Organization, Product, ServicePortSubscription, Subscription as iSubscription } from "../../../../utils/types";
import SelectField, { SelectFieldProps } from "../SelectField";

function makeLabel(subscription: iSubscription, products: Product[], organisations?: Organization[]) {
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
        let portMode;
        let portSubscription = subscription as ServicePortSubscription;
        if (["MSC", "MSCNL"].includes(product.tag)) {
            portMode = "TAGGED";
        } else {
            portMode = portSubscription.port_mode
                ? portSubscription.port_mode.toUpperCase()
                : I18n.t("forms.widgets.subscription.missingPortMode");
        }
        return `${subscription_substring} ${portMode} ${description.trim()} ${organisationName}`;
    } else {
        return description.trim();
    }
}

function getPortMode(subscription: ServicePortSubscription, products: Product[]) {
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
    "tags"
);

export type SubscriptionFieldProps = {
    inputComponent: typeof SelectField;
    productIds?: string[];
    excludedSubscriptionIds?: string[];
    organisationId?: string;
    organisationKey?: string;
    visiblePortMode?: string;
    bandwidth?: number;
    bandwidthKey?: string;
    tags?: string[];
} & Omit<SelectFieldProps, "placeholder" | "transform" | "allowedValues">;

function Subscription({
    inputComponent,
    name,
    productIds,
    excludedSubscriptionIds,
    organisationId,
    organisationKey,
    visiblePortMode,
    bandwidth,
    bandwidthKey,
    tags,
    ...props
}: SubscriptionFieldProps) {
    let [subscriptions, updateSubscriptions] = useState<iSubscription[]>([]);
    const { organisations, products: allProducts } = useContext(ApplicationContext);

    const filteredProducts: Product[] = filterProductsByBandwidth(allProducts, bandwidth).filter(
        (item: Product) => productIds === undefined || productIds.includes(item.product_id)
    );

    useEffect(() => {
        if (filteredProducts && filteredProducts.length === 1) {
            subscriptionsByProductId(filteredProducts[0].product_id).then(result => updateSubscriptions(result));
        } else if (tags) {
            portSubscriptions(tags, ["active"]).then(result => updateSubscriptions(result));
        } else {
            allSubscriptions().then(result => updateSubscriptions(result));
        }
    }, [allProducts, productIds, bandwidth, tags]); // eslint-disable-line react-hooks/exhaustive-deps

    // Filter by product
    const filteredProductIds = filteredProducts.map(product => product.product_id);
    subscriptions =
        filteredProductIds.length === allProducts.length || filteredProductIds.length === 1
            ? subscriptions
            : subscriptions.filter(sp => filteredProductIds.includes(sp.product.product_id));

    if (excludedSubscriptionIds) {
        subscriptions = subscriptions.filter(item => !excludedSubscriptionIds.includes(item.subscription_id));
    }

    // Port mode filter
    if (visiblePortMode) {
        if (visiblePortMode === "normal") {
            subscriptions = subscriptions.filter(
                item => getPortMode(item, allProducts) === "tagged" || getPortMode(item, allProducts) === "untagged"
            );
        } else {
            subscriptions = subscriptions.filter(item => getPortMode(item, allProducts) === visiblePortMode);
        }
    }

    // Customer filter toggle
    if (organisationId) {
        subscriptions = subscriptions.filter(item => item.customer_id === organisationId);
    }

    const subscriptionLabelLookup =
        subscriptions?.reduce<{ [index: string]: string }>(function(mapping, subscription) {
            mapping[subscription.subscription_id] = makeLabel(subscription, allProducts, organisations);
            return mapping;
        }, {}) ?? {};

    return createElement<any>(inputComponent, {
        name: "",
        ...props,
        allowedValues: Object.keys(subscriptionLabelLookup),
        transform: (uuid: string) => get(subscriptionLabelLookup, uuid, uuid),
        placeholder: I18n.t("forms.widgets.subscription.placeholder")
    });
}

Subscription.defaultProps = {
    inputComponent: SelectField
};

export default connectField(Subscription);
