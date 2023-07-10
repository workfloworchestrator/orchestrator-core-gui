import { EuiCallOut, EuiSpacer } from "@elastic/eui";
import { SubscriptionDetailSection } from "components/subscriptionDetail/SubscriptionDetailSection";
import React, { useContext } from "react";
import { FormattedMessage } from "react-intl";
import { useQuery } from "react-query";
import ApplicationContext from "utils/ApplicationContext";
import { organisationNameByUuid } from "utils/Lookups";
import { SubscriptionModel } from "utils/types";

interface IExternalServiceId {
    customer_id: string;
    third_party_service_id: string;
}

interface IFreeformExternalServiceId {
    customer_name: string;
    third_party_service_id: string;
}

interface ISubscriptionReferences {
    external_service_ids?: IExternalServiceId[];
    freeform_external_service_ids?: IFreeformExternalServiceId[];
    customer_permissions?: string[];
}

const RenderSubscriptionMetadata = ({ metadata }: { metadata?: ISubscriptionReferences }) => {
    const { theme, organisations } = useContext(ApplicationContext);
    const externalServiceIds = metadata?.external_service_ids ?? [];
    const freeformExternalServiceIds = metadata?.freeform_external_service_ids ?? [];
    const customerPermissions = metadata?.customer_permissions ?? [];

    const externalIdsData = [
        ...externalServiceIds.map(
            ({ customer_id, third_party_service_id }) =>
                `${organisationNameByUuid(customer_id, organisations)} : ${third_party_service_id}`
        ),
        ...freeformExternalServiceIds.map(
            ({ customer_name, third_party_service_id }) => `${customer_name} : ${third_party_service_id}`
        ),
    ];

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
