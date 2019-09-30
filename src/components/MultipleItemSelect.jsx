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

import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import Select from "react-select";

import { subscriptionsByProductId, allSubscriptions } from "../api";
import { isEmpty } from "../utils/Utils";
import "./SubscriptionsSelect.scss";

export default class MultipleItemSelect extends React.PureComponent {
    constructor(props) {
        super(props);
        const { subscriptions, minimum } = this.props;
        const nboxes = subscriptions.length > minimum ? subscriptions.length : minimum;
        this.state = {
            availableItems: [],
            numberOfBoxes: nboxes
        };
    }

    componentWillReceiveProps(nextProps) {
        // todo: not sure we need this?
        if (nextProps.items && nextProps.items !== this.props.items) {
            this.setState({ availableItems: [] });
        }
    }

    onChangeInternal = index => selection => {
        const { items } = this.props;
        if (selection && selection.value) {
            items[index] = selection.value;
        } else {
            items[index] = null;
        }
        this.props.onChange(items);
    };

    addSubscription() {
        const nboxes = this.state.numberOfBoxes + 1;
        this.setState({ numberOfBoxes: nboxes });
    }

    removeSubscription(index) {
        const { items } = this.props;
        const nboxes = this.state.numberOfBoxes - 1;
        if (items.length > nboxes) {
            items.splice(index, 1);
            this.props.onChange(items);
        }
        this.setState({ numberOfBoxes: nboxes });
    }

    render() {
        const { availableItems, numberOfBoxes } = this.state;
        const { disabled, items, minimum, maximum } = this.props;
        const placeholder = I18n.t("multiple_item_select.select_item");
        const showAdd = maximum > minimum && items.length < maximum;
        const boxes =
            subscriptions.length < numberOfBoxes
                ? items.concat(Array(numberOfBoxes - items.length).fill(null))
                : items;

        return (
            <section className="multiple-subscriptions">
                <section className="subscription-select">
                    {boxes.map((item, index) => {
                        const options = availableItems
                            .filter(
                                x => x.subscription_id === item || !items.includes(x.subscription_id)
                            )
                            .map(x => ({
                                value: x.subscription_id,
                                label: x.description
                            }));

                        const value = options.find(option => option.value === item);

                        return (
                            <div className="wrapper" key={index}>
                                <div className="select-box" key={index}>
                                    <Select
                                        onChange={this.onChangeInternal(index)}
                                        key={index}
                                        options={options}
                                        value={value}
                                        isSearchable={true}
                                        isDisabled={disabled || availableItems.length === 0}
                                        placeholder={placeholder}
                                    />
                                </div>

                                {maximum > minimum && (
                                    <i
                                        className={`fa fa-minus ${index < minimum ? "disabled" : ""}`}
                                        onClick={this.removeItem.bind(this, index)}
                                    />
                                )}
                            </div>
                        );
                    })}

                    {showAdd && (
                        <div className="add-item">
                            <i className="fa fa-plus" onClick={this.addItem.bind(this)} />
                        </div>
                    )}
                </section>
            </section>
        );
    }
}

MultipleItemSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    items: PropTypes.array, // array of values or array of {value: "20", label: "My 20 birthday"}
    minimum: PropTypes.number,
    maximum: PropTypes.number
};

MultipleItemSelect.defaultProps = {
    minimum: 1,
    maximum: 1
};
