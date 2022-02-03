import { TabbedSection } from "components/subscriptionDetail/TabbedSection";
import SubscriptionInstanceValue from "custom/components/subscriptionDetail/SubscriptionInstanceValue";
import { isArray, partition } from "lodash";
import { ISubscriptionInstance, TabView } from "utils/types";

interface IProps {
    subscriptionInstances: any[][];
    viewType?: string;
}

export function RenderServiceConfiguration({ subscriptionInstances, viewType }: IProps) {
    const tabOrder = ["ip_gw_endpoint", "l3_endpoints", "l2_endpoints"];

    const splitValueAndInstanceFields = (instance: ISubscriptionInstance) => {
        if (instance === null) debugger;

        const fields = Object.entries(instance)
            .filter((entry) => !["label", "subscription_instance_id", "name"].includes(entry[0]))
            .map<[string, any]>((entry) => {
                return isArray(entry[1]) ? entry : [entry[0], [entry[1]]];
            });
        const [value_fields, instance_fields] = partition(
            fields,
            (entry) => entry[1][0] === null || typeof entry[1][0] !== "object"
        );
        const tabName = Object.entries(instance).filter((entry) => entry[0] === "name");
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
                                        .map((entry, i) => (
                                            <SubscriptionInstanceValue
                                                key={`${inst.subscription_instance_id}.${i}`}
                                                label={entry[0]}
                                                value={entry[1] !== null ? entry[1] : "null"}
                                            />
                                        ))}
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
    const parentSplitFields = splitValueAndInstanceFields(instance);

    const tabs: TabView[] = parseToTabs(parentSplitFields.instance_fields);

    return (
        <div className="mod-subscription-detail">
            <table className="detail-block multiple-tbody">
                <thead />
                <SubscriptionInstanceValue
                    key={`${instance.subscription_id}-instance-id`}
                    label={"Instance ID"}
                    value={instance.subscription_instance_id}
                />
                {parentSplitFields.value_fields
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
