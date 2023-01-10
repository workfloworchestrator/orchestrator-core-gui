/*
 * Copyright 2019-2023 SURF.
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
import { FormattedMessage } from "react-intl";
import { ISubscriptionInstance } from "utils/types";

import { mapSplitFields } from "./templates/ServiceConfiguration";

interface IProps {
    subscription_id: string;
    subscription_instance: ISubscriptionInstance;
    field_name?: string;
    inUseBySubscriptions: {};
    isExpandedView?: boolean;
    parentSubscriptionInstanceId?: string;
}

const importantFields = ["owner_subscription_id"];

const getNameFromField = (field: [string, any]): string => field[0];
const getValueFromField = (field: [string, any]): any => field[1];

const mapInstanceFields = (
    instance_fields: [string, any][],
    subscription_id: string,
    inUseBySubscriptions: {},
    isExpandedView?: boolean,
    subscriptionInstanceId?: string,
    field_name?: string
) => {
    return instance_fields
        .flatMap((field) => getValueFromField(field).map((value: any) => [getNameFromField(field), value]))
        .map((field: [string, ISubscriptionInstance], i: number) => {
            const subscriptionInstance = getValueFromField(field);
            const fieldName = field_name ? `${field_name}.${getNameFromField(field)}` : getNameFromField(field);
            return (
                <SubscriptionInstance
                    key={i}
                    subscription_id={subscription_id}
                    subscription_instance={subscriptionInstance}
                    field_name={fieldName}
                    inUseBySubscriptions={inUseBySubscriptions}
                    isExpandedView={isExpandedView}
                    parentSubscriptionInstanceId={subscriptionInstanceId}
                />
            );
        });
};

export default function SubscriptionInstance({
    subscription_instance,
    field_name,
    inUseBySubscriptions,
    subscription_id,
    isExpandedView,
    parentSubscriptionInstanceId,
}: IProps) {
    if (!subscription_instance) {
        return null;
    }

    const isOutsideSubscriptionBoundary = subscription_id !== subscription_instance.owner_subscription_id;
    const isFirstInstanceOutsideSubscriptionBoundary = isOutsideSubscriptionBoundary && !isExpandedView;
    const shouldRenderCurrentBlock =
        isExpandedView || !isOutsideSubscriptionBoundary || isFirstInstanceOutsideSubscriptionBoundary;

    if (!shouldRenderCurrentBlock) {
        return null;
    }

    const subscriptionInstanceId = subscription_instance.subscription_instance_id;

    const fields = Object.entries(subscription_instance)
        .filter((entry) => !isFirstInstanceOutsideSubscriptionBoundary || importantFields.includes(entry[0]))
        .filter((entry) => !["label", "subscription_instance_id", "name"].includes(entry[0]))
        .map<[string, any]>((field) =>
            isArray(getValueFromField(field)) ? field : [getNameFromField(field), [getValueFromField(field)]]
        );

    const [value_fields, instance_fields] = partition(fields, (entry) => typeof entry[1][0] !== "object");

    const shouldRenderInstanceFields = !isFirstInstanceOutsideSubscriptionBoundary;
    const updatedValueFields: [string, any][] = value_fields.map((valueField) => {
        const fieldName = getNameFromField(valueField);
        if (fieldName === "in_use_by_ids") {
            const inUseByIds: string[] = getValueFromField(valueField);
            const filteredInUseByIds: string[] = inUseByIds.filter(
                (value: string) => value !== parentSubscriptionInstanceId
            );

            return [fieldName, [...filteredInUseByIds]];
        }

        return valueField;
    });

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
                {mapSplitFields(
                    subscription_instance.subscription_instance_id,
                    updatedValueFields,
                    inUseBySubscriptions
                )}
            </table>

            {shouldRenderInstanceFields &&
                mapInstanceFields(
                    instance_fields,
                    subscription_id,
                    inUseBySubscriptions,
                    isExpandedView,
                    subscriptionInstanceId,
                    field_name
                )}
        </section>
    );
}
