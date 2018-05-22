import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import Select from "react-select";

import {isEmpty, stop} from "../utils/Utils";


import "react-select/dist/react-select.css";
import "./SSPProductSelect.css";

export default class SSPProductSelect extends React.Component {

    openNewTab = product_id => e => {
        stop(e);
        window.open(`/new-process?product=${product_id}`);
    };

    render() {
        const {onChange, products, product, disabled} = this.props;
        const options = products.map(aProduct => (
            {value: aProduct.product_id,
                label: aProduct.name,
                productId: aProduct.product_id,
            }));

        return (
            <section className="ssp-product-select">
                <div className="wrapper-left ssp-select">
                <Select className="select-ssp-product"
                        onChange={onChange}
                        options={options}
                        value={product}
                        searchable={true}
                        placeholder="Search or select a SSP variant to start a new workflow..."
                        disabled={disabled || products.length === 0}/>
                </div>
                <div className="wrapper-right ssp-select-button">
                    <a className={`button ${isEmpty(product) ? "grey disabled" : "green"}`} onClick={this.openNewTab(product)}>
                    {I18n.t("subscription.start")}
                </a>
                </div>
            </section>
        );
    }

}


SSPProductSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    products: PropTypes.array,
    product: PropTypes.string,
    disabled: PropTypes.bool


};