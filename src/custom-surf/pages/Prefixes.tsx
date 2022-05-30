/*
 * Copyright 2019-2022 SURF.
 *
 */

import { EuiFieldSearch, EuiFlexGroup, EuiFlexItem, EuiPage, EuiPageBody, EuiSpacer } from "@elastic/eui";
import LabelledFilter from "custom/components/LabelledFilter";
import debounce from "lodash/debounce";
import pMap from "p-map";
import React from "react";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";
import ScrollUpButton from "react-scroll-up-button";
import ApplicationContext from "utils/ApplicationContext";
import { familyFullName, ipAddressToNumber, ipamStates, organisationNameByUuid, renderDate } from "utils/Lookups";
import { Filter, IpPrefix, IpPrefixSubscription, Product, SortOption } from "utils/types";
import { isEmpty, isValidUUIDv4, stop } from "utils/Utils";

import { tablePrefixes } from "../../emotion/custom-surf/pages/Prefixes";

interface ExtendedIpPrefixSubscription extends IpPrefixSubscription {
    customer: string;
    start_date_as_str: string;
}

type Column =
    | "customer"
    | "subscription_id"
    | "description"
    | "family"
    | "prefixlen"
    | "prefix"
    | "parent"
    | "state"
    | "start_date";

interface IProps extends WrappedComponentProps {}

interface FilterAttributes {
    state: Filter[];
    rootPrefix: Filter[];
}

interface IState {
    prefixes: ExtendedIpPrefixSubscription[];
    query: string;
    searchResults: ExtendedIpPrefixSubscription[];
    sortOrder: SortOption<Column>;
    filterAttributes: FilterAttributes;
    rootPrefixes: IpPrefix[];
    availablePrefixId: number;
    ipPrefixProductId: string;
}

class Prefixes extends React.PureComponent<IProps, IState> {
    context!: React.ContextType<typeof ApplicationContext>;
    state: IState = {
        prefixes: [],
        query: "",
        searchResults: [],
        sortOrder: { name: "prefix", descending: false },
        filterAttributes: {
            state: ipamStates
                .filter((s) => s)
                .map((state) => ({
                    name: state ?? "",
                    selected: state === "Allocated",
                    count: 0,
                })),
            rootPrefix: [],
        },
        rootPrefixes: [],
        availablePrefixId: 10000,
        ipPrefixProductId: "",
    };

    componentDidMount() {
        this.setState({});

        this.context.customApiClient.prefix_filters().then((result) => {
            const prefixFilters = result.map((p, idx) => ({
                name: p.prefix,
                selected: true,
                count: 0,
            }));
            const currentFilterAttributes = this.state.filterAttributes;
            const modifiedAttributes = { rootPrefix: prefixFilters };
            this.setState({
                rootPrefixes: result,
                filterAttributes: { ...currentFilterAttributes, ...modifiedAttributes },
                ipPrefixProductId:
                    this.context.products
                        .filter((p) => p.tag === "IP_PREFIX")
                        .map((p) => p.product_id)
                        .pop() || "",
            });
            this.getFreePrefixes(result);
            this.getPrefixSubscriptions(result);
        });
    }

    componentDidUpdate(prevProps: IProps, prevState: IState) {
        if (this.state.prefixes !== prevState.prefixes) {
            this.debouncedCount();
        }
    }

    getPrefixSubscriptions = async (roots: IpPrefix[]) => {
        const { organisations } = this.context;
        const mapper = async (root: IpPrefix) => {
            await this.context.customApiClient
                .prefixSubscriptionsByRootPrefix(root.id)
                .then((result) =>
                    result.map((prefix) => {
                        const { customer_id, start_date, subscription_id } = prefix;
                        const organisation =
                            customer_id === undefined ? "Unknown" : organisationNameByUuid(customer_id, organisations);
                        const subscription = subscription_id === undefined ? "Unknown" : subscription_id;
                        return {
                            ...prefix,
                            subscription_id: subscription,
                            start_date_as_str: renderDate(start_date),
                            customer: organisation,
                        };
                    })
                )
                .then((result) => {
                    //deduping is added as a temporary fix removing the IP "root_prefix" filter
                    //a more thorough redesign is called for in wf-client ticket #255
                    this.setState((prevState) => {
                        let newPrefixes = prevState.prefixes.concat(result);
                        newPrefixes = Array.from(new Set(newPrefixes.map((p) => p.id))).map((id) => {
                            return newPrefixes.find((s) => s.id === id)!;
                        });
                        return { prefixes: newPrefixes };
                    });
                })
                .catch((err) => {
                    console.log(`failed to load prefix ${root.id}`);
                });
        };
        return await pMap(roots, mapper, { concurrency: 2, stopOnError: false });
    };

