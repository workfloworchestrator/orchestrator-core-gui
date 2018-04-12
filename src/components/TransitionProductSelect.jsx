import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";

import "react-select/dist/react-select.css";
import {transitions} from "../api";

export default class TransitionProductSelect extends React.PureComponent {

    constructor(props, context) {
        super(props, context);
        this.state = {transitionProducts: []};
    }

    componentDidMount = () => {
        const {subscriptionId, transitionType} = this.props;
        transitions(subscriptionId, transitionType).then(result =>
            this.setState({transitionProducts: result})
        );
    };

    render() {
        const {onChange, product, disabled} = this.props;
        const {transitionProducts} = this.state;
        return (
            <Select onChange={onChange}
                    options={transitionProducts.map(p => ({value: p.product_id, label: p.name}))}
                    value={product}
                    searchable={false}
                    placeholder="Search and select a product..."
                    disabled={disabled || transitionProducts.length === 0}/>
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
