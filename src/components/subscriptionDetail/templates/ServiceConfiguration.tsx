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

import SubscriptionInfo from "components/subscriptionDetail/SubscriptionInfo";
import { TabbedSection } from "components/subscriptionDetail/TabbedSection";
import SubscriptionInstanceValue from "custom/components/subscriptionDetail/SubscriptionInstanceValue";
import { isArray, partition } from "lodash";
import { ISubscriptionInstance, TabView } from "utils/types";

import { ExpandableRow } from "../../tables/ExpandableRow";

interface IProps {
    subscriptionInstances: any[][];
    subscription_id: string;
    inUseBySubscriptions: Record<string, any>;
    isExpandedView?: boolean;
}

export const mapSplitFields = (
    instance_id: string,
    value_fields: [string, any][],
    inUseBySubscriptions: Record<string, any>
) => {
    const renderInUseByIds = (key: string, values: any) =>
        values.length > 0 ? (
            <ExpandableRow
                title="USED_BY_SUBSCRIPTIONS"
                text="Show info about subscriptions that use this product block"
                key={`expandable-${instance_id}-${key}`}
            >
                {values.map((value: any) => {
                    const subscription = inUseBySubscriptions.hasOwnProperty(value)
                        ? inUseBySubscriptions[value]
                        : value;
                    return <SubscriptionInfo key={value} label="used_by_subscription" value={subscription} />;
                })}
            </ExpandableRow>
        ) : null;

    return value_fields
        .sort((valueFieldLeft, valueFieldRight) => valueFieldLeft[0].localeCompare(valueFieldRight[0]))
        .map(([key, values]) => {
            if (key === "in_use_by_ids") {
                return [key, values];
            }

            return [key, values[0]];
        })
        .map(([key, values]) => {
            if (key === "in_use_by_ids" && values) {
                return renderInUseByIds(key, values);
            }
            return (
                <SubscriptionInstanceValue
                    key={`${instance_id}.${key}`}
                    label={key}
                    value={values !== null ? values : "null"}
                />
            );
        })
        .filter((element) => element !== null) as JSX.Element[];
};

export function RenderServiceConfiguration({
    subscriptionInstances,
    subscription_id,
    inUseBySubscriptions,
    isExpandedView = false,
}: IProps) {
    // Todo: remove surf specific code
    const tabOrder = ["ip_gw_endpoint", "l3_endpoints", "l2_endpoints"];
    const importantFields = ["owner_subscription_id"];

    const splitValueAndInstanceFields = (instance: ISubscriptionInstance) => {
        const fields = Object.entries(instance)
            .filter(([key]) => !["label", "subscription_instance_id", "name"].includes(key))
            .filter(([key, value]) => (key === "owner_subscription_id" ? value !== subscription_id : true))
            .map<[string, any]>(([key, value]) => {
                return isArray(value) ? [key, value] : [key, [value]];
            });
        const [value_fields, instance_fields] = partition(
            fields,
            ([_, value]) => value[0] === null || typeof value[0] !== "object"
        );
        const tabName = Object.entries(instance).filter(([key]) => key === "name");
        return { value_fields, instance_fields, tabName: tabName.length > 0 ? tabName[0][1] : "-" };
    };

    // Prepare a list of tabs for this product.
    // If we find instancefields, we'll create a tab for each instance
    // in a separate TabbedSection by calling this function again.
    // The result should be a nested list of tabs.
    const parseToTabs = (
        parentSubscriptionInstanceId: string,
        instance_fields: [string, any][],
        level = 0
    ): TabView[] => {
        return instance_fields
            .sort((a, b) => tabOrder.indexOf(a[0]) - tabOrder.indexOf(b[0]))
            .map(([field, instances]): TabView[] =>
                instances.map(parseInstanceToTab(parentSubscriptionInstanceId, level, field))
            )
            .flat();
    };

    const parseInstanceToTab = (parentSubscriptionInstanceId: string, level: number, field: string) => (
        inst: ISubscriptionInstance
    ): TabView => {
        const { subscription_instance_id } = inst;
        const { value_fields, instance_fields, tabName } = splitValueAndInstanceFields(inst);

        const sorted_instance_fields = instance_fields.sort((a, b) => tabOrder.indexOf(a[0]) - tabOrder.indexOf(b[0]));

        const isOutsideSubscriptionBoundary = subscription_id !== inst.owner_subscription_id;
        const shouldOnlyRenderImportantValueFields = isOutsideSubscriptionBoundary && !isExpandedView;
        const shouldRenderInstanceFields = isExpandedView || !shouldOnlyRenderImportantValueFields;

        const filteredValueFields = value_fields
            .filter((valueField) => !shouldOnlyRenderImportantValueFields || importantFields.includes(valueField[0]))
            .map((valueField): [string, any] => {
                const [fieldName, fieldValue] = valueField;
                if (fieldName === "in_use_by_ids" && !isOutsideSubscriptionBoundary) {
                    const inUseByIdsWithoutParent = fieldValue.filter(
                        (id: string) => id !== parentSubscriptionInstanceId
                    );
                    return [fieldName, inUseByIdsWithoutParent];
                }
                return valueField;
            });

        const SplitFieldInstanceValues = mapSplitFields(
            subscription_instance_id,
            filteredValueFields,
            inUseBySubscriptions
        );

        const subTabs: TabView[] =
            level < 4 && shouldRenderInstanceFields
                ? parseToTabs(subscription_instance_id, sorted_instance_fields, level + 1)
                : [];

        return {
            id: `${field}-${subscription_instance_id}`,
            name: tabName,
            disabled: false,
            content: (
                <>
                    <table className="detail-block multiple-tbody">
                        <thead />
                        {!shouldOnlyRenderImportantValueFields && (
                            <SubscriptionInstanceValue
                                key={`${inst.subscription_id}-instance-id`}
                                label={"Instance ID"}
                                value={subscription_instance_id}
                            />
                        )}
                        {SplitFieldInstanceValues}
                    </table>
                    {subTabs.length > 0 && (
                        <div className="indented">
                            <TabbedSection
                                id={`${field}-${subscription_instance_id}-tabs`}
                                tabs={subTabs}
                                name={field}
                            />
                        </div>
                    )}
                </>
            ),
        };
    };

    const instance = subscriptionInstances[0][1] as ISubscriptionInstance;

    // initiate first run to map all product blocks into a tab list.
    const { value_fields, instance_fields } = splitValueAndInstanceFields(instance);

    const InstanceValues = mapSplitFields(instance.subscription_instance_id, value_fields, inUseBySubscriptions);
    const tabs: TabView[] = parseToTabs(instance.subscription_instance_id, instance_fields);

    return (
        <div className="mod-subscription-detail">
            <table className="detail-block multiple-tbody">
                <thead />
                <SubscriptionInstanceValue
                    key={`${instance.subscription_id}-instance-id`}
                    label={"Instance ID"}
                    value={instance.subscription_instance_id}
                />
                {InstanceValues}
            </table>
            {tabs.length > 0 && (
                <TabbedSection id="subscription-configuration-tabs" tabs={tabs} name="Subscription Configuration" />
            )}
        </div>
    );
}
