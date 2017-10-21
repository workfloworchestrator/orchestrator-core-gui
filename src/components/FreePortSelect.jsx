import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import "react-select/dist/react-select.css";

import {freePortsForLocationCodeAndInterfaceType} from "../api";

export default class FreePortSelect extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            freePorts: []
        }
    }

    componentWillMount() {
        freePortsForLocationCodeAndInterfaceType(this.props.locationCode, this.props.interfaceType).then(result =>
            this.setState({freePorts: result})
        );

    };

    render() {
        const {freePorts} = this.state;
        const {onChange, freePort, disabled} = this.props;

        return (
            <Select className="select-free-port"
                    onChange={onChange}
                    options={freePorts.map(aFreePort => {
                        return {value: aFreePort, label: aFreePort};
                    })}
                    value={freePort}
                    searchable={true}
                    disabled={disabled || freePorts.length === 0}/>
        )
    }

}


FreePortSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    freePort: PropTypes.string,
    locationCode: PropTypes.string.isRequired,
    interfaceType: PropTypes.string.isRequired,
    disabled: PropTypes.bool
};
