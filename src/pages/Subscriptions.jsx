import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import debounce from "lodash/debounce";
import {childSubscriptions, parentSubscriptions, subscriptions} from "../api";
import {isEmpty, stop} from "../utils/Utils";

import "./Subscriptions.scss";
import FilterDropDown from "../components/FilterDropDown";
import {organisationNameByUuid, productNameById, productTagById, renderDate} from "../utils/Lookups";
import CheckBox from "../components/CheckBox";
import ConfirmationDialog from "../components/ConfirmationDialog";
import {deleteSubscription} from "../api/index";
import {setFlash} from "../utils/Flash";
import {searchableColumns, searchConstruct} from "../validations/Subscriptions";


const productServicePortTags = ["MSP", "MSPNL", "SSP", "RMSP"];
const productLightPathTags = ["LightPath", "ELAN"];
const collapsibleProductTags = productServicePortTags.concat(productLightPathTags);

export default class Subscriptions extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            subscriptions: [],
            filteredSubscriptions: [],
            filterAttributesProduct: [],
            filterAttributesStatus: [
                {name: "initial", selected: true, count: 0},
                {name: "provisioning", selected: true, count: 0},
                {name: "active", selected: true, count: 0},
                {name: "disabled", selected: true, count: 0},
                {name: "terminated", selected: false, count: 0}
            ],
            query: "",
            sorted: {name: "status", descending: false},
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this,
            confirm: () => this,
            confirmationDialogQuestion: "",
            collapsedSubscriptions: [],
            collapsibleSubscriptions: []
        };
    }

    componentDidMount = () => subscriptions()
        .then(results => {
            const {organisations, products} = this.props;
            const collapsibleSubscriptions = [];
            results.forEach(subscription => {
                this.enrichSubscription(subscription, organisations, products);
                if (collapsibleProductTags.includes(subscription.product_tag)) {
                    collapsibleSubscriptions.push(subscription.subscription_id);
                }
            });
            const newFilterAttributesProduct = [];
            const uniqueTags = [...new Set(products.map(p => p.tag))];
            uniqueTags.forEach(tag => {
                newFilterAttributesProduct.push({
                    name: tag,
                    selected: true,
                    count: results.filter(result => result.product_tag === tag).length
                })
            });
            const newFilterAttributesStatus = [...this.state.filterAttributesStatus];
            newFilterAttributesStatus.forEach(attr => attr.count = results
                .filter(sub => sub.status === attr.name).length);

            const filterAttributesProduct = newFilterAttributesProduct.filter(attr => attr.count > 0);
            const filterAttributesStatus = newFilterAttributesStatus.filter(attr => attr.count > 0);
            this.setState({
                subscriptions: results,
                filteredSubscriptions: this.doSearchAndSortAndFilter("", results, this.state.sorted, filterAttributesProduct, filterAttributesStatus),
                filterAttributesProduct: filterAttributesProduct,
                filterAttributesStatus: filterAttributesStatus,
                collapsibleSubscriptions: collapsibleSubscriptions
            });
        });

    enrichSubscription = (subscription, organisations, products) => {
        subscription.customer_name = organisationNameByUuid(subscription.customer_id, organisations);
        subscription.product_name = productNameById(subscription.product_id, products);
        subscription.product_tag = productTagById(subscription.product_id, products);
    };

    showSubscription = subscription => () => this.props.history.push("/subscription/" + subscription.subscription_id);

    search = e => {
        const query = e.target.value;
        this.setState({query: query});
        this.delayedSearch(query);
    };

    doSearchAndSortAndFilter = (query, subscriptions, sorted, filterAttributesProduct, filterAttributesStatus) => {
        if (!isEmpty(query)) {
            const queryToLower = query.toLowerCase();
            let colonIndex = queryToLower.indexOf(":");
            if (colonIndex > -1) {
                const searchOptions = searchConstruct(query);
                Object.keys(searchOptions).forEach(key => {
                    subscriptions = subscriptions.filter(subscription => {
                        const searchValue = searchOptions[key];
                        if (key === "global_search") {
                            const filteredColumns = searchableColumns.filter(col => !Object.keys(searchOptions).includes(col));
                            return filteredColumns
                                .map(search => subscription[search].toLowerCase().indexOf(searchValue))
                                .some(indexOf => indexOf > -1)
                        }
                        if (Array.isArray(searchValue)) {
                            return searchValue.every(val => subscription[key].toLowerCase().indexOf(val) > -1)
                        }
                        return subscription[key].toLowerCase().indexOf(searchValue) > -1;
                    })
                })
            } else {
                subscriptions = subscriptions.filter(subscription =>
                    searchableColumns.map(search => subscription[search].toLowerCase().indexOf(queryToLower))
                        .some(indexOf => indexOf > -1)
                );
            }
        }
        subscriptions = subscriptions.filter(subscription => {
            const productFilter = filterAttributesProduct.find(attr => attr.name === subscription.product_tag);
            return productFilter ? productFilter.selected : true;
        });
        subscriptions = subscriptions.filter(subscription => {
            const statusFilter = filterAttributesStatus.find(attr => attr.name === subscription.status);
            return statusFilter ? statusFilter.selected : true;
        });

        subscriptions.sort(this.sortBy(sorted.name));
        return sorted.descending ? subscriptions.reverse() : subscriptions;
    };

    delayedSearch = debounce(query => {
        const subscriptions = [...this.state.subscriptions];
        const {filterAttributesProduct, filterAttributesStatus} = this.state;

        this.setState({
            query: query,
            filteredSubscriptions: this.doSearchAndSortAndFilter(query, subscriptions, this.state.sorted, filterAttributesProduct, filterAttributesStatus)
        });
    }, 250);

    sortBy = name => (a, b) => {
        const aSafe = a[name] || "";
        const bSafe = b[name] || "";
        return typeof aSafe === "string" ? aSafe.toLowerCase().localeCompare(bSafe.toString().toLowerCase()) : aSafe - bSafe;
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
        const {subscriptions, filterAttributesProduct, filterAttributesStatus, sorted, query} = this.state;
        const newFilterAttributesProduct = [...filterAttributesProduct];
        newFilterAttributesProduct.forEach(attr => {
            if (attr.name === item.name) {
                attr.selected = !attr.selected;
            }
        });
        const newFilterAttributesStatus = [...filterAttributesStatus];
        newFilterAttributesStatus.forEach(attr => {
            if (attr.name === item.name) {
                attr.selected = !attr.selected;
            }
        });
        this.setState({
            filteredSubscriptions: this.doSearchAndSortAndFilter(query, subscriptions, sorted, newFilterAttributesProduct, newFilterAttributesStatus),
            filterAttributesProduct: newFilterAttributesProduct,
            filterAttributesStatus: newFilterAttributesStatus
        });
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

    handleCollapseSubscription = subscription => e => {
        stop(e);
        let collapsedSubscriptions = [...this.state.collapsedSubscriptions];
        const id = subscription.subscription_id;
        const indexOf = collapsedSubscriptions.indexOf(id);
        if (indexOf > -1) {
            collapsedSubscriptions.splice(indexOf, 1);
        } else {
            collapsedSubscriptions.push(id);
            const isServicePort = productServicePortTags.includes(subscription.product_tag);
            if ((isServicePort && subscription.parentSubscriptions === undefined) ||
                (!isServicePort && subscription.childSubscriptions === undefined)) {
                const promise = isServicePort ? parentSubscriptions : childSubscriptions;
                promise(id).then(result => {
                    const filteredSubscriptions = [...this.state.filteredSubscriptions];
                    const subscriptionToBeEnriched = filteredSubscriptions.find(sub => sub.subscription_id === id);
                    const attributeName = isServicePort ? "parentSubscriptions" : "childSubscriptions";
                    const {organisations, products} = this.props;
                    result.json.forEach(sub => this.enrichSubscription(sub, organisations, products));
                    subscriptionToBeEnriched[attributeName] = result.json;
                    this.setState({filteredSubscriptions: filteredSubscriptions});
                });
            }
        }
        this.setState({collapsedSubscriptions: collapsedSubscriptions});
    };

    handleDeleteSubscription = subscription => e => {
        stop(e);
        this.confirmation(I18n.t("subscriptions.deleteConfirmation", {
                name: subscription.product_name,
                customer: subscription.customer_name
            }), () =>
                deleteSubscription(subscription.subscription_id).then(() => {
                    this.componentDidMount();
                    setFlash(I18n.t("subscriptions.flash.delete", {name: subscription.product_name}));
                })
        );
    };

    renderSubscriptionsTable(filteredSubscriptions, sorted, collapsibleSubscriptions, collapsedSubscriptions) {
        const columns = ["noop", "customer_name", "subscription_id", "description", "insync", "product_name", "status",
            "product_tag", "start_date", "noop"];
        const th = index => {
            const name = columns[index];
            return <th key={index} className={name} onClick={this.sort(name)}>
                <span>{I18n.t(`subscriptions.${name}`)}</span>
                {name !== "nope" && this.sortColumnIcon(name, sorted)}
            </th>
        };

        if (filteredSubscriptions.length !== 0) {
            return (
                <table className="subscriptions">
                    <thead>
                    <tr>{columns.map((column, index) => th(index))}</tr>
                    </thead>
                    {filteredSubscriptions.map((subscription, index) =>
                        this.renderSubscriptionRow(subscription, index, collapsibleSubscriptions, collapsedSubscriptions)
                    )}
                </table>
            );
        }
        return <div><em>{I18n.t("subscriptions.no_found")}</em></div>;
    }

    filterRelatedSubscriptions = subscriptions => {
        // Apply the same filter to child and parent subscriptions
        const filterAttributesStatus = this.state.filterAttributesStatus;

        if (isEmpty(subscriptions)) {
            return subscriptions;
        }

        return subscriptions.filter(subscription => {
            const statusFilter = filterAttributesStatus.find(attr => attr.name === subscription.status);
            return statusFilter ? statusFilter.selected : true;
        });
    };

    renderFetchingSpinner = () => <section className="fetching-related-subscriptions">
        <i className="fa fa-refresh fa-spin fa-2x fa-fw"></i>
        <em>{I18n.t("subscriptions.fetchingRelatedSubscriptions")}</em>
    </section>;

    relatedSubscriptionMsg = subscription => ["LightPath", "LPNLNSI", "ELAN"].includes(subscription.tag) ?
        I18n.t("subscriptions.relatedSubscriptionsLP", {description: subscription.description}) :
    I18n.t("subscriptions.relatedSubscriptionsServicePort", {description: subscription.description});

    renderSubscriptionRow = (subscription, index, collapsibleSubscriptions, collapsedSubscriptions) => {
        const subscriptionId = subscription.subscription_id;
        const isCollapsible = collapsibleSubscriptions.includes(subscriptionId);
        const isCollapsed = isCollapsible && collapsedSubscriptions.includes(subscriptionId);
        const icon = isCollapsed ? "minus" : "plus";
        const isServicePort = productServicePortTags.includes(subscription.product_tag);
        const relatedSubscriptions = isServicePort ? this.filterRelatedSubscriptions(subscription.parentSubscriptions) : this.filterRelatedSubscriptions(subscription.childSubscriptions);
        const isLoading = isCollapsed && relatedSubscriptions === undefined;
        const hasNoRelatedSubscriptions = isCollapsed && relatedSubscriptions && relatedSubscriptions.length === 0;
        const renderRelatedSubscriptions = isCollapsed && relatedSubscriptions && relatedSubscriptions.length > 0;
        return (
            <tbody key={`${subscriptionId}_${index}`}>
            {this.renderSingleSubscription(subscription, isCollapsible, icon)}
            {isLoading &&
            <tr>
                <td colSpan="9">
                    {this.renderFetchingSpinner()}
                </td>
            </tr>}
            {hasNoRelatedSubscriptions &&
            <tr className="related-subscription">
                <td></td>
                <td colSpan="9">
                    <em>{I18n.t("subscriptions.noRelatedSubscriptions", {description: subscription.description})}</em>
                </td>
            </tr>}
            {renderRelatedSubscriptions &&
            <tr className={subscription.status !== "terminated" ? "related-subscription" : "related-subscription-warning"}>
                <td></td>
                <td colSpan="9">
                    <em>{subscription.status !== "terminated" ? this.relatedSubscriptionMsg(subscription) : I18n.t("subscriptions.terminatedWarning")}</em>
                </td>
            </tr>}
            {renderRelatedSubscriptions && relatedSubscriptions.map(sub =>
                this.renderSingleSubscription(sub, false, "nope", "related-subscription"))}
            </tbody>);
    };

    renderSingleSubscription = (subscription, isCollapsible, icon, className = "") => {
        const subscriptionId = subscription.subscription_id;

        return (
            <tr key={subscriptionId} className={className}
                onClick={this.showSubscription(subscription)}>
                <td data-label={I18n.t("subscriptions.noop")}
                    className="expand"><span>
                {isCollapsible &&
                <i className={`fa fa-${icon}-circle`} onClick={this.handleCollapseSubscription(subscription)}></i>}
                            </span></td>
                <td data-label={I18n.t("subscriptions.customer_name")}
                    className="customer_name">{subscription.customer_name}</td>
                <td data-label={I18n.t("subscriptions.subscription_id")}
                    className="subscription_id">{subscriptionId.substring(0, 8)}</td>
                <td data-label={I18n.t("subscriptions.description")}
                    className="description">{subscription.description}</td>
                <td data-label={I18n.t("subscriptions.insync")} className="insync">
                    <CheckBox value={subscription.insync} name="insync" readOnly={true}/>
                </td>
                <td data-label={I18n.t("subscriptions.product_name")}
                    className="product_name">{subscription.product_name}</td>
                <td data-label={I18n.t("subscriptions.status")}
                    className="status">{subscription.status}</td>
                <td data-label={I18n.t("subscriptions.product_tag")}
                    className="tag">{subscription.product_tag}</td>
                <td data-label={I18n.t("subscriptions.start_date_epoch")}
                    className="start_date_epoch">{renderDate(subscription.start_date)}</td>
                <td data-label={I18n.t("subscriptions.noop")}
                    className="actions"><span>
                                <i className="fa fa-trash" onClick={this.handleDeleteSubscription(subscription)}></i>
                            </span></td>
            </tr>)
    };

    render() {
        const {
            filteredSubscriptions, filterAttributesProduct, filterAttributesStatus, query, sorted,
            confirmationDialogOpen, confirmationDialogAction, confirmationDialogQuestion, collapsibleSubscriptions,
            collapsedSubscriptions
        } = this.state;
        return (
            <div className="mod-subscriptions">
                <ConfirmationDialog isOpen={confirmationDialogOpen}
                                    cancel={this.cancelConfirmation}
                                    confirm={confirmationDialogAction}
                                    question={confirmationDialogQuestion}/>
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
                                   onChange={this.search}
                                   value={query}/>
                            <i className="fa fa-search"></i>
                        </section>
                    </div>
                </div>
                <section className="subscriptions">
                    {this.renderSubscriptionsTable(filteredSubscriptions, sorted, collapsibleSubscriptions,
                        collapsedSubscriptions)}
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
