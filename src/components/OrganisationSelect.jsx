import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";

export default class OrganisationSelect extends React.PureComponent {
    render() {
        const { onChange, organisation, organisations, disabled } = this.props;

        const options = organisations.map(org => ({
            value: org.uuid,
            label: org.name
        }));
        const value = options.find(option => option.value === organisation);

        return (
            <Select
                onChange={onChange}
                options={options}
                value={value}
                isSearchable={true}
                placeholder="Search and select a customer..."
                isDisabled={disabled || organisations.length === 0}
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
