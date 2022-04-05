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

import { EuiButton } from "@elastic/eui";
import SubscriptionInfo from "components/subscriptionDetail/SubscriptionInfo";
import SubscriptionInstanceValue from "custom/components/subscriptionDetail/SubscriptionInstanceValue";
import { isArray, partition } from "lodash";
import React, { useContext, useState } from "react";
import { FormattedMessage } from "react-intl";
import ApplicationContext from "utils/ApplicationContext";
import { ISubscriptionInstance } from "utils/types";

interface IProps {
    subscription_instance: ISubscriptionInstance;
    field_name?: string;
    inUseBySubscriptions: {};
}

export default function SubscriptionInstance({ subscription_instance, field_name, inUseBySubscriptions }: IProps) {
    const { theme } = useContext(ApplicationContext);
    const [subscriptionInfoExpanded, setSubscriptionInfoExpanded] = useState(false);

    if (!subscription_instance) {
        return null;
    }
    let isSubscriptionInfoSection = false;
    const subscriptionInstanceId = subscription_instance.subscription_instance_id;
    const fields = Object.entries(subscription_instance)
        .filter((entry) => !["label", "subscription_instance_id", "name"].includes(entry[0]))
        .map<[string, any]>((entry) => (isArray(entry[1]) ? entry : [entry[0], [entry[1]]]));

    const [value_fields, instance_fields] = partition(fields, (entry) => typeof entry[1][0] !== "object");
    return (
        <section className="product-block">
            <h3>{subscription_instance.name}</h3>
            {field_name && (
                // Default must contain a space as not to be Falsy
                <p className="label">
                    <FormattedMessage id={`subscription_instance.${field_name}`} defaultMessage=" " />
                </p>
            )}
            {subscription_instance.label && <p className="label">{`Label: ${subscription_instance.label}`}</p>}
            <p className="label">{`Instance ID: ${subscription_instance.subscription_instance_id}`}</p>
            <table className="detail-block multiple-tbody">
                <thead />
                {value_fields
                    .sort((entryA, entryB) => entryA[0].localeCompare(entryB[0]))
                    .flatMap((entry) => entry[1].map((value: any) => [entry[0], value]))
                    .map((entry, i) => {
                        if (entry[0] === "in_use_by_ids") {
                            let SubscriptionInfoExpandButton = <></>;
                            if (!isSubscriptionInfoSection) {
                                // render button once per product block
                                SubscriptionInfoExpandButton = (
                                    <tbody className={theme}>
                                        <tr>
                                            <td>USED_BY_SUBSCRIPTIONS</td>
                                            <td>Show info about subscriptions that use this product block</td>
                                            <td>
                                                <EuiButton
                                                    iconType={subscriptionInfoExpanded ? "arrowDown" : "arrowRight"}
                                                    onClick={() =>
                                                        setSubscriptionInfoExpanded(!subscriptionInfoExpanded)
                                                    }
                                                >
                                                    {subscriptionInfoExpanded ? "collapse" : "expand"}
                                                </EuiButton>
                                            </td>
                                        </tr>
                                    </tbody>
                                );
                                isSubscriptionInfoSection = true;
                            }
                            // @ts-ignore
                            const value = inUseBySubscriptions.hasOwnProperty(entry[1])
                                ? // @ts-ignore
                                  inUseBySubscriptions[entry[1]]
                                : entry[1];
                            return (
                                <>
                                    {SubscriptionInfoExpandButton}
                                    {subscriptionInfoExpanded && (
                                        <SubscriptionInfo
                                            key={`${subscriptionInstanceId}.${i}`}
                                            label="used_by_subscription"
                                            value={value}
                                        />
                                    )}
                                </>
                            );
                        }
                        return (
                            <SubscriptionInstanceValue
                                key={i}
                                label={entry[0]}
                                value={entry[1] !== null ? entry[1] : "null"}
                            />
                        );
                    })}
            </table>
            {instance_fields
                .flatMap((entry) => entry[1].map((value: any) => [entry[0], value]))
                .map((entry: [string, ISubscriptionInstance], i: number) => (
                    <SubscriptionInstance
                        key={i}
                        subscription_instance={entry[1]}
                        field_name={field_name ? `${field_name}.${entry[0]}` : entry[0]}
                        inUseBySubscriptions={inUseBySubscriptions}
                    />
                ))}
        </section>
    );
}
