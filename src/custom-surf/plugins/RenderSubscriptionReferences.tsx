import { EuiCallOut, EuiSpacer } from "@elastic/eui";
import { SubscriptionDetailSection } from "components/subscriptionDetail/SubscriptionDetailSection";
import React, { useContext } from "react";
import { FormattedMessage } from "react-intl";
import { useQuery } from "react-query";
import ApplicationContext from "utils/ApplicationContext";
import { SubscriptionModel } from "utils/types";

interface ISubscriptionReference {
    name: string;
    external_id: string;
}

interface ISubscriptionReferences {
    references?: ISubscriptionReference[];
    permissions?: string[];
}

const RenderSubscriptionMetadata = ({ metadata }: { metadata?: ISubscriptionReferences }) => {
    const { theme } = useContext(ApplicationContext);
    const references = metadata?.references ?? [];
    const customerPermissions = metadata?.permissions ?? [];

    const externalIdsData = [...references.map(({ name, external_id }) => `${name} : ${external_id}`)];

    if (externalIdsData.length + customerPermissions.length === 0) {
        return (
            <div>
                <EuiSpacer />
                <EuiCallOut size="m" title="No subscription references/permissions found." iconType="alert" />
            </div>
        );
    }
    return (
        <table className="detail-block">
            <thead />
            <tbody>
                {externalIdsData.map((s, i) => (
                    <tr key={`external-service-id-${i}`} className={theme}>
                        <td>{i === 0 ? "Third party service ids" : ""}</td>
                        <td>{s}</td>
                    </tr>
                ))}
                {customerPermissions.map((customerId, i) => (
                    <tr key={`customer-permission-${i}`} className={theme}>
                        <td>{i === 0 ? "Institutes granted viewing permission" : ""}</td>
                        <td>{customerId}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const RenderSubscriptionReferences = ({ subscription }: { subscription: SubscriptionModel }): JSX.Element | null => {
    const { apiClient } = useContext(ApplicationContext);
    const subscriptionId = subscription.subscription_id;

    const { isLoading, error, data } = useQuery({
        queryKey: ["subscription-metadata", { id: subscriptionId }],
        queryFn: () => apiClient.subscriptionMetadata(subscriptionId),
    });

    if (isLoading || error) {
        return null;
    }

    return (
        <div className="mod-subscription-detail">
            <SubscriptionDetailSection
                name={<FormattedMessage id="subscriptions.referencesAndPermissions" />}
                className="subscription-metadata"
            >
                <RenderSubscriptionMetadata metadata={data} />
            </SubscriptionDetailSection>
        </div>
    );
};

export default RenderSubscriptionReferences;
