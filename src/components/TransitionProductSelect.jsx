import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";

import { transitions } from "../api";

export default class TransitionProductSelect extends React.PureComponent {
    constructor(props, context) {
        super(props, context);
        this.state = { transitionProducts: [] };
    }

    componentDidMount = () => {
        const { subscriptionId, transitionType, onChange } = this.props;
        transitions(subscriptionId, transitionType).then(transitionProducts => {
            this.setState({ transitionProducts: transitionProducts });

            // If only one product is selectable set this as selected value
            if (transitionProducts.length === 1) {
                onChange({ value: transitionProducts[0].product_id });
            }
        });
    };

    render() {
        const { onChange, product, disabled } = this.props;
        const { transitionProducts } = this.state;

        const options = transitionProducts.map(p => ({
            value: p.product_id,
            label: p.name
        }));

        const value = options.find(option => option.value === product);

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
