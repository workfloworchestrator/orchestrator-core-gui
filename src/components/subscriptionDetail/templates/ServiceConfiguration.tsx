import { EuiButton, EuiButtonIcon } from "@elastic/eui";
import { TabbedSection } from "components/subscriptionDetail/TabbedSection";
import SubscriptionInstanceValue from "custom/components/subscriptionDetail/SubscriptionInstanceValue";
import { isArray, partition } from "lodash";
import React, { useContext, useState } from "react";
import { ISubscriptionInstance, TabView } from "utils/types";

import ApplicationContext from "../../../utils/ApplicationContext";
import SubscriptionInfo from "../SubscriptionInfo";

interface IProps {
    subscriptionInstances: any[][];
    viewType?: string;
    subscription_id: string;
    inUseBySubscriptions: {};
}

export function RenderServiceConfiguration({
    subscriptionInstances,
    viewType,
    subscription_id,
    inUseBySubscriptions,
}: IProps) {
    // Todo: remove surf specific code
    const tabOrder = ["ip_gw_endpoint", "l3_endpoints", "l2_endpoints"];
    const { theme } = useContext(ApplicationContext);
    const [subscriptionInfoExpanded, setSubscriptionInfoExpanded] = useState<string[]>([]);

    const toggleExpand = (id: string) => {
        if (subscriptionInfoExpanded.includes(id)) {
            setSubscriptionInfoExpanded(subscriptionInfoExpanded.filter((i) => i !== id));
        } else {
            setSubscriptionInfoExpanded(subscriptionInfoExpanded.concat(id));
        }
    };

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
        const tabs: TabView[] = [];
        instance_fields
            .sort((a, b) => tabOrder.indexOf(a[0]) - tabOrder.indexOf(b[0]))
            .forEach(([field, instances]) => {
                instances.forEach((inst: ISubscriptionInstance) => {
                    const splitFields = splitValueAndInstanceFields(inst);
                    const subTabs: TabView[] = level < 4 ? parseToTabs(splitFields.instance_fields, level + 1) : [];
                    let isSubscriptionInfoSection = false;
                    const subscriptionInstanceId = inst.subscription_instance_id;
                    tabs.push({
                        id: `${field}-${inst.subscription_instance_id}`,
                        name: splitFields.tabName,
                        content: (
                            <>
                                <table className="detail-block multiple-tbody">
                                    <thead />
                                    <SubscriptionInstanceValue
                                        key={`${inst.subscription_id}-instance-id`}
                                        label={"Instance ID"}
                                        value={inst.subscription_instance_id}
                                    />
                                    {splitFields.value_fields
                                        .sort((entryA, entryB) => entryA[0].localeCompare(entryB[0]))
                                        .flatMap((entry) =>
                                            entry[1].map((value: any) => [entry[0], value !== null ? value : "NULL"])
                                        )
                                        .map((entry, i) => {
                                            if (entry[0] === "in_use_by_ids") {
                                                const isExpanded = subscriptionInfoExpanded.includes(
                                                    subscriptionInstanceId
                                                );
                                                let SubscriptionInfoExpandButton = <></>;
                                                if (!isSubscriptionInfoSection) {
                                                    // render button once per product block
                                                    SubscriptionInfoExpandButton = (
                                                        <tbody className={theme}>
                                                            <tr>
                                                                <td>USED_BY_SUBSCRIPTIONS</td>
                                                                <td>
                                                                    Show info about subscriptions that use this product
                                                                    block
                                                                </td>
                                                                <td>
                                                                    <EuiButton
                                                                        iconType={
                                                                            isExpanded ? "arrowDown" : "arrowRight"
                                                                        }
                                                                        onClick={() =>
                                                                            toggleExpand(subscriptionInstanceId)
                                                                        }
                                                                    >
                                                                        {isExpanded ? "collapse" : "expand"}
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
                                                        {isExpanded && (
                                                            <SubscriptionInfo
                                                                key={`${inst.subscription_instance_id}.${i}`}
                                                                label="used_by_subscription"
                                                                value={value}
                                                            />
                                                        )}
                                                    </>
                                                );
                                            }
                                            return (
                                                <SubscriptionInstanceValue
                                                    key={`${inst.subscription_instance_id}.${i}`}
                                                    label={entry[0]}
                                                    value={entry[1] !== null ? entry[1] : "null"}
                                                />
                                            );
                                        })}
                                </table>
                                {subTabs.length > 0 && (
                                    <div className="indented">
                                        <TabbedSection
                                            id={`${field}-${inst.subscription_instance_id}-tabs`}
                                            tabs={subTabs}
                                            name={field}
                                        ></TabbedSection>
                                    </div>
                                )}
                            </>
                        ),
                    } as TabView);
                });
            });
        return tabs;
    };

    // initiate first run to map all product blocks into a tab list.
    const instance = subscriptionInstances[0][1] as ISubscriptionInstance;
    const inUseByInstanceSplitFields = splitValueAndInstanceFields(instance);

    const tabs: TabView[] = parseToTabs(inUseByInstanceSplitFields.instance_fields);

    return (
        <div className="mod-subscription-detail">
            <table className="detail-block multiple-tbody">
                <thead />
                <SubscriptionInstanceValue
                    key={`${instance.subscription_id}-instance-id`}
                    label={"Instance ID"}
                    value={instance.subscription_instance_id}
                />
                {inUseByInstanceSplitFields.value_fields
                    .sort((entryA, entryB) => entryA[0].localeCompare(entryB[0]))
                    .flatMap((entry) => entry[1].map((value: any) => [entry[0], value]))
                    .map((entry, i) => (
                        <SubscriptionInstanceValue
                            key={i}
                            label={entry[0]}
                            value={entry[1] !== null ? entry[1] : "NULL"}
                        />
                    ))}
            </table>
            {tabs.length > 0 && (
                <TabbedSection
                    id="subscription-configuration-tabs"
                    tabs={tabs}
                    name="Subscription Configuration"
                ></TabbedSection>
            )}
        </div>
    );
}
