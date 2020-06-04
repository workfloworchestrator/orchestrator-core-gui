import { allSubscriptions, portSubscriptions, subscriptionsByProductId } from "api";
import { memoize } from "lodash";
import React, { HTMLProps } from "react";
import { ServicePortSubscription } from "utils/types";

let data: Omit<SubscriptionsContextType, "getSubscriptions"> & { getSubscriptions?: typeof getSubscriptionsHandler } = {
    subscriptions: {},
    clearSubscriptions: clearSubscriptions,
    getSubscription: getSubscription,
    getSubscriptions: undefined
};

function getSubscriptionsHandler(filteredProductIds?: string[], tags?: string[]): Promise<ServicePortSubscription[]> {
    function updateSubscriptions(subscriptions: ServicePortSubscription[]) {
        subscriptions.forEach(subscription => (data.subscriptions[subscription.subscription_id] = subscription));

        return subscriptions;
    }

    if (filteredProductIds && filteredProductIds.length === 1) {
        return subscriptionsByProductId(filteredProductIds[0]).then(updateSubscriptions);
    } else if (tags) {
        return portSubscriptions(tags, ["active"]).then(updateSubscriptions);
    } else {
        return allSubscriptions().then(updateSubscriptions);
    }
}

let subscriptions: { [index: string]: ServicePortSubscription } = {};

function getSubscription(subscriptionId: string): ServicePortSubscription {
    return subscriptions[subscriptionId];
}

const getSubscriptions = memoize(
    getSubscriptionsHandler,
    (filteredProductIds?: string[], tags?: string[]) => (filteredProductIds || []).join() + tags?.join()
);

function clearSubscriptions(): void {
    getSubscriptions.cache.clear!();
}

data.getSubscriptions = getSubscriptions;

export interface SubscriptionsContextType {
    subscriptions: { [index: string]: ServicePortSubscription };
    clearSubscriptions: typeof clearSubscriptions;
    getSubscription: typeof getSubscription;
    getSubscriptions: typeof getSubscriptionsHandler;
}

// Context to share loaded subscriptions over multiple instances or components
export const SubscriptionsContext = React.createContext<SubscriptionsContextType>(data as SubscriptionsContextType);

export function SubscriptionsContextProvider({ children }: HTMLProps<HTMLDivElement>) {
    return (
        <SubscriptionsContext.Provider value={data as SubscriptionsContextType}>
            {children}
        </SubscriptionsContext.Provider>
    );
}
