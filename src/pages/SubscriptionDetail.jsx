import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import {subscriptions_detail} from "../api";
import "./SubscriptionDetail.css";
import "highlight.js/styles/default.css";
import {organisationNameByUuid, productNameById, renderDate} from "../utils/Lookups";
import CheckBox from "../components/CheckBox";

export default class SubscriptionDetail extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            subscription: {},
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
            const {organisations, products} = this.props;

            subscription.customer_name = organisationNameByUuid(subscription.client_id, organisations);
            subscription.product_name = productNameById(subscription.product_id, products);
            subscription.end_date_epoch = subscription.end_date ? new Date(subscription.end_date).getTime() : 0;
            subscription.start_date_epoch = subscription.start_date ? new Date(subscription.start_date).getTime() : 0;
            this.setState({
                subscription: subscription, loaded: true
            })
        });
    };

    renderDetails = subscription => {
        return <section className="details">
            <h3>{I18n.t("subscription.title")}</h3>
            <section className="form-container">
                <section>
                    <label className="title">{I18n.t("subscriptions.customer_name")}</label>
                    <input type="text" readOnly={true} value={subscription.customer_name}/>
                    <label className="title">{I18n.t("subscriptions.description")}</label>
                    <input type="text" readOnly={true} value={subscription.description}/>
                    <label className="title">{I18n.t("subscriptions.product_name")}</label>
                    <input type="text" readOnly={true} value={subscription.product_name}/>
                    <CheckBox value={subscription.insync} readOnly={true}
                              name="isync" info={I18n.t("subscriptions.insync")}/>
                </section>
                <section>
                    <label className="title">{I18n.t("subscriptions.status")}</label>
                    <input type="text" readOnly={true} value={subscription.status}/>
                    <label className="title">{I18n.t("subscriptions.start_date_epoch")}</label>
                    <input type="text" readOnly={true} value={renderDate(subscription.start_date)}/>
                    <label className="title">{I18n.t("subscriptions.end_date_epoch")}</label>
                    <input type="text" readOnly={true} value={renderDate(subscription.end_date)}/>
                    <label className="title">{I18n.t("subscriptions.sub_name")}</label>
                    <input type="text" readOnly={true} value={subscription.sub_name}/>
                </section>
            </section>
        </section>
    };

    render() {
        const {loaded, notFound, subscription} = this.state;
        const renderNotFound = loaded && notFound;
        const renderContent = loaded && !notFound;
        return (
            <div className="mod-subscription-detail">
                {renderContent && this.renderDetails(subscription)}
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

