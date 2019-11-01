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

import "./GenericMultiSelect.scss";
import { capitalizeFirstLetter } from "../utils/Utils";

export default class GenericMultiSelect extends React.PureComponent {
    constructor(props) {
        super(props);
        const { selections, minimum } = this.props;
        const nboxes = selections.length > minimum ? selections.length : minimum;
        this.state = {
            numberOfBoxes: nboxes
        };
    }

    onChangeInternal = index => selection => {
        const { selections } = this.props;
        if (selection && selection.value) {
            selections[index] = { value: selection.value, label: selection.label };
        } else {
            selections[index] = null;
        }
        this.props.onChange(selections);
    };

    addItem() {
        const nboxes = this.state.numberOfBoxes + 1;
        this.setState({ numberOfBoxes: nboxes });
    }

    removeItem(index) {
        const { selections } = this.props;

        // Don't allow when disabled
        if (selections[index].nonremovable === true) {
            return;
        }

        const nboxes = this.state.numberOfBoxes - 1;
        if (selections.length > nboxes) {
            selections.splice(index, 1);
            this.props.onChange(selections);
        }
        this.setState({ numberOfBoxes: nboxes });
    }

    render() {
        const { numberOfBoxes } = this.state;
        const { choices, disabled, selections, minimum, maximum, errors } = this.props;
        const placeholder = I18n.t("generic_multi_select.placeholder");
        const showAdd = maximum > minimum && selections.length < maximum;
        const boxes =
            selections.length < numberOfBoxes
                ? selections.concat(Array(numberOfBoxes - selections.length).fill(null))
                : selections;
        const rootFieldErrors = errors.filter(error => error.loc.length === 1);

        return (
            <section className="multiple-selections-container">
                <section className="item-select">
                    {boxes.map((selection, index) => {
                        const fieldErrors = errors.filter(error => error.loc[1] === index && error.loc.length === 3);
                        const notModifiable =
                            selection && selection.hasOwnProperty("modifiable") ? !selection.modifiable : false;
                        const showDelete = selections.length > minimum && !disabled;
                        const options = choices
                            .filter(
                                x =>
                                    !selections.find(y => y.value === x.value) ||
                                    (selection && x.value === selection.value)
                            )
                            .map(x => ({
                                value: x.value,
                                label: x.label
                            }));

                        let value;
                        if (selection && selection.hasOwnProperty("value")) {
                            value = options.find(option => option.value === selection.value);
                        }

                        return (
                            <div className="wrapper" key={index}>
                                <div className="select-box" key={index}>
                                    <Select
                                        onChange={this.onChangeInternal(index)}
                                        key={index}
                                        options={options}
                                        value={value}
                                        isSearchable={true}
                                        isDisabled={disabled || options.length === 0 || notModifiable}
                                        placeholder={
                                            options.length === 0
                                                ? I18n.t("generic_multi_select.placeholder_no_items")
                                                : placeholder
                                        }
                                    />
                                </div>
                                {fieldErrors && (
                                    <em className="error">
                                        {fieldErrors.map((e, index) => (
                                            <div key={index}>
                                                {capitalizeFirstLetter(e.loc[2])}: {capitalizeFirstLetter(e.msg)}.
                                            </div>
                                        ))}
                                    </em>
                                )}

                                {showDelete && (
                                    <i
                                        className={`fa fa-minus ${
                                            selection && selection.nonremovable ? "disabled" : ""
                                        }`}
                                        onClick={this.removeItem.bind(this, index)}
                                    />
                                )}
                            </div>
                        );
                    })}

                    {rootFieldErrors && (
                        <em className="error root-error">
                            {rootFieldErrors.map((e, index) => (
                                <div key={index}>{capitalizeFirstLetter(e.msg)}.</div>
                            ))}
                        </em>
                    )}

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

GenericMultiSelect.defaultProps = {
    minimum: 1,
    maximum: 1,
    errors: []
};

GenericMultiSelect.propTypes = {
    selections: PropTypes.array.isRequired,
    choices: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    minimum: PropTypes.number,
    maximum: PropTypes.number,
    errors: PropTypes.array
};
