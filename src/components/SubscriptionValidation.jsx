import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import {stop} from "../utils/Utils";

import "./SubscriptionValidation.css";
import {organisationNameByUuid, productNameById, renderDate} from "../utils/Lookups";
import CheckBox from "../components/CheckBox";
import {setFlash} from "../utils/Flash";
import {deleteSubscription} from "../api/index";
import ConfirmationDialog from "./ConfirmationDialog";

export default class SubscriptionValidation extends React.Component {

    constructor(props) {
        super(props);
        const {organisations, products, subscriptions} = this.props;
        this.enrichSubscriptions(subscriptions, organisations, products);
        this.state = {
            sorted: {name: "status", descending: false},
            subscriptions: subscriptions,
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this,
            confirm: () => this,
            confirmationDialogQuestion: "",
        };
    }

    enrichSubscriptions(subscriptions, organisations, products) {
        subscriptions.forEach(subscription => {
            subscription.customer_name = organisationNameByUuid(subscription.client_id, organisations);
            subscription.product_name = productNameById(subscription.product_id, products);
            subscription.end_date_epoch = subscription.end_date ? new Date(subscription.end_date).getTime() : "";
            subscription.start_date_epoch = subscription.start_date ? new Date(subscription.start_date).getTime() : "";
        });
    }

    componentWillReceiveProps(nextProps) {
        const {subscriptions} = nextProps;
        if (subscriptions.length !== this.state.subscriptions.length) {
            const {organisations, products} = this.props;
            this.enrichSubscriptions(subscriptions, organisations, products);
            this.setState({subscriptions: subscriptions});
        }
    };


    showSubscription = subscription => () => this.props.history.push("/subscription/" + subscription.subscription_id);

    sortBy = name => (a, b) => {
        const aSafe = a[name] || "";
        const bSafe = b[name] || "";
        return typeof aSafe === "string" ? aSafe.toLowerCase().localeCompare(bSafe.toLowerCase()) : aSafe - bSafe;
    };

    sort = name => e => {
        stop(e);
        if (name !== "noop") {
            const sorted = {...this.state.sorted};
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
            return <i className={sorted.descending ? "fa fa-sort-desc" : "fa fa-sort-asc"}></i>
        }
        return <i/>;
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

    handleDeleteSubscription = subscription => e => {
        stop(e);
        this.confirmation(I18n.t("subscriptions.deleteConfirmation", {
                name: subscription.product_name,
                customer: subscription.customer_name
            }), () =>
                deleteSubscription(subscription.subscription_id).then(() => {
                    this.props.onChange();
                    setFlash(I18n.t("subscriptions.flash.delete", {name: subscription.product_name}));
                })
        );
    };

    renderSubscriptionsTable(subscriptions, sorted) {
        const columns = ["customer_name", "description", "insync", "product_name", "status", "start_date_epoch",
            "end_date_epoch", "noop"];
        const th = index => {
            const name = columns[index];
            return <th key={index} className={name} onClick={this.sort(name)}>
                <span>{I18n.t(`subscriptions.${name}`)}</span>
                {name !== "nope" && this.sortColumnIcon(name, sorted)}
            </th>
        };

        if (subscriptions.length !== 0) {
            return (
                <table className="subscriptions">
                    <thead>
                    <tr>{columns.map((column, index) => th(index))}</tr>
                    </thead>
                    <tbody>
                    {subscriptions.map((subscription, index) =>
                        <tr key={`${subscription.subscription_id}_${index}`}
                            onClick={this.showSubscription(subscription)}>
                            <td data-label={I18n.t("subscriptions.customer_name")}
                                className="customer_name">{subscription.customer_name}</td>
                            <td data-label={I18n.t("subscriptions.description")}
                                className="description">{subscription.description}</td>
                            <td data-label={I18n.t("subscriptions.insync")} className="insync">
                                <CheckBox value={subscription.insync} name="insync" readOnly={true}/>
                            </td>
                            <td data-label={I18n.t("subscriptions.product_name")}
                                className="product_name">{subscription.product_name}</td>
                            <td data-label={I18n.t("subscriptions.status")}
                                className="status">{subscription.status}</td>
                            <td data-label={I18n.t("subscriptions.start_date_epoch")}
                                className="start_date_epoch">{renderDate(subscription.start_date)}</td>
                            <td data-label={I18n.t("subscriptions.name")}
                                className="end_date_epoch">{renderDate(subscription.end_date)}</td>
                            <td data-label={I18n.t("subscriptions.nope")}
                                className="actions"><span>
                                <i className="fa fa-trash" onClick={this.handleDeleteSubscription(subscription)}></i>
                            </span></td>
                        </tr>
                    )}
                    </tbody>
                </table>
            );
        }
        return <div><em>{I18n.t("validations.no_subscriptions")}</em></div>;
    }

    render() {
        const {
            subscriptions, sorted, confirmationDialogOpen, confirmationDialogAction,
            confirmationDialogQuestion
        } = this.state;
        const {workflow} = this.props;
        return (
            <section className="subscription-validation">
                <ConfirmationDialog isOpen={confirmationDialogOpen}
                                    cancel={this.cancelConfirmation}
                                    confirm={confirmationDialogAction}
                                    question={confirmationDialogQuestion}/>
                <h3>{I18n.t("validations.workflow_key", {workflow: workflow})}</h3>
                <section className="subscriptions">
                    {this.renderSubscriptionsTable(subscriptions, sorted)}
                </section>
            </section>
        );
    }
}

SubscriptionValidation.propTypes = {
    history: PropTypes.object.isRequired,
    organisations: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired,
    subscriptions: PropTypes.array.isRequired,
    workflow: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

