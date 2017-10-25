import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import {imsService, productById, subscriptions_detail} from "../api";
import "./SubscriptionDetail.css";
import "highlight.js/styles/default.css";
import {organisationNameByUuid, productNameById, renderDate} from "../utils/Lookups";
import CheckBox from "../components/CheckBox";
import {isEmpty} from "../utils/Utils";

export default class SubscriptionDetail extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            subscription: {},
            product: {},
            imsServices: [],
            subscriptions: [],
            notFound: false,
            loaded: false
        };
    }

    componentWillMount = () => {
        subscriptions_detail(this.props.match.params.id)
            .catch(err => {
                if (err.response && err.response.status === 404) {
                    this.setState({notFound: true, loaded: true});
                } else {
                    throw err;
                }
            }).then(subscription => {
            this.enrichSubscription(subscription);
            this.setState({subscription: subscription, loaded: true});
            const resourceTypes = subscription.instances.reduce((acc, instance) => acc.concat(instance.resource_types), []);
            Promise.all([productById(subscription.product_id)]
                .concat(resourceTypes.map(rt => imsService(rt.resource_type, rt.value)))).then(result => {
                const relatedObjects = result.slice(1);
                const subscriptions = relatedObjects.filter(obj => obj.type === "port_subscription_id").map(obj => obj.json);
                subscriptions.forEach(sub => this.enrichSubscription(sub));
                const allImsServices = relatedObjects.filter(obj => obj.type === "ims_circuit_id" || obj.type === "ims_port_id").map(obj => obj.json);
                const flags = new Set();
                const imsServices = allImsServices.filter(resource => {
                    if (flags.has(resource.id)) {
                        return false;
                    }
                    flags.add(resource.id);
                    return true;
                });
                this.setState({product: result[0], imsServices: imsServices, subscriptions: subscriptions});
            });
        });
    };

    enrichSubscription = subscription  => {
        const {organisations, products} = this.props;
        subscription.customer_name = organisationNameByUuid(subscription.client_id, organisations);
        subscription.product_name = productNameById(subscription.product_id, products);
        subscription.end_date_epoch = subscription.end_date ? new Date(subscription.end_date).getTime() : 0;
        subscription.start_date_epoch = subscription.start_date ? new Date(subscription.start_date).getTime() : 0;
    };

    renderSubscriptions = (subscriptions, product) => {
        if (isEmpty(subscriptions)) {
            return null;
        }
        return <section className="details">
            <h3>{I18n.t("subscription.subscriptions", {product: product})}</h3>
            <div className="form-container-parent">
                {subscriptions.map((subscription, index) => {
                return <section key={index} className="form-container">
                    <section>
                        <label className="title">{I18n.t("subscriptions.customer_name")}</label>
                        <input type="text" readOnly={true} value={subscription.customer_name}/>
                        <label className="title">{I18n.t("subscriptions.description")}</label>
                        <input type="text" readOnly={true} value={subscription.description}/>
                        <label className="title">{I18n.t("subscriptions.product_name")}</label>
                        <input type="text" readOnly={true} value={subscription.product_name}/>
                        <label className="title">{I18n.t("subscriptions.sub_name")}</label>
                        <input type="text" readOnly={true} value={subscription.sub_name}/>
                    </section>
                    <section>
                        <label className="title">{I18n.t("subscriptions.status")}</label>
                        <input type="text" readOnly={true} value={subscription.status}/>
                        <label className="title">{I18n.t("subscriptions.start_date_epoch")}</label>
                        <input type="text" readOnly={true} value={renderDate(subscription.start_date)}/>
                        <label className="title">{I18n.t("subscriptions.end_date_epoch")}</label>
                        <input type="text" readOnly={true} value={renderDate(subscription.end_date)}/>
                        <CheckBox value={subscription.insync} readOnly={true}
                                  name="isync" info={I18n.t("subscriptions.insync")}/>
                    </section>
                </section>
                })}
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
                            <label className="title">{I18n.t("subscription.ims_service.id", {index: (index + 1).toString()})}</label>
                            <input type="text" readOnly={true} value={service.id}/>
                            <label className="title">{I18n.t("subscription.ims_service.customer")}</label>
                            <input type="text" readOnly={true}
                                   value={organisationNameByUuid(service.customer_id, organisations)}/>
                            <label className="title">{I18n.t("subscription.ims_service.extra_info")}</label>
                            <input type="text" readOnly={true} value={service.extra_info}/>
                            <label className="title">{I18n.t("subscription.ims_service.name")}</label>
                            <input type="text" readOnly={true} value={service.name}/>
                        </section>
                        <section>
                            <label className="title">{I18n.t("subscription.ims_service.product")}</label>
                            <input type="text" readOnly={true} value={service.product}/>
                            <label className="title">{I18n.t("subscription.ims_service.speed")}</label>
                            <input type="text" readOnly={true} value={service.speed}/>
                            <label className="title">{I18n.t("subscription.ims_service.status")}</label>
                            <input type="text" readOnly={true} value={service.status}/>
                        </section>
                    </section>

                })}
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
                        <input type="text" readOnly={true} value={product.name}/>
                        <label className="title">{I18n.t("subscription.product.description")}</label>
                        <input type="text" readOnly={true} value={product.description}/>
                        <label className="title">{I18n.t("subscription.product.workflow")}</label>
                        <input type="text" readOnly={true} value={product.create_subscription_workflow_key}/>
                        <label className="title">{I18n.t("subscription.product.product_type")}</label>
                        <input type="text" readOnly={true} value={product.product_type}/>
                    </section>
                    <section>
                        <label className="title">{I18n.t("subscription.product.created")}</label>
                        <input type="text" readOnly={true} value={renderDate(product.create_date)}/>
                        <label className="title">{I18n.t("subscription.product.end_date")}</label>
                        <input type="text" readOnly={true} value={renderDate(product.end_date)}/>
                        <label className="title">{I18n.t("subscription.product.status")}</label>
                        <input type="text" readOnly={true} value={product.status}/>
                        <label className="title">{I18n.t("subscription.product.tag")}</label>
                        <input type="text" readOnly={true} value={product.tag}/>
                    </section>
                </section>
            </div>
        </section>
    };

    renderDetails = subscription => {
        return <section className="details">
            <h3>{I18n.t("subscription.subscription")}</h3>
            <div className="form-container-parent">
                <section className="form-container">
                    <section>
                        <label className="title">{I18n.t("subscriptions.customer_name")}</label>
                        <input type="text" readOnly={true} value={subscription.customer_name}/>
                        <label className="title">{I18n.t("subscriptions.description")}</label>
                        <input type="text" readOnly={true} value={subscription.description}/>
                        <label className="title">{I18n.t("subscriptions.product_name")}</label>
                        <input type="text" readOnly={true} value={subscription.product_name}/>
                        <label className="title">{I18n.t("subscriptions.sub_name")}</label>
                        <input type="text" readOnly={true} value={subscription.sub_name}/>
                    </section>
                    <section>
                        <label className="title">{I18n.t("subscriptions.status")}</label>
                        <input type="text" readOnly={true} value={subscription.status}/>
                        <label className="title">{I18n.t("subscriptions.start_date_epoch")}</label>
                        <input type="text" readOnly={true} value={renderDate(subscription.start_date)}/>
                        <label className="title">{I18n.t("subscriptions.end_date_epoch")}</label>
                        <input type="text" readOnly={true} value={renderDate(subscription.end_date)}/>
                        <CheckBox value={subscription.insync} readOnly={true}
                                  name="isync" info={I18n.t("subscriptions.insync")}/>
                    </section>
                </section>
            </div>
        </section>
    };

    render() {
        const {loaded, notFound, subscription, product, imsServices, subscriptions} = this.state;
        const {organisations} = this.props;
        const renderNotFound = loaded && notFound;
        const renderContent = loaded && !notFound;
        return (
            <div className="mod-subscription-detail">
                {renderContent && this.renderDetails(subscription)}
                {renderContent && this.renderProduct(product)}
                {renderContent && this.renderSubscriptions(subscriptions, subscription.product_name)}
                {renderContent && this.renderServices(imsServices, organisations)}
                {renderNotFound && <section>{I18n.t("subscription.notFound")}</section>}
            </div>
        );
    }
}

SubscriptionDetail.propTypes = {
    history: PropTypes.object.isRequired,
    organisations: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired
};

