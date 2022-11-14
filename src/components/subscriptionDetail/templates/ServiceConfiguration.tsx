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
    showRelatedBlocks?: boolean;
}

export const mapSplitFields = (
    instance_id: string,
    value_fields: [string, any][],
    inUseBySubscriptions: Record<string, any>
) => {
    let hasInUseByExpandableRow = false;
    return value_fields
        .sort((entryA, entryB) => entryA[0].localeCompare(entryB[0]))
        .flatMap((entry) => entry[1].map((value: any) => [entry[0], value !== null ? value : "NULL"]))
        .map((entry, i) => {
            if (entry[0] === "in_use_by_ids") {
                const value = inUseBySubscriptions.hasOwnProperty(entry[1]) ? inUseBySubscriptions[entry[1]] : entry[1];
                if (!hasInUseByExpandableRow) {
                    hasInUseByExpandableRow = true;
                    return (
                        <ExpandableRow
                            title="USED_BY_SUBSCRIPTIONS"
                            text="Show info about subscriptions that use this product block"
                            key={`expandable-${instance_id}-${i}`}
                        >
                            <SubscriptionInfo label="used_by_subscription" value={value} />
                        </ExpandableRow>
                    );
                }
                return null;
            }
            return (
                <SubscriptionInstanceValue
                    key={`${instance_id}.${i}`}
                    label={entry[0]}
                    value={entry[1] !== null ? entry[1] : "null"}
                />
            );
        })
        .filter((element) => element !== null) as JSX.Element[];
};

const getSubBlockFromInstanceFields = (instance_fields: [string, any][]) =>
    instance_fields[0] && // instance_fields: [[label, subscription_instance[]], ...]
    instance_fields[0][1] && // instance_fields[0]: [label, subscription_instance[]]
    instance_fields[0][1][0]; // instance_fields[0][1]: subscription_instance[]

const getVisibleInstanceFields = (
    instance_fields: [string, any][],
    showRelatedBlocks: boolean,
    subBlockContainsDataForCollapsedView: boolean
): [string, any][] => {
    if (showRelatedBlocks || !subBlockContainsDataForCollapsedView) {
        return [...instance_fields];
    }

    const { owner_subscription_id, subscription_instance_id, name } = getSubBlockFromInstanceFields(instance_fields);

    return [
        [
            instance_fields[0][0],
            [
                {
                    owner_subscription_id,
                    subscription_instance_id,
                    name,
                },
            ],
        ],
    ];
};

export function RenderServiceConfiguration({
    subscriptionInstances,
    subscription_id,
    inUseBySubscriptions,
    showRelatedBlocks = false,
}: IProps) {
    // Todo: remove surf specific code
    const tabOrder = ["ip_gw_endpoint", "l3_endpoints", "l2_endpoints"];

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

    const instance = subscriptionInstances[0][1] as ISubscriptionInstance;

    // Prepare a list of tabs for this product.
    // If we find instancefields, we'll create a tab for each instance
    // in a separate TabbedSection by calling this function again.
    // The result should be a nested list of tabs.
    const parseToTabs = (instance_fields: [string, any][], level = 0): TabView[] => {
        return instance_fields
            .sort((a, b) => tabOrder.indexOf(a[0]) - tabOrder.indexOf(b[0]))
            .map(([field, instances]): TabView[] => {
                return instances.map(parseInstanceToTab(level, field));
            })
            .flat();
    };

    const parseInstanceToTab = (level: number, field: string) => (inst: ISubscriptionInstance): TabView => {
        const { subscription_instance_id } = inst;
        const { value_fields, instance_fields, tabName } = splitValueAndInstanceFields(inst);

        const sorted_instance_fields = instance_fields.sort((a, b) => tabOrder.indexOf(a[0]) - tabOrder.indexOf(b[0]));
        if (instance_fields.some((instField) => tabOrder.includes(instField[0]))) {
            console.log({ level, field, instance_fields, sorted_instance_fields });
        }
        const subBlock = getSubBlockFromInstanceFields(sorted_instance_fields);
        const ownerSubscriptionIdSubBlock = subBlock && subBlock.owner_subscription_id;
        const inUseByIdsSubBlock = subBlock && subBlock.in_use_by_ids;

        const isSubscriptionBlock = inst.owner_subscription_id === ownerSubscriptionIdSubBlock;
        const subBlockContainsDataForCollapsedView = inUseByIdsSubBlock?.includes(subscription_instance_id);
        const showSubBlock = isSubscriptionBlock || showRelatedBlocks || subBlockContainsDataForCollapsedView;

        const visibleInstanceFields = getVisibleInstanceFields(
            instance_fields,
            showRelatedBlocks,
            subBlockContainsDataForCollapsedView
        );
        const subTabs: TabView[] = level < 4 ? parseToTabs(visibleInstanceFields, level + 1) : [];

        const SplitFieldInstanceValues = mapSplitFields(subscription_instance_id, value_fields, inUseBySubscriptions);

        return {
            id: `${field}-${subscription_instance_id}`,
            name: tabName,
            disabled: false,
            content: (
                <>
                    <table className="detail-block multiple-tbody">
                        <thead />
                        <SubscriptionInstanceValue
                            key={`${inst.subscription_id}-instance-id`}
                            label={"Instance ID"}
                            value={subscription_instance_id}
                        />
                        {SplitFieldInstanceValues}
                    </table>
                    {subTabs.length > 0 && showSubBlock && (
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

    // initiate first run to map all product blocks into a tab list.
    const inUseByInstanceSplitFields = splitValueAndInstanceFields(instance);

    const tabs: TabView[] = parseToTabs(inUseByInstanceSplitFields.instance_fields);

    const InstanceValues = mapSplitFields(
        instance.subscription_instance_id,
        inUseByInstanceSplitFields.value_fields,
        inUseBySubscriptions
    );

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
