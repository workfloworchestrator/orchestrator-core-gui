import "./Navigation.scss";

import React, { useState } from "react";
import { useLocation } from "react-router-dom";

import NavigationItem from "./NavigationItem";

function Navigation() {
    // const location = useLocation();
    // console.log(location);
    // const [value, setValue] = useState(location.pathname);
    // const onChange = (e, value) => {
    //     setValue(value);
    // };
    // TODO: load/use spinner
    return (
        <div className="navigation-container">
            <div className="navigation">
                <NavigationItem href="/processes" value="processes" />
                <NavigationItem href="/subscriptions" value="subscriptions" />
                <NavigationItem href="/metadata" value="metadata" />
                <NavigationItem href="/validations" value="validations" />
                <NavigationItem href="/tasks" value="tasks" />
                <NavigationItem href="/prefixes" value="prefixes" />
                <NavigationItem href="/settings" value="settings" />
                <NavigationItem href="/new-process" value="new_process" className="new_process" />
            </div>
        </div>
    );
}
export default Navigation;
