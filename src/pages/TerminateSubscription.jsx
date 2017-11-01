import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import "./NewProcess.css";
import {productById, subscriptionsDetail} from "../api";
import {isEmpty} from "../utils/Utils";
import "./ProcessDetail.css";
import "highlight.js/styles/default.css";
import ContactPersons from "../components/ContactPersons";
import {renderDate} from "../utils/Lookups";
import CheckBox from "../components/CheckBox";

export default class TerminateSubscription extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            product: {},
            userInput: [],
            subscription: {}
        };
    }

    componentDidMount = () => {
        const {subscriptionId} = this.props;
        subscriptionsDetail(subscriptionId).then(subscription => {
            this.setState({subscription: subscription});
            productById(subscription.product_id).then(product =>
                this.setState({product: product}))
        });
    };

    // validSubmit = (userInput) => {
    //     if (!isEmpty(this.state.product)) {
    //         const product = {
    //             name: "product",
    //             type: "product",
    //             value: this.state.product.value,
    //             tag: this.state.product.tag
    //         };
    //         //create a copy to prevent re-rendering
    //         let processInput = [...stepUserInput];
    //         processInput.push(product);
    //
    //         processInput = processInput.reduce((acc, input) => {
    //             acc[input.name] = input.value;
    //             return acc;
    //         }, {});
    //         startProcess(processInput)
    //             .then(() => {
    //                 this.props.history.push(`/processes`);
    //                 const {products} = this.props;
    //                 const name = products.find(prod => prod.identifier === this.state.product.value).name;
    //                 setFlash(I18n.t("process.flash.create", {name: name}));
    //             });
    //     }
    // };

    changeUserInput = name => value => {
        const userInput = [...this.state.userInput];
        userInput.find(input => input.name === name).value = value;
        this.setState({process: {...this.state.process, user_input: userInput}});
    };


    renderSubscriptionDetail = subscription =>
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


    render() {
        const {product, subscription, userInput} = this.state;
        return (
            <div className="mod-terminate-subscription">
                <section className="card">
                    <h3>{I18n.t("subscription.terminate")}</h3>
                    {false && this.renderProduct(product)}
                    {false && this.renderSubscriptionDetail(subscription)}
                    <section className="form-step">
                        <section className="form-divider">
                            {<label htmlFor="name">{I18n.t("process.contact_persons")}</label>}
                            {<em>{I18n.t("process.contact_persons")}</em>}
                            <ContactPersons
                                persons={isEmpty(userInput.value) ? [{email: "", name: "", tel: ""}] : userInput.value}
                                onChange={this.changeUserInput("contact_persons")}/>
                        </section>
                    </section>
                </section>
            </div>
        );
    }
}

TerminateSubscription.propTypes = {
    history: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    organisations: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired,
    subscriptionId: PropTypes.string
};
