import { EuiButtonGroup, EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiSplitPanel, EuiText } from "@elastic/eui";
import { useContext, useState } from "react";

import ApplicationContext from "../utils/ApplicationContext";
import { ProcessSubscription } from "../utils/types";
import { isEmpty } from "../utils/Utils";
import Navigation from "./Navigation";

function ProcessSubscriptionLink({
    subscriptionProcesses,
    isProcess,
    currentState,
    handleDeltaClick,
}: {
    subscriptionProcesses: ProcessSubscription[];
    isProcess: boolean;
    currentState: any;
    handleDeltaClick: (subscriptionId: string, subscription: any | undefined) => void;
}) {
    const { allowed } = useContext(ApplicationContext);
    const [collapsedPanel, setCollapsedPanel] = useState(false);
    const [toggleIdToSelectedMap, setToggleIdToSelectedMap] = useState({
        ["multiSelectButtonGroup__1"]: true,
        ["multiSelectButtonGroup__2"]: true,
    });
    if (isEmpty(subscriptionProcesses)) {
        return null;
    }

    const buttons = [
        {
            id: 'multiSelectButtonGroup__1',
            label: "Show Subscription",
            iconType: "link",
        },
        {
            id: 'multiSelectButtonGroup__2',
            label: "Show Delta",
            iconType: "indexMapping",
        },
    ];

    const onChange = (optionId: string, subscriptionId:string) => {
        console.log("Button clicked", optionId);
        if(optionId=="multiSelectButtonGroup__2") {
            handleDeltaClick(subscriptionId, {})
        }
    };

    const renderButtons = subscriptionProcesses.map((ps, index: number) => (
        <EuiSplitPanel.Inner>
            <EuiButtonGroup
                color={"accent"}
                legend="Subscription button group"
                options={buttons}
                type={"multi"}
                idToSelectedMap={toggleIdToSelectedMap}
                onChange={(id: string) => onChange(id, ps.subscription_id)}
            />
        </EuiSplitPanel.Inner>
    ));

    return (
        <section className="subscription-link">
            {allowed("/orchestrator/subscriptions/view/from-process") && (
                <>
                    <EuiFlexGroup gutterSize="s">
                        <EuiFlexItem grow={false}>
                            <EuiButtonIcon
                                iconType={collapsedPanel ? "arrowRight" : "arrowDown"}
                                aria-label="Toggle related subscriptions"
                                onClick={() => setCollapsedPanel(!collapsedPanel)}
                            />
                        </EuiFlexItem>
                        <EuiFlexItem grow={false}>
                            <EuiText>
                                <h4>Related subscriptions</h4>
                            </EuiText>
                        </EuiFlexItem>
                    </EuiFlexGroup>
                    {!collapsedPanel && (
                        <EuiSplitPanel.Outer color="transparent" hasBorder={true}>
                            {renderButtons}
                        </EuiSplitPanel.Outer>
                    )}
                </>
            )}
        </section>
    );
}
export default ProcessSubscriptionLink;
