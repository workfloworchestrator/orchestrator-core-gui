import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import "react-select/dist/react-select.css";

export default class IEEEInterfaceTypesSelect extends React.PureComponent {

    render() {
        const {onChange, interfaceType, interfaceTypes, disabled} = this.props;
        console.log(this.state)
        console.log(this.props)
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


IEEEInterfaceTypesSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    interfaceTypes: PropTypes.array.isRequired,
    interfaceType: PropTypes.string,
    disabled: PropTypes.bool
};