    getFreePrefixes = (roots: IpPrefix[]) => {
        const now = Math.floor(Date.now() / 1000);
        const nowString = renderDate(now);
        return roots.map((p) =>
            this.context.customApiClient.freeSubnets(p.prefix).then((result) => {
                const { availablePrefixId } = this.state;
                const free = result.map((r, idx) => {
                    const [networkAddress, prefixlen] = r.split("/");
                    return {
                        id: availablePrefixId + idx,
                        customer: "N/A",
                        subscription_id: "Create",
                        start_date: now,
                        start_date_as_str: nowString,
                        description: "Vrije ruimte - gegenereerd",
                        family: p.version,
                        prefix: r,
                        network_address_as_int: ipAddressToNumber(networkAddress),
                        prefixlen: parseInt(prefixlen, 10),
                        parent: p.prefix,
                        state: ipamStates.indexOf("Free"),
                        version: 4,
                        name: "",
                        product: {} as Product,
                        product_id: "",
                        status: "",
                        insync: false,
                        customer_id: "",
                        end_date: now,
                        note: "",
                    } as ExtendedIpPrefixSubscription;
                });
                this.setState((prevState) => ({
                    prefixes: prevState.prefixes.concat(free),
                    availablePrefixId: prevState.availablePrefixId + free.length,
                }));
            })
        );
    };

    count = () => {
        const { prefixes, filterAttributes } = this.state;
        const { state, rootPrefix } = filterAttributes;
        const stateCount = state.map((attr) => {
            const newCount = prefixes.reduce((acc, p) => {
                return ipamStates[p.state] === attr.name ? acc + 1 : acc;
            }, 0);
            return newCount === attr.count ? attr : { ...attr, count: newCount };
        });
        const rootPrefixCount = rootPrefix.map((attr) => {
            const newCount = prefixes.reduce((acc, p) => {
                return p.parent === attr.name ? acc + 1 : acc;
            }, 0);
            return newCount === attr.count ? attr : { ...attr, count: newCount };
        });
        this.setState({
            filterAttributes: {
                state: stateCount,
                rootPrefix: rootPrefixCount,
            },
        });
    };

    debouncedCount = debounce(this.count, 1500, {
        leading: true,
        trailing: true,
    });

    setFilter = (filterName: "state" | "rootPrefix") => (item: Filter) => {
        const currentFilterAttributes = this.state.filterAttributes;
        var modifiedAttributes: Partial<FilterAttributes> = {};
        modifiedAttributes[filterName] = currentFilterAttributes[filterName].map((attr) => {
            if (attr.name === item.name) {
                attr.selected = !attr.selected;
            }
            return attr;
        });
        this.setState({
            filterAttributes: { ...currentFilterAttributes, ...modifiedAttributes },
        });
    };

    // setFilter, but for a list of filters.
    setFilterList = (filterName: "state" | "rootPrefix") => (item: Filter[]) => {
        const currentFilterAttributes = this.state.filterAttributes;
        const incomingFilterNames = item.map((f) => f.name);
        let modifiedAttributes: Partial<FilterAttributes> = {};
        modifiedAttributes[filterName] = currentFilterAttributes[filterName].map((attr) => {
            attr.selected = incomingFilterNames.includes(attr.name);

            return attr;
        });
        this.setState({
            filterAttributes: { ...currentFilterAttributes, ...modifiedAttributes },
        });
    };

    singleSelectFilter = (filterName: "state" | "rootPrefix") => (e: React.MouseEvent<HTMLElement>, item: Filter) => {
        stop(e);
        const currentFilterAttributes = this.state.filterAttributes;
        var modifiedAttributes: Partial<FilterAttributes> = {};
        modifiedAttributes[filterName] = currentFilterAttributes[filterName].map((attr) => {
            if (attr.name !== item.name && attr.selected) {
                attr.selected = false;
            } else if (attr.name === item.name && !attr.selected) {
                attr.selected = true;
            }
            return attr;
        });
        this.setState({
            filterAttributes: { ...currentFilterAttributes, ...modifiedAttributes },
        });
    };

