import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";

import "react-select/dist/react-select.css";

export default function GenericSelect({onChange, choices, selected,  disabled}) {
    const options = choices.map(choice => ({value: choice, label: choice}));
    return (
        <Select className="generic-select"
                onChange={onChange}
                options={options}
                value={selected}
                searchable={true}
                placeholder="Search or select a value..." 
                disabled={disabled}/>
    );
}

GenericSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    choices: PropTypes.array.isRequired,
    selected: PropTypes.string,
    disabled: PropTypes.bool
};
