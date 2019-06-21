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
