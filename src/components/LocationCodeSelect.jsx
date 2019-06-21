import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import { isEmpty } from "../utils/Utils";

export default function LocationCodeSelect({ onChange, locationCode, locationCodes, disabled }) {
    if (!isEmpty(locationCode) && !locationCodes.includes(locationCode)) {
        const toUpperCase = locationCode.toUpperCase();
        locationCode = locationCodes.find(lc => lc.toUpperCase() === toUpperCase);
    }

    const options = locationCodes.map(aLocationCode => {
        return { value: aLocationCode, label: aLocationCode };
    });

    const value = options.find(option => option.value === locationCode);

    return (
        <Select
            className="select-locationcode"
            onChange={onChange}
            options={options}
            value={value}
            isSearchable={true}
            isDisabled={disabled || locationCodes.length === 0}
        />
    );
}

LocationCodeSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    locationCodes: PropTypes.array.isRequired,
    locationCode: PropTypes.string,
    disabled: PropTypes.bool
};
