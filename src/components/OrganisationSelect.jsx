import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import {contacts} from "../api"
import "react-select/dist/react-select.css";

export const organisationContactsKey = "organisation-contacts";

export default function OrganisationSelect({onChange, storeInterDependentState, organisation, organisations, disabled}) {

    return (
        <Select onChange={option => {
                    onChange(option);
                    if (option && option.value) {
                        contacts(option.value).then(result => storeInterDependentState(organisationContactsKey, result))
                    }
                }}
                options={organisations.map(org => {
                    return {value: org.uuid, label: org.name};
                })}
                value={organisation}
                searchable={true}
                placeholder="Search and select a customer..."
                disabled={disabled || organisations.length === 0}/>
    );
}

OrganisationSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    storeInterDependentState: PropTypes.func.isRequired,
    organisations: PropTypes.array.isRequired,
    organisation: PropTypes.string,
    disabled: PropTypes.bool
};
