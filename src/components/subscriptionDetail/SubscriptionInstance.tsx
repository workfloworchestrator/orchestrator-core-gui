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

import SubscriptionInstanceValue from "custom/components/subscriptionDetail/SubscriptionInstanceValue";
import { isArray, partition } from "lodash";
import React from "react";
import { FormattedMessage } from "react-intl";

interface ISubscriptionInstance {
    subscription_instance_id: string;
    name: string;
    label?: string;
    [index: string]: any;
}

interface IProps {
    subscription_instance: ISubscriptionInstance;
    field_name?: string;
}

export default function SubscriptionInstance({ subscription_instance, field_name }: IProps) {
    if (!subscription_instance) {
        return null;
    }

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
                    .map((entry, i) => (
                        <SubscriptionInstanceValue key={i} label={entry[0]} value={entry[1]} />
                    ))}
            </table>
            {instance_fields
                .flatMap((entry) => entry[1].map((value: any) => [entry[0], value]))
                .map((entry: [string, ISubscriptionInstance], i: number) => (
                    <SubscriptionInstance
                        key={i}
                        subscription_instance={entry[1]}
                        field_name={field_name ? `${field_name}.${entry[0]}` : entry[0]}
                    />
                ))}
        </section>
    );
}
