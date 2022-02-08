import { EuiButton, EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiSplitPanel, EuiText } from "@elastic/eui";
import { useContext, useState } from "react";
import ApplicationContext from "utils/ApplicationContext";
import { ProcessSubscription } from "utils/types";
import { isEmpty } from "utils/Utils";

function ProcessSubscriptionLink({
    subscriptionProcesses,
    isProcess,
    currentState,
    handleDeltaClick,
}: {
    subscriptionProcesses: ProcessSubscription[];
    isProcess: boolean;
    currentState: any;
    handleDeltaClick: (subscriptionId: string, before: any | undefined, now: any | undefined) => void;
}) {
    const { allowed } = useContext(ApplicationContext);
    const [collapsedPanel, setCollapsedPanel] = useState(false);

    if (isEmpty(subscriptionProcesses)) {
        return null;
    }

    const onDeltaClicked = (subscriptionId: string, before: any, now: any) => {
        console.log("Delegating showDelta for subscriptionId:", subscriptionId);
        handleDeltaClick(subscriptionId, before, now);
    };

    const renderButtons = subscriptionProcesses.map((ps, index: number) => (
        <EuiSplitPanel.Inner paddingSize="s">
            <EuiFlexGroup gutterSize="s" alignItems="center">
                <EuiFlexItem grow={false}>
                    <EuiText>
                        {ps.workflow_target.toLowerCase()}: {ps.subscription_id.slice(0, 8)}
                    </EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                    <EuiButton
                        id="to-subscription"
                        href={`/subscriptions/${ps.subscription_id}`}
                        iconType="link"
                        size="s"
                        fill
                    >
                        Show Details
                    </EuiButton>
                </EuiFlexItem>
                {currentState.hasOwnProperty("subscription") &&
                    currentState.hasOwnProperty("__old_subscriptions__") &&
                    currentState.__old_subscriptions__.hasOwnProperty(ps.subscription_id) && (
                        <EuiFlexItem grow={false}>
                            <EuiButton
                                iconType="indexMapping"
                                size="s"
                                fill
                                onClick={() =>
                                    onDeltaClicked(
                                        ps.subscription_id,
                                        currentState.__old_subscriptions__[ps.subscription_id],
                                        currentState.subscription
                                    )
                                }
                            >
                                Show Delta
                            </EuiButton>
                        </EuiFlexItem>
                    )}
                {currentState.hasOwnProperty("__old_subscriptions__") &&
                    currentState.__old_subscriptions__.hasOwnProperty(ps.subscription_id) &&
                    currentState.__old_subscriptions__[ps.subscription_id].hasOwnProperty("subscription_id") &&
                    currentState.__old_subscriptions__[ps.subscription_id]["subscription_id"] !==
                        currentState.subscription_id && (
                        <EuiFlexItem grow={false}>
                            <EuiButton
                                iconType="indexMapping"
                                size="s"
                                fill
                                onClick={() =>
                                    onDeltaClicked(
                                        ps.subscription_id,
                                        currentState.__old_subscriptions__[ps.subscription_id],
                                        currentState.find(
                                            (sub: any) =>
                                                sub.hasOwnProperty("subscription_id") &&
                                                sub.subscription_id === ps.subscription_id
                                        )
                                    )
                                }
                            >
                                Show Delta
                            </EuiButton>
                        </EuiFlexItem>
                    )}

            </EuiFlexGroup>
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
