import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import "react-select/dist/react-select.css";

export default class ServicePortSelect extends React.PureComponent {

    label = (servicePort, organisations) => {
        const organisation = organisations.find(org => org.uuid === servicePort.customer_id);
        const organisationName = organisation ? organisation.name : "";
        const description = servicePort.description || "<No description>";
        return `${description.trim()} ${organisationName}`
    };

    is_selectable = (servicePort) => {
        if (servicePort.tag === "SSP") {
            // Service port with TAG SSP can always be used
            return true;
        }
        // Other service ports need to be insync before you can select them
        return servicePort.insync;
    };

    render() {
        const {onChange, servicePort, servicePorts, organisations, disabled} = this.props;
        return <Select onChange={onChange}
                       options={servicePorts
                           .map(aServicePort => ({
                               value: aServicePort.subscription_id,
                               label: this.label(aServicePort, organisations),
                               tag: aServicePort.tag,
                               disabled: !this.is_selectable(aServicePort),
                           }))
                           .sort((x,y)=> x.label.localeCompare(y.label))
                       }
                       value={servicePort}
                       searchable={true}
                       disabled={disabled || servicePorts.length === 0}/>

    }
}

ServicePortSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    servicePorts: PropTypes.array.isRequired,
    servicePort: PropTypes.string,
    organisations: PropTypes.array.isRequired,
    disabled: PropTypes.bool
};
