import {isEmpty} from "../utils/Utils";

export function subscriptionResourceTypes(subscription) {
    return subscription.instances.reduce((acc, instance) => acc.concat(instance.resource_types), []);
}

export function hasResourceType(subscription, resourceType) {
    const resourceTypes = subscriptionResourceTypes(subscription);
    return resourceTypes.some(rt => rt.resource_type === resourceType);
}

export function isTerminatable(subscription, relatedSubscriptions) {
    //Parent subscriptions like 'Lichtpaden' can always be terminated
    if (hasResourceType(subscription, "nms_service_id")) {
        return true;
    }
    //Child subscriptions like 'MSP' / 'SSP' can only be terminated if not used in parent subscriptions
    return isEmpty(relatedSubscriptions);

}
