import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import "react-select/dist/react-select.css";
import {ieeeInterfaceTypesForProductTag} from "../api";

export default class IEEEInterfaceTypesForProductTagSelect extends React.PureComponent {

    constructor(props) {
        super(props);
        let interfaceTypes;
        interfaceTypes = ieeeInterfaceTypesForProductTag('MSP1G');
        this.setState({interfaceTypes});
    }

    // componentWillMount() {
    //     let interfaceTypes;
    //     interfaceTypes = ieeeInterfaceTypesForProductTag('MSP1G');
    //     console.log(interfaceTypes)
    //     this.setState({interfaceTypes});
    // }

    render() {
        const {onChange, interfaceType, interfaceTypes, disabled} = this.props;
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
    interfaceTypes: PropTypes.array.isRequired,
    interfaceType: PropTypes.string,
    productTag: PropTypes.string.isRequired,
    disabled: PropTypes.bool
};
