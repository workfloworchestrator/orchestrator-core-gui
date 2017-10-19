import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import "react-select/dist/react-select.css";

import {freePortsForLocationCodeAndInterfaceType} from "../api";

export default class FreePortSelect extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            loading: true
        }
    }

    componentWillMount() {
        console.log(`Fetching data for ${this.props.locationCode} and ${this.props.interfaceType}`);
        //fetch the data and use it when ready
        freePortsForLocationCodeAndInterfaceType(this.props.locationCode, this.props.interfaceType).then(result => {
            console.log('HOER')
            console.log(result)
            this.setState({ loading: false, freePorts: result})
        });

    };

    render() {
        console.log(`render called with state ${this.state}`);
        const {loading, freePorts} = this.state;

        if (loading) {
            console.log('Not ready for render yet');
            return null; // render null when component is not ready yet
        }

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
