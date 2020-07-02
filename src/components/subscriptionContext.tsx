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
import { allSubscriptions, portSubscriptions, subscriptionsByProductId } from "api";
import { memoize } from "lodash";
import React, { HTMLProps } from "react";
import { ServicePortSubscription } from "utils/types";

let subscriptions: { [index: string]: ServicePortSubscription } = {};

let data: Omit<SubscriptionsContextType, "getSubscriptions"> & { getSubscriptions?: typeof getSubscriptionsHandler } = {
    subscriptions: subscriptions,
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
