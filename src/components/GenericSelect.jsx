import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";

export default function GenericSelect({ onChange, choices, selected, disabled, defaultValue }) {
    const options = choices.map(choice =>
        choice instanceof Object && "label" in choice && "value" in choice ? choice : { value: choice, label: choice }
    );

    let value = options.find(option => option.value === selected);

    if (value === undefined && defaultValue !== undefined){
        value = options.find(option => option.value === defaultValue)
        onChange(value);
    }

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
    disabled: PropTypes.bool,
    defaultValue: PropTypes.string
};
