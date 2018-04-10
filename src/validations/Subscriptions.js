import {isEmpty} from "../utils/Utils";

export function subscriptionInstanceValues(subscription) {
    return subscription.instances.reduce((acc, instance) =>
        acc.concat(instance.values.map(item => ({...item, instance_label: instance.label}))), []);
}

export function hasResourceType(subscription, resourceType) {
    const values = subscriptionInstanceValues(subscription);
    return values.some(val => val.resource_type.resource_type === resourceType);
}

export function isTerminatable(subscription, relatedSubscriptions) {
    //Parent subscriptions like 'Lichtpaden' can always be terminated
    if (hasResourceType(subscription, "nms_service_id")) {
        return true;
    }
    if (hasResourceType(subscription, "port_subscription_id")) {
        return true;
    }
    //Child subscriptions like 'MSP' / 'SSP' can only be terminated if not used in non-terminated parent subscriptions
    return isEmpty(relatedSubscriptions) || relatedSubscriptions.every(sub => sub.status === "terminated");

}

export function isModifiable(subscription, relatedSubscriptions) {
    return !isEmpty(relatedSubscriptions)
}

const searchableSubscriptionsColumnsMapping = {
    "customer": "customer_name",
    "id": "subscription_id",
    "description": "description",
    "product": "product_name",
    "status": "status",
    "type": "product_tag"
};

export function searchConstruct(query) {
    const queryToLower = query.toLowerCase();
    let colonIndex = queryToLower.indexOf(":");
    if (colonIndex > -1) {
        const searchOptions = {};
        const parts = query.split(/(:|'|"| )/)
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
                searchOptions[key] = searchOptions[key] + (part === " " ? part : part.trim().toLowerCase());
            }
            else if (part === " " && !inSeparator) {
                let subParts = parts.slice(i);
                const remainder = subParts.join("");
                if (remainder.indexOf(":") < 0) {
                    searchOptions["global_search"] = remainder.toLowerCase().trim();
                    break;
                }
            } else if (parts.length === i) {
                searchOptions["global_search"] = parts.toLowerCase().trim();
            }
            else if (customSearchableColumns.includes(part.trim()) && !inSeparator) {
                lastSearchItem = part;
                let key = searchableSubscriptionsColumnsMapping[part];
                searchOptions[key] = "";
                inSearchTerm = true;
                //not really but we need to reset it
                afterColon = false;
            } else if (inSearchTerm && afterColon) {
                let key = searchableSubscriptionsColumnsMapping[lastSearchItem];
                searchOptions[key] = searchOptions[key] + (part === " " ? part : part.trim().toLowerCase());
            }
        }
        Object.keys(searchOptions).forEach(key => {
            searchOptions[key] = searchOptions[key].trim();
            if (searchOptions[key] === "") {
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
