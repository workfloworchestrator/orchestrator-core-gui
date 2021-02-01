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

import { EuiButton, EuiCopy, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import CheckBox from "components/CheckBox";
import { FAVORITE_STORAGE_KEY } from "components/modals/components/FavoritePortSelector";
import { ENV } from "env";
import I18n from "i18n-js";
import React, { useContext } from "react";
import { useStorageState } from "react-storage-hooks";
import ApplicationContext from "utils/ApplicationContext";
import { organisationNameByUuid, renderDate } from "utils/Lookups";
import {
    FavoriteSubscriptionStorage,
    Product,
    Subscription,
    SubscriptionModel,
    SubscriptionProcesses,
} from "utils/types";

function renderGrafanaLink(subscription: Subscription, product: Product) {
    if (
        (product.product_type === "Port" ||
            product.product_type === "LightPath" ||
            product.product_type === "IP" ||
            product.product_type === "L2VPN") &&
        product.tag !== "MSC"
    ) {
        return (
            <tr>
                <td id="subscriptions-stats_in_grafana-k">{I18n.t("subscriptions.stats_in_grafana")}</td>
                <td id="subscriptions-stats_in_grafana-v">
                    <a
                        href={`https://grafana.surf.net/d/v6yLvaQmk/surfnet8-subscription-id?orgId=1&refresh=30s&var-datasource=SURFnet-Subscriptions&var-measurement=NetworkMeasurements_bps_5min&var-subid=${subscription.subscription_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {I18n.t("subscriptions.go_to_grafana")}
                    </a>
                </td>
            </tr>
        );
    } else {
        return null;
    }
}

function renderNetworkDashboardLink(subscription: Subscription, product: Product) {
    if (
        product.product_type === "Port" ||
        product.product_type === "LightPath" ||
        product.product_type === "IP" ||
        product.product_type === "L2VPN"
    ) {
        return (
            <tr>
                <td id="subscriptions-in_networkdashboard-k">{I18n.t("subscriptions.networkdashboard_url")}</td>
                <td id="subscriptions-in_networkdashboard-v">
                    <a
                        href={`${ENV.NETWORKDASHBOARD_URL}/subscription/${subscription.subscription_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {I18n.t("subscriptions.go_to_networkdashboard_url")}
                    </a>
                </td>
            </tr>
        );
    } else {
        return null;
    }
}

function renderFailedTask(subscriptionProcesses: SubscriptionProcesses[]) {
    let failed_tasks = subscriptionProcesses
        .map((sp) => sp.process)
        .filter((process) => process.last_status !== "completed");

    if (failed_tasks.length)
        return (
            <a target="_blank" rel="noopener noreferrer" href={`/task/${failed_tasks[0].pid}`}>
                {I18n.t("subscriptions.failed_task", failed_tasks[0])}
            </a>
        );
}
interface IProps {
    subscription: SubscriptionModel;
    className?: string;
    subscriptionProcesses?: SubscriptionProcesses[];
}

export default function SubscriptionDetails({ subscription, className = "", subscriptionProcesses = [] }: IProps) {
    const { organisations } = useContext(ApplicationContext);

    const [favoritesList, setFavoritesList] = useStorageState<FavoriteSubscriptionStorage[]>(
        localStorage,
        FAVORITE_STORAGE_KEY,
        []
    );

    function isCurrentlyFavorited(subscription_id: string) {
        const v = favoritesList.find((s) => s.subscription_id === subscription_id);
        return v !== undefined;
    }

    const customer_name = organisationNameByUuid(subscription.customer_id, organisations);
    return (
        <table className={`detail-block ${className}`}>
            <thead />
            <tbody>
                <tr>
                    <td id="subscriptions-id-k">{I18n.t("subscriptions.id")}</td>
                    <td id="subscriptions-id-v">
                        <EuiFlexGroup>
                            <EuiFlexItem grow={false}>
                                <a
                                    href={`/subscriptions/${subscription.subscription_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {subscription.subscription_id}
                                </a>
                            </EuiFlexItem>
                            <EuiFlexItem grow={false}>
                                <EuiCopy textToCopy={subscription.subscription_id}>
                                    {(copy) => (
                                        <EuiButton
                                            id="subscriptions-copy-button"
                                            iconType="copyClipboard"
                                            size="s"
                                            onClick={copy}
                                        >
                                            Copy ID
                                        </EuiButton>
                                    )}
                                </EuiCopy>
                            </EuiFlexItem>
                            <EuiFlexItem grow={false}>
                                <EuiButton
                                    id="subscriptions-favorite-toggle"
                                    iconType="filter"
                                    size="s"
                                    onClick={() => {
                                        const new_list = isCurrentlyFavorited(subscription.subscription_id)
                                            ? favoritesList.filter(
                                                  (item) => item.subscription_id !== subscription.subscription_id
                                              )
                                            : favoritesList.concat([
                                                  {
                                                      subscription_id: subscription.subscription_id,
                                                      customName: "",
                                                  },
                                              ]);
                                        setFavoritesList(new_list);
                                    }}
                                >
                                    {isCurrentlyFavorited(subscription.subscription_id)
                                        ? I18n.t(`favorites.remove`)
                                        : I18n.t(`favorites.add`)}
                                </EuiButton>
                            </EuiFlexItem>
                        </EuiFlexGroup>
                    </td>
                </tr>
                <tr>
                    <td id="subscriptions-name-k">{I18n.t("subscriptions.name")}</td>
                    <td id="subscriptions-name-v">{subscription.product.name}</td>
                </tr>
                <tr>
                    <td id="subscriptions-description-k">{I18n.t("subscriptions.description")}</td>
                    <td id="subscriptions-description-v">{subscription.description}</td>
                </tr>
                <tr>
                    <td id="subscriptions-startdate-k">{I18n.t("subscriptions.start_date_epoch")}</td>
                    <td id="subscriptions-startdate-v">{renderDate(subscription.start_date)}</td>
                </tr>
                <tr>
                    <td id="subscriptions-enddate-k">{I18n.t("subscriptions.end_date_epoch")}</td>
                    <td id="subscriptions-enddate-v">{renderDate(subscription.end_date)}</td>
                </tr>
                <tr>
                    <td id="subscriptions-status-k">{I18n.t("subscriptions.status")}</td>
                    <td id="subscriptions-status-v">{subscription.status}</td>
                </tr>
                <tr>
                    <td id="subscriptions-insync-k">{I18n.t("subscriptions.insync")}</td>
                    <td id="subscriptions-insync-v">
                        <CheckBox value={subscription.insync || false} readOnly={true} name="isync" />
                        {!subscription.insync && renderFailedTask(subscriptionProcesses)}
                    </td>
                </tr>
                {customer_name && (
                    <tr>
                        <td id="subscriptions-customer-name-k">{I18n.t("subscriptions.customer_name")}</td>
                        <td id="subscriptions-customer-name-v">{customer_name}</td>
                    </tr>
                )}
                <tr>
                    <td id="subscriptions-customer-id-k">{I18n.t("subscriptions.customer_id")}</td>
                    <td id="subscriptions-customer-id-v">{subscription.customer_id}</td>
                </tr>
                {subscription.customer_descriptions && (
                    <tr>
                        <td id="subscriptions-customer-descriptions-k">
                            {I18n.t("subscriptions.customer_descriptions")}
                        </td>
                        <td id="subscriptions-customer-descriptions-v">
                            <dl>
                                {subscription.customer_descriptions.map((description, index) => (
                                    <React.Fragment key={index}>
                                        <dt>{organisationNameByUuid(description.customer_id, organisations)}</dt>
                                        <dd>{description.description}</dd>
                                    </React.Fragment>
                                ))}
                            </dl>
                        </td>
                    </tr>
                )}
                {renderGrafanaLink(subscription, subscription.product)}
                {renderNetworkDashboardLink(subscription, subscription.product)}
                <tr>
                    <td id="subscriptions-note-k">{I18n.t("subscriptions.note")}</td>
                    <td id="subscriptions-note-v">{subscription.note}</td>
                </tr>
            </tbody>
        </table>
    );
}
