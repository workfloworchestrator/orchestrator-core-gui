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

import "./Autocomplete.scss";

import React from "react";
import scrollIntoView from "scroll-into-view";
import { ContactPerson } from "utils/types";

import { isEmpty } from "../utils/Utils";

interface IProps {
    query: string;
    selectedItem: number;
    personIndex: number;
    itemSelected: (value: ContactPerson, index: number) => void;
    className: string;
    suggestions: ContactPerson[];
}

export default class Autocomplete extends React.PureComponent<IProps> {
    // Intentionally not done with state since we don't need a rerender
    // This is only to store a ref for the scroll into view part
    selectedRow?: HTMLElement | null;

    static defaultProps = {
        className: ""
    };

    componentDidUpdate(prevProps: IProps) {
        if (
            this.selectedRow &&
            prevProps.selectedItem !== this.props.selectedItem &&
            !isEmpty(this.props.suggestions)
        ) {
            scrollIntoView(this.selectedRow);
        }
    }

    itemName = (item: ContactPerson, query: string) => {
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
