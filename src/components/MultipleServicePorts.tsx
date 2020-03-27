/*
 * Copyright 2019 SURF.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import "./MultipleServicePorts.scss";

import I18n from "i18n-js";
import range from "lodash/range";
import React from "react";

import { fetchPortSpeedBySubscription, portSubscriptions } from "../api";
import ApplicationContext from "../utils/ApplicationContext";
import { Product, ServicePort, ServicePortSubscription, ValidationError, setProp } from "../utils/types";
import { capitalizeFirstLetter, isEmpty, stop } from "../utils/Utils";
import { filterProductsByBandwidth } from "../validations/Products";
import ServicePortSelect from "./ServicePortSelect";
import VirtualLAN from "./VirtualLAN";

interface IProps {
    servicePorts: ServicePort[];
    sn8: boolean;
    productTags: string[];
    minimum: number;
    maximum: number;
    disabled: boolean;
    organisationId: string;
    isElan: boolean;
    mspOnly: boolean;
    organisationPortsOnly: boolean;
    visiblePortMode: string; // all, tagged, untagged, link_member
    disabledPorts: boolean;
    bandwidth: number;
    onChange: (servicePorts: ServicePort[]) => void;
    errors: ValidationError[];
}

interface IState {
    bandwidthErrors: { [index: number]: boolean };
    vlanErrors: { [index: number]: boolean };
    availableServicePorts: ServicePortSubscription[];
}

export default class MultipleServicePorts extends React.PureComponent<IProps> {
    public static defaultProps = {
        minimum: 1,
        visiblePortMode: "all",
        disabledPorts: false,
        mspOnly: false,
        servicePorts: [],
        node: null,
        errors: []
    };
    context!: React.ContextType<typeof ApplicationContext>;

    state: IState = {
        bandwidthErrors: {},
        vlanErrors: {},
        availableServicePorts: []
    };

    componentDidMount = () => {
        const extra = Math.max(0, this.props.minimum - this.props.servicePorts.length);
        const servicePorts = [...this.props.servicePorts];
        range(extra).forEach(() => servicePorts.push({ subscription_id: "", vlan: "", port_mode: "tagged" }));
        this.props.onChange(servicePorts);

        const { availableServicePorts } = this.state;

        if (isEmpty(availableServicePorts)) {
            this.loadServicePorts();
        }
    };

    loadServicePorts = () => {
        const tags = this.props.productTags;

        portSubscriptions(tags, ["active"]).then((result: ServicePortSubscription[]) => {
            this.setState({
                availableServicePorts: result.map(sp => {
                    // Todo: delegate this to backend: it should provide a valid port mode for MSC
                    if (sp.product.tag === "MSC" || sp.product.tag === "MSCNL") {
                        sp.port_mode = "tagged";
                    }
                    return sp;
                })
            });
        });
    };

    onChangeSubscription = (index: number) => (e: { value: string }) => {
        const servicePorts = [...this.props.servicePorts];
        let value = e ? e.value : null;

        if (value !== null) {
            const port = this.state.availableServicePorts.find(x => x.subscription_id === value);

            if (port) {
                servicePorts[index].subscription_id = value;

                // TODO: Leave these out, they are properties of the subscription
                servicePorts[index].port_mode =
                    port.port_mode ||
                    (["MSP", "MSPNL", "MSC", "MSCNL"].includes(port.product.tag) ? "tagged" : "untagged");
                servicePorts[index].tag = port.product.tag;

                // Reset vlan since we cannot change it for untagged and link_member and it can't be 0 for tagged
                servicePorts[index].vlan = ["untagged", "link_member"].includes(servicePorts[index].port_mode)
                    ? "0"
                    : "";
            }
        }

        this.clearErrors(index);

        this.props.onChange(servicePorts);
    };

    onChangeInternal = (name: keyof ServicePort, index: number) => (e: React.FormEvent<HTMLInputElement>) => {
        const servicePorts = [...this.props.servicePorts];
        const target = e.target as HTMLInputElement;
        let value = e.target ? target.value : "";
        setProp(servicePorts[index], name, value);

        this.clearErrors(index);

        if (name === "bandwidth") {
            this.validateMaxBandwidth(index)(e);
        }

        this.props.onChange(servicePorts);
    };

    addServicePort = () => {
        const servicePorts = [...this.props.servicePorts];
        //todo: we might need to add tag and port_mode
        servicePorts.push({ subscription_id: "", vlan: "", port_mode: "tagged" });
        this.props.onChange(servicePorts);
    };

    removeServicePort = (index: number) => (e: React.MouseEvent<HTMLInputElement>) => {
        stop(e);
        const servicePorts = [...this.props.servicePorts];

        // Don't allow when disabled
        if (servicePorts[index].nonremovable === true) {
            return;
        }

        servicePorts.splice(index, 1);
        this.clearErrors(index);
        this.props.onChange(servicePorts);
    };

    clearErrors = (index: number) => {
        let { bandwidthErrors, vlanErrors } = this.state;
        vlanErrors[index] = false;
        bandwidthErrors[index] = false;
        this.setState({ vlanErrors: vlanErrors, bandwidthErrors: bandwidthErrors });
    };

    reportVlanError = (index: number) => (isError: boolean) => {
        let { vlanErrors } = this.state;
        vlanErrors[index] = isError;
        this.setState({ vlanErrors: vlanErrors });
    };

    validateMaxBandwidth = (index: number) => (e: React.FormEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        const bandwidth = target.value;
        if (bandwidth) {
            const servicePort = this.props.servicePorts[index];
            fetchPortSpeedBySubscription(servicePort.subscription_id).then(res => {
                let { bandwidthErrors } = this.state;
                bandwidthErrors[index] = parseInt(bandwidth, 10) > parseInt(res, 10);
                this.setState({ bandwidthErrors: bandwidthErrors });
            });
        }
    };

    renderServicePort = (servicePort: ServicePort, index: number) => {
        const {
            servicePorts,
            organisationId,
            minimum,
            disabled,
            isElan,
            mspOnly,
            organisationPortsOnly,
            visiblePortMode,
            disabledPorts,
            bandwidth,
            errors
        } = this.props;
        const { bandwidthErrors, availableServicePorts } = this.state;
        const { products } = this.context;
        const portErrors = errors.filter(
            error =>
                error.loc[1] === index && error.loc.length === 3 && error.loc[2] !== "tag" && error.loc[2] !== "vlan"
        );
        const vlanErrors = errors.filter(
            error =>
                error.loc[1] === index && error.loc.length === 3 && (error.loc[2] === "tag" || error.loc[2] === "vlan")
        );
        let inSelect = availableServicePorts;

        const productIds = filterProductsByBandwidth(products, bandwidth).map((product: Product) => product.product_id);
        inSelect =
            productIds.length === products.length
                ? inSelect
                : inSelect.filter(sp => productIds.includes(sp.product.product_id));

        // Port mode filter
        if (visiblePortMode === "untagged") {
            inSelect = inSelect.filter(port => port.port_mode === "untagged");
        } else if (visiblePortMode === "tagged" || isElan || mspOnly) {
            inSelect = inSelect.filter(
                port => port.port_mode === "tagged" || ["MSP", "MSPNL"].includes(port.product.tag)
            );
        } else if (visiblePortMode === "normal") {
            inSelect = inSelect.filter(port => port.port_mode === "tagged" || port.port_mode === "untagged");
        } else if (visiblePortMode === "link_member") {
            inSelect = inSelect.filter(port => port.port_mode === "link_member");
        }

        // Customer filter toggle
        if (organisationPortsOnly) {
            inSelect = inSelect.filter(port => port.customer_id === organisationId);
        }
        const showDelete = servicePorts.length > minimum && !disabled;
        const notmodifiable = servicePort.modifiable === false;
        const portDisabled = disabled || notmodifiable || disabledPorts;
        const vlanDisabled =
            disabled || !servicePort.subscription_id || visiblePortMode === "link_member" || notmodifiable;
        const vlansJustChosen = servicePorts
            .filter(sp => sp.subscription_id === servicePort.subscription_id && sp !== servicePort)
            .map(sp => sp.vlan)
            .join(",");

        return (
            <section className={`service-port row${index}`} key={index}>
                <div className="wrapper service-port-select">
                    {index === 0 && <label>{I18n.t("service_ports.servicePort")}</label>}
                    <ServicePortSelect
                        key={index}
                        onChange={this.onChangeSubscription(index)}
                        servicePort={servicePort.subscription_id}
                        servicePorts={inSelect}
                        disabled={portDisabled}
                    />

                    {portErrors && (
                        <em className="error backend-validation">
                            {portErrors.map((e, index) => (
                                <div key={index}>
                                    {capitalizeFirstLetter(((e.loc as unknown) as string)[2])}:{" "}
                                    {capitalizeFirstLetter(e.msg)}.
                                </div>
                            ))}
                        </em>
                    )}
                </div>
                <div className="wrapper vlan">
                    {index === 0 && <label>{I18n.t("service_ports.vlan")}</label>}
                    <VirtualLAN
                        key={servicePort.subscription_id || undefined}
                        vlan={servicePort.vlan}
                        onChange={this.onChangeInternal("vlan", index)}
                        subscriptionId={servicePort.subscription_id}
                        disabled={vlanDisabled}
                        reportError={this.reportVlanError(index)}
                        vlansExtraInUse={vlansJustChosen}
                        portMode={servicePort.port_mode}
                    />

                    {vlanErrors && (
                        <em className="error">
                            {vlanErrors.map((e, index) => (
                                <div key={index} className="backend-validation">
                                    {capitalizeFirstLetter(e.msg)}.
                                </div>
                            ))}
                        </em>
                    )}
                </div>
                {isElan && (
                    <div className="wrapper bandwidth">
                        {index === 0 && <label>{I18n.t("service_ports.bandwidth")}</label>}
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
                            disabled={vlanDisabled}
                        />
                        {bandwidthErrors[index] && (
                            <em className="error">{I18n.t("service_ports.invalid_bandwidth", { max: 1000 })}</em>
                        )}
                    </div>
                )}
                {showDelete && (
                    <i
                        className={`fa fa-minus ${servicePort.nonremovable ? "disabled" : ""}`}
                        onClick={this.removeServicePort(index)}
                    />
                )}
            </section>
        );
    };

    render() {
        const { servicePorts, maximum, disabled, errors } = this.props;
        const showAdd = (!maximum || servicePorts.length < maximum) && !disabled;
        const rootFieldErrors = errors.filter(error => error.loc.length === 1);
        return (
            <section className="service-port-container">
                {!disabled && (
                    <div className="refresh-service-ports">
                        <i className="fa fa-refresh" onClick={this.loadServicePorts} />
                    </div>
                )}
                {servicePorts.map((servicePort, index) => this.renderServicePort(servicePort, index))}
                {rootFieldErrors && (
                    <em className="error">
                        {rootFieldErrors.map((e, index) => (
                            <div key={index} className="backend-validation">
                                {capitalizeFirstLetter(e.msg)}.
                            </div>
                        ))}
                    </em>
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

MultipleServicePorts.contextType = ApplicationContext;
