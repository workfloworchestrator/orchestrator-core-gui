import React from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";
import {stop} from "../utils/Utils";

import "./MultipleServicePorts.css";
import ServicePortSelect from "./ServicePortSelect";
import VirtualLAN from "./VirtualLAN";
import {doValidateUserInput} from "../validations/UserInput";
import {subscriptions_by_subscription_port_id} from "../api";

export default class MultipleServicePorts extends React.PureComponent {

    constructor(props, context) {
        super(props, context);
        this.state = {
            errors: {},
            usedSSPDescriptions: {}
        };
    }

    onChangeInternal = (name, index) => e => {
        const servicePorts = [...this.props.servicePorts];
        let value;
        if (name === "subscription_id") {
            value = e ? e.value : null;
            if (e !== null) {
                const port = this.props.availableServicePorts.find(x => x.subscription_id === value);
                if (port.tag === "SSP") {
                    // The SSP may bot be used in other LP's
                    subscriptions_by_subscription_port_id(value).then(res => {
                        const usedSSPDescriptions = {...this.state.usedSSPDescriptions};
                        if (res.json.length > 0) {
                            usedSSPDescriptions[index] = res.json.map(parent => parent.description).join(", ");
                        } else {
                            this.clearErrors(index);
                        }
                        this.setState({usedSSPDescriptions: usedSSPDescriptions});
                    });
                } else {
                    this.clearErrors(index);
                }
                servicePorts[index].tag = port.tag;
            } else {
                this.clearErrors(index);
            }
        } else {
            value = e.target ? e.target.value : null
        }
        servicePorts[index][name] = value;
        this.props.onChange(servicePorts);
    };

    clearErrors = index => {
        const usedSSPDescriptions = {...this.state.usedSSPDescriptions};
        usedSSPDescriptions[index] = null;
        this.setState({usedSSPDescriptions: usedSSPDescriptions});
    };

    addServicePort = () => {
        const servicePorts = [...this.props.servicePorts];
        servicePorts.push({subscription_id: null, vlan: ""});
        this.props.onChange(servicePorts);
    };

    removeServicePort = index => e => {
        stop(e);
        if (index > 1) {
            const servicePorts = [...this.props.servicePorts];
            servicePorts.splice(index, 1);
            this.props.onChange(servicePorts);
        }
    };

    validateVlan = index => e => {
        const err = {};
        doValidateUserInput({name: "n", type: "vlan_range"}, e.target.value, err);
        const errors = {...this.state.errors};
        errors[index] = err["n"];
        this.setState({errors: errors});
    };


    renderServicePort = (servicePorts, servicePort, index, errors, availableServicePorts, organisations, maximum,
                         disabled, usedSSPDescriptions) => {
        let inSelect = availableServicePorts.filter(port => port.subscription_id === servicePort.subscription_id ||
            !servicePorts.some(x => x.subscription_id === port.subscription_id));
        inSelect = inSelect.filter(port => port.tag === "MSP" || port.tag === "SSP");
        if (maximum > 2) { //ELAN
            inSelect = inSelect.filter(port => port.tag === "MSP");
        }
        const showDelete = maximum > 2 && !disabled;
        return (<section className="msp" key={index}>
            <div className="wrapper msp-select">
                {index === 0 && <label>{I18n.t("service_ports.servicePort")}</label>}
                <ServicePortSelect key={index} onChange={this.onChangeInternal("subscription_id", index)}
                                   servicePort={servicePort.subscription_id}
                                   servicePorts={inSelect}
                                   organisations={organisations}
                                   disabled={disabled}/>
                {usedSSPDescriptions[index] &&
                <em className="error">{I18n.t("service_ports.used_ssp", {descriptions: usedSSPDescriptions[index]})}</em>}
            </div>
            {servicePort.tag === "MSP" && <div className="wrapper">
                {index === 0 && <label>{I18n.t("service_ports.vlan")}</label>}
                <div className="vlan">
                    <VirtualLAN vlan={servicePort.vlan} onChange={this.onChangeInternal("vlan", index)}
                                subscriptionIdMSP={servicePort.subscription_id} onBlur={this.validateVlan(index)}
                                disabled={disabled}/>
                    {showDelete && <i className={`fa fa-minus ${index < 2 ? "disabled" : "" }`}
                                       onClick={this.removeServicePort(index)}></i>}
                </div>
                {errors[index] && <em className="error">{I18n.t("service_ports.invalid_vlan")}</em>}
            </div>}

        </section>)
    };

    render() {
        const {availableServicePorts, servicePorts, organisations, maximum, disabled} = this.props;
        const {errors, usedSSPDescriptions} = this.state;
        const showAdd = maximum > 2 && !disabled;
        return (<section className="multiple-mps">
            {servicePorts.map((servicePort, index) =>
                this.renderServicePort(servicePorts, servicePort, index, errors, availableServicePorts, organisations,
                    maximum, disabled, usedSSPDescriptions))}
            {showAdd && <div className="add-msp"><i className="fa fa-plus" onClick={this.addServicePort}></i></div>}
        </section>)
    }
}

MultipleServicePorts.propTypes = {
    onChange: PropTypes.func.isRequired,
    availableServicePorts: PropTypes.array.isRequired,
    servicePorts: PropTypes.array.isRequired,
    organisations: PropTypes.array.isRequired,
    maximum: PropTypes.number.isRequired,
    disabled: PropTypes.bool
};
