import { SubscriptionDetailSection } from "components/subscriptionDetail/SubscriptionDetailSection";
import { ENV } from "env";
import React from "react";
import { FormattedMessage } from "react-intl";
import { SubscriptionModel } from "utils/types";

function getGrafanaLink(subscription: SubscriptionModel) {
    let link = `https://grafana.surf.net/d/v6yLvaQmk/surfnet8-subscription-id?orgId=1&refresh=30s&var-datasource=SURFnet-Subscriptions&var-measurement=NetworkMeasurements_bps_5min&var-subid=${subscription.subscription_id}`;
    if (
        (subscription.product.product_type === "Port" ||
            subscription.product.product_type === "LightPath" ||
            subscription.product.product_type === "IP" ||
            subscription.product.product_type === "L2VPN" ||
            subscription.product.product_type === "Firewall" ||
            subscription.product.product_type === "Node") &&
        subscription.product.tag !== "MSC"
    ) {
        if (subscription.product.product_type === "Node") {
            const node_name = subscription.description.split(" ").slice(-1);
            link = `https://grafana.surf.net/d/000000020/?&var-Hostname=${node_name}.dcn.surf.net`;
        }
        return link;
    }
    return null;
}

function getNetworkDashboardLink(subscription: SubscriptionModel) {
    if (
        subscription.product.product_type === "Port" ||
        subscription.product.product_type === "LightPath" ||
        subscription.product.product_type === "IP" ||
        subscription.product.product_type === "L2VPN" ||
        subscription.product.product_type === "Firewall"
    ) {
        return `${ENV.NETWORKDASHBOARD_URL}/subscription/${subscription.subscription_id}`;
    }
    return null;
}

function RenderExternalLinks({ subscription }: { subscription: SubscriptionModel }) {
    const grafanaLink = getGrafanaLink(subscription);
    const networkDashboarLink = getNetworkDashboardLink(subscription);
    return (
        <SubscriptionDetailSection
            name={<FormattedMessage id="subscription.external_links" />}
            className="subscription-external-links"
        >
            <table className="detail-block">
                <thead />
                <tbody>
                    {grafanaLink && (
                        <tr>
                            <td id="subscriptions-stats_in_grafana-k">
                                <FormattedMessage id="subscriptions.stats_in_grafana" />
                            </td>
                            <td id="subscriptions-stats_in_grafana-v">
                                <a href={`${grafanaLink}`} target="_blank" rel="noopener noreferrer">
                                    <FormattedMessage id="subscriptions.go_to_grafana" />
                                </a>
                            </td>
                        </tr>
                    )}
                    {networkDashboarLink && (
                        <tr>
                            <td id="subscriptions-in_networkdashboard-k">
                                <FormattedMessage id="subscriptions.networkdashboard_url" />
                            </td>
                            <td id="subscriptions-in_networkdashboard-v">
                                <a href={networkDashboarLink} target="_blank" rel="noopener noreferrer">
                                    <FormattedMessage id="subscriptions.go_to_networkdashboard_url" />
                                </a>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </SubscriptionDetailSection>
    );
}
export default RenderExternalLinks;
