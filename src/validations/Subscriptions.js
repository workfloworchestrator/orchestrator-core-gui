import {isEmpty} from "../utils/Utils";
import I18n from "i18n-js";

export function subscriptionInstanceValues(subscription) {
    return subscription.instances.reduce((acc, instance) =>
        acc.concat(instance.values.map(item => ({...item, instance_label: instance.label}))), []);
}

export function maybeModifiedMessage(subscription, relation_info) {
    let message = "";
    if (!subscription.insync) {
        return I18n.t("subscription.not_in_sync");
    }
    else if (!relation_info.insync) {
        if (!isEmpty(relation_info.locked_childs)) {
            message = message + " " + I18n.t("subscription.locked_child_subscriptions") + " ";
            relation_info.locked_childs.forEach((relation, index, array) => {
                message = message + relation.description + ((index !== array.length - 1) ? ", " : ".");
            });
        }
        if (!isEmpty(relation_info.locked_parents)) {
            message = message + " " + I18n.t("subscription.locked_parent_subscriptions") + " ";
            relation_info.locked_parents.forEach((relation, index, array) => {
                message = message + relation.description + ((index !== array.length - 1) ? ", " : ".");
            });
        }
        return I18n.t("subscription.relations_not_in_sync") + message;
    }
    return null;
}

export function maybeTerminatedMessage(subscription, relation_info) {
    let message = "";
    if (!subscription.insync) {
        return I18n.t("subscription.not_in_sync");
    }
    else if (!relation_info.insync) {
        if (!isEmpty(relation_info.unterminated_parents)) {
            message = message + " " + I18n.t("subscription.no_termination_parent_subscription") + " ";
            relation_info.unterminated_parents.forEach((relation, index, array) => {
                message = message + relation.description + ((index !== array.length - 1) ? ", " : ".");
            });
        }
        if (!isEmpty(relation_info.locked_childs)) {
            message = message + " " + I18n.t("subscription.locked_child_subscriptions") + " ";
            relation_info.locked_childs.forEach((relation, index, array) => {
                message = message + relation.description + ((index !== array.length - 1) ? ", " : ".");
            });
        }
        if (!isEmpty(relation_info.locked_parents)) {
            message = message + " " + I18n.t("subscription.locked_parent_subscriptions") + " ";
            relation_info.locked_parents.forEach((relation, index, array) => {
                message = message + relation.description + ((index !== array.length - 1) ? ", " : ".");
            });
        }
        return I18n.t("subscription.relations_not_in_sync") + message;
    }
    return null;
}

const searchableSubscriptionsColumnsMapping = {
    "customer": "customer_name",
    "id": "subscription_id",
    "description": "description",
    "product": "product_name",
    "status": "status",
    "type": "product_tag"
};

export function validateIPRange(value) {
	var isValid = false;
	if (value.indexOf(":")>0){
		//assume IPv6 expression
		isValid = validIPv6RangeRegExp.test(value.trim());
	} else {
		//IPv4
		isValid = validIPv4RangeRegExp.test(value.trim());
	}
	return isValid;
}	

export function searchConstruct(query) {
    const queryToLower = query.toLowerCase();
    let colonIndex = queryToLower.indexOf(":");
    //See the tests in src/__tests__/validations/Subscriptions.test.js for 'explanation'
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
                        value[value.length - 1] = value[value.length - 1] + (part === " " ? part : part.trim().toLowerCase());
                    } else {
                        value.push(part === " " ? part : part.trim().toLowerCase());
                    }

                } else {
                    searchOptions[key] = value + (part === " " ? part : part.trim().toLowerCase());
                }
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
                let key = searchableSubscriptionsColumnsMapping[part];
                if (lastSearchItem === part) {
                    const previous = searchOptions[key];
                    if (Array.isArray(previous)) {
                        previous.push("");
                    } else {
                        searchOptions[key] = [previous, ""]
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
                        value[value.length - 1] = value[value.length - 1] + (part === " " ? part : part.trim().toLowerCase());
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

export const validIPv4RangeRegExp = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$/;

export const validIPv6RangeRegExp = /^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*(\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$/;

export const port_subscription_id = "port_subscription_id";
export const ims_circuit_id = "ims_circuit_id";
export const ims_port_id = "ims_port_id";
export const nms_service_id = "nms_service_id";
export const parent_subscriptions = "parent_subscriptions";
export const child_subscriptions = "child_subscriptions";
export const absent = "absent";

export const customSearchableColumns = Object.keys(searchableSubscriptionsColumnsMapping);
export const searchableColumns = Object.values(searchableSubscriptionsColumnsMapping);
