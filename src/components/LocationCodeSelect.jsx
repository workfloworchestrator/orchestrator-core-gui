import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import "react-select/dist/react-select.css";
import {isEmpty} from "../utils/Utils";

export default function LocationCodeSelect({onChange, locationCode, locationCodes, disabled}) {

    if (!isEmpty(locationCode) && !locationCodes.includes(locationCode)) {
        locationCode = locationCodes.find(lc => lc.toUpperCase() === locationCode.toUpperCase());
    }
    return (
        <Select className="select-locationcode"
                onChange={onChange}
                options={locationCodes.map(aLocationCode => {
                    return {value: aLocationCode, label: aLocationCode};
                })}
                value={locationCode}
                searchable={true}
                disabled={disabled || locationCodes.length === 0}/>
    );
}

LocationCodeSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    locationCodes: PropTypes.array.isRequired,
    locationCode: PropTypes.string,
    disabled: PropTypes.bool
};
