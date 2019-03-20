import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import {subscriptions} from "../api";
import {isEmpty} from "../utils/Utils";

import "./Subscriptions.scss";
import FilterDropDown from "../components/FilterDropDown";
import ConfirmationDialog from "../components/ConfirmationDialog";

export default class Subscriptions extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            subscriptions: [],
            filterAttributesProduct: [],
            filterAttributesStatus: [
                {name: "initial", selected: true, count: 0},
                {name: "provisioning", selected: true, count: 0},
                {name: "migrating", selected: true, count: 0},
                {name: "active", selected: true, count: 0},
                {name: "disabled", selected: true, count: 0},
                {name: "terminated", selected: false, count: 0}
            ],
            searchPhrase: "",
            sorted: {name: "start_date", descending: true},
        };
    }

    componentDidMount = () => subscriptions()
        .then(results => {
           // const newFilterAttributesProduct = [];
           // this.setState({
           //      subscriptions: results,
           //      filteredSubscriptions: this.doSearchAndSortAndFilter("", results, this.state.sorted, filterAttributesProduct, filterAttributesStatus),
           //      filterAttributesProduct: filterAttributesProduct,
           //      filterAttributesStatus: filterAttributesStatus,
           //      collapsibleSubscriptions: collapsibleSubscriptions
           //  });
        });

    filter = item => {
        console.log("filter() called")
    };



    showSubscriptionDetail = subscription => () => this.props.history.push("/subscription/" + subscription.subscription_id);

    render() {
        const {
            filteredSubscriptions, filterAttributesProduct, filterAttributesStatus, searchPhrase, sorted,
        } = this.state;
        return (
            <div className="subscriptions-page">
               <div className="card">
                    <div className="options">
                        <FilterDropDown items={filterAttributesProduct}
                                        filterBy={this.filter}
                                        label={I18n.t("subscriptions.product")}/>
                        <FilterDropDown items={filterAttributesStatus}
                                        filterBy={this.filter}
                                        label={I18n.t("subscriptions.status")}/>
                        <section className="search">
                            <input className="allowed"
                                   placeholder={I18n.t("subscriptions.searchPlaceHolder")}
                                   type="text"
                                   value={searchPhrase}/>
                            <i className="fa fa-search"></i>
                        </section>
                    </div>
                </div>
                <section className="subscriptions-container">
                </section>
            </div>
        );
    }
}

Subscriptions.propTypes = {
    history: PropTypes.object.isRequired,
};