    selectAll = (filterName: "state" | "rootPrefix") => (e: React.MouseEvent<HTMLElement>) => {
        stop(e);
        const currentFilterAttributes = this.state.filterAttributes;
        var modifiedAttributes: Partial<FilterAttributes> = {};
        modifiedAttributes[filterName] = currentFilterAttributes[filterName].map((attr) => {
            if (!attr.selected) {
                attr.selected = true;
            }
            return attr;
        });
        this.setState({
            filterAttributes: { ...currentFilterAttributes, ...modifiedAttributes },
        });
    };

    filter = (unfiltered: ExtendedIpPrefixSubscription[]) => {
        const { state, rootPrefix } = this.state.filterAttributes;
        return unfiltered
            .filter((prefix) => {
                const stateFilter = state.find((attr) => ipamStates.indexOf(attr.name) === prefix.state);

                return stateFilter ? stateFilter.selected : true;
            })
            .filter((prefix) => {
                const rootFilter = rootPrefix.find((attr) => attr.name === prefix.parent);

                return rootFilter ? rootFilter.selected : true;
            });
    };

    sortBy = (name: Column) => (a: ExtendedIpPrefixSubscription, b: ExtendedIpPrefixSubscription) => {
        const aSafe = a[name] === undefined ? "" : a[name];
        const bSafe = b[name] === undefined ? "" : b[name];
        if (name === "prefix") {
            return a["network_address_as_int"] - b["network_address_as_int"];
        } else if (name === "state") {
            return (ipamStates[a[name]] ?? "").localeCompare(ipamStates[b[name]] ?? "");
        } else {
            return typeof aSafe === "string" || typeof bSafe === "string"
                ? (aSafe as string).toLowerCase().localeCompare(bSafe.toString().toLowerCase())
                : aSafe - bSafe;
        }
    };

    toggleSort = (name: Column) => (e: React.MouseEvent<HTMLTableHeaderCellElement>) => {
        stop(e);
        const sortOrder = { ...this.state.sortOrder };
        sortOrder.descending = sortOrder.name === name ? !sortOrder.descending : false;
        sortOrder.name = name;
        this.setState({ sortOrder: sortOrder });
    };

    sort = (unsorted: ExtendedIpPrefixSubscription[]) => {
        const { name, descending } = this.state.sortOrder;
        const sorted = unsorted.sort(this.sortBy(name));
        if (descending) {
            sorted.reverse();
        }
        return sorted;
    };

