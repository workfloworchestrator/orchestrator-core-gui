import React from "react";
import PropTypes from "prop-types";
import {organisationNameByUuid} from "../utils/Lookups";
import I18n from "i18n-js";

import "./ImsChanges.css";

export default class ImsChanges extends React.PureComponent {

    renderImsServiceDetail = (service, index, imsEndpoints, className) =>
        <table className={`ims-circuit ${className}`}>
            <thead>
            <th>
                <td className="header" colSpan="2">
                    {I18n.t(`ims_changes.${className}`)}
                </td>
            </th>
            </thead>
            <tbody>
            <tr>
                <td>{I18n.t("subscription.ims_service.identifier")}</td>
                <td>{service.id}</td>
            </tr>
            <tr>
                <td>{I18n.t("subscription.ims_service.customer")}</td>
                <td>{organisationNameByUuid(service.customer_id, this.props.organisations)}</td>
            </tr>
            <tr>
                <td>{I18n.t("subscription.ims_service.extra_info")}</td>
                <td>{service.extra_info || ""}</td>
            </tr>
            <tr>
                <td>{I18n.t("subscription.ims_service.name")}</td>
                <td>{service.name || ""}</td>
            </tr>
            <tr>
                <td>{I18n.t("subscription.ims_service.product")}</td>
                <td>{service.product || ""}</td>
            </tr>
            <tr>
                <td>{I18n.t("subscription.ims_service.speed")}</td>
                <td>{service.speed || ""}</td>
            </tr>
            <tr>
                <td>{I18n.t("subscription.ims_service.status")}</td>
                <td>{service.status || ""}</td>
            </tr>
            <tr>
                <td>{I18n.t("subscription.ims_service.order_id")}</td>
                <td>{service.order_id || ""}</td>
            </tr>
            <tr>
                <td>{I18n.t("subscription.ims_service.aliases")}</td>
                <td>{(service.aliases || []).join(", ")}</td>
            </tr>
            <tr>
                <td>{I18n.t("subscription.ims_service.endpoints")}</td>
                <td>{(service.endpoints || []).map(endpoint => `ID: ${endpoint.id}${endpoint.vlanranges ? " - " : ""}${(endpoint.vlanranges || [])
                    .map(vlan => `VLAN: ${vlan.start} - ${vlan.end}`).join(", ")}`).join(", ")}</td>
            </tr>
            {imsEndpoints.map((port, index) => this.renderImsPortDetail(port, index))}
            </tbody>
        </table>;

    renderImsPortDetail = (port, index) =>
        <tr>
            <td>{I18n.t("subscription.ims_port.id", {id: port.id})}</td>
            <td>
                <table className="ims-port" index={index}>
                    <thead>
                    </thead>
                    <tbody>
                    {["connector_type", "fiber_type", "iface_type", "line_name", "location", "node", "patchposition", "port", "status"]
                        .map(attr => <tr key={attr}>
                            <td>{I18n.t(`subscription.ims_port.${attr}`)}</td>
                            <td>{port[attr] || ""}</td>
                        </tr>)}
                    </tbody>
                </table>
            </td>
        </tr>;


    render() {
        const {changes} = this.props;
        return (<section className="mod-ims-changes">
            {changes.map(change => <section className="lp-circuit" key={change.ims_circuit_id}>
                    <h3>{I18n.t("ims_changes.circuit_changed", {
                        id: change.ims_circuit_id,
                        description: change.description
                    })}</h3>
                    {change.endpoints.map((endpoint, index) => <section>
                        {this.renderImsServiceDetail(endpoint.old_ims_service, index, [endpoint.old_ims_port], "old_endpoint")}
                        {this.renderImsServiceDetail(endpoint.new_ims_service, index, [endpoint.new_ims_port], "new_endpoint")}
                    </section>)}
                </section>
            )}
        </section>);
    }
}

ImsChanges.propTypes = {
    changes: PropTypes.array.isRequired,
    organisations: PropTypes.array.isRequired,
};