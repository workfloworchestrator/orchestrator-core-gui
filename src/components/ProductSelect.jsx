import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";

import "./ProductSelect.scss";
import { TARGET_CREATE } from "../validations/Products";

export default function ProductSelect({ onChange, product, products, disabled }) {
    const options = products.map(aProduct => ({
        value: aProduct.product_id,
        label: aProduct.name,
        workflow: aProduct.workflows.find(wf => wf.target === TARGET_CREATE),
        tag: aProduct.tag,
        productId: aProduct.product_id,
        fixed_inputs: aProduct.fixed_inputs
    }));
    return (
        <Select
            className={`select-product ${options.length > 15 ? "large" : ""}`}
            onChange={onChange}
            options={options}
            value={options.find(option => option.value === product)}
            isSearchable={true}
            placeholder="Search and select a product..."
            isDisabled={disabled || products.length === 0}
        />
    );
}

ProductSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    products: PropTypes.array.isRequired,
    product: PropTypes.string,
    disabled: PropTypes.bool
};
