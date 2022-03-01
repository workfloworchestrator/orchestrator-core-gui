import { EuiFlexGroup, EuiFlexItem, EuiSwitch } from "@elastic/eui";
import { SubscriptionDetailSection } from "components/subscriptionDetail/SubscriptionDetailSection";
import React, { useContext, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import ApplicationContext from "utils/ApplicationContext";
import { organisationNameByUuid, renderDate, renderDateTime } from "utils/Lookups";
import {
    Product,
    SubscriptionModel,
    SubscriptionProcesses,
    SubscriptionWithDetails,
    WorkflowReasons,
} from "utils/types";
import { applyIdNamingConvention, isEmpty, stop } from "utils/Utils";

import CheckBox from "../CheckBox";

let create_readable_description = function (wf: any): object {
    if ("unterminated_parents" in wf)
        return { action: wf.action, unterminated_parents: wf.unterminated_parents.join(", ") };
    return wf as any;
};

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
                        workflows.terminate
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((wf, index: number) => (
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
                                        {wf.reason && wf.reason === "subscription.no_modify_parent_subscription" && (
                                            <em className="error">
                                                <FormattedMessage
                                                    id={wf.reason}
                                                    values={create_readable_description(wf) as any}
                                                />
                                            </em>
                                        )}
                                        {wf.reason && wf.reason !== "subscription.no_modify_parent_subscription" && (
                                            <em className="error">
                                                <FormattedMessage id={wf.reason} values={wf as any}></FormattedMessage>
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
                        workflows.modify
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((wf, index: number) => (
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
                                        {wf.reason && wf.reason === "subscription.no_modify_parent_subscription" && (
                                            <em className="error">
                                                <FormattedMessage
                                                    id={wf.reason}
                                                    values={create_readable_description(wf) as any}
                                                />
                                            </em>
                                        )}
                                        {wf.reason && wf.reason !== "subscription.no_modify_parent_subscription" && (
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
                        workflows.system
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((wf, index: number) => (
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

export function RenderFixedInputs({ product }: { product?: Product }) {
    if (!product || !product.fixed_inputs.length) {
        return null;
    }
    return (
        <SubscriptionDetailSection
            name={<FormattedMessage id="subscriptions.fixedInputs" />}
            className="subscription-fixed-inputs"
        >
            <table className="detail-block">
                <thead />
                <tbody>
                    {product.fixed_inputs
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((fi, index) => (
                            <tr key={index}>
                                <td id={`${applyIdNamingConvention(fi.name)}-k`}>{fi.name}</td>
                                <td id={`${applyIdNamingConvention(fi.name)}-v`}>{fi.value}</td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </SubscriptionDetailSection>
    );
}

export function RenderProduct({ product }: { product?: Product }) {
    if (!product) {
        return null;
    }
    return (
        <SubscriptionDetailSection
            name={<FormattedMessage id="subscription.product_title" />}
            className="subscription-product-information"
        >
            <table className="detail-block">
                <thead />
                <tbody>
                    <tr>
                        <td id="sub-prod-name-k">
                            <FormattedMessage id="subscription.product.name" />
                        </td>
                        <td id="sub-prod-name-v">
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={`/metadata/product/${product.product_id}`}
                            >
                                {product.name || ""}
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td id="description-k">
                            <FormattedMessage id="subscription.product.description" />
                        </td>
                        <td id="description-v">{product.description}</td>
                    </tr>
                    <tr>
                        <td id="product-type-k">
                            <FormattedMessage id="subscription.product.product_type" />
                        </td>
                        <td id="product-type-v">{product.product_type}</td>
                    </tr>
                    <tr>
                        <td id="tag-k">
                            <FormattedMessage id="subscription.product.tag" />
                        </td>
                        <td id="tag-v">{product.tag || ""}</td>
                    </tr>
                    <tr>
                        <td id="status-k">
                            <FormattedMessage id="subscription.product.status" />
                        </td>
                        <td id="status-v">{product.status || ""}</td>
                    </tr>
                    <tr>
                        <td id="created-k">
                            <FormattedMessage id="subscription.product.created" />
                        </td>
                        <td id="created-v">{renderDateTime(product.created_at)}</td>
                    </tr>
                    <tr>
                        <td id="end-date-k">
                            <FormattedMessage id="subscription.product.end_date" />
                        </td>
                        <td id="end-date-v">{renderDateTime(product.end_date)}</td>
                    </tr>
                </tbody>
            </table>
        </SubscriptionDetailSection>
    );
}

export function RenderProcesses({ subscriptionProcesses }: { subscriptionProcesses: SubscriptionProcesses[] }) {
    const columns = ["target", "name", "id", "status", "started_at", "modified_at"];

    const th = (index: number) => {
        const name = columns[index];
        return (
            <th key={index} className={name}>
                <span>
                    <FormattedMessage id={`subscription.process.${name}`} />
                </span>
            </th>
        );
    };

    subscriptionProcesses = subscriptionProcesses.filter((sp) => !sp.process.is_task);

    return (
        <SubscriptionDetailSection
            name={<FormattedMessage id="subscription.process_link" />}
            className="subscription-processes"
        >
            <table className="processes">
                <thead>
                    <tr>{columns.map((column, index) => th(index))}</tr>
                </thead>
                <tbody>
                    {subscriptionProcesses.map((ps, index) => (
                        <tr key={index}>
                            <td>{ps.workflow_target}</td>
                            <td>{ps.process.workflow}</td>
                            <td>
                                <a target="_blank" rel="noopener noreferrer" href={`/processes/${ps.pid}`}>
                                    {ps.pid}
                                </a>
                            </td>
                            <td>{ps.process.last_status}</td>
                            <td>{renderDateTime(ps.process.started_at)}</td>
                            <td>{renderDateTime(ps.process.last_modified_at)}</td>
                        </tr>
                    ))}
                    {isEmpty(subscriptionProcesses) && (
                        <tr>
                            <td colSpan={3}>
                                <span className="no_process_link">
                                    <FormattedMessage id="subscription.no_process_link_text" />
                                </span>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </SubscriptionDetailSection>
    );
}

export function RenderSubscriptions({ parentSubscriptions }: { parentSubscriptions?: SubscriptionWithDetails[] }) {
    const intl = useIntl();
    const [filterTerminated, setFilterTerminated] = useState(true);

    if (!parentSubscriptions || parentSubscriptions.length === 0) {
        return null;
    }

    const filteredSubscriptions = filterTerminated
        ? parentSubscriptions?.filter((subscription) => subscription.status !== "terminated")
        : parentSubscriptions;

    const columns = [
        "customer_name",
        "subscription_id",
        "description",
        "insync",
        "product_name",
        "status",
        "product_tag",
        "start_date",
    ];
    const th = (index: number) => {
        const name = columns[index];
        return (
            <th key={index} className={name}>
                <span>
                    <FormattedMessage id={`subscriptions.${name}`} />
                </span>
            </th>
        );
    };
    return (
        <SubscriptionDetailSection
            name={
                <EuiFlexGroup justifyContent="spaceBetween">
                    <EuiFlexItem grow={false}>
                        <FormattedMessage id="subscription.in_use_by_subscriptions" />
                    </EuiFlexItem>
                    <EuiFlexItem>
                        <EuiSwitch
                            label={<FormattedMessage id="subscription.toggle_hide_dependent_subscriptions" />}
                            checked={filterTerminated}
                            onChange={(e) => {
                                setFilterTerminated(e.target.checked);
                            }}
                        />
                    </EuiFlexItem>
                </EuiFlexGroup>
            }
            className="subscription-parent-subscriptions"
        >
            <table className="subscriptions">
                <thead>
                    <tr>{columns.map((column, index) => th(index))}</tr>
                </thead>
                <tbody>
                    {filteredSubscriptions.map((subscription: SubscriptionWithDetails, index: number) => (
                        <tr key={index}>
                            <td
                                data-label={intl.formatMessage({ id: "subscriptions.customer_name" })}
                                className="customer_name"
                            >
                                {subscription.customer_name}
                            </td>
                            <td
                                data-label={intl.formatMessage({ id: "subscriptions.subscription_id" })}
                                className="subscription_id"
                            >
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={`/subscriptions/${subscription.subscription_id}`}
                                >
                                    {subscription.subscription_id.substring(0, 8)}
                                </a>
                            </td>
                            <td
                                data-label={intl.formatMessage({ id: "subscriptions.description" })}
                                className="description"
                            >
                                {subscription.description}
                            </td>
                            <td data-label={intl.formatMessage({ id: "subscriptions.insync" })} className="insync">
                                <CheckBox value={subscription.insync} name="insync" readOnly={true} />
                            </td>
                            <td
                                data-label={intl.formatMessage({ id: "subscriptions.product_name" })}
                                className="product_name"
                            >
                                {subscription.product.name}
                            </td>
                            <td data-label={intl.formatMessage({ id: "subscriptions.status" })} className="status">
                                {subscription.status}
                            </td>
                            <td data-label={intl.formatMessage({ id: "subscriptions.product_tag" })} className="tag">
                                {subscription.product.tag}
                            </td>
                            <td
                                data-label={intl.formatMessage({ id: "subscriptions.start_date_epoch" })}
                                className="start_date_epoch"
                            >
                                {renderDate(subscription.start_date)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </SubscriptionDetailSection>
    );
}
