import I18n from "i18n-js";
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";

function NavigationItem({ href, value, className = "" }) {
    return (
        <NavLink className={className} activeClassName="active" to={href}>
            {I18n.t("navigation." + value)}
        </NavLink>

        //
        // <Tabs value={value} classes={{ indicator: classes.indicator }} onChange={onChange}>
        //     <Tab className={classes.tabRoot} label="Processes" component={Link} to="/" value="/" />
        //     <Tab
        //         className={classes.tabRoot}
        //         label="Subscriptions"
        //         component={Link}
        //         to="/subscriptions"
        //         value="/subscriptions"
        //     />
        //     <Tab className={classes.tabRoot} label="Metadata" component={Link} to="/metadata" value="/metadata" />
        //     <Tab className={classes.tabRoot} label="Tasks" component={Link} to="/tasks" value="/tasks" />
        //     <Tab
        //         className={classes.tabRoot}
        //         label="+ Process"
        //         component={Link}
        //         to="/new-process"
        //         value="/new-process"
        //     />
        // </Tabs>
    );
}
export default NavigationItem;
