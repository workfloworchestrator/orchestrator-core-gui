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
        console.log(`Fetching data for ${this.props.productTag}`);
        //fetch the data and use it when ready
        ieeeInterfaceTypesForProductTag(this.props.productTag).then(result => {
            this.setState({ loading: false, interfaceTypes: result})
        });
    };

    render() {
        console.log(`render called with state ${this.state}`);
        const {loading, interfaceTypes} = this.state;

        if (loading) {
            console.log('Not ready for render yet');
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
                    disabled={disabled || interfaceTypes.length === 0}/>
        )
    }

}


IEEEInterfaceTypesForProductTagSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    interfaceType: PropTypes.string,
    productTag: PropTypes.string.isRequired,
    disabled: PropTypes.bool
};
