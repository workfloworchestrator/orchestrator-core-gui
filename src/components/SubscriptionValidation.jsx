/*
 * Copyright 2019-2020 SURF.
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

import "./SubscriptionValidation.scss";

import I18n from "i18n-js";
import PropTypes from "prop-types";
import React from "react";

import { deleteSubscription } from "../api/index";
import CheckBox from "../components/CheckBox";
import ApplicationContext from "../utils/ApplicationContext";
import { setFlash } from "../utils/Flash";
import { enrichSubscription, renderDate } from "../utils/Lookups";
import { stop } from "../utils/Utils";
import ConfirmationDialog from "./ConfirmationDialog";

export default class SubscriptionValidation extends React.Component {
    constructor(props, context) {
        super(props, context);
        const { subscriptions } = this.props;
        const { organisations, products } = this.context;
        subscriptions.forEach(subscription => enrichSubscription(subscription, organisations, products));
        this.state = {
            sorted: { name: "status", descending: false },
            subscriptions: subscriptions,
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this,
            confirm: () => this,
            confirmationDialogQuestion: ""
        };
    }

    componentWillReceiveProps(nextProps) {
        const { subscriptions } = nextProps;
        if (subscriptions.length !== this.state.subscriptions.length) {
            const { organisations, products } = this.context;
            subscriptions.forEach(subscription => enrichSubscription(subscription, organisations, products));
            this.setState({ subscriptions: subscriptions });
        }
    }

    sortBy = name => (a, b) => {
        const aSafe = a[name] || "";
        const bSafe = b[name] || "";
        return typeof aSafe === "string" ? aSafe.toLowerCase().localeCompare(bSafe.toLowerCase()) : aSafe - bSafe;
    };

    sort = name => e => {
        stop(e);
        if (name !== "noop") {
            const sorted = { ...this.state.sorted };
            const subscriptions = [...this.state.subscriptions].sort(this.sortBy(name));

            sorted.descending = sorted.name === name ? !sorted.descending : false;
            sorted.name = name;
            this.setState({
                subscriptions: sorted.descending ? subscriptions.reverse() : subscriptions,
                sorted: sorted
            });
        }
    };

    sortColumnIcon = (name, sorted) => {
        if (sorted.name === name) {
            return <i className={sorted.descending ? "fas fa-sort-down" : "fas fa-sort-up"} />;
        }
        return <i />;
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

    handleDeleteSubscription = subscription => e => {
        stop(e);
        this.confirmation(
            I18n.t("subscriptions.deleteConfirmation", {
                name: subscription.product.name,
                customer: subscription.customer_name
            }),
            () =>
                deleteSubscription(subscription.subscription_id).then(() => {
                    this.props.onChange();
                    setFlash(
                        I18n.t("subscriptions.flash.delete", {
                            name: subscription.product.name
                        })
                    );
                })
        );
    };

    renderSubscriptionsTable(subscriptions, sorted) {
        const columns = [
            "customer_name",
            "description",
            "insync",
            "product_name",
            "status",
            "start_date_epoch",
            "end_date_epoch",
            "noop"
        ];
        const th = index => {
            const name = columns[index];
            return (
                <th key={index} className={name} onClick={this.sort(name)}>
                    <span>{I18n.t(`subscriptions.${name}`)}</span>
                    {name !== "nope" && this.sortColumnIcon(name, sorted)}
                </th>
            );
        };

        if (subscriptions.length !== 0) {
            return (
                <table className="subscriptions">
                    <thead>
                        <tr>{columns.map((column, index) => th(index))}</tr>
                    </thead>
                    <tbody>
                        {subscriptions.map((subscription, index) => (
                            <tr key={`${subscription.subscription_id}_${index}`}>
                                <td data-label={I18n.t("subscriptions.customer_name")} className="customer_name">
                                    {subscription.customer_name}
                                </td>
                                <td data-label={I18n.t("subscriptions.description")} className="description">
                                    <a
                                        href={`subscriptions/${subscription.subscription_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {subscription.description}
                                    </a>
                                </td>
                                <td data-label={I18n.t("subscriptions.insync")} className="insync">
                                    <CheckBox value={subscription.insync} name="insync" readOnly={true} />
                                </td>
                                <td data-label={I18n.t("subscriptions.product_name")} className="product_name">
                                    {subscription.product.name}
                                </td>
                                <td data-label={I18n.t("subscriptions.status")} className="status">
                                    {subscription.status}
                                </td>
                                <td data-label={I18n.t("subscriptions.start_date_epoch")} className="start_date_epoch">
                                    {renderDate(subscription.start_date)}
                                </td>
                                <td data-label={I18n.t("subscriptions.name")} className="end_date_epoch">
                                    {renderDate(subscription.end_date)}
                                </td>
                                <td data-label={I18n.t("subscriptions.nope")} className="actions">
                                    <span>
                                        <i
                                            className="fas fa-trash-alt"
                                            onClick={this.handleDeleteSubscription(subscription)}
                                        />
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
        return (
            <div>
                <em>{I18n.t("validations.no_subscriptions")}</em>
            </div>
        );
    }

    render() {
        const {
            subscriptions,
            sorted,
            confirmationDialogOpen,
            confirmationDialogAction,
            confirmationDialogQuestion
        } = this.state;
        const { workflow } = this.props;
        return (
            <section className="subscription-validation">
                <ConfirmationDialog
                    isOpen={confirmationDialogOpen}
                    cancel={this.cancelConfirmation}
                    confirm={confirmationDialogAction}
                    question={confirmationDialogQuestion}
                />
                <h3>{I18n.t("validations.workflow_key", { workflow: workflow })}</h3>
                <section className="subscriptions">{this.renderSubscriptionsTable(subscriptions, sorted)}</section>
            </section>
        );
    }
}

SubscriptionValidation.propTypes = {
    subscriptions: PropTypes.array.isRequired,
    workflow: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

SubscriptionValidation.contextType = ApplicationContext;
