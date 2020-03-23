/*
 * Copyright 2019 SURF.
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

import "./Autocomplete.scss";

import PropTypes from "prop-types";
import React from "react";
import scrollIntoView from "scroll-into-view";

import { isEmpty } from "../utils/Utils";

export default class Autocomplete extends React.PureComponent {
    componentDidUpdate(prevProps) {
        if (
            this.selectedRow &&
            prevProps.selectedItem !== this.props.selectedItem &&
            !isEmpty(this.props.suggestions)
        ) {
            scrollIntoView(this.selectedRow);
        }
    }

    itemName = (item, query) => {
        const name = item.name;
        const nameToLower = name.toLowerCase();
        const indexOf = nameToLower.indexOf(query.toLowerCase());
        const first = name.substring(0, indexOf);
        const middle = name.substring(indexOf, indexOf + query.length);
        const last = name.substring(indexOf + query.length);
        return (
            <span>
                {first}
                <span className="matched">{middle}</span>
                {last}
            </span>
        );
    };

    render() {
        const { suggestions, query, selectedItem, personIndex, itemSelected, className } = this.props;
        if (isEmpty(suggestions)) {
            return null;
        }
        return (
            <section className={`autocomplete ${className || ""}`}>
                <table className="result">
                    <tbody>
                        {suggestions.map((item, index) => (
                            <tr
                                key={index}
                                className={selectedItem === index ? "active" : ""}
                                onClick={() => itemSelected(item, personIndex)}
                                ref={ref => {
                                    if (selectedItem === index) {
                                        this.selectedRow = ref;
                                    } else if (suggestions.length - 1 === index) {
                                        this.lastRow = ref;
                                    }
                                }}
                            >
                                <td>{this.itemName(item, query)}</td>
                                <td>{item.email || ""}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        );
    }
}

Autocomplete.propTypes = {
    suggestions: PropTypes.array.isRequired,
    query: PropTypes.string.isRequired,
    selectedItem: PropTypes.number,
    personIndex: PropTypes.number.isRequired,
    itemSelected: PropTypes.func.isRequired,
    className: PropTypes.string
};
