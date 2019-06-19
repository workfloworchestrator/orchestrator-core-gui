import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import "react-select/dist/react-select.css";

export default class OrganisationSelect extends React.PureComponent {
    render() {
        const { onChange, organisation, organisations, disabled } = this.props;
        return (
            <Select
                onChange={onChange}
                options={organisations.map(org => ({
                    value: org.uuid,
                    label: org.name
                }))}
                value={organisation}
                searchable={true}
                placeholder="Search and select a customer..."
                disabled={disabled || organisations.length === 0}
            />
        );
    }
}

OrganisationSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    organisations: PropTypes.array.isRequired,
    organisation: PropTypes.string,
    disabled: PropTypes.bool
};
