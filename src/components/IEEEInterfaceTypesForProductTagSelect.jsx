import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import "react-select/dist/react-select.css";

import {ieeeInterfaceTypesForProductTag} from "../api";

export default class IEEEInterfaceTypesForProductTagSelect extends React.PureComponent {


    componentWillMount() {
        console.log('Component will mount');
        const p1 = Promise.resolve(ieeeInterfaceTypesForProductTag('MSP100G')).then(result => {
            const productInterfaceTypes = result;
            console.log('Promise:')
            console.log(productInterfaceTypes);
            return productInterfaceTypes
        });
        console.log('P1')
        console.log(p1.v)

        //console.log(productInterfaceTypes);

        this.setState({ interfaceTypes: p1}, function() {
            this.stateIsReady();
        });





    };

    stateIsReady() {
        console.log('setState() ready')

    }

    render() {
        console.log(`render called with state ${this.state}`);
        console.log(this.state)
        console.log(this.props)


        const {onChange, interfaceType, disabled} = this.props;
        const interfaceTypes = this.state['interfaceTypes'];
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
