import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import {
    imsService,
    parentSubscriptions,
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
            notFoundRelatedObjects: []
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
                    const flags = new Set();
                    // There are service duplicates for port_id and circuit_id
                    const imsServices = allImsServices.filter(resource => {
                        if (flags.has(resource.id)) {
                            return false;
                        }
                        flags.add(resource.id);
                        return true;
                    });
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

    renderSubscriptionDetail = (subscription, index) =>
        <table key={index}>
            <thead>
            </thead>
            <tbody>
            <tr>
                <td>{I18n.t("subscriptions.id")}</td>
                <td>{subscription.subscription_id}</td>
                <td></td>
            </tr>
            <tr>
                <td>{I18n.t("subscriptions.name")}</td>
                <td>{subscription.name}</td>
                <td></td>
            </tr>
            <tr>
                <td>{I18n.t("subscriptions.description")}</td>
                <td>{subscription.description}</td>
                <td></td>
            </tr>
            <tr>
                <td>{I18n.t("subscriptions.start_date_epoch")}</td>
                <td>{renderDate(subscription.start_date)}</td>
                <td></td>
            </tr>
            <tr>
                <td>{I18n.t("subscriptions.end_date_epoch")}</td>
                <td>{renderDate(subscription.end_date)}</td>
                <td></td>
            </tr>
            <tr>
                <td>{I18n.t("subscriptions.status")}</td>
                <td>{subscription.status}</td>
                <td></td>
            </tr>
            <tr>
                <td>{I18n.t("subscriptions.insync")}</td>
                <td><CheckBox value={subscription.insync || false} readOnly={true}
                              name="isync"/></td>
                <td></td>
            </tr>
            <tr>
                <td>{I18n.t("subscriptions.customer_name")}</td>
                <td>{subscription.customer_name || ""}</td>
                <td></td>
            </tr>
            <tr>
                <td>{I18n.t("subscriptions.customer_id")}</td>
                <td>{subscription.customer_id}</td>
                <td></td>
            </tr>
            </tbody>
        </table>;


    renderSubscriptions = (subscriptions, product) => {
        if (isEmpty(subscriptions)) {
            return null;
        }
        const values = subscriptionInstanceValues(this.state.subscription);
        const title = values.some(val => val.resource_type.resource_type === nms_service_id) ?
            "subscription.child_subscriptions" : "subscription.parent_subscriptions";
        return <section className="details">
            <h3>{I18n.t(title, {product: product})}</h3>
            {subscriptions.map((subscription, index) =>
                <div className="form-container-parent">{this.renderSubscriptionDetail(subscription, index)}</div>
            )}
        </section>
    };

    renderServices = (imsServices, organisations) => {
        if (isEmpty(imsServices)) {
            return null;
        }
        return <section className="details">
            <h3>{I18n.t("subscription.ims_services")}</h3>
            <div className="form-container-parent">
                {imsServices.map((service, index) => {
                    return <section key={index} className="form-container">
                        <section>
                            <label
                                className="title">{I18n.t("subscription.ims_service.id", {index: (index + 1).toString()})}</label>
                            <input type="text" readOnly={true} value={service.id || ""}/>
                            <label className="title">{I18n.t("subscription.ims_service.customer")}</label>
                            <input type="text" readOnly={true}
                                   value={organisationNameByUuid(service.customer_id, organisations)}/>
                            <label className="title">{I18n.t("subscription.ims_service.extra_info")}</label>
                            <input type="text" readOnly={true} value={service.extra_info || ""}/>
                            <label className="title">{I18n.t("subscription.ims_service.name")}</label>
                            <input type="text" readOnly={true} value={service.name || ""}/>
                        </section>
                        <section>
                            <label className="title">{I18n.t("subscription.ims_service.product")}</label>
                            <input type="text" readOnly={true} value={service.product || ""}/>
                            <label className="title">{I18n.t("subscription.ims_service.speed")}</label>
                            <input type="text" readOnly={true} value={service.speed || ""}/>
                            <label className="title">{I18n.t("subscription.ims_service.status")}</label>
                            <input type="text" readOnly={true} value={service.status || ""}/>
                        </section>
                    </section>

                })}
            </div>
        </section>
    };

    renderSubscriptionInstanceValue = (val, index) => {
        const title = val.resource_type.resource_type + (val.instance_label ? ` : ${val.instance_label}` : "");
        return <div key={index}>
            <label className="title">{title}</label>
            <input type="text" readOnly={true} value={val.value}/>
        </div>;
    };

    renderProduct = product => {
        if (isEmpty(product)) {
            return null;
        }
        return <section className="details">
            <h3>{I18n.t("subscription.product_title")}</h3>
            <div className="form-container-parent">
                <table>
                    <thead>
                    </thead>
                    <tbody>
                    <tr>
                        <td>{I18n.t("subscription.product.name")}</td>
                        <td><a target="_blank" href={`/product/${product.product_id}`}>{product.name || ""}</a></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>{I18n.t("subscription.product.description")}</td>
                        <td>{product.description}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>{I18n.t("subscription.product.product_type")}</td>
                        <td>{product.product_type}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>{I18n.t("subscription.product.tag")}</td>
                        <td>{product.tag || ""}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>{I18n.t("subscription.product.status")}</td>
                        <td>{product.status || ""}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>{I18n.t("subscription.product.created")}</td>
                        <td>{renderDateTime(product.created_at)}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>{I18n.t("subscription.product.end_date")}</td>
                        <td>{renderDateTime(product.end_date)}</td>
                        <td></td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </section>
    };

    workflowByTarget = (product, target) => product.workflows.find(wf => wf.target === target);

    renderActions = (subscription, isTerminatable, subscriptions, product, notFoundRelatedObjects,
                     loadedIMSRelatedObjects) => {
        let reason = null;
        if (!isEmpty(notFoundRelatedObjects)) {
            reason = I18n.t("subscription.no_termination_deleted_related_objects");
        }
        if ((!hasResourceType(subscription, port_subscription_id) && !hasResourceType(subscription, nms_service_id)) &&
            (subscriptions.length > 0 && !subscriptions.every(sub => sub.status === "terminated"))) {
            reason = I18n.t("subscription.no_termination_parent_subscription");
        }
        if (!this.workflowByTarget(product, TARGET_TERMINATE)) {
            reason = I18n.t("subscription.no_termination_workflow");
        }
        //All subscription statuses: ["initial", "provisioning", "active", "disabled", "terminated"]
        const status = subscription.status;
        if (status !== "provisioning" && status !== "active") {
            reason = I18n.t("subscription.no_termination_invalid_status", {status: status});
        }
        if (subscription.insync !== true) {
            reason = I18n.t("subscription.not_in_sync");
        }
        const displayTerminate = isTerminatable && !reason && loadedIMSRelatedObjects;
        return <section className="details">
            <h3>{I18n.t("subscription.actions")}</h3>
            <div className="form-container-parent">
                <table>
                    <thead>
                    </thead>
                    <tbody>
                    <tr>
                        {displayTerminate && <td><a href={I18n.t("subscription.terminate")}
                                                    onClick={this.terminate(subscription, isTerminatable && !reason)}>
                            {I18n.t("subscription.terminate")}
                        </a></td>}
                        {!displayTerminate && <td><span>{I18n.t("subscription.terminate")}</span></td>}
                        <td><em className="error">{reason}</em></td>
                        <td>{!loadedIMSRelatedObjects && <section className="terminate-link-waiting">
                            <em>{I18n.t("subscription.fetchingImsData")}</em>
                            <i className="fa fa-refresh fa-spin fa-2x fa-fw"></i>
                        </section>}
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </section>;

    };

    renderProcesses = subscriptionProcesses => {
        return <section className="details">
            <h3>{I18n.t("subscription.process_link")}</h3>
            <div className="form-container-parent">
                <table>
                    <thead>
                    </thead>
                    <tbody>
                    {subscriptionProcesses.map((ps, index) =>
                        <tr key={index}>
                            <td>{ps.workflow_target}</td>
                            <td><a target="_blank" href={`/process/${ps.pid}`}>{ps.pid}</a></td>
                            <td></td>
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

    renderModifyLink = (subscription, product, notFoundRelatedObjects, loadedIMSRelatedObjects) => {
        if (!loadedIMSRelatedObjects) {
            return null;
        }
        const modifyWorkflows = product.workflows.filter(wf => wf.target === TARGET_MODIFY);
        let reason = null;
        if (isEmpty(modifyWorkflows)) {
            reason = I18n.t("subscription.no_modify_workflow");
        }
        if (!isEmpty(notFoundRelatedObjects)) {
            reason = I18n.t("subscription.no_modify_deleted_related_objects");
        }
        //All subscription statuses: ["initial", "provisioning", "active", "disabled", "terminated"]
        const status = subscription.status;
        if (status !== "active") {
            reason = I18n.t("subscription.no_modify_invalid_status", {status: status});
        }
        const insync = subscription.insync;
        if (insync !== true) {
            reason = I18n.t("subscription.not_in_sync");
        }

        const isModifiable = isEmpty(reason);
        return <section className="modify-link">
            {
                modifyWorkflows.map(wf =>
                    <a href="/modify" key={wf.name} className={`button ${isModifiable ? "blue" : "grey disabled"}`}
                       onClick={this.modify(subscription, isModifiable, wf)}>
                        <i className="fa fa-pencil-square-o"></i> {I18n.t(`subscription.modify_${wf.name}`)}</a>
                )
            }

            {!isModifiable && <p className="no-modify-reason">{reason}</p>}
        </section>
    };

    renderNotFoundRelatedObject = notFoundRelatedObjects => {
        if (isEmpty(notFoundRelatedObjects)) {
            return null;
        }
        return <section className="not-found-related-objects">
            <h3>{I18n.t("subscription.notFoundRelatedObjects")}</h3>
            <div className="form-container-parent">
                <section className="form-container">
                    {notFoundRelatedObjects.map((obj, index) => <section key={index}>
                        <label className="title">{obj.requestedType}</label>
                        <input type="text" readOnly={true} value={obj.identifier}/>
                    </section>)}
                </section>
            </div>
        </section>;
    };

    renderFixedInputs = (product) =>
        <section className="details">
            <h3>{I18n.t("subscriptions.fixedInputs")}</h3>
            <div className="form-container-parent">
                <table>
                    <thead>
                    </thead>
                    <tbody>
                    {product.fixed_inputs
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((fi, index) => <tr key={index}>
                            <td>{fi.name}</td>
                            <td>{fi.value}</td>
                            <td></td>
                        </tr>)}
                    </tbody>
                </table>
            </div>
        </section>;

    renderResourceTypeValue = (subscription, subscriptionInstanceValue) =>
        subscriptionInstanceValue.resource_type.resource_type === "port_subscription_id" ?
            <a target="_blank"
               href={`/subscription/${subscription.subscription_id}`}>{subscriptionInstanceValue.value}</a> :
            <span>{subscriptionInstanceValue.value}</span>

    renderDeletedIms = (notFoundRelatedObjects, subInstValue, loadedIMSRelatedObjects) => {
        const isDeleted = subInstValue.resource_type.resource_type === "ims_circuit_id" &&
            loadedIMSRelatedObjects && notFoundRelatedObjects.some(obj => obj.requestedType === "ims_circuit_id" && obj.identifier === subInstValue.value);
        return isDeleted ? <em class="error">{"This circuit ID has been removed from IMS"}</em> : <span></span>;

    };


    renderProductBlocks = (subscription, notFoundRelatedObjects, loadedIMSRelatedObjects) => {
        return <section className="details">
            <h3>{I18n.t("subscriptions.productBlocks")}</h3>
            <div className="form-container-parent">
                {subscription.instances
                    .sort((a, b) => a.product_block.tag.localeCompare(b.product_block.tag))
                    .map((instance, index) =>
                        <section className="product-block" key={index}>
                            <h2>{`${instance.product_block.tag} - ${instance.product_block.name}`}</h2>
                            <table>
                                <thead>
                                </thead>
                                <tbody>
                                {instance.values
                                    .sort((a, b) => a.resource_type.resource_type.localeCompare(b.resource_type.resource_type))
                                    .map((value, i) =>
                                        <tr key={i}>
                                            <td>{value.resource_type.resource_type.toUpperCase()}</td>
                                            <td>{this.renderResourceTypeValue(subscription, value)}</td>
                                            <td>{this.renderDeletedIms(notFoundRelatedObjects, value, loadedIMSRelatedObjects)}</td>
                                        </tr>)}
                                </tbody>
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
                {this.renderSubscriptionDetail(subscription, 0, false)}
            </div>
        </section>;

    render() {
        const {
            loaded, notFound, subscription, subscriptionProcesses, product, imsServices,
            subscriptions, isTerminatable, confirmationDialogOpen, confirmationDialogAction,
            confirmationDialogQuestion, notFoundRelatedObjects, loadedIMSRelatedObjects
        } = this.state;
        const {organisations} = this.props;
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
                    {this.renderProductBlocks(subscription, notFoundRelatedObjects, loadedIMSRelatedObjects)}
                    {this.renderActions(subscription, isTerminatable, subscriptions, product, notFoundRelatedObjects,
                        loadedIMSRelatedObjects)}
                    {this.renderProduct(product)}
                    {this.renderProcesses(subscriptionProcesses)}
                    {this.renderSubscriptions(subscriptions, subscription.description)}
                    {this.renderServices(imsServices, organisations)}
                </div>}
                {renderNotFound &&<section className="card not-found"><h1>{I18n.t("subscription.notFound")}</h1></section>}
            </div>
        );
    }
}

SubscriptionDetail.propTypes = {
    history: PropTypes.object.isRequired,
    organisations: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired
};

