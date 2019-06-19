import React from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";
import { stop } from "../utils/Utils";

import "./MultipleServicePortsSN8.scss";
import ServicePortSelectSN8 from "./ServicePortSelectSN8";
import VirtualLAN from "./VirtualLAN";
import { fetchPortSpeedBySubscription, parentSubscriptions } from "../api";

export default class MultipleServicePortsSN8 extends React.PureComponent {
    constructor(props, context) {
        super(props, context);
        this.state = {
            bandwidthErrors: {},
            usedUntaggedServicePorts: {}
        };
    }

    onChangeInternal = (name, index) => e => {
        const servicePorts = [...this.props.servicePorts];
        let value;
        if (name === "subscription_id") {
            value = e ? e.value : null;
            if (e !== null) {
                const port = this.props.availableServicePorts.find(x => x.subscription_id === value);
                if (port.port_mode === "untagged") {
                    parentSubscriptions(value).then(res => {
                        const usedUntaggedServicePorts = {
                            ...this.state.usedUntaggedServicePorts
                        };
                        let filteredParents = res.json.filter(parent => parent.status !== "terminated");
                        if (filteredParents.length > 0) {
                            usedUntaggedServicePorts[index] = filteredParents
                                .map(parent => parent.description)
                                .join(", ");
                        } else {
                            usedUntaggedServicePorts[index] = false;
                        }
                        this.setState({
                            usedUntaggedServicePorts: usedUntaggedServicePorts
                        });
                    });
                } else {
                    // TODO: check if this is needed and ensure it works with SN8 SP's
                    console.log(
                        "Warning: not all business logic is implemented/clear for untagged SP's: investigate clearErrors()..."
                    );
                    this.clearErrors(index);
                }
                servicePorts[index].port_mode = port.port_mode;
            } else {
                this.clearErrors(index);
            }
        } else {
            value = e.target ? e.target.value : null;
        }
        servicePorts[index][name] = value;
        this.props.onChange(servicePorts);
    };

    clearErrors = index => {
        const usedUntaggedServicePorts = { ...this.state.usedUntaggedServicePorts };
        usedUntaggedServicePorts[index] = false;
        this.setState({ usedUntaggedServicePorts: usedUntaggedServicePorts });
    };

    addServicePort = () => {
        const servicePorts = [...this.props.servicePorts];
        //todo: we might need to add tag and port_mode
        servicePorts.push({ subscription_id: null, vlan: "" });
        this.props.onChange(servicePorts);
    };

    removeServicePort = index => e => {
        stop(e);
        const servicePorts = [...this.props.servicePorts];
        servicePorts.splice(index, 1);
        this.props.onChange(servicePorts);
    };

    reportVlanError = isError => this.props.reportError(isError);

    bubbleUpErrorState = () => {
        const { bandwidthErrors, usedUntaggedServicePorts } = this.state;
        const inValid = Object.values(bandwidthErrors)
            .concat(Object.values(usedUntaggedServicePorts))
            .some(val => val);
        this.props.reportError(inValid);
    };

    validateMaxBandwidth = index => e => {
        const bandwidth = e.target.value;
        if (bandwidth) {
            const servicePort = this.props.servicePorts[index];
            fetchPortSpeedBySubscription(servicePort.subscription_id).then(res => {
                const bandwidthErrors = { ...this.state.bandwidthErrors };
                bandwidthErrors[index] = parseInt(bandwidth, 10) > parseInt(res, 10);
                this.setState({ bandwidthErrors: bandwidthErrors }, this.bubbleUpErrorState);
            });
        }
    };

