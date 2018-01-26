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
    //Child subscriptions like 'MSP' / 'SSP' can only be terminated if not used in non-terminated parent subscriptions
    return isEmpty(relatedSubscriptions) || relatedSubscriptions.every(sub => sub.status === "terminated");

}

export const validEmailRegExp = /^\S+@\S+$/;

export const port_subscription_id = "port_subscription_id";
export const ims_circuit_id = "ims_circuit_id";
export const ims_port_id = "ims_port_id";
export const nms_service_id = "nms_service_id";
export const parent_subscriptions = "parent_subscriptions";
export const absent = "absent";
