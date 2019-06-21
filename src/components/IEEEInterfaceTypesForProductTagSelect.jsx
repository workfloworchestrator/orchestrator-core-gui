import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";

import { ieeeInterfaceTypesForProductId } from "../api/index";
import { isEmpty } from "../utils/Utils";

export default class IEEEInterfaceTypesForProductTagSelect extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            interfaceTypes: []
        };
    }

    componentDidMount = (productId = this.props.productId) => {
        if (productId) {
            ieeeInterfaceTypesForProductId(productId).then(result => this.setState({ interfaceTypes: result }));
        }
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.productId && nextProps.productId !== this.props.productId) {
            this.componentDidMount(nextProps.productId);
        } else if (isEmpty(nextProps.productId)) {
            this.setState({ interfaceTypes: [] });
        }
    }

    render() {
        const { interfaceTypes } = this.state;
        const { onChange, interfaceType, disabled } = this.props;

        const options = interfaceTypes.map(aInterfaceType => {
            return { value: aInterfaceType, label: aInterfaceType };
        });
        const value = options.find(option => option.value === interfaceType);
        return (
            <Select
                className="select-interface-type"
                onChange={onChange}
                options={options}
                value={value}
                isSearchable={true}
                isDisabled={disabled || interfaceTypes.length === 0}
                placeholder={
                    interfaceTypes.length > 0 ? "Select an IEEE interface type..." : "First select a product type..."
                }
            />
        );
    }
}

IEEEInterfaceTypesForProductTagSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    interfaceType: PropTypes.string,
    productId: PropTypes.string,
    disabled: PropTypes.bool
};