    renderServicePort = (
        servicePorts,
        servicePort,
        index,
        availableServicePorts,
        organisations,
        organisationId,
        minimum,
        maximum,
        disabled,
        usedUntaggedServicePorts,
        bandwidthErrors,
        isElan,
        organisationPortsOnly,
        visiblePortMode,
        disabledPorts
    ) => {
        // TC the statement below filters the selected-value of itself and of it's sibling components
        let inSelect = availableServicePorts.filter(
            port =>
                port.subscription_id === servicePort.subscription_id ||
                !servicePorts.some(x => x.subscription_id === port.subscription_id)
        );
        // PB let op er is ook een filter die een andere lijst van servicePorts ophaalt in procesdetail.jsx
        // TC above check already implemented in new-process.jsx

        // Port mode filter
        if (visiblePortMode === "untagged") {
            inSelect = inSelect.filter(port => port.port_mode === "untagged");
        } else if (isElan || visiblePortMode === "tagged") {
            inSelect = inSelect.filter(port => port.port_mode === "tagged");
        } else if (visiblePortMode === "normal") {
            inSelect = inSelect.filter(port => port.port_mode === "tagged" || port.port_mode === "untagged");
        } else if (visiblePortMode === "link_member") {
            inSelect = inSelect.filter(port => port.port_mode === "link_member");
        }

        // Customer filter toggle
        if (organisationPortsOnly) {
            inSelect = inSelect.filter(port => port.customer_id === organisationId);
        }
        const showDelete = servicePorts.length > minimum && !servicePort.nonremovable && !disabled;
        const vlanPlaceholder =
            servicePort.port_mode === "untagged"
                ? I18n.t("vlan.untagged")
                : servicePort.subscription_id
                ? I18n.t("vlan.placeholder")
                : isElan
                ? I18n.t("vlan.placeholder_no_service_port")
                : I18n.t("vlan.placeholder_no_service_port");
        return (
            <section className="service-port" key={index}>
                <div className="wrapper service-port-select">
                    {index === 0 && <label>{I18n.t("service_ports.servicePortSN8")}</label>}
                    <ServicePortSelectSN8
                        key={index}
                        onChange={this.onChangeInternal("subscription_id", index)}
                        servicePort={servicePort.subscription_id}
                        servicePorts={inSelect}
                        organisations={organisations}
                        disabled={disabled || servicePort.modifiable === false || disabledPorts}
                        visiblePortMode={visiblePortMode}
                    />
                    {usedUntaggedServicePorts[index] && (
                        <em className="error">
                            {I18n.t("service_ports.used_ssp", {
                                descriptions: usedUntaggedServicePorts[index]
                            })}
                        </em>
                    )}
                </div>
                <div className="wrapper">
                    {index === 0 && <label>{I18n.t("service_ports.vlan")}</label>}
                    <div className="vlan">
                        <VirtualLAN
                            vlan={servicePort.port_mode === "untagged" ? "0" : servicePort.vlan}
                            onChange={this.onChangeInternal("vlan", index)}
                            subscriptionIdMSP={servicePort.subscription_id}
                            disabled={
                                disabled ||
                                servicePort.port_mode === "untagged" ||
                                !servicePort.subscription_id ||
                                servicePort.modifiable === false
                            }
                            placeholder={vlanPlaceholder}
                            servicePortTag={servicePort.port_mode}
                            reportError={this.reportVlanError}
                        />
                        {!isElan && showDelete && (
                            <i
                                className={`fa fa-minus ${!showDelete ? "disabled" : ""}`}
                                onClick={this.removeServicePort(index)}
                            />
                        )}
                    </div>
                </div>
                {isElan && (
                    <div className="wrapper">
                        {index === 0 && <label>{I18n.t("service_ports.bandwidth")}</label>}
                        <div className="bandwidth">
                            <input
                                type="number"
                                name={`bandwidth_${index}`}
                                value={servicePort.bandwidth || ""}
                                placeholder={
                                    servicePort.subscription_id
                                        ? I18n.t("service_ports.bandwidth_placeholder")
                                        : I18n.t("service_ports.bandwidth_no_service_port_placeholder")
                                }
                                onChange={this.onChangeInternal("bandwidth", index)}
                                onBlur={this.validateMaxBandwidth(index)}
                                disabled={disabled || !servicePort.subscription_id}
                            />
                            {isElan && showDelete && (
                                <i
                                    className={`fa fa-minus ${
                                        !showDelete || !servicePort.nonremovable ? "disabled" : ""
                                    }`}
                                    onClick={this.removeServicePort(index)}
                                />
                            )}
                        </div>
                        {bandwidthErrors[index] && (
                            <em className="error">{I18n.t("service_ports.invalid_bandwidth", { max: 1000 })}</em>
                        )}
                    </div>
                )}
            </section>
        );
    };

    render() {
        const {
            availableServicePorts,
            servicePorts,
            organisations,
            organisationId,
            minimum,
            maximum,
            disabled,
            isElan,
            organisationPortsOnly,
            visiblePortMode,
            disabledPorts
        } = this.props;
        const { bandwidthErrors, usedUntaggedServicePorts } = this.state;
        const showAdd = maximum > 2 && servicePorts.length < maximum && !disabled;
        return (
            <section className="service-port-container">
                {servicePorts.map((servicePort, index) =>
                    this.renderServicePort(
                        servicePorts,
                        servicePort,
                        index,
                        availableServicePorts,
                        organisations,
                        organisationId,
                        minimum,
                        maximum,
                        disabled,
                        usedUntaggedServicePorts,
                        bandwidthErrors,
                        isElan,
                        organisationPortsOnly,
                        visiblePortMode,
                        disabledPorts
                    )
                )}
                {showAdd && (
                    <div className="add-service-port">
                        <i className="fa fa-plus" onClick={this.addServicePort} />
                    </div>
                )}
            </section>
        );
    }
}

MultipleServicePortsSN8.propTypes = {
    onChange: PropTypes.func.isRequired,
    availableServicePorts: PropTypes.array.isRequired,
    servicePorts: PropTypes.array.isRequired,
    organisations: PropTypes.array.isRequired,
    organisationId: PropTypes.string,
    minimum: PropTypes.number,
    maximum: PropTypes.number.isRequired,
    disabled: PropTypes.bool,
    isElan: PropTypes.bool,
    organisationPortsOnly: PropTypes.bool,
    reportError: PropTypes.func.isRequired,
    visiblePortMode: PropTypes.string.isRequired, // all, tagged, untagged, link_member
    disabledPorts: PropTypes.bool
};

MultipleServicePortsSN8.defaultProps = {
    minimum: 2,
    visiblePortMode: "all",
    disabledPorts: false
};
