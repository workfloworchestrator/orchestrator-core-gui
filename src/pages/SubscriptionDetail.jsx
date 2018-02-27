import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import {
    imsService,
    processSubscriptionsBySubscriptionId,
    productById,
    subscriptions_by_subscription_port_id,
    subscriptionsDetail
} from "../api";
import {enrichSubscription, organisationNameByUuid, renderDate, renderDateTime} from "../utils/Lookups";
import CheckBox from "../components/CheckBox";
import {isEmpty, stop} from "../utils/Utils";
import {NavLink} from "react-router-dom";
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

export default class SubscriptionDetail extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            subscription: {instances: []},
            product: {},
            subscriptionProcesses: [],
            imsServices: [],
            subscriptions: [],
            notFound: false,
            loaded: false,
            loadedIMSRelatedObjects: false,
            isTerminatable: false,
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
                const promises = [processSubscriptionsBySubscriptionId(subscription.subscription_id), productById(subscription.product_id)]
                    .concat(values.map(val => imsService(val.resource_type.resource_type, val.value)));
                if (values.some(val => val.resource_type.resource_type === ims_circuit_id) &&
                    !values.some(val => val.resource_type.resource_type === nms_service_id)) {
                    //add the parent subscriptions where this subscription is used as a MSP (or SSP)
                    promises.push(subscriptions_by_subscription_port_id(subscription.subscription_id))
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

    modify = (subscription, isModifiable) => e => {
        stop(e);
        if (isModifiable) {
            this.confirmation(I18n.t("subscription.modifyConfirmation", {
                    name: subscription.product_name,
                    customer: subscription.customer_name
                }),
                () => startModificationSubscription(subscription.subscription_id).then(() => {
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

    renderSubscriptionDetail = (subscription, index, showLink = true) =>
        <section key={index} className="form-container">
            <section>
                <label className="title">{I18n.t("subscriptions.customer_name")}</label>
                <input type="text" readOnly={true} value={subscription.customer_name || ""}/>
                <label className="title">{I18n.t("subscriptions.description")}</label>
                <input type="text" readOnly={true} value={subscription.description || ""}/>
                <label className="title">{I18n.t("subscriptions.product_name")}</label>
                <input type="text" readOnly={true} value={subscription.product_name || ""}/>
                <label className="title">{I18n.t("subscriptions.name")}</label>
                <input type="text" readOnly={true} value={subscription.name || ""}/>
                {showLink && <NavLink to={`/subscription/${subscription.subscription_id}`}
                                      className="button green subscription-link">
                    <i className="fa fa-link"></i> {I18n.t("subscription.link_subscription")}</NavLink>}
            </section>
            <section>
                <label className="title">{I18n.t("subscriptions.status")}</label>
                <input type="text" readOnly={true} value={subscription.status || ""}/>
                <label className="title">{I18n.t("subscriptions.start_date_epoch")}</label>
                <input type="text" readOnly={true} value={renderDate(subscription.start_date)}/>
                <label className="title">{I18n.t("subscriptions.end_date_epoch")}</label>
                <input type="text" readOnly={true} value={renderDate(subscription.end_date)}/>
                <CheckBox value={subscription.insync || false} readOnly={true}
                          name="isync" info={I18n.t("subscriptions.insync")}/>
            </section>
        </section>


    renderSubscriptions = (subscriptions, product) => {
        if (isEmpty(subscriptions)) {
            return null;
        }
        const sunscriptionInstanceValues = subscriptionInstanceValues(this.state.subscription);
        const title = sunscriptionInstanceValues.some(val => val.resource_type.resource_type === nms_service_id) ?
            "subscription.child_subscriptions" : "subscription.parent_subscriptions";
        return <section className="details">
            <h3>{I18n.t(title, {product: product})}</h3>
            <div className="form-container-parent">
                {subscriptions.map((subscription, index) => this.renderSubscriptionDetail(subscription, index))}
            </div>
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

    renderSubscriptionResourceTypes = subscription => {
        const values = subscriptionInstanceValues(subscription);
        if (isEmpty(values)) {
            return null;
        }
        values.sort((i1, i2) => {
            const i1Safe = i1.instance_label || i1.resource_type.resource_type;
            const i2Safe = i2.instance_label || i2.resource_type.resource_type;
            return i1Safe.toString().toLowerCase().localeCompare(i2Safe.toString().toLowerCase());
        });
        const nbrLeft = Math.ceil(values.length / 2);
        return <section className="details">
            <h3>{I18n.t("subscription.resource_types")}</h3>
            <em>{I18n.t("subscription.resource_types_info")}</em>
            <div className="form-container-parent">
                <section className="form-container">
                    <section>
                        {values.slice(0, nbrLeft).map(this.renderSubscriptionInstanceValue)}
                    </section>
                    <section>
                        {values.slice(nbrLeft).map(this.renderSubscriptionInstanceValue)}
                    </section>
                </section>
            </div>
        </section>
    };


    renderProduct = product => {
        if (isEmpty(product)) {
            return null;
        }
        return <section className="details">
            <h3>{I18n.t("subscription.product_title")}</h3>
            <div className="form-container-parent">
                <section className="form-container">
                    <section>
                        <label className="title">{I18n.t("subscription.product.name")}</label>
                        <input type="text" readOnly={true} value={product.name || ""}/>
                        <label className="title">{I18n.t("subscription.product.description")}</label>
                        <input type="text" readOnly={true} value={product.description || ""}/>
                        <label className="title">{I18n.t("subscription.product.workflow")}</label>
                        <input type="text" readOnly={true} value={product.create_subscription_workflow_key || ""}/>
                        <label className="title">{I18n.t("subscription.product.product_type")}</label>
                        <input type="text" readOnly={true} value={product.product_type || ""}/>
                    </section>
                    <section>
                        <label className="title">{I18n.t("subscription.product.created")}</label>
                        <input type="text" readOnly={true} value={renderDateTime(product.created_at)}/>
                        <label className="title">{I18n.t("subscription.product.end_date")}</label>
                        <input type="text" readOnly={true} value={renderDateTime(product.end_date)}/>
                        <label className="title">{I18n.t("subscription.product.status")}</label>
                        <input type="text" readOnly={true} value={product.status || ""}/>
                        <label className="title">{I18n.t("subscription.product.tag")}</label>
                        <input type="text" readOnly={true} value={product.tag || ""}/>
                    </section>
                </section>
            </div>
        </section>
    };

    renderProcessLink = subscriptionProcesses => {
        const displaysubscriptionProcesses = !isEmpty(subscriptionProcesses);
        return <section className="details">
            <h3>{I18n.t("subscription.process_link")}</h3>
            {subscriptionProcesses.map((ps, index) =>
                <section key={index} className="process-link">
                    <NavLink key={index} to={`/process/${ps.pid}`} className="button green">
                        <i className="fa fa-link"></i> {I18n.t("subscription.process_link_text", {target: ps.workflow_target})}
                    </NavLink>

                </section>
            )}
            {!displaysubscriptionProcesses && <section className="process-link">
                <span className="no_process_link">{I18n.t("subscription.no_process_link_text")}</span>
            </section>}
        </section>
    };

    renderTerminateLink = (subscription, isTerminatable, subscriptions, product, notFoundRelatedObjects, loadedIMSRelatedObjects) => {
        if (!loadedIMSRelatedObjects) {
            return <section className="terminate-link-waiting">
                <em>{I18n.t("subscription.fetchingImsData")}</em>
                <i className="fa fa-refresh fa-spin fa-2x fa-fw"></i>
            </section>;
        }
        let reason = null;
        if (!isEmpty(notFoundRelatedObjects)) {
            reason = I18n.t("subscription.no_termination_deleted_related_objects");
        }
        if ((!hasResourceType(subscription, port_subscription_id) && !hasResourceType(subscription, nms_service_id)) &&
            (subscriptions.length > 0 && !subscriptions.every(sub => sub.status === "terminated"))) {
            reason = I18n.t("subscription.no_termination_parent_subscription");
        }
        if (!product.terminate_subscription_workflow_key) {
            reason = I18n.t("subscription.no_termination_workflow");
        }
        //All subscription statuses: ["initial", "provisioning", "active", "disabled", "terminated"]
        const status = subscription.status;
        if (status !== "provisioning" && status !== "active") {
            reason = I18n.t("subscription.no_termination_invalid_status", {status: status});
        }
        const insync = subscription.insync
        if (insync !== true) {
            reason = I18n.t("subscription.not_in_sync");
        }
        return <section className="terminate-link">
            <a href="/terminate" className={`button ${(isTerminatable && !reason) ? "orange" : "grey disabled"}`}
               onClick={this.terminate(subscription, isTerminatable && !reason)}>
                <i className="fa fa-chain-broken"></i> {I18n.t("subscription.terminate")}</a>
            {reason && <p className="no-termination-reason">{reason}</p>}
        </section>
    };

    renderModifyLink = (subscription, product, notFoundRelatedObjects, loadedIMSRelatedObjects) => {
        if (!loadedIMSRelatedObjects) {
            return null;
        }
        let reason = null;
        if (!isEmpty(notFoundRelatedObjects)) {
            reason = I18n.t("subscription.no_modify_deleted_related_objects");
        }
        if (!product.modify_subscription_workflow_key) {
            reason = I18n.t("subscription.no_modify_workflow");
        }
        //All subscription statuses: ["initial", "provisioning", "active", "disabled", "terminated"]
        const status = subscription.status;
        if (status !== "active") {
            reason = I18n.t("subscription.no_modify_invalid_status", {status: status});
        }

        const insync = subscription.insync
        if (insync !== true) {
            reason = I18n.t("subscription.not_in_sync");
        }
        const isModifiable = isEmpty(reason);
        return <section className="modify-link">
            <a href="/modify" className={`button ${isModifiable ? "blue" : "grey disabled"}`}
               onClick={this.modify(subscription, isModifiable)}>
                <i className="fa fa-pencil-square-o"></i> {I18n.t("subscription.modify")}</a>
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

    renderDetails = (subscription, isTerminatable, subscriptions, product, notFoundRelatedObjects, loadedIMSRelatedObjects) =>
        <section className="details">
            <h3>{I18n.t("subscription.subscription")}</h3>
            <div className="form-container-parent">
                {this.renderSubscriptionDetail(subscription, 0, false)}
                {this.renderTerminateLink(subscription, isTerminatable, subscriptions, product, notFoundRelatedObjects, loadedIMSRelatedObjects)}
                {this.renderModifyLink(subscription, product, notFoundRelatedObjects, loadedIMSRelatedObjects)}
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

                {renderContent && this.renderDetails(subscription, isTerminatable, subscriptions, product, notFoundRelatedObjects, loadedIMSRelatedObjects)}
                {renderContent && this.renderProcessLink(subscriptionProcesses)}
                {renderContent && this.renderNotFoundRelatedObject(notFoundRelatedObjects)}
                {renderContent && this.renderSubscriptionResourceTypes(subscription)}
                {renderContent && this.renderProduct(product)}
                {renderContent && this.renderServices(imsServices, organisations)}
                {renderContent && this.renderSubscriptions(subscriptions, subscription.product_name)}
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

