import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import { isEmpty } from "../utils/Utils";
import { getResourceTypeInfo, subscriptionsDetail } from "../api/index";
import { enrichSubscription, enrichPortSubscription, enrichPrimarySubscription } from "../utils/Lookups";
import { port_subscription_id, subscriptionInstanceValues } from "../validations/Subscriptions";

import "./DowngradeRedundantLPChoice.scss";
import CheckBox from "./CheckBox";

export default class DowngradeRedundantLPChoice extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            subscription: { instances: [] },
            childSubscriptions: [],
            spPL: "",
            spPR: "",
            spSL: "",
            spSR: "",
            primarySelected: true
        };
    }

    componentWillMount() {
        const { subscriptionId, organisations, products } = this.props;
        subscriptionsDetail(subscriptionId).then(subscription => {
            enrichPrimarySubscription(subscription, organisations, products);
            this.setState({ subscription: subscription });
            const values = subscriptionInstanceValues(subscription);
            const portSubscriptionResourceTypes = values.filter(
                val => val.resource_type.resource_type === port_subscription_id
            );
            const promises = portSubscriptionResourceTypes.map(rt =>
                getResourceTypeInfo(port_subscription_id, rt.value)
            );
            Promise.all(promises).then(results => {
                const children = results.map(obj => obj.json);
                children.forEach(sub => enrichSubscription(sub, organisations, products));
                const portPromises = children.map(sub => enrichPortSubscription(subscription, sub));
                Promise.all(portPromises).then(results => {
                    this.setState({
                        spPL: results.find(r => r.label === "Primary-left"),
                        spPR: results.find(r => r.label === "Primary-right"),
                        spSL: results.find(r => r.label === "Secondary-left"),
                        spSR: results.find(r => r.label === "Secondary-right")
                    });
                });
                this.setState({ childSubscriptions: children });
            });
        });
    }

    renderChild = (subscription, children, label) => {
        const instance = subscription.instances.find(instance => instance.label.toLowerCase() === label);
        const child = children.find(child => instance.values.find(value => value.value === child.subscription_id));
        return (
            <section className="subscription_child">
                <p className="child">{label}</p>
                <label className="title">{I18n.t("subscriptions.customer_name")}</label>
                <input type="text" readOnly={true} value={child.customer_name} />
                <label className="title">{I18n.t("subscriptions.description")}</label>
                <input type="text" readOnly={true} value={child.description} />
            </section>
        );
    };

    renderServicePort = (title, servicePort) => {
        return (
            <tbody>
                <tr className="label">
                    <td colSpan="2">{title}</td>
                </tr>
                {servicePort && this.renderValue("klant", servicePort.customer_name, 1)}
                {servicePort && this.renderValue("CRM port ID", servicePort.crm_port_id, 1)}
                {servicePort && this.renderValue("IMS circuit name", servicePort.ims_circuit_name, 1)}
                {servicePort && this.renderValue("IMS node", servicePort.ims_node, 1)}
                {servicePort && this.renderValue("IMS port", servicePort.ims_port, 1)}
                {servicePort && this.renderValue("VLAN ID", servicePort.vlan, 1)}
                {servicePort && this.renderValue("interface type", servicePort.ims_iface_type, 1)}
                {servicePort && this.renderValue("patch position", servicePort.ims_patch_position, 1)}
                {servicePort &&
                    this.renderValue("port subscription", this.renderSubscriptionLink(servicePort.subscription_id), 1)}
            </tbody>
        );
    };

    renderValue = (name, value, colspan) => {
        return (
            <tr>
                <td className="label">{name}</td>
                <td colSpan={colspan} className="value">
                    {value}
                </td>
            </tr>
        );
    };

    renderSubscriptionLink = subscription_id => {
        return (
            <a href={"/subscription/" + subscription_id} target="_blank" rel="noopener noreferrer">
                {subscription_id}
            </a>
        );
    };

    renderSubscription = (subscription, children) => {
        if (isEmpty(children)) {
            return null;
        }
        const { spPL, spPR, spSL, spSR, primarySelected } = this.state;
        return (
            <section className="lightpaths">
                <div key={subscription.subscription_id} className={`form-container`}>
                    <div style={{ flexDirection: "column" }}>
                        <div className={"rlp_container"}>
                            <table className="rlp_heading">
                                <thead>
                                    <tr>
                                        <th colSpan="5">
                                            <h3>{I18n.t("downgrade_redundant_lp.redundant_lightpath")}</h3>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.renderValue("klant", subscription.customer_name, 4)}
                                    {this.renderValue("protection", "redundant", 4)}
                                    {this.renderValue("speed", subscription.service_speed, 4)}
                                    {this.renderValue(
                                        "nms_service_id",
                                        subscription.nms_service_id_p + " en " + subscription.nms_service_id_s,
                                        4
                                    )}
                                    {this.renderValue(
                                        "subscription",
                                        this.renderSubscriptionLink(subscription.subscription_id),
                                        4
                                    )}
                                    <tr>
                                        <td className="vspacer" colSpan="5" />
                                    </tr>
                                    <tr>
                                        <td colSpan="2" className="border-off">
                                            <table className={primarySelected ? "highlight-on" : "highlight-off"}>
                                                <thead>
                                                    <tr>
                                                        <td>
                                                            <h3>Primary LP</h3>
                                                        </td>
                                                        <td>{subscription.nms_service_id_p}</td>
                                                    </tr>
                                                </thead>
                                                {this.renderServicePort("A1", spPL)}
                                                {this.renderServicePort("B1", spPR)}
                                            </table>
                                        </td>
                                        <td className="spacer" />
                                        <td colSpan="2">
                                            <table className={primarySelected ? "highlight-off" : "highlight-on"}>
                                                <thead>
                                                    <tr>
                                                        <td>
                                                            <h3>Secondary LP</h3>
                                                        </td>
                                                        <td>{subscription.nms_service_id_s}</td>
                                                    </tr>
                                                </thead>
                                                {this.renderServicePort("A2", spSL)}
                                                {this.renderServicePort("B2", spSR)}
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        );
    };

    onChangeChoice = e => {
        const checked = e.target.checked;
        const isPrimary = e.target.name === "primary";
        this.setState({ primarySelected: isPrimary });
        const result = isPrimary ? (checked ? "Primary" : "Secondary") : checked ? "Secondary" : "Primary";
        this.props.onChange({ target: { value: result } });
    };

    renderChoice = () => {
        const { value, readOnly } = this.props;
        const primary = isEmpty(value) || value === "Primary";
        return (
            <section className="choice">
                <h3>{I18n.t("downgrade_redundant_lp.choice")}</h3>
                <CheckBox
                    name="primary"
                    value={primary}
                    onChange={this.onChangeChoice}
                    info={I18n.t("downgrade_redundant_lp.primary")}
                    readOnly={readOnly || false}
                />
                <CheckBox
                    name="secondary"
                    value={!primary}
                    onChange={this.onChangeChoice}
                    info={I18n.t("downgrade_redundant_lp.secondary")}
                    readOnly={readOnly || false}
                />
            </section>
        );
    };

    render() {
        const { childSubscriptions, subscription } = this.state;
        return (
            <div className="mod-downgrade-redundant-lp">
                {this.renderSubscription(subscription, childSubscriptions)}
                {this.renderChoice()}
            </div>
        );
    }
}

DowngradeRedundantLPChoice.propTypes = {
    organisations: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired,
    subscriptionId: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
    readOnly: PropTypes.bool
};
