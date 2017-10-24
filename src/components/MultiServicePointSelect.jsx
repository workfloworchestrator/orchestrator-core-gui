import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import I18n from "i18n-js";
import "react-select/dist/react-select.css";

export default class MultiServicePointSelect extends React.PureComponent {

    label = (msp, organisations) => {
        const organisation = organisations.find(org => org.uuid === msp.client_id);
        const organisationName = organisation ? organisation.name : "";
        const value = msp.subscription_id;
        const description = msp.description || "<No description>";
        return `MSP ${description.trim()} ${organisationName}`
    };

    render() {
        const {onChange, msp, msps, organisations, disabled} = this.props;
        return <Select className="select-msp"
                       onChange={onChange}
                       options={msps.map(aMsp => {
                           return {value: aMsp.subscription_id, label: this.label(aMsp, organisations)};
                       })}
                       value={msp}
                       searchable={true}
                       disabled={disabled || msps.length === 0}/>

    }
}

MultiServicePointSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    msps: PropTypes.array.isRequired,
    msp: PropTypes.string,
    organisations: PropTypes.array.isRequired,
    disabled: PropTypes.bool
};
