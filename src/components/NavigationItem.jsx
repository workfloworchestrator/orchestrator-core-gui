import I18n from "i18n-js";
import React from "react";
import { NavLink } from "react-router-dom";

function NavigationItem({ href, value, className = "" }) {
    return (
        <NavLink className={className} activeClassName="active" to={href}>
            {I18n.t("navigation." + value)}
        </NavLink>
    );
}
export default NavigationItem;
