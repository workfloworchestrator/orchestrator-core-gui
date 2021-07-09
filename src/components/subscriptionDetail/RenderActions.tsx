import { SubscriptionDetailSection } from "components/subscriptionDetail/SubscriptionDetailSection";
import React, { useContext } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import ApplicationContext from "utils/ApplicationContext";
import { organisationNameByUuid } from "utils/Lookups";
import { SubscriptionModel, WorkflowReasons } from "utils/types";
import { isEmpty, stop } from "utils/Utils";

export function RenderActions({
    subscription,
    workflows,
    confirmation,
}: {
    subscription: SubscriptionModel;
    workflows: WorkflowReasons;
    confirmation?: (message: string, callback: () => void) => void;
}) {
    const intl = useIntl();
    const { organisations, redirect, allowed } = useContext(ApplicationContext);

    if (!confirmation) {
        return null;
    }

    const terminate = (e: React.MouseEvent<HTMLElement>) => {
        stop(e);

        confirmation(
            intl.formatMessage(
                { id: "subscription.terminateConfirmation" },
                {
                    name: subscription.product.name,
                    customer: organisationNameByUuid(subscription.customer_id, organisations),
                }
            ),
            () => redirect(`/terminate-subscription?subscription=${subscription.subscription_id}`)
        );
    };

    const modify = (workflow_name: string) => (e: React.MouseEvent<HTMLElement>) => {
        stop(e);

        const change = intl.formatMessage({ id: `workflow.${workflow_name}` }).toLowerCase();
        confirmation(
            intl.formatMessage(
                { id: "subscription.modifyConfirmation" },
                {
                    name: subscription.product.name,
                    customer: organisationNameByUuid(subscription.customer_id, organisations),
                    change: change,
                }
            ),
            () =>
                redirect(`/modify-subscription?workflow=${workflow_name}&subscription=${subscription.subscription_id}`)
        );
    };

    return (
        <SubscriptionDetailSection
            name={<FormattedMessage id="subscription.actions" />}
            className="subscription-actions"
        >
            <table className="detail-block">
                <thead />
                <tbody>
                    {allowed("/orchestrator/subscriptions/terminate/" + subscription.subscription_id + "/") &&
                        workflows.terminate.map((wf, index: number) => (
                            <tr key={index}>
                                <td id={`${index}-k`}>
                                    {!wf.reason && (
                                        <a id="terminate-link" href="/modify" key={wf.name} onClick={terminate}>
                                            <FormattedMessage id="subscription.terminate" />
                                        </a>
                                    )}
                                    {wf.reason && (
                                        <span>
                                            <FormattedMessage id="subscription.terminate" />
                                        </span>
                                    )}
                                </td>
                                <td id={`${index}-v`}>
                                    {wf.reason && (
                                        <em className="error">
                                            <FormattedMessage id={wf.reason} values={wf as any} />
                                        </em>
                                    )}
                                </td>
                            </tr>
                        ))}
                    {isEmpty(workflows.terminate) && (
                        <tr>
                            <td>
                                <em className="error">
                                    <FormattedMessage id="subscription.no_termination_workflow" />
                                </em>
                            </td>
                        </tr>
                    )}
                    {allowed("/orchestrator/subscriptions/modify/" + subscription.subscription_id + "/") &&
                        workflows.modify.map((wf, index: number) => (
                            <tr key={index}>
                                <td>
                                    {!wf.reason && (
                                        <a
                                            id={`modify-link-${wf.name.replace(/_/g, "-")}`}
                                            href="/modify"
                                            key={wf.name}
                                            onClick={modify(wf.name)}
                                        >
                                            <FormattedMessage id={`workflow.${wf.name}`} />
                                        </a>
                                    )}
                                    {wf.reason && (
                                        <span>
                                            <FormattedMessage id={`workflow.${wf.name}`} />
                                        </span>
                                    )}
                                </td>
                                <td>
                                    {wf.reason && (
                                        <em className="error">
                                            <FormattedMessage id={wf.reason} values={wf as any} />
                                        </em>
                                    )}
                                </td>
                            </tr>
                        ))}
                    {isEmpty(workflows.modify) && (
                        <tr>
                            <td>
                                <em className="error">
                                    <FormattedMessage id="subscription.no_modify_workflow" />
                                </em>
                            </td>
                        </tr>
                    )}
                    {allowed("/orchestrator/subscriptions/validate/" + subscription.subscription_id + "/") &&
                        workflows.system.map((wf, index: number) => (
                            <tr key={index}>
                                <td>
                                    {!wf.reason && (
                                        <a
                                            id={`validate-link-${wf.name.replace(/_/g, "-")}`}
                                            href="/modify"
                                            key={wf.name}
                                            onClick={modify(wf.name)}
                                        >
                                            <FormattedMessage id={`workflow.${wf.name}`} />
                                        </a>
                                    )}
                                    {wf.reason && (
                                        <span>
                                            <FormattedMessage id={`workflow.${wf.name}`} />
                                        </span>
                                    )}
                                </td>
                                <td>
                                    {wf.reason && (
                                        <em className="error">
                                            <FormattedMessage id={wf.reason} values={wf as any} />
                                        </em>
                                    )}
                                </td>
                            </tr>
                        ))}
                    {isEmpty(workflows.system) && (
                        <tr>
                            <td>
                                <em className="error">
                                    <FormattedMessage id="subscription.no_validate_workflow" />
                                </em>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </SubscriptionDetailSection>
    );
}
