import { EuiCallOut, EuiPanel } from "@elastic/eui";
import { ErrorBoundary } from "@sentry/react";
import NetworkDiagram from "custom/components/subscriptionDetail/NetworkDiagram";
import React, { useContext } from "react";
import { FormattedMessage } from "react-intl";
import ApplicationContext from "utils/ApplicationContext";
import { enrichSubscription } from "utils/Lookups";
import { SubscriptionModel } from "utils/types";

function ErrorFallback({ componentName }: { componentName: string }) {
    return (
        <EuiCallOut title="An unhandled error occurred" color="danger" iconType="alert">
            <p>
                An unhandled error occurred in the {componentName} and was logged to Sentry. This could indicate a
                missing resource type in an external system.
            </p>
        </EuiCallOut>
    );
}

function RenderDiagram({ subscription }: { subscription: SubscriptionModel }) {
    const { organisations, products } = useContext(ApplicationContext);

    if (subscription.status !== "active" || !subscription.insync) {
        return null;
    }
    const header = (
        <h2>
            <FormattedMessage id="subscription.network_diagrams" />
        </h2>
    );
    const enrichedSubscription = enrichSubscription(subscription, organisations, products);
    if (subscription.product.product_type === "LightPath") {
        return (
            <div>
                {header}
                <EuiPanel hasShadow={false} paddingSize="l">
                    <ErrorBoundary
                        beforeCapture={(scope) => {
                            scope.setTag("component", "NetworkDiagram");
                        }}
                        fallback={() => <ErrorFallback componentName="NetworkDiagram" />}
                    >
                        <NetworkDiagram type="patchpanel" subscription={enrichedSubscription} />
                    </ErrorBoundary>
                </EuiPanel>
            </div>
        );
    } else {
        return null;
    }
}

export default RenderDiagram;
