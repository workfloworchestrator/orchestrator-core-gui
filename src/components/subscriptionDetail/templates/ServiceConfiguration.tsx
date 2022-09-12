import { EuiButton } from "@elastic/eui";
import SubscriptionInfo from "components/subscriptionDetail/SubscriptionInfo";
import { TabbedSection } from "components/subscriptionDetail/TabbedSection";
import SubscriptionInstanceValue from "custom/components/subscriptionDetail/SubscriptionInstanceValue";
import { isArray, partition } from "lodash";
import React, { useContext, useState } from "react";
import ApplicationContext from "utils/ApplicationContext";
import { ISubscriptionInstance, TabView } from "utils/types";

interface IProps {
    subscriptionInstances: any[][];
    subscription_id: string;
    inUseBySubscriptions: Record<string, any>;
    showRelatedBlocks?: boolean;
}

interface IExpandableRow {
    children: JSX.Element;
}

export const ExpandableRow = ({ children }: IExpandableRow) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { theme } = useContext(ApplicationContext);

    const ExpandButton = (
        <tbody className={theme}>
            <tr>
                <td>USED_BY_SUBSCRIPTIONS</td>
                <td>Show info about subscriptions that use this product block</td>
                <td>
                    <EuiButton
                        iconType={isExpanded ? "arrowDown" : "arrowRight"}
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? "collapse" : "expand"}
                    </EuiButton>
                </td>
            </tr>
        </tbody>
    );

    return (
        <>
            {ExpandButton}
            {isExpanded && children}
        </>
    );
};

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
                        <ExpandableRow key={`${instance_id}.${i}`}>
                            <SubscriptionInfo label="used_by_subscription" value={value} />
                        </ExpandableRow>
                    );
                }
                return <></>;
            }
            return (
                <SubscriptionInstanceValue
                    key={`${instance_id}.${i}`}
                    label={entry[0]}
                    value={entry[1] !== null ? entry[1] : "null"}
                />
            );
        })
        .filter((entry) => entry !== <></>);
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
        const instance_id = inst.subscription_instance_id;
        const splitFields = splitValueAndInstanceFields(inst);
        const subTabs: TabView[] = level < 4 ? parseToTabs(splitFields.instance_fields, level + 1) : [];
        const sorted_instance_fields = splitFields.instance_fields.sort(
            (a, b) => tabOrder.indexOf(a[0]) - tabOrder.indexOf(b[0])
        );
        const inst_owner_sub =
            sorted_instance_fields &&
            sorted_instance_fields[0] &&
            sorted_instance_fields[0][1] &&
            sorted_instance_fields[0][1][0] &&
            sorted_instance_fields[0][1][0].owner_subscription_id;

        const splitFieldInstanceValues = mapSplitFields(
            instance.subscription_instance_id,
            splitFields.value_fields,
            inUseBySubscriptions
        );

        const isSubscriptionBlock = instance.owner_subscription_id === inst_owner_sub;
        const showBlock = isSubscriptionBlock || showRelatedBlocks;

        return {
            id: `${field}-${instance_id}`,
            name: splitFields.tabName,
            disabled: false,
            content: (
                <>
                    <table className="detail-block multiple-tbody">
                        <thead />
                        <SubscriptionInstanceValue
                            key={`${inst.subscription_id}-instance-id`}
                            label={"Instance ID"}
                            value={instance_id}
                        />
                        {splitFieldInstanceValues}
                    </table>
                    {subTabs.length > 0 && showBlock && (
                        <div className="indented">
                            <TabbedSection id={`${field}-${instance_id}-tabs`} tabs={subTabs} name={field} />
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
