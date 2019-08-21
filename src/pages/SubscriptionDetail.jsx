import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import {
    getResourceTypeInfo,
    parentSubscriptions,
    portByImsPortId,
    portByImsServiceId,
    processSubscriptionsBySubscriptionId,
    productById,
    subscriptionWorkflows,
    serviceByImsServiceId,
    subscriptionsDetail,
    internalPortByImsPortId
} from "../api";
import { enrichSubscription, ipamStates, organisationNameByUuid, renderDate, renderDateTime } from "../utils/Lookups";
import CheckBox from "../components/CheckBox";
import { isEmpty, stop } from "../utils/Utils";
import { absent, ims_circuit_id, nms_service_id, subscriptionInstanceValues } from "../validations/Subscriptions";
import ConfirmationDialog from "../components/ConfirmationDialog";
import ApplicationContext from "../utils/ApplicationContext";

import "./SubscriptionDetail.scss";
import { startProcess } from "../api/index";

export default class SubscriptionDetail extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            subscription: { instances: [] },
            product: { fixed_inputs: [], workflows: [] },
            subscriptionProcesses: [],
            imsServices: [],
            imsEndpoints: [],
            ipamPrefixes: [],
            subscriptions: [],
            notFound: false,
            loaded: false,
            loadedAllRelatedObjects: false,
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this,
            confirm: () => this,
            confirmationDialogQuestion: "",
            notFoundRelatedObjects: [],
            collapsedObjects: [],
            workflows: { terminate: [], modify: [] }
        };
    }

    componentWillMount = () => {
        const subscriptionId = this.props.subscriptionId ? this.props.subscriptionId : this.props.match.params.id;
        this.refreshSubscription(subscriptionId);
    };

    refreshSubscription(subscriptionId) {
        const { organisations, products } = this.context;
        subscriptionsDetail(subscriptionId)
            .then(subscription => {
                enrichSubscription(subscription, organisations, products);
                const values = subscriptionInstanceValues(subscription);
                this.setState({ subscription: subscription, loaded: true });
                const promises = [
                    processSubscriptionsBySubscriptionId(subscription.subscription_id),
                    productById(subscription.product_id),
                    subscriptionWorkflows(subscription.subscription_id),
                    //add the parent subscriptions where this subscription is used
                    parentSubscriptions(subscription.subscription_id)
                ]
                    // Add child subscriptions and other external resources
                    .concat(values.map(val => getResourceTypeInfo(val.resource_type.resource_type, val.value)));

                Promise.all(promises).then(result => {
                    const relatedObjects = result.slice(4);
                    const notFoundRelatedObjects = relatedObjects.filter(obj => obj.type === absent);

                    let childSubscriptions = relatedObjects
                        .filter(
                            obj =>
                                obj.type === "port_subscription_id" ||
                                obj.type === "ip_prefix_subscription_id" ||
                                obj.type === "internetpinnen_prefix_subscription_id" ||
                                obj.type === "parent_ip_prefix_subscription_id" ||
                                obj.type === "node_subscription_id"
                        )
                        .map(obj => obj.json);

                    // Enrich parent subscriptions
                    let parentSubscriptions = result[3].json;
                    parentSubscriptions.forEach(sub => enrichSubscription(sub, organisations, products));

                    const allImsServices = relatedObjects
                        .filter(
                            obj =>
                                obj.type === "ims_circuit_id" ||
                                obj.type === "ims_corelink_trunk_id" ||
                                obj.type === "ims_port_id"
                        )
                        .map(obj => obj.json);

                    // There are service duplicates for port_id and circuit_id
                    const imsServices = allImsServices.filter((item, i, ar) => ar.indexOf(item) === i);

                    const ipamPrefixes = relatedObjects
                        .filter(
                            obj =>
                                obj.type === "ptp_ipv4_ipam_id" ||
                                obj.type === "ptp_ipv6_ipam_id" ||
                                obj.type === "ipam_prefix_id"
                        )
                        .map(obj => obj.json);

                    const ipamAddresses = relatedObjects
                        .filter(obj => obj.type === "node_ipv4_ipam_id" || obj.type === "node_ipv6_ipam_id")
                        .map(obj => obj.json);

                    this.setState({
                        subscriptionProcesses: result[0],
                        product: result[1],
                        workflows: result[2],
                        imsServices: imsServices,
                        ipamPrefixes: ipamPrefixes,
                        ipamAddresses: ipamAddresses,
                        childSubscriptions: childSubscriptions,
                        parentSubscriptions: parentSubscriptions,
                        notFoundRelatedObjects: notFoundRelatedObjects,
                        loadedAllRelatedObjects: true
                    });

                    const uniquePortPromises = imsServices
                        .map(resource =>
                            (resource.endpoints || []).map(async endpoint => {
                                if (endpoint.type === "service") {
                                    // Fix for https://app.asana.com/0/483691603643478/819968465785951/f
                                    // Todo: handle this in redux or refactor? -> seems like a noop to wait for an result
                                    const service = await serviceByImsServiceId(endpoint.id).then(result =>
                                        Object.assign(result, {
                                            serviceId: endpoint.id,
                                            endpointType: "trunk"
                                        })
                                    );
                                    if (service.speed === "TG") {
                                        return service;
                                    }
                                    return portByImsServiceId(endpoint.id).then(result =>
                                        Object.assign(result, {
                                            serviceId: endpoint.id,
                                            endpointType: endpoint.type
                                        })
                                    );
                                } else if (endpoint.type === "port") {
                                    return portByImsPortId(endpoint.id).then(result =>
                                        Object.assign(result, {
                                            serviceId: endpoint.id,
                                            endpointType: endpoint.type
                                        })
                                    );
                                } else if (endpoint.type === "internal_port") {
                                    return internalPortByImsPortId(endpoint.id).then(result =>
                                        Object.assign(result, {
                                            serviceId: endpoint.id,
                                            endpointType: endpoint.type
                                        })
                                    );
                                } else {
                                    // Todo: Refactor this stuff, couldn't reach this else during my tests...
                                    return serviceByImsServiceId(endpoint.id).then(result =>
                                        Object.assign(result, {
                                            serviceId: endpoint.id,
                                            endpointType: endpoint.type
                                        })
                                    );
                                }
                            })
                        )
                        .reduce((a, b) => a.concat(b), []);
                    Promise.all(uniquePortPromises).then(result => this.setState({ imsEndpoints: result }));
                });
            })
            .catch(err => {
                if (err.response && err.response.status === 404) {
                    this.setState({ notFound: true, loaded: true });
                } else {
                    throw err;
                }
            });
    }

    componentWillReceiveProps(nextProps) {
        const id = this.props.subscriptionId ? this.props.subscriptionId : this.props.match.params.id;
        const nextId = nextProps.subscriptionId ? nextProps.subscriptionId : nextProps.match.params.id;
        if (id !== nextId) {
            this.refreshSubscription(nextId);
            window.scrollTo(0, 0);
        }
    }

    terminate = subscription => e => {
        stop(e);
        this.confirmation(
            I18n.t("subscription.terminateConfirmation", {
                name: subscription.product_name,
                customer: subscription.customer_name
            }),
            () => this.context.redirect(`/terminate-subscription?subscription=${subscription.subscription_id}`)
        );
    };

    modify = (subscription, workflow_name) => e => {
        stop(e);
        const change = I18n.t(`subscription.modify_${workflow_name}`).toLowerCase();
        this.confirmation(
            I18n.t("subscription.modifyConfirmation", {
                name: subscription.product_name,
                customer: subscription.customer_name,
                change: change
            }),
            () =>
                startProcess(workflow_name, [{ subscription_id: subscription.subscription_id }]).then(() => {
                    this.context.redirect("/processes");
                })
        );
    };

    cancelConfirmation = () => this.setState({ confirmationDialogOpen: false });

    confirmation = (question, action) =>
        this.setState({
            confirmationDialogOpen: true,
            confirmationDialogQuestion: question,
            confirmationDialogAction: () => {
                this.cancelConfirmation();
                action();
            }
        });

    renderSubscriptionDetail = (subscription, index, className = "") => (
        <table className={`detail-block ${className}`} key={index}>
            <thead />
            <tbody>
                <tr>
                    <td>{I18n.t("subscriptions.id")}</td>
                    <td>
                        <a
                            href={`/subscription/${subscription.subscription_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {subscription.subscription_id}
                        </a>
                    </td>
                </tr>
                <tr>
                    <td>{I18n.t("subscriptions.name")}</td>
                    <td>{subscription.name}</td>
                </tr>
                <tr>
                    <td>{I18n.t("subscriptions.description")}</td>
                    <td>{subscription.description}</td>
                </tr>
                <tr>
                    <td>{I18n.t("subscriptions.start_date_epoch")}</td>
                    <td>{renderDate(subscription.start_date)}</td>
                </tr>
                <tr>
                    <td>{I18n.t("subscriptions.end_date_epoch")}</td>
                    <td>{renderDate(subscription.end_date)}</td>
                </tr>
                <tr>
                    <td>{I18n.t("subscriptions.status")}</td>
                    <td>{subscription.status}</td>
                </tr>
                <tr>
                    <td>{I18n.t("subscriptions.insync")}</td>
                    <td>
                        <CheckBox value={subscription.insync || false} readOnly={true} name="isync" />
                    </td>
                </tr>
                <tr>
                    <td>{I18n.t("subscriptions.customer_name")}</td>
                    <td>{subscription.customer_name || ""}</td>
                </tr>
                <tr>
                    <td>{I18n.t("subscriptions.customer_id")}</td>
                    <td>{subscription.customer_id}</td>
                </tr>
            </tbody>
        </table>
    );

    renderSubscriptions = (parentSubscriptions, subscription, organisations, products) => {
        if (isEmpty(parentSubscriptions)) {
            return null;
        }

        const values = subscriptionInstanceValues(this.state.subscription);
        const isLPSubscription = values.some(val => val.resource_type.resource_type === nms_service_id);
        if (isLPSubscription) {
            //child subscriptions are rendered in the product blocks
            return null;
        }
        const columns = [
            "customer_name",
            "subscription_id",
            "description",
            "insync",
            "product_name",
            "status",
            "product_tag",
            "start_date"
        ];
        const th = index => {
            const name = columns[index];
            return (
                <th key={index} className={name}>
                    <span>{I18n.t(`subscriptions.${name}`)}</span>
                </th>
            );
        };
        return (
            <section className="details">
                <h3>
                    {I18n.t("subscription.parent_subscriptions", {
                        product: subscription.description
                    })}
                </h3>
                <div className="form-container-parent">
                    <table className="subscriptions">
                        <thead>
                            <tr>{columns.map((column, index) => th(index))}</tr>
                        </thead>
                        <tbody>
                            {parentSubscriptions.map((subscription, index) => (
                                <tr key={index}>
                                    <td data-label={I18n.t("subscriptions.customer_name")} className="customer_name">
                                        {subscription.customer_name}
                                    </td>
                                    <td
                                        data-label={I18n.t("subscriptions.subscription_id")}
                                        className="subscription_id"
                                    >
                                        <a
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            href={`/subscription/${subscription.subscription_id}`}
                                        >
                                            {subscription.subscription_id.substring(0, 8)}
                                        </a>
                                    </td>
                                    <td data-label={I18n.t("subscriptions.description")} className="description">
                                        {subscription.description}
                                    </td>
                                    <td data-label={I18n.t("subscriptions.insync")} className="insync">
                                        <CheckBox value={subscription.insync} name="insync" readOnly={true} />
                                    </td>
                                    <td data-label={I18n.t("subscriptions.product_name")} className="product_name">
                                        {subscription.product_name}
                                    </td>
                                    <td data-label={I18n.t("subscriptions.status")} className="status">
                                        {subscription.status}
                                    </td>
                                    <td data-label={I18n.t("subscriptions.product_tag")} className="tag">
                                        {subscription.tag}
                                    </td>
                                    <td
                                        data-label={I18n.t("subscriptions.start_date_epoch")}
                                        className="start_date_epoch"
                                    >
                                        {renderDate(subscription.start_date)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        );
    };

    renderEndpointDetail = (endpoint, index) => (
        <tr>
            <td>
                {endpoint.endpointType !== "internet" && endpoint.endpointType !== "trunk"
                    ? I18n.t("subscription.ims_port.id", { id: endpoint.id })
                    : I18n.t("subscription.ims_service.id", { index: endpoint.id })}
            </td>
            <td>
                <table className="detail-block related-subscription" index={index}>
                    <thead />
                    <tbody>
                        {endpoint.endpointType !== "internet" && endpoint.endpointType !== "trunk"
                            ? [
                                  "connector_type",
                                  "fiber_type",
                                  "iface_type",
                                  "line_name",
                                  "location",
                                  "node",
                                  "patchposition",
                                  "port",
                                  "status"
                              ].map(attr => (
                                  <tr key={attr}>
                                      <td>{I18n.t(`subscription.ims_port.${attr}`)}</td>
                                      <td>{endpoint[attr]}</td>
                                  </tr>
                              ))
                            : ["name", "product", "speed", "status"].map(attr => (
                                  <tr key={attr}>
                                      <td>{I18n.t(`subscription.ims_service.${attr}`)}</td>
                                      <td>{endpoint[attr]}</td>
                                  </tr>
                              ))}
                    </tbody>
                </table>
            </td>
        </tr>
    );

    renderImsServiceDetail = (service, index, imsEndpoints, className = "") => (
        <table className={`detail-block ${className}`}>
            <thead />
            <tbody>
                <tr>
                    <td>{I18n.t("subscription.ims_service.identifier")}</td>
                    <td>{service.id}</td>
                </tr>
                <tr>
                    <td>{I18n.t("subscription.ims_service.customer")}</td>
                    <td>{organisationNameByUuid(service.customer_id, this.context.organisations)}</td>
                </tr>
                <tr>
                    <td>{I18n.t("subscription.ims_service.extra_info")}</td>
                    <td>{service.extra_info || ""}</td>
                </tr>
                <tr>
                    <td>{I18n.t("subscription.ims_service.name")}</td>
                    <td>{service.name || ""}</td>
                </tr>
                <tr>
                    <td>{I18n.t("subscription.ims_service.product")}</td>
                    <td>{service.product || ""}</td>
                </tr>
                <tr>
                    <td>{I18n.t("subscription.ims_service.speed")}</td>
                    <td>{service.speed || ""}</td>
                </tr>
                <tr>
                    <td>{I18n.t("subscription.ims_service.status")}</td>
                    <td>{service.status || ""}</td>
                </tr>
                <tr>
                    <td>{I18n.t("subscription.ims_service.order_id")}</td>
                    <td>{service.order_id || ""}</td>
                </tr>
                <tr>
                    <td>{I18n.t("subscription.ims_service.aliases")}</td>
                    <td>{(service.aliases || []).join(", ")}</td>
                </tr>
                <tr>
                    <td>{I18n.t("subscription.ims_service.endpoints")}</td>
                    <td>
                        {(service.endpoints || [])
                            .map(
                                endpoint =>
                                    `ID: ${endpoint.id}${endpoint.vlanranges ? " - " : ""}${(endpoint.vlanranges || [])
                                        .map(vlan => `VLAN: ${vlan.start} - ${vlan.end}`)
                                        .join(", ")}`
                            )
                            .join(", ")}
                    </td>
                </tr>
            </tbody>
            {imsEndpoints
                .filter(port => service.endpoints.map(endpoint => endpoint.id).includes(port.serviceId))
                .map((port, index) => this.renderEndpointDetail(port, index))}
        </table>
    );

    renderIpamAddress = (address, index, className = "") => {
        if (isEmpty(address)) {
            return null;
        }
        return (
            <table className={`detail-block ${className}`}>
                <thead />
                <tbody>
                    <tr>
                        <td>{I18n.t("ipam.assigned_address_id")}</td>
                        <td>{address.id}</td>
                    </tr>
                    <tr>
                        <td>{I18n.t("ipam.state")}</td>
                        <td>{ipamStates[address.state]}</td>
                    </tr>
                    <tr>
                        <td>{I18n.t("ipam.ipaddress")}</td>
                        <td>{address.address}</td>
                    </tr>
                    <tr>
                        <td>{I18n.t("ipam.fqdn")}</td>
                        <td>{address.fqdn}</td>
                    </tr>
                </tbody>
            </table>
        );
    };

    renderIpamPrefix = (prefix, index, className = "") => {
        if (isEmpty(prefix)) {
            return null;
        }
        return (
            <table className={`detail-block ${className}`}>
                <thead />
                <tbody>
                    <tr>
                        <td>{I18n.t("ipam.description")}</td>
                        <td>{prefix.description}</td>
                    </tr>
                    <tr>
                        <td>{I18n.t("ipam.prefix")}</td>
                        <td>{prefix.prefix}</td>
                    </tr>
                    <tr>
                        <td>{I18n.t("ipam.afi")}</td>
                        <td>{prefix.afi}</td>
                    </tr>
                    <tr>
                        <td>{I18n.t("ipam.asn")}</td>
                        <td>{prefix.asn}</td>
                    </tr>
                    {prefix.addresses &&
                        prefix.addresses.map((address, idx) => (
                            <React.Fragment>
                                <tr>
                                    <td>{I18n.t("ipam.assigned_address_id")}</td>
                                    <td>{address.id}</td>
                                </tr>
                                <tr>
                                    <td>{I18n.t("ipam.state")}</td>
                                    <td>{ipamStates[address.state]}</td>
                                </tr>
                                <tr>
                                    <td>{I18n.t("ipam.ipaddress")}</td>
                                    <td>{address.address}</td>
                                </tr>
                                <tr>
                                    <td>{I18n.t("ipam.fqdn")}</td>
                                    <td>{address.fqdn}</td>
                                </tr>
                            </React.Fragment>
                        ))}
                </tbody>
            </table>
        );
    };

    renderProduct = product => {
        if (isEmpty(product)) {
            return null;
        }
        return (
            <section className="details">
                <h3>{I18n.t("subscription.product_title")}</h3>
                <div className="form-container-parent">
                    <table className="detail-block">
                        <thead />
                        <tbody>
                            <tr>
                                <td>{I18n.t("subscription.product.name")}</td>
                                <td>
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={`/product/${product.product_id}`}
                                    >
                                        {product.name || ""}
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td>{I18n.t("subscription.product.description")}</td>
                                <td>{product.description}</td>
                            </tr>
                            <tr>
                                <td>{I18n.t("subscription.product.product_type")}</td>
                                <td>{product.product_type}</td>
                            </tr>
                            <tr>
                                <td>{I18n.t("subscription.product.tag")}</td>
                                <td>{product.tag || ""}</td>
                            </tr>
                            <tr>
                                <td>{I18n.t("subscription.product.status")}</td>
                                <td>{product.status || ""}</td>
                            </tr>
                            <tr>
                                <td>{I18n.t("subscription.product.created")}</td>
                                <td>{renderDateTime(product.created_at)}</td>
                            </tr>
                            <tr>
                                <td>{I18n.t("subscription.product.end_date")}</td>
                                <td>{renderDateTime(product.end_date)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        );
    };

    workflowByTarget = (product, target) => product.workflows.find(wf => wf.target === target);

    renderActions = (subscription, loadedAllRelatedObjects, notFoundRelatedObjects, workflows) => {
        if (!isEmpty(notFoundRelatedObjects)) {
            const noModifyReason = "subscription.no_modify_deleted_related_objects";
            workflows.terminate.map(wf => (wf.reason = noModifyReason));
            workflows.modify.map(wf => (wf.reason = noModifyReason));
        }

        return (
            <section className="details">
                <h3>{I18n.t("subscription.actions")}</h3>
                <div className="form-container-parent">
                    <table className="detail-block">
                        <thead />
                        <tbody>
                            {workflows.terminate.map((wf, index) => (
                                <tr key={index}>
                                    <td>
                                        {!wf.reason && (
                                            <a href="/modify" key={wf.name} onClick={this.terminate(subscription)}>
                                                {I18n.t(`subscription.terminate`)}
                                            </a>
                                        )}
                                        {wf.reason && <span>{I18n.t(`subscription.terminate`)}</span>}
                                    </td>
                                    <td>{wf.reason && <em className="error">{I18n.t(wf.reason, wf)}</em>}</td>
                                    {!loadedAllRelatedObjects && (
                                        <td>
                                            <section className="terminate-link-waiting">
                                                <em>{I18n.t("subscription.fetchingImsData")}</em>
                                                <i className="fa fa-refresh fa-spin fa-2x fa-fw" />
                                            </section>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {isEmpty(workflows.terminate) && (
                                <tr>
                                    <td>
                                        <em className="error">{I18n.t("subscription.no_termination_workflow")}</em>
                                    </td>
                                </tr>
                            )}
                            {workflows.modify.map((wf, index) => (
                                <tr key={index}>
                                    <td>
                                        {!wf.reason && (
                                            <a
                                                href="/modify"
                                                key={wf.name}
                                                onClick={this.modify(subscription, wf.name)}
                                            >
                                                {I18n.t(`subscription.modify_${wf.name}`)}
                                            </a>
                                        )}
                                        {wf.reason && <span>{I18n.t(`subscription.modify_${wf.name}`)}</span>}
                                    </td>
                                    <td>{wf.reason && <em className="error">{I18n.t(wf.reason, wf)}</em>}</td>

                                    {!loadedAllRelatedObjects && (
                                        <td>
                                            <section className="terminate-link-waiting">
                                                <em>{I18n.t("subscription.fetchingImsData")}</em>
                                                <i className="fa fa-refresh fa-spin fa-2x fa-fw" />
                                            </section>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {isEmpty(workflows.modify) && (
                                <tr>
                                    <td>
                                        <em className="error">{I18n.t("subscription.no_modify_workflow")}</em>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        );
    };

    renderProcesses = subscriptionProcesses => {
        const columns = ["target", "name", "id", "status", "started_at", "modified_at"];

        const th = index => {
            const name = columns[index];
            return (
                <th key={index} className={name}>
                    <span>{I18n.t(`subscription.process.${name}`)}</span>
                </th>
            );
        };

        return (
            <section className="details">
                <h3>{I18n.t("subscription.process_link")}</h3>
                <div className="form-container-parent">
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
                                        <a target="_blank" rel="noopener noreferrer" href={`/process/${ps.pid}`}>
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
                                    <td colSpan="3">
                                        <span className="no_process_link">
                                            {I18n.t("subscription.no_process_link_text")}
                                        </span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        );
    };

    renderFixedInputs = product => (
        <section className="details">
            <h3>{I18n.t("subscriptions.fixedInputs")}</h3>
            <div className="form-container-parent">
                <table className="detail-block">
                    <thead />
                    <tbody>
                        {product.fixed_inputs
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((fi, index) => (
                                <tr key={index}>
                                    <td>{fi.name}</td>
                                    <td>{fi.value}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </section>
    );

    handleCollapseSubscription = (relatedResourceTypeValue, collapsedObjects) => e => {
        stop(e);
        const indexOf = collapsedObjects.indexOf(relatedResourceTypeValue);
        if (indexOf > -1) {
            collapsedObjects.splice(indexOf, 1);
        } else {
            collapsedObjects.push(relatedResourceTypeValue);
        }
        this.setState({ collapsedObjects: [...collapsedObjects] });
    };

    renderRelatedObject = (subscriptions, imsServices, type, identifier, imsEndpoints) => {
        var target;
        switch (type) {
            case "ims_corelink_trunk_id":
                return <div>Todo: implement fetch</div>;
            case "ims_circuit_id":
                target = imsServices.find(circuit => circuit.id === parseInt(identifier, 10));
                return this.renderImsServiceDetail(target, 0, imsEndpoints, "related-subscription");
            case "port_subscription_id":
            case "ip_prefix_subscription_id":
            case "internetpinnen_prefix_subscription_id":
            case "parent_ip_prefix_subscription_id":
                target = subscriptions.find(sub => sub.subscription_id === identifier);
                return this.renderSubscriptionDetail(target, 0, "related-subscription");
            case "ipam_prefix_id":
            case "ptp_ipv4_ipam_id":
            case "ptp_ipv6_ipam_id":
                target = this.state.ipamPrefixes.find(prefix => prefix.id === parseInt(identifier, 10));
                return this.renderIpamPrefix(target, 0, "related-subscription");
            case "node_ipv4_ipam_id":
            case "node_ipv6_ipam_id":
            case "corelink_ipv4_ipam_id":
            case "corelink_ipv6_ipam_id":
                target = this.state.ipamAddresses.find(address => address.id === parseInt(identifier, 10));
                return this.renderIpamAddress(target, 0, "related-subscription");
            default:
                return null;
        }
    };

    renderResourceTypeRow = (
        subscriptionInstanceValue,
        loadedAllRelatedObjects,
        notFoundRelatedObjects,
        index,
        imsServices,
        collapsedObjects,
        subscriptions,
        imsEndpoints
    ) => {
        const isDeleted =
            subscriptionInstanceValue.resource_type.resource_type === ims_circuit_id &&
            loadedAllRelatedObjects &&
            notFoundRelatedObjects.some(
                obj => obj.requestedType === ims_circuit_id && obj.identifier === subscriptionInstanceValue.value
            );
        const isSubscriptionValue = subscriptionInstanceValue.resource_type.resource_type.endsWith("subscription_id");
        const externalLinks = [
            "ims_circuit_id",
            "ims_corelink_trunk_id",
            "ptp_ipv4_ipam_id",
            "ptp_ipv6_ipam_id",
            "ipam_prefix_id",
            "node_ipv4_ipam_id",
            "node_ipv6_ipam_id",
            "corelink_ipv4_ipam_id",
            "corelink_ipv6_ipam_id"
        ];
        const isExternalLinkValue =
            isSubscriptionValue || externalLinks.includes(subscriptionInstanceValue.resource_type.resource_type);
        let isCollapsed = collapsedObjects.includes(subscriptionInstanceValue.value);
        const icon = isCollapsed ? "minus" : "plus";
        return (
            <tbody key={index}>
                <tr>
                    <td>{subscriptionInstanceValue.resource_type.resource_type.toUpperCase()}</td>
                    <td colSpan={isDeleted ? "1" : "2"}>
                        <div className="resource-type">
                            {isExternalLinkValue && !isDeleted && (
                                <i
                                    className={`fa fa-${icon}-circle`}
                                    onClick={this.handleCollapseSubscription(
                                        subscriptionInstanceValue.value,
                                        collapsedObjects
                                    )}
                                />
                            )}
                            {isSubscriptionValue && (
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={`/subscription/${subscriptionInstanceValue.value}`}
                                >
                                    {subscriptionInstanceValue.value}
                                </a>
                            )}
                            {!isSubscriptionValue && <span>{subscriptionInstanceValue.value}</span>}
                        </div>
                    </td>
                    {isDeleted && (
                        <td>
                            <em className="error">{"This circuit ID has been removed from IMS"}</em>
                        </td>
                    )}
                </tr>
                {isExternalLinkValue && !isDeleted && isCollapsed && (
                    <tr className="related-subscription">
                        <td className="whitespace" />
                        <td className="related-subscription-values" colSpan="2">
                            {this.renderRelatedObject(
                                subscriptions,
                                imsServices,
                                subscriptionInstanceValue.resource_type.resource_type,
                                subscriptionInstanceValue.value,
                                imsEndpoints
                            )}
                        </td>
                    </tr>
                )}
            </tbody>
        );
    };

    nullSafeComparision = (s1, s2) => {
        const s1safe = s1 || "";
        const s2safe = s2 || "";
        return s1safe.localeCompare(s2safe);
    };

    renderProductBlocks = (
        subscription,
        notFoundRelatedObjects,
        loadedAllRelatedObjects,
        imsServices,
        collapsedObjects,
        subscriptions,
        imsEndpoints
    ) => {
        return (
            <section className="details">
                <h3>{I18n.t("subscriptions.productBlocks")}</h3>
                <div className="form-container-parent">
                    {subscription.instances
                        .sort((a, b) =>
                            a.product_block.tag !== b.product_block.tag
                                ? this.nullSafeComparision(a.product_block.tag, b.product_block.tag)
                                : this.nullSafeComparision(a.label, a.label)
                        )
                        .map((instance, index) => (
                            <section className="product-block" key={index}>
                                <h2>{`${instance.product_block.tag} - ${instance.product_block.name}`}</h2>
                                {instance.label && <p className="label">{`Label: ${instance.label}`}</p>}
                                <p className="label">{`Instance ID: ${instance.subscription_instance_id}`}</p>
                                <table className="detail-block multiple-tbody">
                                    <thead />
                                    {instance.values
                                        .sort((a, b) =>
                                            a.resource_type.resource_type.localeCompare(b.resource_type.resource_type)
                                        )
                                        .map((value, i) =>
                                            this.renderResourceTypeRow(
                                                value,
                                                loadedAllRelatedObjects,
                                                notFoundRelatedObjects,
                                                i,
                                                imsServices,
                                                collapsedObjects,
                                                subscriptions,
                                                imsEndpoints
                                            )
                                        )}
                                </table>
                            </section>
                        ))}
                </div>
            </section>
        );
    };

    renderDetails = subscription => (
        <section className="details">
            <h3>{I18n.t("subscription.subscription")}</h3>
            <div className="form-container-parent">{this.renderSubscriptionDetail(subscription, 0)}</div>
        </section>
    );

    render() {
        const {
            loaded,
            notFound,
            subscription,
            subscriptionProcesses,
            product,
            imsServices,
            imsEndpoints,
            childSubscriptions,
            parentSubscriptions,
            confirmationDialogOpen,
            confirmationDialogAction,
            confirmationDialogQuestion,
            notFoundRelatedObjects,
            loadedAllRelatedObjects,
            collapsedObjects,
            workflows
        } = this.state;
        const { organisations, products } = this.context;
        const renderNotFound = loaded && notFound;
        const renderContent = loaded && !notFound;
        return (
            <div className={this.props.subscriptionId ? "mod-subscription-detail" : "mod-subscription-detail card"}>
                <ConfirmationDialog
                    isOpen={confirmationDialogOpen}
                    cancel={this.cancelConfirmation}
                    confirm={confirmationDialogAction}
                    question={confirmationDialogQuestion}
                />

                {renderContent && (
                    <div>
                        {this.renderDetails(subscription)}
                        {this.renderFixedInputs(product)}
                        {this.renderProductBlocks(
                            subscription,
                            notFoundRelatedObjects,
                            loadedAllRelatedObjects,
                            imsServices,
                            collapsedObjects,
                            childSubscriptions,
                            imsEndpoints
                        )}
                        {this.renderActions(subscription, loadedAllRelatedObjects, notFoundRelatedObjects, workflows)}
                        {this.renderProduct(product)}
                        {this.renderProcesses(subscriptionProcesses)}
                        {this.renderSubscriptions(parentSubscriptions, subscription, organisations, products)}
                    </div>
                )}
                {renderNotFound && (
                    <section className="card not-found">
                        <h1>{I18n.t("subscription.notFound")}</h1>
                    </section>
                )}
            </div>
        );
    }
}

SubscriptionDetail.propTypes = {
    subscriptionId: PropTypes.string
};
SubscriptionDetail.defaultProps = {
    subscriptionId: undefined
};
SubscriptionDetail.contextType = ApplicationContext;
