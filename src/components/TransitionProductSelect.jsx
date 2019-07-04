import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";

import { transitions } from "../api";

export default class TransitionProductSelect extends React.PureComponent {
    constructor(props, context) {
        super(props, context);
        this.state = { transitionProducts: [], subscription: {} };
    }

    componentDidMount = () => {
        const { subscriptionId, transitionType } = this.props;
        transitions(subscriptionId, transitionType).then(transitionProducts => {
            this.setState({ transitionProducts: transitionProducts });
        });
    };

    render() {
        const { onChange, product, disabled } = this.props;
        const { transitionProducts } = this.state;

        const options = transitionProducts.map(p => ({
            value: p.product_id,
            label: p.name
        }));

        const selected_product = transitionProducts.length === 1 ? transitionProducts[0].product_id : product;

        const value = options.find(option => option.value === selected_product);

        return (
            <Select
                onChange={onChange}
                options={options}
                value={value}
                isSearchable={false}
                placeholder="Search and select a product..."
                isDisabled={disabled || transitionProducts.length === 0 || transitionProducts.length === 1}
            />
        );
    }
}

TransitionProductSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    subscriptionId: PropTypes.string,
    product: PropTypes.string,
    transitionType: PropTypes.string,
    disabled: PropTypes.bool
};
