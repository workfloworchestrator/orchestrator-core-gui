import { SubscriptionDetailSection } from "components/subscriptionDetail/SubscriptionDetailSection";
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import ApplicationContext from "utils/ApplicationContext";
import { SubscriptionModel } from "utils/types";

function RenderDienstafname({ subscription }: { subscription: SubscriptionModel }) {
    const { customApiClient } = useContext(ApplicationContext);

    const [dienstafname, setDienstafname] = useState<any>(null);

    useEffect(() => {
        customApiClient
            .dienstafnameBySubscription(subscription.subscriptionId)
            .then((dienstafname) => setDienstafname(dienstafname));
    });

    if (!dienstafname) {
        return null;
    }

    return (
        <SubscriptionDetailSection
            name={<FormattedMessage id="subscriptions.dienstafname" />}
            className="subscription-service"
        >
            <table className={"detail-block"}>
                <thead />
                <tbody>
                    <tr>
                        <td>
                            <FormattedMessage id="subscriptions.dienstafnameGuid" />
                        </td>
                        <td>{dienstafname.guid}</td>
                    </tr>
                    <tr>
                        <td>
                            <FormattedMessage id="subscriptions.dienstafnameCode" />
                        </td>
                        <td>{dienstafname.code}</td>
                    </tr>
                    <tr>
                        <td>
                            <FormattedMessage id="subscriptions.dienstafnameStatus" />
                        </td>
                        <td>{dienstafname.status}</td>
                    </tr>
                </tbody>
            </table>
        </SubscriptionDetailSection>
    );
}

export default RenderDienstafname;
