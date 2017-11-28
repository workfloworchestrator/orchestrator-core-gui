import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import "react-select/dist/react-select.css";

export default function ProductSelect({onChange, product, products, disabled}) {

    return (
        <Select className="select-product"
                onChange={onChange}
                options={products.map(aProduct => {
                    return {value: aProduct.product_id,
                        label: aProduct.name,
                        workflow: aProduct.create_subscription_workflow_key,
                        tag: aProduct.tag
                    };
                })}
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
