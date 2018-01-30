import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";

import "react-select/dist/react-select.css";
import "./ProductSelect.css";

export default function ProductSelect({onChange, product, products, disabled}) {
    const options = products.map(aProduct => (
        {value: aProduct.product_id,
            label: aProduct.name,
            workflow: aProduct.create_subscription_workflow_key,
            tag: aProduct.tag,
            productId: aProduct.product_id,
            fixed_inputs: aProduct.fixed_inputs
        }));
    return (
        <Select className={`select-product ${options.length > 15 ? 'large' : ''}`}
                onChange={onChange}
                options={options}
                value={product}
                searchable={true}
                placeholder="Search and select a product..."
                disabled={disabled || products.length === 0}/>
    );
}

ProductSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    products: PropTypes.array.isRequired,
    product: PropTypes.string,
    disabled: PropTypes.bool
};
