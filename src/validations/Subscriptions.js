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

import { isEmpty } from "../utils/Utils";

export function subscriptionInstanceValues(subscription) {
    return subscription.instances.reduce(
        (acc, instance) =>
            acc.concat(
                instance.values.map(item => ({
                    ...item,
                    instance_label: instance.label
                }))
            ),
        []
    );
}

const searchableSubscriptionsColumnsMapping = {
    customer: "customer_name",
    id: "subscription_id",
    description: "description",
    product: "product_name",
    status: "status",
    type: "product_tag"
};

export function searchConstruct(query) {
    const queryToLower = query.toLowerCase();
    let colonIndex = queryToLower.indexOf(":");
    //See the tests in src/__tests__/validations/OldSubscriptions.test.js for 'explanation'
    if (colonIndex > -1) {
        const searchOptions = {};
        const parts = query.split(/(:|'|"| )/);
        let lastSearchItem = "";
        let inSeparator = false;
        let afterColon = false;
        let inSearchTerm = false;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (part === "'" || part === '"') {
                inSeparator = !inSeparator;
                continue;
            }
            if (part === ":") {
                afterColon = !afterColon;
                continue;
            }
            if (part === " " && inSeparator) {
                let key = searchableSubscriptionsColumnsMapping[lastSearchItem];
                const value = searchOptions[key];
                if (Array.isArray(value)) {
                    const lastValue = value[value.length - 1];
                    if (isEmpty(lastValue) || inSeparator) {
                        value[value.length - 1] =
                            value[value.length - 1] + (part === " " ? part : part.trim().toLowerCase());
                    } else {
                        value.push(part === " " ? part : part.trim().toLowerCase());
                    }
                } else {
                    searchOptions[key] = value + (part === " " ? part : part.trim().toLowerCase());
                }
            } else if (part === " " && !inSeparator) {
                let subParts = parts.slice(i);
                const remainder = subParts.join("");
                if (remainder.indexOf(":") < 0) {
                    searchOptions["global_search"] = remainder.toLowerCase().trim();
                    break;
                }
            } else if (parts.length === i) {
                searchOptions["global_search"] = parts.toLowerCase().trim();
            } else if (customSearchableColumns.includes(part.trim()) && !inSeparator) {
                let key = searchableSubscriptionsColumnsMapping[part];
                if (lastSearchItem === part) {
                    const previous = searchOptions[key];
                    if (Array.isArray(previous)) {
                        previous.push("");
                    } else {
                        searchOptions[key] = [previous, ""];
                    }
                } else {
                    searchOptions[key] = "";
                }
                lastSearchItem = part;
                inSearchTerm = true;
                //not really but we need to reset it
                afterColon = false;
            } else if (inSearchTerm && afterColon) {
                let key = searchableSubscriptionsColumnsMapping[lastSearchItem];
                const value = searchOptions[key];
                if (Array.isArray(value)) {
                    const lastValue = value[value.length - 1];
                    if (isEmpty(lastValue) || inSeparator) {
                        value[value.length - 1] =
                            value[value.length - 1] + (part === " " ? part : part.trim().toLowerCase());
                    } else {
                        value.push(part === " " ? part : part.trim().toLowerCase());
                    }
                } else {
                    searchOptions[key] = value + (part === " " ? part : part.trim().toLowerCase());
                }
            }
        }
        Object.keys(searchOptions).forEach(key => {
            const value = searchOptions[key];
            if (Array.isArray(value)) {
                searchOptions[key] = value.map(val => val.trim()).filter(val => !isEmpty(val));
            } else {
                searchOptions[key] = searchOptions[key].trim();
            }
            if (isEmpty(value)) {
                delete searchOptions[key];
            }
        });
        return searchOptions;
    }
}

export const validEmailRegExp = /^\S+@\S+$/;

export const port_subscription_id = "port_subscription_id";
export const ims_circuit_id = "ims_circuit_id";
export const ims_port_id = "ims_port_id";
export const nms_service_id = "nms_service_id";
export const parent_subscriptions = "parent_subscriptions";
export const child_subscriptions = "child_subscriptions";
export const absent = "absent";

export const customSearchableColumns = Object.keys(searchableSubscriptionsColumnsMapping);
export const searchableColumns = Object.values(searchableSubscriptionsColumnsMapping);
