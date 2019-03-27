import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import CheckBox from "./CheckBox";

import "./FilterDropDown.scss";
import {productTags} from "../api";

export default class ProductTagsDropDown extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            dropDownActive: false,
            loading: true,
            tags: []
        };
    }

    componentDidMount() {
        // # fetch all product tags
        productTags().then(results => {
            this.setState({tags: results})
        })
    }

    renderDropDownItem = (item, filterBy) => {
        const {noTrans, singleSelectFilter} = this.props;
        const name = noTrans ? item.name : I18n.t(`filter.${item.name.replace(/ /g, "_")}`);
        if (singleSelectFilter) {
            return (
                <li key={item.name} onClick={() => filterBy(item)}>
                    <CheckBox name={item.name} value={item.selected} onChange={() => filterBy(item)}/>
                    <label htmlFor={item.name}>{`${name} (${item.count})`}</label>
                    <i className="fa fa-filter" onClick={e => singleSelectFilter(e, item)}></i>
                </li>
            );
        }
        return (
            <li key={item.name} onClick={() => filterBy(item)}>
                <CheckBox name={item.name} value={item.selected} onChange={() => filterBy(item)}/>
                <label htmlFor={item.name}>{`${name}`}</label>
            </li>
        );
    };

    renderDropDown = (items, filterBy) =>
        <ul className="drop-down">
            {items.map(item => this.renderDropDownItem(item, filterBy))}
        </ul>;


    render() {
        const {items, filterBy, label, selectAll} = this.props;
        const {dropDownActive} = this.state;
        const filtered = items.filter(item => item.selected);
        const name = filtered.length === items.length ? I18n.t("filter.all", {count: count}) : I18n.t("filter.selected", {count: count});
        const faIcon = dropDownActive ? "fa-caret-up" : "fa-caret-down";
        return (
            <section className="filter-drop-down">
                <div className="filtered" onClick={() => this.setState({dropDownActive: !dropDownActive})}>
                    <span className="filter-label">{label}</span>
                    <span className="filter-label-divider">:</span>
                    <span className="filter-name">{name}</span>
                    <span>{filtered.length !== items.length && selectAll && <i className="fa fa-undo" onClick={selectAll}></i>}<i className={`fa ${faIcon}`}/></span>
                </div>
                {dropDownActive && this.renderDropDown(items, filterBy)}
            </section>);
    }

}

ProductTagsDropDown.propTypes = {
    items: PropTypes.array.isRequired,
    filterBy: PropTypes.func.isRequired,
    singleSelectFilter: PropTypes.func,
    selectAll: PropTypes.func,
    label: PropTypes.string,
    noTrans: PropTypes.bool
};
