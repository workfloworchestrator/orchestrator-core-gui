import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import "react-select/dist/react-select.css";

export default function OrganisationSelect({onChange, organisation, organisations, disabled}) {

    return (
        <Select className="select-organisation"
                onChange={onChange}
                options={organisations.map(org => {
                    return {value: org.uuid, label: org.name};
                })}
                value={organisation}
                searchable={true}
                disabled={disabled || organisations.length === 0}/>
    );
}

OrganisationSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    organisations: PropTypes.array.isRequired,
    organisation: PropTypes.string,
    disabled: PropTypes.bool
};
