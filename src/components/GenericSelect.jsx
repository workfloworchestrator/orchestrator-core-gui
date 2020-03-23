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
import PropTypes from "prop-types";
import Select from "react-select";

export default function GenericSelect({ onChange, choices, selected, disabled }) {
    const options = choices.map(choice =>
        choice instanceof Object && "label" in choice && "value" in choice ? choice : { value: choice, label: choice }
    );

    const value = options.find(option => option.value === selected);

    return (
        <Select
            className="generic-select"
            onChange={onChange}
            options={options}
            value={value}
            isSearchable={true}
            placeholder="Search or select a value..."
            isDisabled={disabled}
        />
    );
}

GenericSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    choices: PropTypes.array.isRequired,
    selected: PropTypes.string,
    disabled: PropTypes.bool
};
