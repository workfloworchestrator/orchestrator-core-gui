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

import { isArray, partition } from "lodash";
import React from "react";

import SubscriptionInstanceValue from "./SubscriptionInstanceValue";

interface ISubscriptionInstance {
    instance_id: string;
    label?: string;
    [index: string]: any;
}

interface IProps {
    subscription_instance: ISubscriptionInstance;
}

export default function SubscriptionInstance({ subscription_instance }: IProps) {
    if (!subscription_instance) {
        return null;
    }

    const fields = Object.entries(subscription_instance)
        .filter((entry) => !["label", "subscription_instance_id", "product_block_name"].includes(entry[0]))
        .map<[string, any]>((entry) => (isArray(entry[1]) ? entry : [entry[0], [entry[1]]]));

    const [value_fields, instance_fields] = partition(fields, (entry) => typeof entry[1][0] !== "object");
    return (
        <section className="product-block">
            <h3>{subscription_instance.product_block_name}</h3>
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
                .flatMap((entry) => entry[1])
                .map((instance: ISubscriptionInstance, i: number) => (
                    <SubscriptionInstance key={i} subscription_instance={instance} />
                ))}
        </section>
    );
}
