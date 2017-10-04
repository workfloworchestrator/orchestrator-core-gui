import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import "react-select/dist/react-select.css";

export default class MultiServicePointSelect extends React.PureComponent {

    label = (msp, organisations) => {
        const organisation = organisations.find(org => org.uuid === msp.client_id);
        const organisationName = organisation ? organisation.name : "";
        return `MSP ${msp.description} ${organisationName} (${msp.ims_port_id_value.trim()})`
    };

    render() {
        const {onChange, msp, msps, organisations, disabled} = this.props;
        return <Select className="select-msp"
                       onChange={onChange}
                       options={msps.map(aMsp => {
                           return {value: aMsp.ims_port_id_value, label: this.label(aMsp, organisations)};
                       })}
                       value={msp}
                       searchable={true}
                       disabled={disabled || msps.length === 1}/>

    }
}

MultiServicePointSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    msps: PropTypes.array.isRequired,
    msp: PropTypes.string,
    organisations: PropTypes.array.isRequired,
    disabled: PropTypes.bool
};
