import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import "react-select/dist/react-select.css";

import {ieeeInterfaceTypesForProductId} from "../api/index";


export default class IEEEInterfaceTypesForProductTagSelect extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            interfaceTypes: []
        }
    }

    componentWillMount = () => ieeeInterfaceTypesForProductId(this.props.productId).then(result =>
        this.setState({interfaceTypes: result})
    );

    render() {
        const {interfaceTypes} = this.state;
        const {onChange, interfaceType, disabled} = this.props;
        return (
            <Select className="select-interface-type"
                    onChange={onChange}
                    options={interfaceTypes.map(aInterfaceType => {
                        return {value: aInterfaceType, label: aInterfaceType};
                    })}
                    value={interfaceType}
                    searchable={true}
                    disabled={disabled || interfaceTypes.length === 0}/>
        )
    }

}

IEEEInterfaceTypesForProductTagSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    interfaceType: PropTypes.string,
    productId: PropTypes.string.isRequired,
    disabled: PropTypes.bool
};
