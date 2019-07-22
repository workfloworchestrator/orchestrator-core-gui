import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import debounce from "lodash/debounce";
import { isEmpty, stop, isValidUUIDv4 } from "../utils/Utils";

import "./Prefixes.scss";
import { freeSubnets, prefix_filters, prefixSubscriptionsByRootPrefix } from "../api";
import FilterDropDown from "../components/FilterDropDown";
import { organisationNameByUuid, renderDate, ipamStates, ipAddressToNumber, familyFullName } from "../utils/Lookups";
import ScrollUpButton from "react-scroll-up-button";

export default class Prefixes extends React.PureComponent {
    constructor(props) {
        super(props);

        this.debouncedCount = debounce(this.count, 1500, {
            leading: true,
            trailing: true
        });
        this.debouncedRunQuery = debounce(this.runQuery, 800);

        this.state = {
            prefixes: [],
            query: "",
            searchResults: [],
            sortOrder: { name: "prefix", descending: false },
            filterAttributes: {
                state: ipamStates
                    .filter(s => s)
                    .map(state => ({
                        name: state,
                        selected: state === "Allocated",
                        count: 0
                    })),
                rootPrefix: []
            },
            rootPrefixes: [],
            ipPrefixProductId: props.products
                .filter(p => p.tag === "IP_PREFIX")
                .map(p => p.product_id)
                .pop(),
            availablePrefixId: 10000
        };
    }

