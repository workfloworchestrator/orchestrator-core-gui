/*
 * Copyright 2019-2020 SURF.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import "./SubscriptionDetail.scss";

import { EuiFlexGroup, EuiFlexItem, EuiSwitch } from "@elastic/eui";
import {
    dienstafnameBySubscription,
    parentSubscriptions,
    processSubscriptionsBySubscriptionId,
    productById,
    subscriptionWorkflows,
    subscriptionsDetailWithModel,
} from "api";
import CheckBox from "components/CheckBox";
import NetworkDiagram from "components/Diagram";
import SubscriptionDetails from "components/subscriptionDetail/SubscriptionDetails";
import SubscriptionInstance from "components/subscriptionDetail/SubscriptionInstance";
import TopologyDiagram from "components/TopologyDiagram";
import { isArray } from "lodash";
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import ApplicationContext from "utils/ApplicationContext";
import { enrichSubscription, organisationNameByUuid, renderDate, renderDateTime } from "utils/Lookups";
import {
    Dienstafname,
    Product,
    Subscription,
    SubscriptionModel,
    SubscriptionProcesses,
    SubscriptionWithDetails,
    WorkflowReasons,
} from "utils/types";
import { applyIdNamingConvention, isEmpty, stop } from "utils/Utils";

interface IProps {
    subscriptionId: string;
    confirmation?: (question: string, action: (e: React.MouseEvent) => void) => void;
}

function SubscriptionDetailSection({
    name,
    children,
    className = "",
}: React.PropsWithChildren<{
    name: React.ReactNode;
    className?: string;
}>) {
    return (
        <section className="details">
            <h2>{name}</h2>
            <div className={className}>{children}</div>
        </section>
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
                <NetworkDiagram type="patchpanel" subscription={enrichedSubscription} />
            </div>
        );
    } else if (["L2VPN", "IP"].includes(subscription.product.product_type)) {
        return (
            <div>
                {header}
                <TopologyDiagram subscription={subscription} />
            </div>
        );
    } else {
        return null;
    }
}

function RenderDienstafname({ dienstafname }: { dienstafname?: Dienstafname }) {
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

function RenderFixedInputs({ product }: { product?: Product }) {
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

function RenderActions({
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

function RenderProduct({ product }: { product?: Product }) {
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
                            <a target="_blank" rel="noopener noreferrer" href={`/product/${product.product_id}`}>
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

function RenderProcesses({ subscriptionProcesses }: { subscriptionProcesses: SubscriptionProcesses[] }) {
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

function RenderSubscriptions({ parentSubscriptions }: { parentSubscriptions?: SubscriptionWithDetails[] }) {
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
                        <FormattedMessage id="subscription.parent_subscriptions" />
                    </EuiFlexItem>
                    <EuiFlexItem>
                        <EuiSwitch
                            label={<FormattedMessage id="subscription.toggle_hide_child_subscriptions" />}
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

function SubscriptionDetail({ subscriptionId, confirmation }: IProps) {
    const { organisations, products } = useContext(ApplicationContext);

    const [subscription, setSubscription] = useState<SubscriptionModel>();
    const [product, setProduct] = useState<Product>();
    const [subscriptionProcesses, setSubscriptionProcesses] = useState<SubscriptionProcesses[]>();
    const [notFound, setNotFound] = useState(false);
    const [workflows, setWorkflows] = useState<WorkflowReasons>();
    const [enrichedParentSubscriptions, setEnrichedParentSubscriptions] = useState<SubscriptionWithDetails[]>();
    const [dienstafname, setDienstafname] = useState<Dienstafname>();

    useEffect(() => {
        const promises = [
            subscriptionsDetailWithModel(subscriptionId).then((subscription) => {
                subscription.product_id = subscription.product.product_id;
                setSubscription(enrichSubscription(subscription, organisations, products));
                productById(subscription.product_id).then(setProduct);
            }),
            processSubscriptionsBySubscriptionId(subscriptionId).then(setSubscriptionProcesses),
            subscriptionWorkflows(subscriptionId).then(setWorkflows),
            parentSubscriptions(subscriptionId).then((parentSubscriptions) => {
                // Enrich parent subscriptions
                const enrichedParentSubscriptions = parentSubscriptions.map((sub: Subscription) =>
                    enrichSubscription(sub, organisations, products)
                );
                setEnrichedParentSubscriptions(enrichedParentSubscriptions);
            }),
            dienstafnameBySubscription(subscriptionId).then(setDienstafname),
        ];

        Promise.all(promises).catch((err) => {
            if (err.response && err.response.status === 404) {
                setNotFound(true);
            } else {
                throw err;
            }
        });
    }, [subscriptionId, organisations, products]);

    if (notFound) {
        return (
            <h2>
                <FormattedMessage id="subscription.notFound" />
            </h2>
        );
    } else if (!subscription || !workflows || !subscriptionProcesses || !enrichedParentSubscriptions) {
        return null;
    }

    const subscription_instances = Object.entries(subscription)
        .filter(
            (entry) =>
                typeof entry[1] === "object" &&
                !["product", "customer_descriptions"].includes(entry[0]) &&
                entry[1] !== null
        )
        .flatMap((entry) => (isArray(entry[1]) ? entry[1].map((value: any) => [entry[0], value]) : [entry]));

    return (
        <div className="mod-subscription-detail">
            <SubscriptionDetailSection
                name={<FormattedMessage id="subscription.subscription_title" />}
                className="subscription-details"
            >
                <SubscriptionDetails
                    subscription={subscription}
                    subscriptionProcesses={subscriptionProcesses}
                ></SubscriptionDetails>
            </SubscriptionDetailSection>

            <RenderDiagram subscription={subscription} />
            <RenderDienstafname dienstafname={dienstafname} />
            <RenderFixedInputs product={product} />

            {subscription_instances && (
                <SubscriptionDetailSection
                    name={<FormattedMessage id="subscriptions.productBlocks" />}
                    className="subscription-product-blocks"
                >
                    {subscription_instances.map((entry, index) => (
                        <SubscriptionInstance
                            //@ts-ignore
                            key={index}
                            subscription_instance={entry[1]}
                            field_name={entry[0]}
                        />
                    ))}
                </SubscriptionDetailSection>
            )}

            <RenderActions subscription={subscription} workflows={workflows} confirmation={confirmation} />
            <RenderProduct product={product} />
            <RenderProcesses subscriptionProcesses={subscriptionProcesses} />
            <RenderSubscriptions parentSubscriptions={enrichedParentSubscriptions} />
        </div>
    );
}

export default SubscriptionDetail;
