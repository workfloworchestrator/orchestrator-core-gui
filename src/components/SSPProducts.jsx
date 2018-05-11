import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import "./SSPProducts.css";

export default class SSPProducts extends React.PureComponent {

    render() {
        const {products} = this.props;
        const listItems = products.filter((product) => product.tag === 'SSP').map((product) =>
            <li><a target="_blank" href={"/new-process/?product=" + product.product_id}>{product.name}</a></li>
        );
        return (
            <ul className="ssp-products">{listItems}</ul>
        );
    }
}
SSPProducts.propTypes = {
    products: PropTypes.array.required,
};