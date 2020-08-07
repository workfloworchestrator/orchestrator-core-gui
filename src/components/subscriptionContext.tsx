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
import { portSubscriptions, subscriptions } from "api";
import { memoize, merge } from "lodash";
import React, { HTMLProps } from "react";
import { ServicePortSubscription } from "utils/types";

let subscriptionsCache: { [index: string]: ServicePortSubscription } = {};

let data: Omit<SubscriptionsContextType, "getSubscriptions"> & { getSubscriptions?: typeof getSubscriptionsHandler } = {
    subscriptions: subscriptionsCache,
    clearSubscriptions: clearSubscriptions,
    getSubscription: getSubscription,
    getSubscriptions: undefined
};

function getSubscriptionsHandler(tags?: string[], statuses: string[] = ["active"]): Promise<ServicePortSubscription[]> {
    function updateSubscriptions(subscriptions: ServicePortSubscription[]) {
        subscriptions.forEach(subscription => {
            // We merge instead of overwriting to preserve values like port_mode that might not be set in one call but are in
            // a previous call
            data.subscriptions[subscription.subscription_id] = merge(
                data.subscriptions[subscription.subscription_id] ?? {},
                subscription
            );
        });

        return subscriptions;
    }

    if (
        tags?.filter(tag => ["SSP", "MSP", "MSPNL", "MSC", "MSCNL", "AGGSP", "AGGSPNL", "SP", "SPNL"].includes(tag))
            .length
    ) {
        return portSubscriptions(tags, statuses).then(updateSubscriptions);
    } else {
        return subscriptions(tags, statuses).then(updateSubscriptions);
    }
}

function getSubscription(subscriptionId: string): ServicePortSubscription {
    return subscriptionsCache[subscriptionId];
}

const getSubscriptions = memoize(
    getSubscriptionsHandler,
    (tags?: string[], statuses?: string[]) => (tags || []).join() + statuses?.join()
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
