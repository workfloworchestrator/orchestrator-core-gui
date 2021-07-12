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

import "./SubscriptionDetail.scss";

import {
    RenderActions,
    RenderFixedInputs,
    RenderProcesses,
    RenderProduct,
    RenderSubscriptions,
} from "components/subscriptionDetail/Renderers";
import SubscriptionDetails from "components/subscriptionDetail/SubscriptionDetails";
import { SubscriptionDetailSection } from "components/subscriptionDetail/SubscriptionDetailSection";
import SubscriptionInstance from "components/subscriptionDetail/SubscriptionInstance";
import { plugins } from "custom/manifest.json";
import { isArray } from "lodash";
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import ApplicationContext from "utils/ApplicationContext";
import { enrichSubscription } from "utils/Lookups";
import {
    Product,
    Subscription,
    SubscriptionModel,
    SubscriptionProcesses,
    SubscriptionWithDetails,
    WorkflowReasons,
} from "utils/types";
import { importPlugin } from "utils/Utils";

interface IProps {
    subscriptionId: string;
    confirmation?: (question: string, action: (e: React.MouseEvent) => void) => void;
}

function SubscriptionDetail({ subscriptionId, confirmation }: IProps) {
    const [loadedPlugins, setLoadedPlugins] = useState([]);
    const [loadedSubscriptionModel, setLoadedSubscriptionModel] = useState(false);

    const { organisations, products, apiClient } = useContext(ApplicationContext);

    const [subscription, setSubscription] = useState<SubscriptionModel>();
    const [product, setProduct] = useState<Product>();
    const [subscriptionProcesses, setSubscriptionProcesses] = useState<SubscriptionProcesses[]>();
    const [notFound, setNotFound] = useState(false);
    const [workflows, setWorkflows] = useState<WorkflowReasons>();
    const [enrichedParentSubscriptions, setEnrichedParentSubscriptions] = useState<SubscriptionWithDetails[]>();

    useEffect(() => {
        const promises = [
            apiClient.subscriptionsDetailWithModel(subscriptionId).then((subscription) => {
                subscription.product_id = subscription.product.product_id;
                setSubscription(enrichSubscription(subscription, organisations, products));
                apiClient.productById(subscription.product_id).then(setProduct);
            }),
            apiClient.processSubscriptionsBySubscriptionId(subscriptionId).then(setSubscriptionProcesses),
            apiClient.subscriptionWorkflows(subscriptionId).then(setWorkflows),
            apiClient.parentSubscriptions(subscriptionId).then((parentSubscriptions) => {
                // Enrich parent subscriptions
                const enrichedParentSubscriptions = parentSubscriptions.map((sub: Subscription) =>
                    enrichSubscription(sub, organisations, products)
                );
                setEnrichedParentSubscriptions(enrichedParentSubscriptions);
            }),
        ];

        Promise.all(promises)
            .then(() => setLoadedSubscriptionModel(true))
            .catch((err) => {
                if (err.response && err.response.status === 404) {
                    setNotFound(true);
                } else {
                    throw err;
                }
            });
    }, [subscriptionId, organisations, products, apiClient]);

    useEffect(() => {
        if (loadedSubscriptionModel) {
            async function loadViews() {
                console.log("Fetch of subscripton model complete: loading plugins");
                const componentPromises = plugins["subscriptionDetailPlugins"].map(async (plugin) => {
                    const View = await importPlugin(plugin);
                    // Todo fix dienstafname: only "subscription" data will be available in the plugin
                    return <View subscription={subscription} />;
                });
                // @ts-ignore
                Promise.all(componentPromises).then(setLoadedPlugins);
            }
            loadViews();
        }
    }, [loadedSubscriptionModel, subscription]);

    if (notFound) {
        return (
            <h2>
                <FormattedMessage id="subscription.notFound" />
            </h2>
        );
    } else if (!subscription || !workflows || !subscriptionProcesses || !enrichedParentSubscriptions) {
        return null;
    }

    const subscription_instances = Object.entries(subscription)
        .filter(
            (entry) =>
                typeof entry[1] === "object" &&
                !["product", "customer_descriptions"].includes(entry[0]) &&
                entry[1] !== null
        )
        .flatMap((entry) => (isArray(entry[1]) ? entry[1].map((value: any) => [entry[0], value]) : [entry]));

    return (
        <div className="mod-subscription-detail">
            <SubscriptionDetailSection
                name={<FormattedMessage id="subscription.subscription_title" />}
                className="subscription-details"
            >
                <SubscriptionDetails
                    subscription={subscription}
                    subscriptionProcesses={subscriptionProcesses}
                ></SubscriptionDetails>
            </SubscriptionDetailSection>

            <React.Suspense fallback="Loading plugins...">{loadedPlugins}</React.Suspense>

            <RenderFixedInputs product={product} />

            {subscription_instances && (
                <SubscriptionDetailSection
                    name={<FormattedMessage id="subscriptions.productBlocks" />}
                    className="subscription-product-blocks"
                >
                    {subscription_instances.map((entry, index) => (
                        <SubscriptionInstance
                            //@ts-ignore
                            key={index}
                            subscription_instance={entry[1]}
                            field_name={entry[0]}
                        />
                    ))}
                </SubscriptionDetailSection>
            )}

            <RenderActions subscription={subscription} workflows={workflows} confirmation={confirmation} />
            <RenderProduct product={product} />
            <RenderProcesses subscriptionProcesses={subscriptionProcesses} />
            <RenderSubscriptions parentSubscriptions={enrichedParentSubscriptions} />
        </div>
    );
}

export default SubscriptionDetail;
