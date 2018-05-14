import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import Select from "react-select";

import "react-select/dist/react-select.css";
import "./SSPProductSelect.css";

export default function SSPProductSelect({onChange, product, products, disabled}) {
    const options = products.map(aProduct => (
        {value: aProduct.product_id,
         label: aProduct.name,
         productId: aProduct.product_id,
        }));
    return (
        <div>
        <Select className={`select-product ${options.length > 15 ? 'large' : ''}`}
                onChange={onChange}
                options={options}
                value={product}
                searchable={true}
                placeholder="Search or select a SSP variant to start a new workflow..."
                disabled={disabled || products.length === 0}/>
        <a tabIndex={0} className={`button ${disabled ? "grey disabled" : "blue"}`} onClick={window.open('https://www.google.com')}>
            {I18n.t("subscription.start")}
        </a>
        </div>
    );
}
    // render() {
    //     const {products} = this.props;
    //     const listItems = products.filter((product) => product.tag === 'SSP').map((product) =>
    //         <li><a target="_blank" href={"/new-process/?product=" + product.product_id}>{product.name}</a></li>
    //     );
    //     return (
    //         <ul className="ssp-products">{listItems}</ul>
    //     );
    // }

SSPProductSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    products: PropTypes.array,
    product: PropTypes.string,
    disabled: PropTypes.bool


};