import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import "react-select/dist/react-select.css";
import {isEmpty} from "../utils/Utils";

export default class ServicePortSelectSN8 extends React.PureComponent {

    label = (servicePort, organisations) => {
        const organisation = organisations.find(org => org.uuid === servicePort.customer_id);
        const organisationName = organisation ? organisation.name : "";
        const description = servicePort.description || "<No description>";
        const portMode = isEmpty(servicePort.port_mode) ? "<No port_mode>" : servicePort.port_mode.toUpperCase();
        return `${servicePort.subscription_id.substring(0,8)} ${portMode} ${description.trim()} ${organisationName}`
    };

    render() {
        const {onChange, servicePort, servicePorts, organisations, disabled} = this.props;
        return <Select onChange={onChange}
                       options={servicePorts
                           .map(aServicePort => ({
                               value: aServicePort.subscription_id,
                               label: this.label(aServicePort, organisations),
                               tag: aServicePort.tag,
                           }))
                           .sort((x, y) => x.label.localeCompare(y.label))
                       }
                       value={servicePort}
                       searchable={true}
                       disabled={disabled || servicePorts.length === 0}/>
    }
}

ServicePortSelectSN8.propTypes = {
    onChange: PropTypes.func.isRequired,
    servicePorts: PropTypes.array.isRequired,
    servicePort: PropTypes.string,
    organisations: PropTypes.array.isRequired,
    disabled: PropTypes.bool,
    visiblePortMode: PropTypes.string.isRequired, // all, tagged, untagged, link_member
};
