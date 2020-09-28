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
import { InstanceValue, SubscriptionInstance, SubscriptionWithDetails } from "utils/types";

export interface InstanceValueWithLabel extends InstanceValue {
    instance_label: string;
}

export function subscriptionInstanceValues(subscription: SubscriptionWithDetails) {
    return subscription.instances.reduce(
        (acc: InstanceValueWithLabel[], instance: SubscriptionInstance) =>
            acc.concat(
                instance.values.map((item: InstanceValue) => ({
                    ...item,
                    instance_label: instance.label
                }))
            ),
        []
    );
}

export const port_subscription_id = "port_subscription_id";
export const ims_circuit_id = "ims_circuit_id";
export const ims_port_id = "ims_port_id";
export const nms_service_id = "nms_service_id";
export const parent_subscriptions = "parent_subscriptions";
export const child_subscriptions = "child_subscriptions";
export const absent = "absent";
