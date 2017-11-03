import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import debounce from "lodash/debounce";
import {subscriptions} from "../api";
import {isEmpty, stop} from "../utils/Utils";

import "./Subscriptions.css";
import FilterDropDown from "../components/FilterDropDown";
import {organisationNameByUuid, productNameById, productTagById, renderDate} from "../utils/Lookups";
import CheckBox from "../components/CheckBox";

export default class Subscriptions extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            subscriptions: [],
            filteredSubscriptions: [],
            filterAttributesProduct: [],
            query: "",
            sorted: {name: "status", descending: false}
        };
    }

    componentDidMount = () => subscriptions()
        .then(results => {
            const {organisations, products} = this.props;
            results.forEach(subscription => {
                subscription.customer_name = organisationNameByUuid(subscription.client_id, organisations);
                subscription.product_name = productNameById(subscription.product_id, products);
                subscription.product_tag = productTagById(subscription.product_id, products)
                subscription.end_date_epoch = subscription.end_date ? new Date(subscription.end_date).getTime() : "";
                subscription.start_date_epoch = subscription.start_date ? new Date(subscription.start_date).getTime() : "";
            });
            const newFilterAttributesProduct = [];
            this.props.products.forEach(product => {
                newFilterAttributesProduct.push({
                    name: product.tag,
                    selected: true,
                    count: results.filter(result => result.product_tag === product.tag).length
                })
            });

            this.setState({
                subscriptions: results, filteredSubscriptions: results,
                filterAttributesProduct: newFilterAttributesProduct.filter(attr => attr.count > 0)
            })
        });

    showSubscription = subscription => () => this.props.history.push("/subscription/" + subscription.subscription_id);

    search = e => {
        const query = e.target.value;
        this.setState({query: query});
        this.delayedSearch(query);
    };

    doSearchAndSortAndFilter = (query, subscriptions, sorted, filterAttributesProduct) => {
        if (!isEmpty(query)) {
            const queryToLower = query.toLowerCase();
            const searchable = ["customer_name", "description", "product_name", "status", "sub_name"];
            subscriptions = subscriptions.filter(subscription =>
                searchable.map(search => subscription[search].toLowerCase().indexOf(queryToLower))
                    .some(indexOf => indexOf > -1)
            );

        }
        subscriptions = subscriptions.filter(subscription => {
            const productFilter = filterAttributesProduct.find(attr => attr.name === subscription.product_tag);
            return productFilter ? productFilter.selected : true;
        });
        subscriptions.sort(this.sortBy(sorted.name));
        return sorted.descending ? subscriptions.reverse() : subscriptions;
    };

    delayedSearch = debounce(query => {
        const subscriptions = [...this.state.subscriptions];
        const {filterAttributesProduct} = this.state;

        this.setState({
            query: query,
            filteredSubscriptions: this.doSearchAndSortAndFilter(query, subscriptions, this.state.sorted, filterAttributesProduct)
        });
    }, 250);

    sortBy = name => (a, b) => {
        const aSafe = a[name] || "";
        const bSafe = b[name] || "";
        return typeof aSafe === "string" ? aSafe.toLowerCase().localeCompare(bSafe.toLowerCase()) : aSafe - bSafe;
    };

    sort = name => e => {
        stop(e);
        const sorted = {...this.state.sorted};
        const filteredSubscriptions = [...this.state.filteredSubscriptions].sort(this.sortBy(name));

        sorted.descending = sorted.name === name ? !sorted.descending : false;
        sorted.name = name;
        this.setState({
            filteredSubscriptions: sorted.descending ? filteredSubscriptions.reverse() : filteredSubscriptions,
            sorted: sorted
        });
    };

    filter = item => {
        const {subscriptions, filterAttributesProduct, sorted, query} = this.state;
        const newFilterAttributesProduct = [...filterAttributesProduct];
        newFilterAttributesProduct.forEach(attr => {
            if (attr.name === item.name) {
                attr.selected = !attr.selected;
            }
        });
        this.setState({
            filteredSubscriptions: this.doSearchAndSortAndFilter(query, subscriptions, sorted, newFilterAttributesProduct),
            filterAttributesProduct: newFilterAttributesProduct
        });
    };

    sortColumnIcon = (name, sorted) => {
        if (sorted.name === name) {
            return <i className={sorted.descending ? "fa fa-sort-desc" : "fa fa-sort-asc"}></i>
        }
        return <i/>;
    };

    renderSubscriptionsTable(subscriptions, sorted) {
        const columns = ["customer_name", "description", "insync", "product_name", "status", "start_date_epoch", "end_date_epoch"];
        const th = index => {
            const name = columns[index];
            return <th key={index} className={name} onClick={this.sort(name)}>
                <span>{I18n.t(`subscriptions.${name}`)}</span>
                {this.sortColumnIcon(name, sorted)}
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
                        </tr>
                    )}
                    </tbody>
                </table>
            );
        }
        return <div><em>{I18n.t("subscriptions.no_found")}</em></div>;
    }

    render() {
        const {filteredSubscriptions, filterAttributesProduct, query, sorted} = this.state;
        const {organisations} = this.props;
        return (
            <div className="mod-subscriptions">
                <div className="card">
                    <div className="options">
                        <FilterDropDown items={filterAttributesProduct}
                                        filterBy={this.filter}
                                        label={I18n.t("subscriptions.product")}/>
                        <section className="search">
                            <input className="allowed"
                                   placeholder={I18n.t("subscriptions.searchPlaceHolder")}
                                   type="text"
                                   onChange={this.search}
                                   value={query}/>
                            <i className="fa fa-search"></i>
                        </section>
                    </div>
                </div>
                <section className="subscriptions">
                    {this.renderSubscriptionsTable(filteredSubscriptions, sorted, organisations)}
                </section>
            </div>
        );
    }
}

Subscriptions.propTypes = {
    history: PropTypes.object.isRequired,
    organisations: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired
};

