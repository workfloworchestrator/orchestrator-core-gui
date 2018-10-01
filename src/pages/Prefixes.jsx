import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import "./Prefixes.css";
import {ip_blocks, prefix_filters, prefix_by_id, subscriptionsByProductType} from "../api";
import FilterDropDown from "../components/FilterDropDown";
import {organisationNameByUuid, renderDate} from "../utils/Lookups";

export default class Prefixes extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      prefixes: [
        {
            customer_name: "De Brede Hogeschool en Technische Universiteit van Alexandrie",
            subscription_id: "abcd3f3",
            description: "ALEX prefix 192.168.1.0/24",
            prefix: "192.168.1.0/24",
            family: "4",
            status: "Planned", start_date: "14 feb"}
      ],
      query: "",
      sorted: {name: "start_date", descending: true},
      filterAttributesStatus: [
        {name: "Allocated", selected: true, count: 0},
        {name: "Planned", selected: true, count: 0},
        {name: "Available", selected: true, count: 0}
      ],
      filterAttributesRootPrefix: [],
      filterAttributesFamily: [
        {name: "IPv4", selected: true, count: 0},
        {name: "IPv6", selected: true, count: 0}
      ],
      root_prefixes: [],
    }
  }

  componentDidMount(){
      prefix_filters().then(result => {
          const filter = result.map(p => ({name: p.prefix, selected: true, count: 0}));
          this.setState({root_prefixes: result, filterAttributesRootPrefix: filter});
      });
      subscriptionsByProductType("IP_PREFIX")
      .then(subscriptions =>
        subscriptions.map(sub => this.enrichSubscription(sub)))
      .then(enrichedSubscriptions =>
        Promise.all(enrichedSubscriptions).then(result => {
                this.setState({prefixes: result});
            }
        )
     )
  }

  enrichSubscription = sub => {
     const ipam_prefix_id = sub.instances
        .map(instance =>
            instance.values.filter(v => v.resource_type.resource_type === "ipam_prefix_id")
            .map(v => v.value)[0])[0];
     const ipam_prefix = prefix_by_id(ipam_prefix_id);
     return ipam_prefix.then(prefix => {
        return {
                customer_name: organisationNameByUuid(sub.customer_id),
                subscription_id: sub.subscription_id,
                start_date: sub.start_date,
                description: sub.description,
                prefix: prefix.prefix,
                family: prefix.afi,
                status: prefix.status}
     })
     .catch(error => {
         return {
             customer_name: organisationNameByUuid(sub.customer_id, this.props.organisations),
             subscription_id: sub.subscription_id,
             start_date: sub.start_date,
             description: sub.description,
             prefix: "N/A",
             family: "N/A",
             status: "N/A",
         }
     })
  }

  showParentSubscriptions(prefix) {
    return null;
  }

  filter = item => {
    const newFilterAttributesFamily = this.state.filterAttributesFamily;
    newFilterAttributesFamily.forEach(attr => {
        if (attr.name === item.name) {
            attr.selected = !attr.selected;
        }
    });
    const newFilterAttributesStatus = [...this.state.filterAttributesStatus];
    newFilterAttributesStatus.forEach(attr => {
        if (attr.name === item.name) {
            attr.selected = !attr.selected;
        }
    });
    const newFilterAttributesRootPrefix = [...this.state.filterAttributesRootPrefix];
    newFilterAttributesRootPrefix.forEach(attr => {
        if (attr.name === item.name) {
            attr.selected = !attr.selected;
        }
    });
    this.setState({
        filterAttributesFamily: newFilterAttributesFamily,
        filterAttributesStatus: newFilterAttributesStatus,
        filterAttributesRootPrefix: newFilterAttributesRootPrefix
        }
    )
  }

  sort = name => e => {
    return null;
  }

  search = e => {
    const query = e.target.value;
    this.setState({query: query});
    this.delayedSearch(query);
  }

  delayedSearch(query) {
    return query;
  }

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
          return <th key={index} className={name} onClick={this.sort(name)}>
              <span>{I18n.t(`prefixes.${name}`)}</span>
              {this.sortColumnIcon(name, this.state.sorted)}
          </th>
      };
      const query = this.state.query;

    return (
        <div className="mod-prefixes">
            <div className="card">
                <div className="options">
                    <FilterDropDown items={this.state.filterAttributesFamily}
                                    filterBy={this.filter}
                                    label={I18n.t("prefixes.filters.family")}/>
                    <FilterDropDown items={this.state.filterAttributesRootPrefix}
                                    filterBy={this.filter}
                                    label={I18n.t("prefixes.filters.root_prefix")}
                                    noTrans={true}/>
                    <FilterDropDown items={this.state.filterAttributesStatus}
                                    filterBy={this.filter}
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
                {this.state.prefixes.map((prefix, index) =>
                  <tr key={`${prefix.id}_${index}`} onClick={this.showParentSubscriptions(prefix)}
                    className={prefix.status}>
                    <td data-label={I18n.t("prefixes.customer")}
                      className="customer">{prefix.customer_name}</td>
                    <td data-label={I18n.t("prefixes.subscription_id")}
                      className="subscription">{prefix.subscription_id}</td>
                    <td data-label={I18n.t("prefixes.description")}
                      className="description">{prefix.description}</td>
                    <td data-label={I18n.t("prefixes.family")}
                      className="family">{prefix.family === "4" ? "IPv4" : "IPv6"}</td>
                    <td data-label={I18n.t("prefixes.ip_prefix")}
                      className="prefix">{prefix.prefix}</td>
                    <td data-label={I18n.t("prefixes.status")}
                      className="status">{prefix.status}</td>
                    <td data-label={I18n.t("prefixes.start_date")}
                      className="start_date">{prefix.start_date}</td>
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
