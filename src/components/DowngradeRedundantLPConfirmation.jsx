import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import {subscriptionsDetail} from "../api/index";
import {enrichSubscription} from "../utils/Lookups";

import "./DowngradeRedundantLPConfirmation.scss";
import CheckBox from "./CheckBox";

export default class DowngradeRedundantLPConfirmation extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            subscription: {instances: []}
        };
    }

    componentWillMount() {
        const {subscriptionId, organisations, products} = this.props;
        subscriptionsDetail(subscriptionId).then(subscription => {
            enrichSubscription(subscription, organisations, products);
            this.setState({subscription: subscription});
        })
    }

    renderChoice = (choice) => {
        const primary = choice === "Primary";
        return <section className="choice">
            <h3>{I18n.t("downgrade_redundant_lp.choosen")}</h3>
            <CheckBox name="primary" value={primary}
                      info={I18n.t("downgrade_redundant_lp.primary")}
                      onChange={() => this}
                      readOnly={true}/>
            <CheckBox name="secondary" value={!primary}
                      onChange={() => this}
                      info={I18n.t("downgrade_redundant_lp.secondary")}
                      readOnly={true}/>
        </section>
    };

    renderSubscriptionDetail = (subscription, className = "", index = 0) =>
        <section className="details">
            <h3>{I18n.t("subscription.subscription")}</h3>
            <div key={`${subscription.subscription_id}_${index}`} className={`form-container ${className}`}>
                <section className="part">
                    <label className="title">{I18n.t("subscriptions.customer_name")}</label>
                    <input type="text" readOnly={true} value={subscription.customer_name}/>
                    <label className="title">{I18n.t("subscriptions.name")}</label>
                    <input type="text" readOnly={true} value={subscription.name}/>
                </section>
                <section className="part">
                    <label className="title">{I18n.t("subscriptions.status")}</label>
                    <input type="text" readOnly={true} value={subscription.status}/>
                    <label className="title">{I18n.t("subscriptions.description")}</label>
                    <input type="text" readOnly={true} value={subscription.description}/>
                </section>
            </div>
        </section>;


    renderDetail = (port, label) => <div>
        <p className="child">{label}</p>
        <label className="title">{I18n.t("downgrade_redundant_lp.description")}</label>
        <input type="text" readOnly={true} value={port.description}/>
        <label className="title">{I18n.t("downgrade_redundant_lp.connector_type")}</label>
        <input type="text" readOnly={true} value={port.ims_port.connector_type}/>
        {port.ims_port.customer_name && <div>
            <label className="title">{I18n.t("downgrade_redundant_lp.customer_name")}</label>
            <input type="text" readOnly={true} value={port.ims_port.customer_name}/>
        </div>
        }
        <label className="title">{I18n.t("downgrade_redundant_lp.location")}</label>
        <input type="text" readOnly={true} value={port.ims_port.location}/>
        <label className="title">{I18n.t("downgrade_redundant_lp.node")}</label>
        <input type="text" readOnly={true} value={port.ims_port.node}/>
        <label className="title">{I18n.t("downgrade_redundant_lp.patch_position")}</label>
        <input type="text" readOnly={true} value={port.ims_port.patchposition}/>
    </div>;


    renderLightPath = (lp, prefix) => <section className="subscription_child">
        <label className="title">{I18n.t("downgrade_redundant_lp.ims_circuit_id")}</label>
        <input type="text" readOnly={true} value={lp.ims_circuit_id}/>
        <label className="title">{I18n.t("downgrade_redundant_lp.ims_protection_circuit_id")}</label>
        <input type="text" readOnly={true} value={lp.ims_protection_circuit_id}/>
        {this.renderDetail(lp.left, `${prefix}-left`)}
        {this.renderDetail(lp.right, `${prefix}-right`)}
    </section>;


    renderDetails = (primary, secondary) => {
        return <section className="lightpaths">
            <div className={`form-container`}>
                <section className="part">
                    <h3>{I18n.t("downgrade_redundant_lp.primary")}</h3>
                    {this.renderLightPath(primary, "Primary")}
                </section>
                <section className="part">
                    <h3>{I18n.t("downgrade_redundant_lp.secondary")}</h3>
                    {this.renderLightPath(secondary, "Secondary")}
                </section>
            </div>
        </section>;
    };


    render() {
        const {subscription} = this.state;
        const {primary, secondary, choice} = this.props;
        return (
            <div className="mod-downgrade-redundant-lp-confirmation">
                {this.renderSubscriptionDetail(subscription)}
                {this.renderChoice(choice)}
                {this.renderDetails(primary, secondary)}
            </div>
        );
    }
}

DowngradeRedundantLPConfirmation.propTypes = {
    organisations: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired,
    subscriptionId: PropTypes.string.isRequired,
    primary: PropTypes.object.isRequired,
    secondary: PropTypes.object.isRequired,
    choice: PropTypes.string.isRequired,
};
