import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import debounce from "lodash/debounce";
import {isEmpty, stop, isValidUUIDv4} from "../utils/Utils";

import "./Prefixes.css";
import {freeSubnets, prefix_filters, prefixById, subscriptionsByProductType} from "../api";
import FilterDropDown from "../components/FilterDropDown";
import {organisationNameByUuid, renderDate, ipamStates, ipAddressToNumber, familyFullName} from "../utils/Lookups";

export default class Prefixes extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      prefixes: [],
      query: "",
      searchResults: [],
      sortOrder: {name: "prefix", descending: false},
      filterAttributes: {
        state: ipamStates.filter(s => s).map(state =>
          ({name: state, selected: true, count: 0})),
        rootPrefix: [],
        family: [
          {name: "IPv4", selected: true, count: 0},
          {name: "IPv6", selected: true, count: 0}
        ]
     },
      rootPrefixes: [],
     }
  }

  componentDidMount(){
      prefix_filters()
      .then(result => {
          const prefixFilters = result.map(p => ({name: p.prefix, selected: true, count: 0}));
          const currentFilterAttributes = this.state.filterAttributes;
          const modifiedAttributes = {rootPrefix: prefixFilters}
          this.setState({rootPrefixes: result, filterAttributes: {...currentFilterAttributes, ...modifiedAttributes}});
          this.getFreePrefixes(result);
      });
      subscriptionsByProductType("IP_PREFIX")
      .then(subscriptions =>
        subscriptions
        .filter(s => s.status === "active")
        .map(sub => this.enrichIPPrefixSubscription(sub)));
  }

  componentDidUpdate(prevProps, prevState) {
      if (this.state.prefixes !== prevState.prefixes) {
          this.count();
      }
      if (this.state.filterAttributes !== prevState.filterAttributes) {
          this.count();
      }
  }

  enrichIPPrefixSubscription(sub) {
     const ipam_prefix_id = sub.instances
        .map(instance =>
            instance.values.filter(v => v.resource_type.resource_type === "ipam_prefix_id")
            .map(v => v.value)[0])[0];
     return prefixById(ipam_prefix_id)
        .then(prefix => ({
                id: prefix.id,
                customer_name: organisationNameByUuid(sub.customer_id, this.props.organisations),
                subscription_id: sub.subscription_id,
                start_date: sub.start_date,
                description: sub.description,
                prefix: prefix.prefix,
                prefixlen: parseInt(prefix.prefix.split("/")[1], 10),
                parent: prefix.parent__label.split(": ")[1],
                family: prefix.afi,
                state: prefix.state})
        )
        .catch(error => ({
             id: 9999,
             customer_name: organisationNameByUuid(sub.customer_id, this.props.organisations),
             subscription_id: sub.subscription_id,
             start_date: sub.start_date,
             description: sub.description,
             state: ipamStates.indexOf("Failed"),
             parent: "",
             family: 0,
             prefix: error.message,
             prefixlen: 0
        }))
        .then(result => {
            this.setState({prefixes: this.state.prefixes.concat(result)});
        });

  }

  getFreePrefixes = roots => {
        return roots.map(p =>
            freeSubnets(p.prefix)
                .then(result => {
                  const free = result.map((r, idx) => ({
                      id: 9999 - idx,
                      customer_name: "N/A",
                      subscription_id: "N/A",
                      start_date: Math.floor(Date.now() / 1000),
                      description: "Vrije ruimte - gegenereerd",
                      family: p.version,
                      prefix: r,
                      prefixlen: parseInt(r.split("/")[1], 10),
                      parent: p.prefix,
                      state: ipamStates.indexOf("Free")
                  }));
                  this.setState({prefixes: this.state.prefixes.concat(free)});
                })
            )
  }


  count = debounce(() => {
      const {prefixes, filterAttributes} = this.state;
      const {state, rootPrefix, family} = filterAttributes;
      const stateCount = state.map(attr => (
          {...attr, count: prefixes.filter(p => ipamStates[p.state] === attr.name).length})
      );
      const rootPrefixCount = rootPrefix.map(attr => (
          {...attr, count: prefixes.filter(p => p.parent === attr.name).length})
      );
      const familyCount = family.map(attr => (
          {...attr, count: prefixes.filter(p => familyFullName[p.family] === attr.name).length})
      );
      this.setState({filterAttributes: {state: stateCount, rootPrefix: rootPrefixCount, family: familyCount}})
  }, 250)

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
        filterAttributes: {...currentFilterAttributes, ...modifiedAttributes},
        }
    );
  }

  filter = unfiltered => {
      const {state, rootPrefix, family} = this.state.filterAttributes;
      return unfiltered.filter(prefix => {
       const stateFilter = state.find(attr => ipamStates.indexOf(attr.name) === prefix.state);
       const rootPrefixFilter = rootPrefix.find(attr => attr.name === prefix.parent);
       const familyFilter = family.find(attr => attr.name === familyFullName[prefix.family]);

       return (stateFilter ? stateFilter.selected : true)
        && (rootPrefixFilter ? rootPrefixFilter.selected : true)
        && (familyFilter ? familyFilter.selected : true);
    });
  }

  sortBy = name => (a, b) => {
      const aSafe = a[name] === undefined ? "" : a[name];
      const bSafe = b[name] === undefined ? "" : b[name];
      if (name === "prefix") {
        return ipAddressToNumber(aSafe.split("/")[0]) - ipAddressToNumber(bSafe.split("/")[0]);
    } else if (name === "state") {
        return ipamStates[parseInt(aSafe,10)].localeCompare(ipamStates[parseInt(bSafe,10)]);
    } else {
        return typeof aSafe === "string" ? aSafe.toLowerCase().localeCompare(bSafe.toString().toLowerCase()) : aSafe - bSafe;
      }
    };

  toggleSort = name => e => {
      stop(e);
      const sortOrder = {...this.state.sortOrder};
      sortOrder.descending = sortOrder.name === name ? !sortOrder.descending : false;
      sortOrder.name = name;
      this.setState({sortOrder: sortOrder});
  }

  sort = unsorted => {
      const {name, descending} = this.state.sortOrder;
      const sorted = unsorted.sort(this.sortBy(name));
      if (descending) {
          sorted.reverse();
      }
      return sorted;
  };

  search = e => {
    const query = e.target.value;
    this.setState({query: query});
    this.delayedSearch(query);
  }

  delayedSearch = debounce(query => {
    const {prefixes} = this.state;
    const queryToLower = query.toLowerCase();
    const runQuery = new Promise(
        function(resolve, reject) {
         const results = prefixes.filter(prefix => {
                    return (prefix.prefix.toLowerCase().includes(queryToLower)
                    || prefix.customer_name.toLowerCase().includes(queryToLower)
                    || prefix.description.toLowerCase().includes(queryToLower)
                    || ipamStates[prefix.state].toLowerCase().includes(queryToLower)
                    || queryToLower === familyFullName[prefix.family].toLowerCase()
                    || renderDate(prefix.start_date).includes(query))
                });
         resolve(results);
    });
    runQuery.then(results => {
        this.setState({searchResults: results});
    });
  }, 250);

  sortColumnIcon = (name, sorted) => {
     if (sorted.name === name) {
         return <i className={sorted.descending ? "fa fa-sort-desc" : "fa fa-sort-asc"}></i>
     }
     return <i/>;
  }

  showSubscription = subscription_id => () => {
      if (isValidUUIDv4(subscription_id)) {
          this.props.history.push("/subscription/" + subscription_id);
      }
  }

  render() {
    const columns = ["customer", "subscription_id", "description", "family", "prefixlen", "prefix", "parent", "state", "start_date"];
    const th = index => {
      const name = columns[index];
      return (
        <th key={index} className={name} onClick={this.toggleSort(name)}>
          <span>{I18n.t(`prefixes.${name}`)}</span>
          {this.sortColumnIcon(name, this.state.sortOrder)}
        </th>
      )
    };
    const {prefixes, query, searchResults, filterAttributes} = this.state;
    const filteredPrefixes = isEmpty(query) ? this.filter(prefixes) : this.filter(searchResults);
    const sortedPrefixes = this.sort(filteredPrefixes);

    return (
        <div className="mod-prefixes">
            <div className="card">
                <div className="options">
                    <FilterDropDown items={filterAttributes.family}
                                    filterBy={this.setFilter("family")}
                                    label={I18n.t("prefixes.filters.family")}/>
                    <FilterDropDown items={filterAttributes.rootPrefix}
                                    filterBy={this.setFilter("rootPrefix")}
                                    label={I18n.t("prefixes.filters.root_prefix")}
                                    noTrans={true}/>
                    <FilterDropDown items={filterAttributes.state}
                                    filterBy={this.setFilter("state")}
                                    label={I18n.t("prefixes.filters.state")}/>

                    <section className="search">
                    <input className="allowed"
                           placeholder={I18n.t("prefixes.searchPlaceHolder")}
                           type="text"
                           onChange={this.search}
                           value={query}/>
                    <i className="fa fa-search"></i>
                    </section>
                </div>
            </div>
            <section className="prefixes">
            <table className="prefixes">
                <thead>
                    <tr>{columns.map((column, index) => th(index))}</tr>
                </thead>
                <tbody>
                {sortedPrefixes.map((prefix, index) =>
                  <tr key={`${prefix.id}_${index}`} onClick={this.showSubscription(prefix.subscription_id)}
                    className={ipamStates[prefix.state]}>
                    <td data-label={I18n.t("prefixes.customer")}
                      className="customer">{prefix.customer_name}</td>
                    <td data-label={I18n.t("prefixes.subscription_id")}
                      className="subscription">{prefix.subscription_id.substring(0,8)}</td>
                    <td data-label={I18n.t("prefixes.description")}
                      className="description">{prefix.description}</td>
                  {prefix.prefix ? ([
                    <td data-label={I18n.t("prefixes.family")}
                      className="family">{familyFullName[prefix.family]}</td>,
                    <td data-label={I18n.t("prefixes.prefixlen")}
                        className="prefixlen">/{prefix.prefixlen}</td>,
                    <td data-label={I18n.t("prefixes.prefix")}
                      className="prefix">{prefix.prefix}</td>,
                    <td data-label={I18n.t("prefixes.parent")}
                        className="parent">{prefix.parent}</td>,
                    <td data-label={I18n.t("prefixes.state")}
                      className="state">{ipamStates[prefix.state]}</td>]
                  ) : ([
                    <td data-label={I18n.t("prefixes.family")}
                      className="family">-</td>,
                    <td data-label={I18n.t("prefixes.prefixlen")}
                        className="prefixlen">0</td>,
                    <td data-label={I18n.t("prefixes.prefix")}
                      className="prefix">{prefix.error}</td>,
                      <td data-label={I18n.t("prefixes.parent")}
                          className="parent">-</td>,
                    <td data-label={I18n.t("prefixes.state")}
                      className="state">0</td>])
                  }
                  <td data-label={I18n.t("prefixes.start_date")}
                    className="start_date">{renderDate(prefix.start_date)}</td>

                  </tr>
                  )
                }
                </tbody>
              </table>
           </section>
          </div>
        );
    }
}

Prefixes.propTypes = {
    history: PropTypes.object.isRequired,
    organisations: PropTypes.array.isRequired
}
