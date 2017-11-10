import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import {contacts} from "../api"
import "react-select/dist/react-select.css";
import {isEmpty} from "../utils/Utils";

export const organisationContactsKey = "organisation-contacts";
export const organisationNameKey = "organisation-name";

export default class OrganisationSelect extends React.PureComponent {

    componentDidMount() {
        const {organisation, storeInterDependentState} = this.props;
        this.fetchContacts(organisation, storeInterDependentState);
    }

    fetchContacts = (organisation, storeInterDependentState) => {
        if (!isEmpty(organisation)) {
            storeInterDependentState(organisationNameKey, organisation);
            contacts(organisation).then(result => storeInterDependentState(organisationContactsKey, result))
        }
    };

    render() {
        const {onChange, storeInterDependentState, organisation, organisations, disabled} = this.props;
        return (
            <Select onChange={option => {
                onChange(option);
                if (option && option.value) {
                    this.fetchContacts(option.value, storeInterDependentState);
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
}

OrganisationSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    storeInterDependentState: PropTypes.func.isRequired,
    organisations: PropTypes.array.isRequired,
    organisation: PropTypes.string,
    disabled: PropTypes.bool
};
