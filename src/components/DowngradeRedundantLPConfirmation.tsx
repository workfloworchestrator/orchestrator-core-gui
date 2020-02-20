/*
 * Copyright 2019 SURF.
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

import React from "react";
import I18n from "i18n-js";
import { subscriptionsDetail } from "../api/index";
import { enrichSubscription } from "../utils/Lookups";

import "./DowngradeRedundantLPConfirmation.scss";
import CheckBox from "./CheckBox";
import { SubscriptionWithDetails } from "../utils/types";
import DowngradeRedundantLPChoice from "./DowngradeRedundantLPChoice";
import ApplicationContext from "../utils/ApplicationContext";

interface IMSPortData {
    location: string;
    node: string;
    patchposition: string;
    connector_type: string;
    customer_name: string;
}

interface PortData {
    description: string;
    ims_port: IMSPortData;
}

interface LegData {
    left: PortData;
    right: PortData;
    ims_circuit_id: number;
    ims_protection_circuit_id: number;
}

interface IProps {
    subscriptionId: string;
    primary: LegData;
    secondary: LegData;
    choice: "Primary" | "Secondary";
}

interface IState {
    subscription?: SubscriptionWithDetails;
}

export default class DowngradeRedundantLPConfirmation extends React.PureComponent<IProps, IState> {
    state: IState = {};

    componentWillMount() {
        const { subscriptionId } = this.props;
        const { organisations, products } = this.context;

        subscriptionsDetail(subscriptionId).then(subscription => {
            const enriched_subscription = enrichSubscription(subscription, organisations, products);
            this.setState({ subscription: enriched_subscription });
        });
    }

    renderChoice = (choice: "Primary" | "Secondary") => {
        const primary = choice === "Primary";
        return (
            <section className="choice">
                <h3>{I18n.t("downgrade_redundant_lp.choosen")}</h3>
                <CheckBox
                    name="primary"
                    value={primary}
                    info={I18n.t("downgrade_redundant_lp.primary")}
                    onChange={() => this}
                    readOnly={true}
                />
                <CheckBox
                    name="secondary"
                    value={!primary}
                    onChange={() => this}
                    info={I18n.t("downgrade_redundant_lp.secondary")}
                    readOnly={true}
                />
            </section>
        );
    };

    renderSubscriptionDetail = (subscription: SubscriptionWithDetails, className: string = "", index: number = 0) => (
        <section className="details">
            <h3>{I18n.t("subscription.subscription")}</h3>
            <div key={`${subscription.subscription_id}_${index}`} className={`form-container ${className}`}>
                <section className="part">
                    <label className="title">{I18n.t("subscriptions.customer_name")}</label>
                    <input type="text" readOnly={true} value={subscription.customer_name} />
                    <label className="title">{I18n.t("subscriptions.name")}</label>
                    <input type="text" readOnly={true} value={subscription.name} />
                </section>
                <section className="part">
                    <label className="title">{I18n.t("subscriptions.status")}</label>
                    <input type="text" readOnly={true} value={subscription.status} />
                    <label className="title">{I18n.t("subscriptions.description")}</label>
                    <input type="text" readOnly={true} value={subscription.description} />
                </section>
            </div>
        </section>
    );

    renderDetail = (port: PortData, label: string) => (
        <div>
            <p className="child">{label}</p>
            <label className="title">{I18n.t("downgrade_redundant_lp.description")}</label>
            <input type="text" readOnly={true} value={port.description} />
            <label className="title">{I18n.t("downgrade_redundant_lp.connector_type")}</label>
            <input type="text" readOnly={true} value={port.ims_port.connector_type} />
            {port.ims_port.customer_name && (
                <div>
                    <label className="title">{I18n.t("downgrade_redundant_lp.customer_name")}</label>
                    <input type="text" readOnly={true} value={port.ims_port.customer_name} />
                </div>
            )}
            <label className="title">{I18n.t("downgrade_redundant_lp.location")}</label>
            <input type="text" readOnly={true} value={port.ims_port.location} />
            <label className="title">{I18n.t("downgrade_redundant_lp.node")}</label>
            <input type="text" readOnly={true} value={port.ims_port.node} />
            <label className="title">{I18n.t("downgrade_redundant_lp.patch_position")}</label>
            <input type="text" readOnly={true} value={port.ims_port.patchposition} />
        </div>
    );

    renderLightPath = (lp: LegData, prefix: string) => (
        <section className="subscription_child">
            <label className="title">{I18n.t("downgrade_redundant_lp.ims_circuit_id")}</label>
            <input type="text" readOnly={true} value={lp.ims_circuit_id} />
            <label className="title">{I18n.t("downgrade_redundant_lp.ims_protection_circuit_id")}</label>
            <input type="text" readOnly={true} value={lp.ims_protection_circuit_id} />
            {this.renderDetail(lp.left, `${prefix}-left`)}
            {this.renderDetail(lp.right, `${prefix}-right`)}
        </section>
    );

    renderDetails = (primary: LegData, secondary: LegData) => {
        return (
            <section className="lightpaths">
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
            </section>
        );
    };

    render() {
        const { subscription } = this.state;
        const { primary, secondary, choice } = this.props;

        if (!subscription) {
            return null;
        }

        return (
            <div className="mod-downgrade-redundant-lp-confirmation">
                {this.renderSubscriptionDetail(subscription)}
                {this.renderChoice(choice)}
                {this.renderDetails(primary, secondary)}
            </div>
        );
    }
}

DowngradeRedundantLPChoice.contextType = ApplicationContext;
