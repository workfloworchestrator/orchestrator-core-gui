import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import {
    imsService,
    parentSubscriptions,
    portByImsPortId,
    portByImsServiceId,
    processSubscriptionsBySubscriptionId,
    productById,
    subscriptionsDetail
} from "../api";
import {enrichSubscription, organisationNameByUuid, renderDate, renderDateTime} from "../utils/Lookups";
import CheckBox from "../components/CheckBox";
import {isEmpty, stop} from "../utils/Utils";
import {
    absent,
    hasResourceType,
    ims_circuit_id,
    ims_port_id,
    isTerminatable,
    nms_service_id,
    parent_subscriptions,
    port_subscription_id,
    subscriptionInstanceValues
} from "../validations/Subscriptions";
import ConfirmationDialog from "../components/ConfirmationDialog";

import "./SubscriptionDetail.css";
import {startModificationSubscription} from "../api/index";
import {TARGET_MODIFY, TARGET_TERMINATE} from "../validations/Products";

export default class SubscriptionDetail extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            subscription: {instances: []},
            product: {fixed_inputs: [], workflows: []},
            subscriptionProcesses: [],
            imsServices: [],
            imsEndpoints: [],
            subscriptions: [],
            notFound: false,
            loaded: false,
            loadedIMSRelatedObjects: false,
            isTerminatable: false,
            isModifiable: true,
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this,
            confirm: () => this,
            confirmationDialogQuestion: "",
            notFoundRelatedObjects: [],
            collapsedObjects: [],
        };
    }

    componentWillMount = () => {
        const subscriptionId = this.props.match.params.id;
        this.refreshSubscription(subscriptionId);
    };

    refreshSubscription(subscriptionId) {
        const {organisations, products} = this.props;
        subscriptionsDetail(subscriptionId)
            .then(subscription => {
                enrichSubscription(subscription, organisations, products);
                const values = subscriptionInstanceValues(subscription);
                this.setState({subscription: subscription, loaded: true});
                const promises = [processSubscriptionsBySubscriptionId(subscription.subscription_id),
                    productById(subscription.product_id)]
                    .concat(values.map(val => imsService(val.resource_type.resource_type, val.value)));
                if (values.some(val => val.resource_type.resource_type === ims_circuit_id) &&
                    !values.some(val => val.resource_type.resource_type === nms_service_id)) {
                    //add the parent subscriptions where this subscription is used as a MSP (or SSP)
                    promises.push(parentSubscriptions(subscription.subscription_id))
                }
                Promise.all(promises).then(result => {
                    const relatedObjects = result.slice(2);
                    const notFoundRelatedObjects = relatedObjects.filter(obj => obj.type === absent);
                    let subscriptions = relatedObjects.filter(obj => obj.type === port_subscription_id).map(obj => obj.json);
                    const subscription_used = relatedObjects.find(obj => obj.type === parent_subscriptions);
                    if (subscription_used) {
                        subscriptions = subscriptions.concat(subscription_used.json);
                    }
                    subscriptions.forEach(sub => enrichSubscription(sub, organisations, products));
                    const allImsServices = relatedObjects.filter(obj => obj.type === ims_circuit_id || obj.type === ims_port_id).map(obj => obj.json);
                    // There are service duplicates for port_id and circuit_id
                    const imsServices = allImsServices.filter((item, i, ar) => ar.indexOf(item) === i);
                    this.setState({
                        subscriptionProcesses: result[0],
                        product: result[1],
                        imsServices: imsServices,
                        subscriptions: subscriptions,
                        notFoundRelatedObjects: notFoundRelatedObjects,
                        isTerminatable: isTerminatable(subscription, subscriptions),
                        isModifiable: false,
                        loadedIMSRelatedObjects: true
                    });
                    const uniquePortPromises = imsServices.map(resource => (resource.endpoints || [])
                        .map(endpoint => endpoint.type === "service" ? portByImsServiceId(endpoint.id) : portByImsPortId(endpoint.id)))
                        .reduce((a, b) => a.concat(b), []);
                    Promise.all(uniquePortPromises).then(result => this.setState({imsEndpoints: result}));
                })
            }).catch(err => {
            if (err.response && err.response.status === 404) {
                this.setState({notFound: true, loaded: true});
            } else {
                throw err;
            }
        });
    }

    componentWillReceiveProps(nextProps) {
        const id = this.props.match.params.id;
        const nextId = nextProps.match.params.id;
        if (id !== nextId) {
            this.refreshSubscription(nextId);
            window.scrollTo(0, 0);
        }
    };

    terminate = (subscription, isTerminatable) => e => {
        stop(e);
        if (isTerminatable) {
            this.confirmation(I18n.t("subscription.terminateConfirmation", {
                    name: subscription.product_name,
                    customer: subscription.customer_name
                }),
                () => this.props.history.push(`/terminate-subscription?subscription=${subscription.subscription_id}`));
        }
    };

    modify = (subscription, isModifiable, workflow) => e => {
        stop(e);
        if (isModifiable) {
            const change = I18n.t(`subscription.modify_${workflow.name}`).toLowerCase();
            this.confirmation(I18n.t("subscription.modifyConfirmation", {
                    name: subscription.product_name,
                    customer: subscription.customer_name,
                    change: change
                }),
                () => startModificationSubscription(subscription.subscription_id, workflow).then(() => {
                    this.props.history.push("/processes")
                }));
        }
    };

    cancelConfirmation = () => this.setState({confirmationDialogOpen: false});

    confirmation = (question, action) => this.setState({
        confirmationDialogOpen: true,
        confirmationDialogQuestion: question,
        confirmationDialogAction: () => {
            this.cancelConfirmation();
            action();
        }
    });

    renderSubscriptionDetail = (subscription, index, className = "") =>
        <table className={`detail-block ${className}`} key={index}>
            <thead>
            </thead>
            <tbody>
            <tr>
                <td>{I18n.t("subscriptions.id")}</td>
                <td>{subscription.subscription_id}</td>

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
                <td><CheckBox value={subscription.insync || false} readOnly={true}
                              name="isync"/></td>

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
        </table>;

    renderSubscriptions = (subscriptions, subscription, organisations, products) => {
        if (isEmpty(subscriptions)) {
            return null;
        }
        subscriptions.forEach(sub => enrichSubscription(sub, organisations, products));

        const values = subscriptionInstanceValues(this.state.subscription);
        const isLPSubscription = values.some(val => val.resource_type.resource_type === nms_service_id);
        if (isLPSubscription) {
            //child subscriptions are rendered in the product blocks
            return null;
        }
        const columns = ["customer_name", "subscription_id", "description", "insync", "product_name", "status",
            "product_tag", "start_date"];
        const th = index => {
            const name = columns[index];
            return <th key={index} className={name}>
                <span>{I18n.t(`subscriptions.${name}`)}</span>
            </th>
        };
        return <section className="details">
            <h3>{I18n.t("subscription.parent_subscriptions", {product: subscription.description})}</h3>
            <div className="form-container-parent">
                <table className="subscriptions">
                    <thead>
                    <tr>{columns.map((column, index) => th(index))}</tr>
                    </thead>
                    <tbody>
                    {subscriptions.map((subscription, index) =>
                        <tr key={index}>
                            <td data-label={I18n.t("subscriptions.customer_name")}
                                className="customer_name">{subscription.customer_name}</td>
                            <td data-label={I18n.t("subscriptions.subscription_id")}
                                className="subscription_id">
                                <a target="_blank"
                                   href={`/subscription/${subscription.subscription_id}`}>{subscription.subscription_id.substring(0, 8)}</a>
                            </td>
                            <td data-label={I18n.t("subscriptions.description")}
                                className="description">{subscription.description}</td>
                            <td data-label={I18n.t("subscriptions.insync")} className="insync">
                                <CheckBox value={subscription.insync} name="insync" readOnly={true}/>
                            </td>
                            <td data-label={I18n.t("subscriptions.product_name")}
                                className="product_name">{subscription.product_name}</td>
                            <td data-label={I18n.t("subscriptions.status")}
                                className="status">{subscription.status}</td>
                            <td data-label={I18n.t("subscriptions.product_tag")}
                                className="tag">{subscription.tag}</td>
                            <td data-label={I18n.t("subscriptions.start_date_epoch")}
                                className="start_date_epoch">{renderDate(subscription.start_date)}</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </section>
    };

    renderImsPortDetail = (port, index) =>
        <tr>
            <td>{I18n.t("subscription.ims_port.id", {id: port.id})}</td>
            <td>
                <table className="detail-block related-subscription" index={index}>
                    <thead>
                    </thead>
                    <tbody>
                    {["connector_type", "fiber_type", "iface_type", "line_name", "location", "node", "patchposition", "port", "status"]
                        .map(attr => <tr key={attr}>
                            <td>{I18n.t(`subscription.ims_port.${attr}`)}</td>
                            <td>{port[attr]}</td>
                        </tr>)}
                    </tbody>
                </table>
            </td>
        </tr>;

    renderImsServiceDetail = (service, index, imsEndpoints, className = "") =>
        <table className={`detail-block ${className}`}>
            <thead>
            </thead>
            <tbody>
            <tr>
                <td>{I18n.t("subscription.ims_service.identifier")}</td>
                <td>{service.id}</td>
            </tr>
            <tr>
                <td>{I18n.t("subscription.ims_service.customer")}</td>
                <td>{organisationNameByUuid(service.customer_id, this.props.organisations)}</td>
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
                <td>{(service.endpoints || []).map(endpoint => `ID: ${endpoint.id}${endpoint.vlanranges ? " - " : ""}${(endpoint.vlanranges || [])
                    .map(vlan => `VLAN: ${vlan.start} - ${vlan.end}`).join(", ")}`).join(", ")}</td>
            </tr>
            {imsEndpoints.map((port, index) => this.renderImsPortDetail(port, index))}
            </tbody>
        </table>;

    renderProduct = product => {
        if (isEmpty(product)) {
            return null;
        }
        return <section className="details">
            <h3>{I18n.t("subscription.product_title")}</h3>
            <div className="form-container-parent">
                <table className="detail-block">
                    <thead>
                    </thead>
                    <tbody>
                    <tr>
                        <td>{I18n.t("subscription.product.name")}</td>
                        <td><a target="_blank" href={`/product/${product.product_id}`}>{product.name || ""}</a></td>

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
    };

    workflowByTarget = (product, target) => product.workflows.find(wf => wf.target === target);

    renderActions = (subscription, isTerminatable, subscriptions, product, notFoundRelatedObjects,
                     loadedIMSRelatedObjects) => {
        let noTerminateReason = null;
        if (!isEmpty(notFoundRelatedObjects)) {
            noTerminateReason = I18n.t("subscription.no_termination_deleted_related_objects");
        }
        if ((!hasResourceType(subscription, port_subscription_id) && !hasResourceType(subscription, nms_service_id)) &&
            (subscriptions.length > 0 && !subscriptions.every(sub => sub.status === "terminated"))) {
            noTerminateReason = I18n.t("subscription.no_termination_parent_subscription");
        }
        if (!this.workflowByTarget(product, TARGET_TERMINATE)) {
            noTerminateReason = I18n.t("subscription.no_termination_workflow");
        }
        //All subscription statuses: ["initial", "provisioning", "active", "disabled", "terminated"]
        const status = subscription.status;
        if (status !== "provisioning" && status !== "active") {
            noTerminateReason = I18n.t("subscription.no_termination_invalid_status", {status: status});
        }
        if (subscription.insync !== true) {
            noTerminateReason = I18n.t("subscription.not_in_sync");
        }
        const displayTerminate = isTerminatable && !noTerminateReason && loadedIMSRelatedObjects;
        const modifyWorkflows = product.workflows.filter(wf => wf.target === TARGET_MODIFY);

        let noModifyReason = null;
        if (isEmpty(modifyWorkflows)) {
            noModifyReason = I18n.t("subscription.no_modify_workflow");
        }
        if (!isEmpty(notFoundRelatedObjects)) {
            noModifyReason = I18n.t("subscription.no_modify_deleted_related_objects");
        }
        //All subscription statuses: ["initial", "provisioning", "active", "disabled", "terminated"]
        if (status !== "active") {
            noModifyReason = I18n.t("subscription.no_modify_invalid_status", {status: status});
        }
        const insync = subscription.insync;
        if (insync !== true) {
            noModifyReason = I18n.t("subscription.not_in_sync");
        }

        const isModifiable = isEmpty(noModifyReason) && loadedIMSRelatedObjects;

        return <section className="details">
            <h3>{I18n.t("subscription.actions")}</h3>
            <div className="form-container-parent">
                <table className="detail-block">
                    <thead>
                    </thead>
                    <tbody>
                    <tr>
                        {displayTerminate && <td><a href={I18n.t("subscription.terminate")}
                                                    onClick={this.terminate(subscription, isTerminatable && !noTerminateReason)}>
                            {I18n.t("subscription.terminate")}
                        </a></td>}
                        {!displayTerminate && <td><span>{I18n.t("subscription.terminate")}</span></td>}
                        {!displayTerminate && <td><em
                            className="error">{noTerminateReason}</em></td>}
                        {!loadedIMSRelatedObjects && <td>
                            <section className="terminate-link-waiting">
                                <em>{I18n.t("subscription.fetchingImsData")}</em>
                                <i className="fa fa-refresh fa-spin fa-2x fa-fw"></i>
                            </section>
                        </td>}
                    </tr>
                    {modifyWorkflows.map((wf, index) =>
                        <tr key={index}>
                            {isModifiable && <td>
                                <a href="/modify" key={wf.name} onClick={this.modify(subscription, isModifiable, wf)}>
                                    {I18n.t(`subscription.modify_${wf.name}`)}</a>
                            </td>}
                            {!isModifiable && <td><span>{I18n.t(`subscription.modify_${wf.name}`)}</span></td>}
                            {(!isEmpty(noModifyReason) && loadedIMSRelatedObjects) &&
                            <td><em className="error">{noModifyReason}</em></td>}
                            {!loadedIMSRelatedObjects && <td>
                                <section className="terminate-link-waiting">
                                    <em>{I18n.t("subscription.fetchingImsData")}</em>
                                    <i className="fa fa-refresh fa-spin fa-2x fa-fw"></i>
                                </section>
                            </td>}

                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </section>;

    };

    renderProcesses = subscriptionProcesses => {
        return <section className="details">
            <h3>{I18n.t("subscription.process_link")}</h3>
            <div className="form-container-parent">
                <table className="detail-block">
                    <thead>
                    </thead>
                    <tbody>
                    {subscriptionProcesses.map((ps, index) =>
                        <tr key={index}>
                            <td>{`${ps.workflow_target} - ${ps.process.workflow}`}</td>
                            <td><a target="_blank" href={`/process/${ps.pid}`}>{ps.pid}</a></td>
                        </tr>)}
                    {isEmpty(subscriptionProcesses) && <tr>
                        <td colSpan="3"><span
                            className="no_process_link">{I18n.t("subscription.no_process_link_text")}</span></td>
                    </tr>}
                    </tbody>
                </table>
            </div>
        </section>;
    };

    renderFixedInputs = (product) =>
        <section className="details">
            <h3>{I18n.t("subscriptions.fixedInputs")}</h3>
            <div className="form-container-parent">
                <table className="detail-block">
                    <thead>
                    </thead>
                    <tbody>
                    {product.fixed_inputs
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((fi, index) => <tr key={index}>
                            <td>{fi.name}</td>
                            <td>{fi.value}</td>

                        </tr>)}
                    </tbody>
                </table>
            </div>
        </section>;

    handleCollapseSubscription = (relatedResourceTypeValue, collapsedObjects) => e => {
        stop(e);
        const indexOf = collapsedObjects.indexOf(relatedResourceTypeValue);
        if (indexOf > -1) {
            collapsedObjects.splice(indexOf, 1);
        } else {
            collapsedObjects.push(relatedResourceTypeValue);
        }
        this.setState({collapsedObjects: [...collapsedObjects]});
    };

    renderRelatedObject = (subscriptions, imsServices, identifier, isSubscriptionValue, imsEndpoints) => {
        const target = isSubscriptionValue ? subscriptions.find(sub => sub.subscription_id === identifier) :
            imsServices.find(circuit => circuit.id === parseInt(identifier, 10));
        return isSubscriptionValue ? this.renderSubscriptionDetail(target, 0, "related-subscription") :
            this.renderImsServiceDetail(target, 0, imsEndpoints, "related-subscription");
    };

    renderResourceTypeRow = (subscription, subscriptionInstanceValue, loadedIMSRelatedObjects, notFoundRelatedObjects, index,
                             imsServices, collapsedObjects, subscriptions, imsEndpoints) => {
        const isDeleted = subscriptionInstanceValue.resource_type.resource_type === ims_circuit_id &&
            loadedIMSRelatedObjects && notFoundRelatedObjects.some(obj => obj.requestedType === ims_circuit_id && obj.identifier === subscriptionInstanceValue.value);
        const isSubscriptionValue = subscriptionInstanceValue.resource_type.resource_type === port_subscription_id;
        const isExternalLinkValue = isSubscriptionValue || subscriptionInstanceValue.resource_type.resource_type === ims_circuit_id;
        let isCollapsed = collapsedObjects.includes(subscriptionInstanceValue.value);
        const icon = isCollapsed ? "minus" : "plus";
        return (
            <tbody key={index}>
            <tr>
                <td>{subscriptionInstanceValue.resource_type.resource_type.toUpperCase()}</td>
                <td colSpan={isDeleted ? "1" : "2"}>
                    <div className="resource-type">
                        {(isExternalLinkValue && !isDeleted) &&
                        <i className={`fa fa-${icon}-circle`}
                           onClick={this.handleCollapseSubscription(subscriptionInstanceValue.value, collapsedObjects)}></i>}
                        {isSubscriptionValue && <a target="_blank"
                                                   href={`/subscription/${subscriptionInstanceValue.value}`}>{subscriptionInstanceValue.value}</a>}
                        {!isSubscriptionValue && <span>{subscriptionInstanceValue.value}</span>}
                    </div>
                </td>
                {isDeleted && <td><em className="error">{"This circuit ID has been removed from IMS"}</em></td>}
            </tr>
            {(isExternalLinkValue && !isDeleted && isCollapsed) &&
            <tr className="related-subscription">
                <td className="whitespace"></td>
                <td className="related-subscription-values"
                    colSpan="2">{this.renderRelatedObject(subscriptions, imsServices, subscriptionInstanceValue.value, isSubscriptionValue, imsEndpoints)}</td>
            </tr>}
            </tbody>

        );
    };

    nullSafeComparision = (s1, s2) => {
        const s1safe = s1 || "";
        const s2safe = s2 || "";
        return s1safe.localeCompare(s2safe);
    };

    renderProductBlocks = (subscription, notFoundRelatedObjects, loadedIMSRelatedObjects, imsServices, collapsedObjects,
                           subscriptions, imsEndpoints) => {
        return <section className="details">
            <h3>{I18n.t("subscriptions.productBlocks")}</h3>
            <div className="form-container-parent">
                {subscription.instances
                    .sort((a, b) => a.product_block.tag !== b.product_block.tag ? this.nullSafeComparision(a.product_block.tag, b.product_block.tag) :
                        this.nullSafeComparision(a.label, a.label))
                    .map((instance, index) =>
                        <section className="product-block" key={index}>
                            <h2>{`${instance.product_block.tag} - ${instance.product_block.name}`}</h2>
                            {instance.label && <p className="label">{`Label: ${instance.label}`}</p>}
                            <table className="detail-block multiple-tbody">
                                <thead>
                                </thead>
                                {instance.values
                                    .sort((a, b) => a.resource_type.resource_type.localeCompare(b.resource_type.resource_type))
                                    .map((value, i) => this.renderResourceTypeRow(subscription, value, loadedIMSRelatedObjects, notFoundRelatedObjects, i,
                                        imsServices, collapsedObjects, subscriptions, imsEndpoints))}
                            </table>
                        </section>
                    )}
            </div>
        </section>
    };

    renderDetails = (subscription) =>
        <section className="details">
            <h3>{I18n.t("subscription.subscription")}</h3>
            <div className="form-container-parent">
                {this.renderSubscriptionDetail(subscription, 0)}
            </div>
        </section>;

    render() {
        const {
            loaded, notFound, subscription, subscriptionProcesses, product, imsServices, imsEndpoints,
            subscriptions, isTerminatable, confirmationDialogOpen, confirmationDialogAction,
            confirmationDialogQuestion, notFoundRelatedObjects, loadedIMSRelatedObjects,
            collapsedObjects
        } = this.state;
        const {organisations, products} = this.props;
        const renderNotFound = loaded && notFound;
        const renderContent = loaded && !notFound;
        return (
            <div className="mod-subscription-detail">
                <ConfirmationDialog isOpen={confirmationDialogOpen}
                                    cancel={this.cancelConfirmation}
                                    confirm={confirmationDialogAction}
                                    question={confirmationDialogQuestion}/>

                {renderContent && <div>
                    {this.renderDetails(subscription)}
                    {this.renderFixedInputs(product)}
                    {this.renderProductBlocks(subscription, notFoundRelatedObjects, loadedIMSRelatedObjects,
                        imsServices, collapsedObjects, subscriptions, imsEndpoints)}
                    {this.renderActions(subscription, isTerminatable, subscriptions, product, notFoundRelatedObjects,
                        loadedIMSRelatedObjects)}
                    {this.renderProduct(product)}
                    {this.renderProcesses(subscriptionProcesses)}
                    {this.renderSubscriptions(subscriptions, subscription, organisations, products)}
                </div>}
                {renderNotFound &&
                <section className="card not-found"><h1>{I18n.t("subscription.notFound")}</h1></section>}
            </div>
        );
    }
}

SubscriptionDetail.propTypes = {
    history: PropTypes.object.isRequired,
    organisations: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired
};