    componentDidMount() {
        this.setState({});

        prefix_filters().then(result => {
            const prefixFilters = result.map((p, idx) => ({
                name: p.prefix,
                selected: idx === 0,
                count: 0
            }));
            const currentFilterAttributes = this.state.filterAttributes;
            const modifiedAttributes = { rootPrefix: prefixFilters };
            this.setState({
                rootPrefixes: result,
                filterAttributes: { ...currentFilterAttributes, ...modifiedAttributes }
            });
            this.getFreePrefixes(result);
            this.getPrefixSubscriptions(result);
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.prefixes !== prevState.prefixes) {
            this.debouncedCount();
        }
    }

    getPrefixSubscriptions = roots => {
        const { organisations } = this.props;
        return roots.map(p =>
            prefixSubscriptionsByRootPrefix(p.id)
                .then(result =>
                    result.map(prefix => {
                        const { customer_id, start_date, subscription_id } = prefix;
                        const organisation =
                            customer_id === undefined ? "Unknown" : organisationNameByUuid(customer_id, organisations);
                        const subscription = subscription_id === undefined ? "Unknown" : subscription_id;
                        return {
                            ...prefix,
                            subscription_id: subscription,
                            start_date_as_str: renderDate(start_date),
                            customer: organisation
                        };
                    })
                )
                .then(result => {
                    //deduping is added as a temporary fix removing the IP "root_prefix" filter
                    //a more thorough redesign is called for in wf-client ticket #255
                    this.setState(prevState => {
                        let newPrefixes = prevState.prefixes.concat(result);
                        newPrefixes = Array.from(new Set(newPrefixes.map(p => p.id))).map(id => {
                            return newPrefixes.find(s => s.id === id);
                        });
                        return { prefixes: newPrefixes };
                    });
                })
        );
    };

    getFreePrefixes = roots => {
        const now = Math.floor(Date.now() / 1000);
        const nowString = renderDate(now);
        return roots.map(p =>
            freeSubnets(p.prefix).then(result => {
                const { availablePrefixId } = this.state;
                const free = result.map((r, idx) => {
                    const [networkAddress, prefixlen] = r.split("/");
                    return {
                        id: availablePrefixId + idx,
                        customer: "N/A",
                        subscription_id: "N/A",
                        start_date: now,
                        start_date_as_str: nowString,
                        description: "Vrije ruimte - gegenereerd",
                        family: p.version,
                        prefix: r,
                        network_address_as_int: ipAddressToNumber(networkAddress),
                        prefixlen: parseInt(prefixlen, 10),
                        parent: p.prefix,
                        state: ipamStates.indexOf("Free")
                    };
                });
                this.setState(prevState => ({
                    prefixes: prevState.prefixes.concat(free),
                    availablePrefixId: prevState.availablePrefixId + free.length
                }));
            })
        );
    };

    count = () => {
        const { prefixes, filterAttributes } = this.state;
        const { state, rootPrefix } = filterAttributes;
        const stateCount = state.map(attr => {
            const newCount = prefixes.reduce((acc, p) => {
                return ipamStates[p.state] === attr.name ? acc + 1 : acc;
            }, 0);
            return newCount === attr.count ? attr : { ...attr, count: newCount };
        });
        const rootPrefixCount = rootPrefix.map(attr => {
            const newCount = prefixes.reduce((acc, p) => {
                return p.parent === attr.name ? acc + 1 : acc;
            }, 0);
            return newCount === attr.count ? attr : { ...attr, count: newCount };
        });
        this.setState({
            filterAttributes: {
                state: stateCount,
                rootPrefix: rootPrefixCount
            }
        });
    };

    setFilter = filterName => item => {
        const currentFilterAttributes = this.state.filterAttributes;
        var modifiedAttributes = {};
        modifiedAttributes[filterName] = currentFilterAttributes[filterName].map(attr => {
            if (attr.name === item.name) {
                attr.selected = !attr.selected;
            }
            return attr;
        });
        this.setState({
            filterAttributes: { ...currentFilterAttributes, ...modifiedAttributes }
        });
    };

    singleSelectFilter = filterName => (e, item) => {
        stop(e);
        const currentFilterAttributes = this.state.filterAttributes;
        var modifiedAttributes = {};
        modifiedAttributes[filterName] = currentFilterAttributes[filterName].map(attr => {
            if (attr.name !== item.name && attr.selected) {
                attr.selected = false;
            } else if (attr.name === item.name && !attr.selected) {
                attr.selected = true;
            }
            return attr;
        });
        this.setState({
            filterAttributes: { ...currentFilterAttributes, ...modifiedAttributes }
        });
    };

    selectAll = filterName => e => {
        stop(e);
        const currentFilterAttributes = this.state.filterAttributes;
        var modifiedAttributes = {};
        modifiedAttributes[filterName] = currentFilterAttributes[filterName].map(attr => {
            if (!attr.selected) {
                attr.selected = true;
            }
            return attr;
        });
        this.setState({
            filterAttributes: { ...currentFilterAttributes, ...modifiedAttributes }
        });
    };

    filter = unfiltered => {
        const { state } = this.state.filterAttributes;
        return unfiltered.filter(prefix => {
            const stateFilter = state.find(attr => ipamStates.indexOf(attr.name) === prefix.state);

            return stateFilter ? stateFilter.selected : true;
        });
    };

    sortBy = name => (a, b) => {
        const aSafe = a[name] === undefined ? "" : a[name];
        const bSafe = b[name] === undefined ? "" : b[name];
        if (name === "prefix") {
            return a["network_address_as_int"] - b["network_address_as_int"];
        } else if (name === "state") {
            return ipamStates[parseInt(aSafe, 10)].localeCompare(ipamStates[parseInt(bSafe, 10)]);
        } else {
            return typeof aSafe === "string"
                ? aSafe.toLowerCase().localeCompare(bSafe.toString().toLowerCase())
                : aSafe - bSafe;
        }
    };

    toggleSort = name => e => {
        stop(e);
        const sortOrder = { ...this.state.sortOrder };
        sortOrder.descending = sortOrder.name === name ? !sortOrder.descending : false;
        sortOrder.name = name;
        this.setState({ sortOrder: sortOrder });
    };

    sort = unsorted => {
        const { name, descending } = this.state.sortOrder;
        const sorted = unsorted.sort(this.sortBy(name));
        if (descending) {
            sorted.reverse();
        }
        return sorted;
    };

    search = e => {
        const query = e.target.value;
        this.setState({ query: query });
        this.debouncedRunQuery(query);
    };

    runQuery = query => {
        const { prefixes } = this.state;
        const queryToLower = query.toLowerCase();
        const results = prefixes.filter(prefix => {
            return (
                prefix.prefix.toLowerCase().includes(queryToLower) ||
                prefix.customer.toLowerCase().includes(queryToLower) ||
                (prefix.description !== null && prefix.description.toLowerCase().includes(queryToLower)) ||
                ipamStates[prefix.state].toLowerCase().includes(queryToLower) ||
                queryToLower === familyFullName[prefix.family].toLowerCase() ||
                prefix.start_date_as_str.includes(query)
            );
        });
        this.setState({ searchResults: results });
    };

    sortColumnIcon = (name, sorted) => {
        if (sorted.name === name) {
            return <i className={sorted.descending ? "fa fa-sort-desc" : "fa fa-sort-asc"} />;
        }
        return <i />;
    };

    subscriptionLink = selection => () => {
        const { subscription_id, prefix, prefixlen } = selection;
        const product_id = this.state.ipPrefixProductId;
        if (isValidUUIDv4(subscription_id)) {
            this.props.history.push("/subscription/" + subscription_id);
        } else if (subscription_id === "N/A") {
            let network = prefix.split("/")[0];
            this.props.history.push(
                `new-process/?product=${product_id}&prefix=${network}&prefixlen=${prefixlen}&prefix_min=${prefixlen}`
            );
        }
    };

    render() {
        const columns = [
            "customer",
            "subscription_id",
            "description",
            "family",
            "prefixlen",
            "prefix",
            "parent",
            "state",
            "start_date"
        ];
        const th = index => {
            const name = columns[index];
            return (
                <th key={index} className={name} onClick={this.toggleSort(name)}>
                    <span>{I18n.t(`prefixes.${name}`)}</span>
                    {this.sortColumnIcon(name, this.state.sortOrder)}
                </th>
            );
        };
        const { prefixes, query, searchResults, filterAttributes } = this.state;
        const filteredPrefixes = isEmpty(query) ? this.filter(prefixes) : this.filter(searchResults);
        const sortedPrefixes = this.sort(filteredPrefixes);
        return (
            <div className="mod-prefixes">
                <div className="card">
                    <div className="options">
                        <FilterDropDown
                            items={filterAttributes.state}
                            filterBy={this.setFilter("state")}
                            singleSelectFilter={this.singleSelectFilter("state")}
                            selectAll={this.selectAll("state")}
                            label={I18n.t("prefixes.filters.state")}
                        />

                        <section className="search">
                            <input
                                className="allowed"
                                placeholder={I18n.t("prefixes.searchPlaceHolder")}
                                type="text"
                                onChange={this.search}
                                value={query}
                            />
                            <i className="fa fa-search" />
                        </section>
                    </div>
                </div>
                <section className="prefixes">
                    <table className="prefixes">
                        <thead>
                            <tr>{columns.map((column, index) => th(index))}</tr>
                        </thead>
                        <tbody>
                            {sortedPrefixes.map(prefix => (
                                <tr
                                    key={prefix.id}
                                    onClick={this.subscriptionLink(prefix)}
                                    className={ipamStates[prefix.state]}
                                >
                                    <td data-label={I18n.t("prefixes.customer")} className="customer">
                                        {prefix.customer}
                                    </td>
                                    <td data-label={I18n.t("prefixes.subscription_id")} className="subscription">
                                        {prefix.subscription_id.substring(0, 8)}
                                    </td>
                                    <td data-label={I18n.t("prefixes.description")} className="description">
                                        {prefix.description}
                                    </td>
                                    <td data-label={I18n.t("prefixes.family")} className="family">
                                        {familyFullName[prefix.family]}
                                    </td>
                                    <td data-label={I18n.t("prefixes.prefixlen")} className="prefixlen">
                                        /{prefix.prefixlen}
                                    </td>
                                    <td data-label={I18n.t("prefixes.prefix")} className="prefix">
                                        {prefix.prefix}
                                    </td>
                                    <td data-label={I18n.t("prefixes.parent")} className="parent">
                                        {prefix.parent}
                                    </td>
                                    <td data-label={I18n.t("prefixes.state")} className="state">
                                        {ipamStates[prefix.state]}
                                    </td>
                                    <td data-label={I18n.t("prefixes.start_date")} className="start_date">
                                        {prefix.start_date_as_str}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
                <ScrollUpButton />
            </div>
        );
    }
}

Prefixes.propTypes = {
    history: PropTypes.object.isRequired,
    organisations: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired
};
