import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import {isEmpty} from "../utils/Utils";
import {imsService, subscriptionsDetail} from "../api/index";
import {enrichSubscription} from "../utils/Lookups";
import {port_subscription_id, subscriptionInstanceValues} from "../validations/Subscriptions";

import "./DowngradeRedundantLPChoice.css";
import CheckBox from "./CheckBox";

export default class DowngradeRedundantLPChoice extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            subscription: {instances: []},
            childSubscriptions: [],
            primary: true
        };
    }

    componentWillMount() {
        const {subscriptionId, organisations, products} = this.props;
        subscriptionsDetail(subscriptionId).then(subscription => {
            enrichSubscription(subscription, organisations, products);
            this.setState({subscription: subscription});
            const values = subscriptionInstanceValues(subscription);
            const portSubscriptionResourceTypes = values.filter(val => val.resource_type.resource_type === port_subscription_id);
            const promises = portSubscriptionResourceTypes.map(rt => imsService(port_subscription_id, rt.value));

            Promise.all(promises).then(results => {
                const children = results.map(obj => obj.json);
                children.forEach(sub => enrichSubscription(sub, organisations, products));
                this.setState({childSubscriptions: children});
            });
        })
    }

    renderChild = (subscription, children, label) => {
        const instance = subscription.instances.find(instance => instance.label.toLowerCase() === label);
        const child = children.find(child => instance.values.find(value => value.value === child.subscription_id));
        return <section className="subscription_child">
            <p className="child">{label}</p>
            <label className="title">{I18n.t("subscriptions.customer_name")}</label>
            <input type="text" readOnly={true} value={child.customer_name}/>
            <label className="title">{I18n.t("subscriptions.description")}</label>
            <input type="text" readOnly={true} value={child.description}/>
        </section>

    };

    renderSubscriptionChilds = (subscription, children) => {
        if (isEmpty(children)) {
            return null;
        }
        return <section className="lightpaths">
            <div key={subscription.subscription_id} className={`form-container`}>
                <section className="part">
                    <h3>{I18n.t("downgrade_redundant_lp.primary")}</h3>
                    {this.renderChild(subscription, children, "primary-left")}
                    {this.renderChild(subscription, children, "primary-right")}
                </section>
                <section className="part">
                    <h3>{I18n.t("downgrade_redundant_lp.secondary")}</h3>
                    {this.renderChild(subscription, children, "secondary-left")}
                    {this.renderChild(subscription, children, "secondary-right")}
                </section>
            </div>
        </section>;
    };

    renderChoice = () => {
        const {primary} = this.state;
        return <section className="choice">
            <h3>{I18n.t("downgrade_redundant_lp.choice")}</h3>
            <CheckBox name="primary" value={primary}
                      onChange={e => this.setState({primary: e.target.checked})}
                      info={I18n.t("downgrade_redundant_lp.primary")}/>
            <CheckBox name="secondary" value={!primary}
                      onChange={e => this.setState({primary: !e.target.checked})}
                      info={I18n.t("downgrade_redundant_lp.secondary")}/>
        </section>
    };
    render() {
        const {childSubscriptions, subscription} = this.state;
        return (
            <div className="mod-downgrade-redundant-lp">
                {this.renderSubscriptionChilds(subscription, childSubscriptions)}
                {this.renderChoice()}
            </div>
        );
    }
}

DowngradeRedundantLPChoice.propTypes = {
    organisations: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired,
    subscriptionId: PropTypes.string.isRequired
};
