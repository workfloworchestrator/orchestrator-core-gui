import React from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";
import {stop} from "../utils/Utils";

import "./MultipleServicePorts.css";
import ServicePortSelect from "./ServicePortSelect";
import VirtualLAN from "./VirtualLAN";
import {doValidateUserInput} from "../validations/UserInput";
import {fetchPortSpeedBySubscription, parentSubscriptions} from "../api";

export default class MultipleServicePorts extends React.PureComponent {

    constructor(props, context) {
        super(props, context);
        this.state = {
            vlanErrors: {},
            bandwidthErrors: {},
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
                    parentSubscriptions(value).then(res => {
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
        const vlanErrors = {...this.state.vlanErrors};
        vlanErrors[index] = err["n"];
        this.setState({vlanErrors: vlanErrors}, this.bubbleUpErrorState);
    };

    bubbleUpErrorState = () => {
      const {vlanErrors, bandwidthErrors, usedSSPDescriptions} = this.state;
      const inValid = Object.values(vlanErrors).some(val => val) || Object.values(bandwidthErrors).some(val => val) ||
      Object.values(usedSSPDescriptions).some(val => val) ;
      this.props.reportError(inValid);
    };

    validateMaxBandwidth = index => e => {
        const bandwidth = e.target.value;
        if (bandwidth) {
            const servicePort = this.props.servicePorts[index];
            fetchPortSpeedBySubscription(servicePort.subscription_id).then(res => {
                const bandwidthErrors = {...this.state.bandwidthErrors};
                const isTooLarge = parseInt(bandwidth, 10) > parseInt(res, 10);
                bandwidthErrors[index] = isTooLarge;
                this.setState({bandwidthErrors: bandwidthErrors}, this.bubbleUpErrorState);
            });
        }
    };

    renderServicePort = (servicePorts, servicePort, index, vlanErrors, availableServicePorts, organisations, maximum,
                         disabled, usedSSPDescriptions, bandwidthErrors, isElan) => {
        let inSelect = availableServicePorts.filter(port => port.subscription_id === servicePort.subscription_id ||
            !servicePorts.some(x => x.subscription_id === port.subscription_id));
        inSelect = inSelect.filter(port => port.tag === "MSP" || port.tag === "SSP");
        if (maximum > 2) { //ELAN
            inSelect = inSelect.filter(port => port.tag === "MSP");
        }
        const showDelete = maximum > 2 && !disabled;
        const vlanPlaceholder = servicePort.tag === "SSP" ? I18n.t("vlan.ssp") :
            (servicePort.subscription_id ? I18n.t("vlan.placeholder") :
                (isElan ? I18n.t("vlan.placeholder_no_msp") : I18n.t("vlan.placeholder_no_service_port")));
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
            <div className="wrapper">
                {index === 0 && <label>{I18n.t("service_ports.vlan")}</label>}
                <div className="vlan">
                    <VirtualLAN vlan={servicePort.tag === "SSP" ? "0" : servicePort.vlan}
                                onChange={this.onChangeInternal("vlan", index)}
                                subscriptionIdMSP={servicePort.subscription_id} onBlur={this.validateVlan(index)}
                                disabled={disabled || servicePort.tag === "SSP" || !servicePort.subscription_id}
                                placeholder={vlanPlaceholder}/>
                    {(!isElan && showDelete) && <i className={`fa fa-minus ${index < 2 ? "disabled" : "" }`}
                                                   onClick={this.removeServicePort(index)}></i>}
                </div>
                {vlanErrors[index] && <em className="error">{I18n.t("service_ports.invalid_vlan")}</em>}
            </div>
            {isElan && <div className="wrapper">
                {index === 0 && <label>{I18n.t("service_ports.bandwidth")}</label>}
                <div className="bandwidth">
                    <input type="number" name={`bandwidth_${index}`}
                           value={servicePort.bandwidth || ""}
                           placeholder={servicePort.subscription_id ? I18n.t("service_ports.bandwidth_placeholder") :
                               I18n.t("service_ports.bandwidth_no_msp_placeholder")}
                           onChange={this.onChangeInternal("bandwidth", index)}
                           onBlur={this.validateMaxBandwidth(index)}
                           disabled={disabled || !servicePort.subscription_id}/>
                    {(isElan && showDelete) && <i className={`fa fa-minus ${index < 2 ? "disabled" : "" }`}
                                                  onClick={this.removeServicePort(index)}></i>}
                </div>
                {bandwidthErrors[index] &&
                <em className="error">{I18n.t("service_ports.invalid_bandwidth", {max: 1000})}</em>}
            </div>}

        </section>)
    };

    render() {
        const {availableServicePorts, servicePorts, organisations, maximum, disabled, isElan} = this.props;
        const {vlanErrors, bandwidthErrors, usedSSPDescriptions} = this.state;
        const showAdd = maximum > 2 && !disabled;
        return (<section className="multiple-mps">
            {servicePorts.map((servicePort, index) =>
                this.renderServicePort(servicePorts, servicePort, index, vlanErrors, availableServicePorts, organisations,
                    maximum, disabled, usedSSPDescriptions, bandwidthErrors, isElan))}
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
    disabled: PropTypes.bool,
    isElan: PropTypes.bool,
    reportError: PropTypes.func.isRequired
};
