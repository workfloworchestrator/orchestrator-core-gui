/*
 * Copyright 2019-2022 SURF.
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

import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiTitle } from "@elastic/eui";
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
import { TabbedSection } from "components/subscriptionDetail/TabbedSection";
import { RenderServiceConfiguration } from "components/subscriptionDetail/templates/ServiceConfiguration";
import manifest from "custom/manifest.json";
import { isArray } from "lodash";
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useQuery } from "react-query";
import { useStorageState } from "react-storage-hooks";
import ApplicationContext from "utils/ApplicationContext";
import { enrichSubscription } from "utils/Lookups";
import {
    Product,
    SUBSCRIPTION_VIEWTYPE_SELECTOR,
    StoredViewPreferences,
    Subscription,
    SubscriptionModel,
    SubscriptionProcesses,
    SubscriptionWithDetails,
    TabView,
    WorkflowReasons,
} from "utils/types";
import { findObjects, importPlugin } from "utils/Utils";

import { subscriptionDetailStyling } from "./SubsciptionDetailStyling";

interface IProps {
    subscriptionId: string;
}

function SubscriptionDetail({ subscriptionId }: IProps) {
    const [loadedPlugins, setLoadedPlugins] = useState([]);
    const [loadedSubscriptionModel, setLoadedSubscriptionModel] = useState(false);

    const { organisations, products, apiClient } = useContext(ApplicationContext);

    const [subscription, setSubscription] = useState<SubscriptionModel>();
    const [product, setProduct] = useState<Product>();
    const [subscriptionProcesses, setSubscriptionProcesses] = useState<SubscriptionProcesses[]>();
    const [notFound, setNotFound] = useState(false);
    const [workflows, setWorkflows] = useState<WorkflowReasons>();
    const [inUseBySubscriptions, setInUseBySubscriptions] = useState({});
    const [enrichedInUseBySubscriptions, setEnrichedInUseBySubscriptions] = useState<SubscriptionWithDetails[]>();
    const [viewTypes, setViewTypes] = useStorageState<StoredViewPreferences[]>(
        localStorage,
        SUBSCRIPTION_VIEWTYPE_SELECTOR,
        []
    );

    const tabViewSettingsForId = (id: string) => {
        const defaultViewSetting = { tabViewId: id, viewType: "tabs" } as StoredViewPreferences;
        return viewTypes.find((s) => s.tabViewId === id) || defaultViewSetting;
    };

    useQuery<SubscriptionModel, Error>(
        ["subscription", { id: subscriptionId }],
        () => apiClient.subscriptionsDetailWithModel(subscriptionId),
        {
            onSuccess: (subscription) => {
                setSubscription(enrichSubscription(subscription, organisations, products));
                setProduct(subscription.product);
            },
        }
    );

    useEffect(() => {
        const promises = [
            apiClient.processSubscriptionsBySubscriptionId(subscriptionId).then(setSubscriptionProcesses),
            apiClient.subscriptionWorkflows(subscriptionId).then(setWorkflows),
            apiClient.inUseBySubscriptions(subscriptionId).then((inUseBySubscriptions) => {
                // Enrich in use by subscriptions
                const enrichedInUseBySubscriptions = inUseBySubscriptions.map((sub: Subscription) =>
                    enrichSubscription(sub, organisations, products)
                );
                setEnrichedInUseBySubscriptions(enrichedInUseBySubscriptions);
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
        if (loadedSubscriptionModel && subscription) {
            async function loadViews() {
                if (manifest.plugins.hasOwnProperty("subscriptionDetailPlugins")) {
                    // @ts-ignore
                    const componentPromises = manifest.plugins["subscriptionDetailPlugins"].map(async (plugin) => {
                        const View = await importPlugin(plugin);
                        return (
                            <View
                                key={`subscription-detail-plugin-${plugin.toLowerCase()}`}
                                subscription={subscription}
                            />
                        );
                    });
                    // @ts-ignore
                    Promise.all(componentPromises).then(setLoadedPlugins);
                }
            }
            loadViews().then();
        }
    }, [loadedSubscriptionModel, subscription]);

    useEffect(() => {
        if (loadedSubscriptionModel && subscription) {
            const inUseByIds = findObjects(subscription, "in_use_by_ids");
            const inUseByIdsUnique = [...new Set(inUseByIds)];
            apiClient.subscriptionsByInUsedByIds(inUseByIdsUnique).then((i) => setInUseBySubscriptions(i));
        }
    }, [loadedSubscriptionModel, subscription, apiClient]);

    if (notFound) {
        return (
            <h2>
                <FormattedMessage id="subscription.notFound" />
            </h2>
        );
    } else if (!subscription || !workflows || !subscriptionProcesses || !enrichedInUseBySubscriptions) {
        return null;
    }

    const subscriptionDetailHeader = (id: string, title?: string) => (
        <EuiFlexGroup>
            <EuiFlexItem grow={true}>
                <EuiTitle size="m">
                    <h1>{title ? title : subscription.product?.name}</h1>
                </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
                <EuiButton
                    id="subscription-detail-viewtype-tree"
                    fill={tabViewSettingsForId(id).viewType === "tree"}
                    iconType="list"
                    size="s"
                    isSelected={tabViewSettingsForId(id).viewType === "tree"}
                    onClick={() => {
                        const existing = viewTypes.find((s) => s.tabViewId === id);
                        let newViewTypes = viewTypes;
                        if (existing) {
                            newViewTypes = viewTypes.map((s) => (s.tabViewId === id ? { ...s, viewType: "tree" } : s));
                        } else {
                            newViewTypes = [...viewTypes, { tabViewId: id, viewType: "tree" }];
                        }
                        setViewTypes(newViewTypes);
                    }}
                >
                    tree
                </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
                <EuiButton
                    id="subscription-detail-viewtype-tree"
                    fill={tabViewSettingsForId(id).viewType === "tabs"}
                    iconType="tableDensityNormal"
                    size="s"
                    isSelected={tabViewSettingsForId(id).viewType === "tabs"}
                    onClick={() => {
                        const existing = viewTypes.find((s) => s.tabViewId === id);
                        let newViewTypes = viewTypes;
                        if (existing) {
                            newViewTypes = viewTypes.map((s) => (s.tabViewId === id ? { ...s, viewType: "tabs" } : s));
                        } else {
                            newViewTypes = [...viewTypes, { tabViewId: id, viewType: "tabs" }];
                        }
                        setViewTypes(newViewTypes);
                    }}
                >
                    tabs
                </EuiButton>
            </EuiFlexItem>
        </EuiFlexGroup>
    );

    const subscription_instances = Object.entries(subscription)
        .filter(
            (entry) =>
                typeof entry[1] === "object" &&
                !["product", "customer_descriptions"].includes(entry[0]) &&
                entry[1] !== null
        )
        .flatMap((entry) => (isArray(entry[1]) ? entry[1].map((value: any) => [entry[0], value]) : [entry]));

    const renderedSubscriptionDetails = (
        <div className="mod-subscription-detail">
            <div className="subscription-details">
                <SubscriptionDetails subscription={subscription} subscriptionProcesses={subscriptionProcesses} />
                {manifest.plugins.hasOwnProperty("subscriptionDetailPlugins") && (
                    <React.Suspense fallback="Loading plugins...">{loadedPlugins}</React.Suspense>
                )}
            </div>
        </div>
    );
    const renderedActions = (
        <div className="mod-subscription-detail">
            <RenderActions subscription={subscription} workflows={workflows} />
        </div>
    );

    const renderedProductDetails = (
        <div className="mod-subscription-detail">
            <RenderProduct product={product} />
        </div>
    );

    const renderedProcesses = (
        <div className="mod-subscription-detail">
            <RenderProcesses subscriptionProcesses={subscriptionProcesses} />
        </div>
    );

    const renderedInUseBySubscriptions = (
        <div className="mod-subscription-detail">
            <RenderSubscriptions inUseBySubscriptions={enrichedInUseBySubscriptions} />
        </div>
    );

    // TODO: change to use formatted message
    const subscriptionTabs: TabView[] = [
        {
            id: "subscription-detail",
            name: "Subscription",
            disabled: false,
            content: (
                <>
                    {renderedSubscriptionDetails}
                    <RenderFixedInputs product={product} />
                </>
            ),
        },
        {
            id: "subscription-actions",
            name: "Actions",
            disabled: false,
            content: renderedActions,
        },
        {
            id: "subscription-product",
            name: "Product",
            disabled: false,
            content: renderedProductDetails,
        },
        {
            id: "subscription-processes",
            name: "Processes",
            disabled: false,
            content: renderedProcesses,
        },
        {
            id: "subscription-related",
            name: "Related subscriptions",
            disabled: false,
            content: renderedInUseBySubscriptions,
        },
    ];

    return (
        <EuiFlexItem css={subscriptionDetailStyling}>
            <div className="mod-subscription-detail">
                {subscriptionDetailHeader("subscription-details")}
                {tabViewSettingsForId("subscription-details").viewType === "tree" && (
                    <>
                        {renderedSubscriptionDetails}
                        <RenderFixedInputs product={product} />
                    </>
                )}
                {tabViewSettingsForId("subscription-details").viewType === "tabs" && (
                    <TabbedSection
                        id="subscription-detail-tabs"
                        tabs={subscriptionTabs}
                        className="tabbed-details-parent"
                        name={<FormattedMessage id="subscription.subscription_title" />}
                    ></TabbedSection>
                )}

                {subscriptionDetailHeader("subscription-product-blocks", "Service configuration details")}
                {tabViewSettingsForId("subscription-product-blocks").viewType === "tree" && (
                    <>
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
                                        inUseBySubscriptions={inUseBySubscriptions}
                                    />
                                ))}
                            </SubscriptionDetailSection>
                        )}
                    </>
                )}
                {tabViewSettingsForId("subscription-product-blocks").viewType === "tabs" && (
                    <RenderServiceConfiguration
                        subscriptionInstances={subscription_instances}
                        subscription_id={subscription.subscription_id}
                        inUseBySubscriptions={inUseBySubscriptions}
                    />
                )}

                {tabViewSettingsForId("subscription-details").viewType === "tree" && (
                    <>
                        {renderedActions}
                        {renderedProductDetails}
                        {renderedProcesses}
                        {renderedInUseBySubscriptions}
                    </>
                )}
            </div>
        </EuiFlexItem>
    );
}

export default SubscriptionDetail;
