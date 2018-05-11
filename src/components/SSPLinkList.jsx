import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import "./Workflows.css";


export default class SSPLinkList extends React.PureComponent {

    render() {
        const ssp_product_links = props.ssp_product_links;
        const listItems = ssp_product_links.map((ssp_product) =>
            <li>{ssp_product}</li>
        );
        return (
            <ul>{listItems}</ul>
        );
    }
}
SSPLinkList.propTypes = {
    ssp_product_links: PropTypes.array.required,

};