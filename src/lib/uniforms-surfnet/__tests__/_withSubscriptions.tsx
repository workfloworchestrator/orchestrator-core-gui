import { SubscriptionsContext } from "components/subscriptionContext";
import React from "react";
import { ServicePortSubscription } from "utils/types";

test("Test suite must contain at least one test", () => {});

export default function withSubscriptions(component: JSX.Element) {
    const getSubscription = jest.fn<Partial<ServicePortSubscription>, [string]>();
    const getSubscriptions = jest.fn<
        Partial<ServicePortSubscription>[],
        [string[] | undefined, string[] | undefined]
    >();
    const clearSubscriptions = jest.fn();
    const subscriptions: { [index: string]: Partial<ServicePortSubscription> } = {};

    return {
        element: (
            <SubscriptionsContext.Provider
                value={
                    {
                        getSubscription,
                        getSubscriptions: (filteredProductIds?: string[], tags?: string[]) =>
                            Promise.resolve(getSubscriptions(filteredProductIds, tags)),
                        clearSubscriptions,
                        subscriptions
                    } as any
                }
            >
                {component}
            </SubscriptionsContext.Provider>
        ),
        subscriptions,
        getSubscription,
        getSubscriptions,
        clearSubscriptions
    };
}