    search = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        this.setState({ query: query });
        this.debouncedRunQuery(query);
    };

    runQuery = (query: string) => {
        const { prefixes } = this.state;
        const queryToLower = query.toLowerCase();
        const results = prefixes.filter((prefix) => {
            return (
                prefix.prefix.toLowerCase().includes(queryToLower) ||
                prefix.customer.toLowerCase().includes(queryToLower) ||
                (prefix.description !== null && prefix.description.toLowerCase().includes(queryToLower)) ||
                ipamStates[prefix.state]?.toLowerCase().includes(queryToLower) ||
                ipamStates[prefix.state]?.toLowerCase().includes("free") ||
                queryToLower === familyFullName[prefix.family].toLowerCase() ||
                prefix.start_date_as_str.includes(query)
            );
        });
        this.setState({ searchResults: results });
    };
    debouncedRunQuery = debounce(this.runQuery, 800);

    sortColumnIcon = (name: string, sorted: SortOption) => {
        if (sorted.name === name) {
            return <i className={sorted.descending ? "fas fa-sort-down" : "fas fa-sort-up"} />;
        }
        return <i />;
    };

    render() {
        const { intl } = this.props;
        const { theme } = this.context;
        const columns: Column[] = [
            "customer",
            "subscription_id",
            "description",
            "family",
            "prefixlen",
            "prefix",
            "parent",
            "state",
            "start_date",
        ];
        const th = (index: number) => {
            const name = columns[index];
            return (
                <th key={index} className={name} onClick={this.toggleSort(name)}>
                    <span>
                        <FormattedMessage id={`prefixes.${name}`} />
                    </span>
                    {this.sortColumnIcon(name, this.state.sortOrder)}
                </th>
            );
        };
        const { prefixes, query, searchResults, filterAttributes } = this.state;
        const filteredPrefixes = isEmpty(query) ? this.filter(prefixes) : this.filter(searchResults);
        const sortedPrefixes = this.sort(filteredPrefixes);
        return (
            <EuiPage css={tablePrefixes}>
                <EuiPageBody component="div" className="mod-prefixes">
                    <div>
                        <EuiFlexGroup>
                            <EuiFlexItem>
                                <LabelledFilter
                                    items={filterAttributes.state}
                                    filterBy={this.setFilterList("state")}
                                    selectAll={this.selectAll("state")}
                                    label={intl.formatMessage({ id: "prefixes.filters.state" })}
                                />
                            </EuiFlexItem>
                            <EuiFlexItem grow={true}>
                                <LabelledFilter
                                    items={filterAttributes.rootPrefix}
                                    filterBy={this.setFilterList("rootPrefix")}
                                    selectAll={this.selectAll("rootPrefix")}
                                    label={intl.formatMessage({ id: "prefixes.filters.root_prefix" })}
                                />
                            </EuiFlexItem>
                        </EuiFlexGroup>
                        <EuiFlexGroup>
                            <EuiFlexItem>
                                <EuiFieldSearch
                                    placeholder={intl.formatMessage({ id: "prefixes.searchPlaceHolder" })}
                                    value={query}
                                    onChange={this.search}
                                    isClearable={true}
                                    fullWidth
                                />
                            </EuiFlexItem>
                        </EuiFlexGroup>
                        <EuiSpacer size="m" />
                    </div>
                    <table className="prefixes">
                        <thead>
                            <tr>{columns.map((column, index) => th(index))}</tr>
                        </thead>
                        <tbody>
                            {sortedPrefixes.map((prefix) => (
                                <tr
                                    key={prefix.id}
                                    className={
                                        ipamStates[prefix.state] ? `${ipamStates[prefix.state]} ${theme}` : theme
                                    }
                                >
                                    <td
                                        data-label={intl.formatMessage({ id: "prefixes.customer" })}
                                        className="customer"
                                    >
                                        {prefix.customer}
                                    </td>
                                    <td
                                        data-label={intl.formatMessage({ id: "prefixes.subscription_id" })}
                                        className="subscription"
                                    >
                                        <a
                                            href={`${getLink(prefix, this.state.ipPrefixProductId)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {prefix.subscription_id.substring(0, 8)}
                                        </a>
                                    </td>
                                    <td
                                        data-label={intl.formatMessage({ id: "prefixes.description" })}
                                        className="description"
                                    >
                                        {prefix.description}
                                    </td>
                                    <td data-label={intl.formatMessage({ id: "prefixes.family" })} className="family">
                                        {familyFullName[prefix.family]}
                                    </td>
                                    <td
                                        data-label={intl.formatMessage({ id: "prefixes.prefixlen" })}
                                        className="prefixlen"
                                    >
                                        /{prefix.prefixlen}
                                    </td>
                                    <td data-label={intl.formatMessage({ id: "prefixes.prefix" })} className="prefix">
                                        {prefix.prefix}
                                    </td>
                                    <td data-label={intl.formatMessage({ id: "prefixes.parent" })} className="parent">
                                        {prefix.parent}
                                    </td>
                                    <td data-label={intl.formatMessage({ id: "prefixes.state" })} className="state">
                                        {ipamStates[prefix.state]}
                                    </td>
                                    <td
                                        data-label={intl.formatMessage({ id: "prefixes.start_date" })}
                                        className="start_date"
                                    >
                                        {prefix.start_date_as_str}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <ScrollUpButton />
                </EuiPageBody>
            </EuiPage>
        );
    }
}

function getLink(prefix_of_row: ExtendedIpPrefixSubscription, productId: string) {
    const { subscription_id, prefix, prefixlen } = prefix_of_row;

    let network = prefix.split("/")[0];
    let link = "/new-process";
    if (isValidUUIDv4(subscription_id)) {
        link = `/subscriptions/${subscription_id}`;
    } else if (subscription_id === "Create") {
        link = `new-process/?product=${productId}&prefix=${network}&prefixlen=${prefixlen}&prefix_min=${prefixlen}`;
    }
    return link;
}

Prefixes.contextType = ApplicationContext;

export default injectIntl(Prefixes);
