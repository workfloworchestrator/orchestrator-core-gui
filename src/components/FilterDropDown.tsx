/*
 * Copyright 2019-2020 SURF.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import "./FilterDropDown.scss";

import I18n from "i18n-js";
import React from "react";

import { Filter } from "../utils/types";
import CheckBox from "./CheckBox";

type filterCallback = (filter: Filter) => void;

interface IProps {
    items: Filter[];
    filterBy: filterCallback;
    singleSelectFilter?: (event: React.MouseEvent<HTMLElement>, filter: Filter) => void;
    selectAll?: (event: React.MouseEvent<HTMLElement>) => void;
    label?: string;
    noTrans?: boolean;
}

interface IState {
    dropDownActive: boolean;
}

export default class FilterDropDown extends React.PureComponent<IProps, IState> {
    state: IState = { dropDownActive: false };

    renderDropDownItem = (item: Filter, filterBy: filterCallback) => {
        const { noTrans, singleSelectFilter } = this.props;
        const name = noTrans ? item.name : I18n.t(`filter.${item.name.replace(/ /g, "_")}`);
        if (singleSelectFilter) {
            return (
                <li key={item.name} onClick={() => filterBy(item)}>
                    <CheckBox name={item.name} value={item.selected} onChange={() => filterBy(item)} />
                    <label htmlFor={item.name}>{`${name} (${item.count})`}</label>
                    <i className="fa fa-filter" onClick={e => singleSelectFilter(e, item)} />
                </li>
            );
        }
        return (
            <li key={item.name} onClick={() => filterBy(item)}>
                <CheckBox name={item.name} value={item.selected} onChange={() => filterBy(item)} />
                <label htmlFor={item.name}>{`${name} (${item.count})`}</label>
            </li>
        );
    };

    renderDropDown = (items: Filter[], filterBy: filterCallback) => (
        <ul className="drop-down">{items.map(item => this.renderDropDownItem(item, filterBy))}</ul>
    );

    render() {
        const { items, filterBy, label, selectAll } = this.props;
        const { dropDownActive } = this.state;
        const filtered = items.filter(item => item.selected);
        const count = filtered.reduce((acc, item) => item.count, 0);
        const name =
            filtered.length === items.length
                ? I18n.t("filter.all", { count: count })
                : I18n.t("filter.selected", { count: count });
        const faIcon = dropDownActive ? "fa-caret-up" : "fa-caret-down";
        return (
            <section className="filter-drop-down">
                <div className="filtered" onClick={() => this.setState({ dropDownActive: !dropDownActive })}>
                    <span className="filter-label">{label}</span>
                    <span className="filter-label-divider">:</span>
                    <span className="filter-name">{name}</span>
                    <span>
                        {filtered.length !== items.length && selectAll && (
                            <i className="fa fa-undo" onClick={selectAll} />
                        )}
                        <i className={`fa ${faIcon}`} />
                    </span>
                </div>
                {dropDownActive && this.renderDropDown(items, filterBy)}
            </section>
        );
    }
}
