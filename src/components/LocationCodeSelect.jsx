import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import "react-select/dist/react-select.css";

export default function LocationCodeSelect({onChange, locationCode, locationCodes, disabled}) {

    return (
        <Select className="select-locationcode"
                onChange={onChange}
                options={locationCodes.map(aLocationCode => {
                    return {value: aLocationCode, label: aLocationCode};
                })}
                value={locationCode}
                searchable={true}
                disabled={disabled || locationCodes.length === 1}/>
    );
}

LocationCodeSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    locationCodes: PropTypes.array.isRequired,
    locationCode: PropTypes.string,
    disabled: PropTypes.bool
};
