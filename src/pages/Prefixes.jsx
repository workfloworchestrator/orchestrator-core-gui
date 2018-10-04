import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import debounce from "lodash/debounce";
import {isEmpty, stop} from "../utils/Utils";

import "./Prefixes.css";
import {freeSubnets, ip_blocks, prefix_filters, prefixById, subscriptionsByProductType} from "../api";
import FilterDropDown from "../components/FilterDropDown";
import {organisationNameByUuid, renderDate, enrichIPPrefixSubscription, ipamStates, ipAddressToNumber, familyFullName} from "../utils/Lookups";

export default class Prefixes extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      prefixes: [],
      query: "",
      searchResults: [],
      sortOrder: {name: "prefix", descending: false},
      filterAttributes: {
        status: ipamStates.filter(s => s).map(state =>
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
          const newFilterAttributes = {...this.state.filterAttributes};
          newFilterAttributes.rootPrefix = prefixFilters;
          this.setState({rootPrefixes: result, filterAttributes: newFilterAttributes});
          this.getFreePrefixes(result);
      });
      subscriptionsByProductType("IP_PREFIX")
      .then(subscriptions =>
        subscriptions
        .filter(s => s.status === "active")
        .map(sub => this.enrichIPPrefixSubscription(sub)));
  }

  enrichIPPrefixSubscription(sub) {
     const ipam_prefix_id = sub.instances
        .map(instance =>
            instance.values.filter(v => v.resource_type.resource_type === "ipam_prefix_id")
            .map(v => v.value)[0])[0];
     return prefixById(ipam_prefix_id)
        .then(prefix => ({
                customer_name: organisationNameByUuid(sub.customer_id, this.props.organisations),
                subscription_id: sub.subscription_id,
                start_date: sub.start_date,
                description: sub.description,
                prefix: prefix.prefix,
                family: prefix.afi,
                state: prefix.state})
        )
        .catch(error => ({
             customer_name: organisationNameByUuid(sub.customer_id, this.props.organisations),
             subscription_id: sub.subscription_id,
             start_date: sub.start_date,
             description: sub.description,
             state: ipamStates.indexOf("Failed"),
             family: 0,
             prefix: error.message
        }))
        .then(result => {
            this.setState({prefixes: this.state.prefixes.concat(result)});
        });

  }

  getFreePrefixes = roots => {
        roots.map(p => {
            freeSubnets(p.prefix)
                .then(result => {
                  const free = result.map(r => ({
                      customer_name: "N/A",
                      subscription_id: "N/A",
                      start_date: Date.now(),
                      description: `Vrij subnet binnen ${p.prefix}`,
                      family: p.version,
                      prefix: r,
                      state: ipamStates.indexOf("Free")
                  }));
                  this.setState({prefixes: this.state.prefixes.concat(free)});
                })
        })
  }

  showParentSubscriptions(prefix) {
    return null;
  }

  setFilter = filterName => item => {
    const currentFilterAttributes = this.state.filterAttributes;
    var modifiedAttributes = {};
    modifiedAttributes[filterName] = currentFilterAttributes[filterName].map(attr => {
        if (attr.name === item.name) {
            attr.selected = !attr.selected;
        }
    });
    this.setState({
        filterAttributes: {...currentFilterAttributes, ...modifiedAttributes},
        }
    );
  }

  sortBy = (name, descending) => (a, b) => {
      var aSafe, bSafe;
      if (descending) {
          // swap a and b for descending order
          aSafe = b[name] || "";
          bSafe = a[name] || "";
      } else {
          aSafe = a[name] || "";
          bSafe = b[name] || "";
      }
      if (name === "prefix") {
        return ipAddressToNumber(aSafe.split("/")[0]) - ipAddressToNumber(bSafe.split("/")[0]);
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
      return unsorted.sort(this.sortBy(name, descending));
  };

  search = e => {
    const query = e.target.value;
    this.setState({query: query});
    this.delayedSearch(query);
  }

  delayedSearch = debounce(query => {
    return query;
  }, 250);

  sortColumnIcon = (name, sorted) => {
     if (sorted.name === name) {
         return <i className={sorted.descending ? "fa fa-sort-desc" : "fa fa-sort-asc"}></i>
     }
     return <i/>;
  }

  render() {
    const columns = ["customer", "subscription_id", "description", "family", "prefix", "status", "start_date"];
    const th = index => {
      const name = columns[index];
      return (
        <th key={index} className={name} onClick={this.toggleSort(name)}>
          <span>{I18n.t(`prefixes.${name}`)}</span>
          {this.sortColumnIcon(name, this.state.sortOrder)}
        </th>
      )
    };
    const {prefixes, query, filterAttributes} = this.state;
    const sortedPrefixes = this.sort(prefixes);

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
                    <FilterDropDown items={filterAttributes.status}
                                    filterBy={this.setFilter("status")}
                                    label={I18n.t("prefixes.filters.status")}/>

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
                  <tr key={`${prefix.id}_${index}`} onClick={this.showParentSubscriptions(prefix)}
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
                    <td data-label={I18n.t("prefixes.ip_prefix")}
                      className="prefix">{prefix.prefix}</td>,
                    <td data-label={I18n.t("prefixes.status")}
                      className="status">{ipamStates[prefix.state]}</td>]
                  ) : ([
                    <td data-label={I18n.t("prefixes.family")}
                      className="family">-</td>,
                    <td data-label={I18n.t("prefixes.ip_prefix")}
                      className="prefix">{prefix.error}</td>,
                    <td data-label={I18n.t("prefixes.status")}
                      className="status">0</td>])
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
