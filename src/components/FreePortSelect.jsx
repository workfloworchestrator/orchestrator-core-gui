import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import Select from "react-select";
import "react-select/dist/react-select.css";

import "./FreePortSelect.css";

import {freePortsForLocationCodeAndInterfaceType} from "../api";

export default class FreePortSelect extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            freePorts: [],
            loading: true
        }
    }

    componentWillMount() {
        freePortsForLocationCodeAndInterfaceType(this.props.locationCode, this.props.interfaceType).then(result =>
            this.setState({freePorts: result, loading: false})
        );
    };

    render() {
        const {freePorts, loading} = this.state;
        const {onChange, freePort, disabled, locationCode, interfaceType} = this.props;
        const noFreePortsAvailable = !loading && freePorts.length === 0;
        const placeholder = loading ? I18n.t("free_port_select.free_ports_loading", {interfaceType, location: locationCode})
            : noFreePortsAvailable ? I18n.t("free_port_select.no_free_ports_placeholder") :
                I18n.t("free_port_select.select_port");

        return (
            <div className="free-port-select">
                <Select className="select-free-port"
                        onChange={onChange}
                        options={freePorts.map(x => { return {value: x.id, label: `${x.node}_${x.port}`}; })}
                        value={freePort}
                        searchable={true}
                        disabled={disabled || freePorts.length === 0}
                        placeholder={placeholder}/>
                {noFreePortsAvailable &&
                 <em className="msg warn">
                     {I18n.t("free_port_select.no_free_ports_available", {interfaceType, location: locationCode})}
                 </em>}
            </div>
        );
    }

}


FreePortSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    freePort: PropTypes.number,
    locationCode: PropTypes.string.isRequired,
    interfaceType: PropTypes.string.isRequired,
    disabled: PropTypes.bool
};
