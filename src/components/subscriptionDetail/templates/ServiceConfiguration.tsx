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
    inUseBySubscriptions: Record<string, any>,
    onlyImportantFields?: boolean
) => {
    const importantFields = ["owner_subscription_id"];

    let hasInUseByExpandableRow = false;
    return value_fields
        .filter((entry) => !onlyImportantFields || importantFields.includes(entry[0]))
        .sort((entryA, entryB) => entryA[0].localeCompare(entryB[0]))
        .flatMap((entry) => entry[1].map((value: any) => [entry[0], value !== null ? value : "NULL"]))
        .map((entry, i) => {
            console.log(`${i}`, entry);
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

// Entry point!
export function RenderServiceConfiguration({
    subscriptionInstances, // Data in this shape: ['vc', {...}]
    subscription_id, // Current subscription id you are viewing (same as URL)
    inUseBySubscriptions, // Detailed data for all IDs in all in_use_by_ids fields -- never gets mutated, just passed along for lookup purposes
    showRelatedBlocks = false, // Toggle collapsed/expanded view
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

    // Prepare a list of tabs for this product.
    // If we find instancefields, we'll create a tab for each instance
    // in a separate TabbedSection by calling this function again.
    // The result should be a nested list of tabs.
    const parseToTabs = (instance_fields: [string, any][], level = 0): TabView[] => {
        return instance_fields
            .sort((a, b) => tabOrder.indexOf(a[0]) - tabOrder.indexOf(b[0]))
            .map(([field, instances]): TabView[] => instances.map(parseInstanceToTab(level, field)))
            .flat();
    };

    // Single Tab with valueFields and instanceFields
    const parseInstanceToTab = (level: number, field: string) => (inst: ISubscriptionInstance): TabView => {
        const { subscription_instance_id } = inst;
        const { value_fields, instance_fields, tabName } = splitValueAndInstanceFields(inst);

        const sorted_instance_fields = instance_fields.sort((a, b) => tabOrder.indexOf(a[0]) - tabOrder.indexOf(b[0]));

        // Attempt to copy TreeView
        const isOutsideSubscriptionBoundary = subscription_id !== inst.owner_subscription_id;
        const isFirstInstanceOutsideSubscriptionBoundary = isOutsideSubscriptionBoundary && !showRelatedBlocks; // var name is not right!!
        const shouldRenderCurrentBlock =
            showRelatedBlocks || !isOutsideSubscriptionBoundary || isFirstInstanceOutsideSubscriptionBoundary;
        const shouldRenderInstanceFields = showRelatedBlocks || !isFirstInstanceOutsideSubscriptionBoundary;

        console.log(`${level} - ${field}`, {
            inst,
            showRelatedBlocks,
            isOutsideSubscriptionBoundary,
            isFirstInstanceOutsideSubscriptionBoundary,
            shouldRenderCurrentBlock,
            shouldRenderInstanceFields,
        });

        // Current level of the table
        const SplitFieldInstanceValues = mapSplitFields(
            subscription_instance_id,
            value_fields,
            inUseBySubscriptions,
            isFirstInstanceOutsideSubscriptionBoundary
        );

        // Child table
        const subTabs: TabView[] =
            level < 4 && shouldRenderInstanceFields ? parseToTabs(sorted_instance_fields, level + 1) : [];

        return {
            id: `${field}-${subscription_instance_id}`,
            name: tabName,
            disabled: false,
            content: (
                <>
                    <table className="detail-block multiple-tbody">
                        <thead />
                        {!isFirstInstanceOutsideSubscriptionBoundary && (
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

    // in case of ['vc', {...}] getting the object --> which is a ISubscriptionInstance
    const instance = subscriptionInstances[0][1] as ISubscriptionInstance;

    // initiate first run to map all product blocks into a tab list.
    const { value_fields, instance_fields } = splitValueAndInstanceFields(instance);

    // Renders the current level of the table
    const InstanceValues = mapSplitFields(instance.subscription_instance_id, value_fields, inUseBySubscriptions);

    // Renders the child table
    const tabs: TabView[] = parseToTabs(instance_fields);

    // This is the Service config details
    return (
        <div className="mod-subscription-detail">
            <table className="detail-block multiple-tbody">
                <thead />
                {/* Current level table */}
                <SubscriptionInstanceValue
                    key={`${instance.subscription_id}-instance-id`}
                    label={"Instance ID"}
                    value={instance.subscription_instance_id}
                />
                {InstanceValues}
            </table>
            {/* Sub tables */}
            {tabs.length > 0 && (
                <TabbedSection id="subscription-configuration-tabs" tabs={tabs} name="Subscription Configuration" />
            )}
        </div>
    );
}
