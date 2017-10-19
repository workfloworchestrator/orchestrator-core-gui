import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import "react-select/dist/react-select.css";

import {ieeeInterfaceTypesForProductTag} from "../api";


export default class IEEEInterfaceTypesForProductTagSelect extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            loading: true
        }
    }

    componentWillMount() {
        console.log('Component will mount');
        Promise.resolve(ieeeInterfaceTypesForProductTag('MSP100G')).then(function(result) {
            const productInterfaceTypes = result;
            console.log('Promise:')
            console.log(productInterfaceTypes);
        });
        this.setInterfaceType(['123','456'])
    };

    setInterfaceType(productInterfaceTypes) {
        this.setState({ interfaceTypes: productInterfaceTypes, loading: false})
    }

    stateIsReady() {
        console.log('setState() ready')

    }

    render() {
        console.log(`render called with state ${this.state}`);
        const {loading, interfaceTypes} = this.state;

        if (loading) {
            return null; // render null when component is not ready yet
        }

        const {onChange, interfaceType, disabled} = this.props;
        return (
            <Select className="select-interface-type"
                    onChange={onChange}
                    options={interfaceTypes.map(aInterfaceType => {
                        return {value: aInterfaceType, label: aInterfaceType};
                    })}
                    value={interfaceType}
                    searchable={true}
                    disabled={disabled || interfaceTypes.length === 1}/>
        )
    }

}


IEEEInterfaceTypesForProductTagSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    // interfaceTypes: PropTypes.array.isRequired,
    interfaceType: PropTypes.string,
    productTag: PropTypes.string.isRequired,
    disabled: PropTypes.bool
};
