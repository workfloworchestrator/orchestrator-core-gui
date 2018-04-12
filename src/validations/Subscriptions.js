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

export const validEmailRegExp = /^\S+@\S+$/;

export const validIPv4RangeRegExp = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$/;

export const validIPv6RangeRegExp = /^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*(\/(d|dd|1[0-1]d|12[0-8]))$/;

export const port_subscription_id = "port_subscription_id";
export const ims_circuit_id = "ims_circuit_id";
export const ims_port_id = "ims_port_id";
export const nms_service_id = "nms_service_id";
export const parent_subscriptions = "parent_subscriptions";
export const absent = "absent";
