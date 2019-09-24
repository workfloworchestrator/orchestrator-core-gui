/*
 * Copyright 2019 SURF.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import React from "react";
import I18n from "i18n-js";
import { unmountComponentAtNode } from "react-dom";
import { Link } from "react-router-dom";
import logo from "../images/network-automation.png";
import "./Header.scss";
import UserProfile from "./UserProfile";
import ApplicationContext from "../utils/ApplicationContext";

export default class Header extends React.PureComponent {
    constructor() {
        super();
        const hostname = window.location.hostname;
        this.state = {
            dropDownActive: false,
            environment:
                hostname.indexOf("staging") > -1
                    ? "staging"
                    : hostname === "localhost"
                    ? "local"
                    : hostname.indexOf("dev") > -1
                    ? "development"
                    : "production"
        };
    }

    logout = () => {
        const node = document.getElementById("app");
        unmountComponentAtNode(node);
        localStorage.clear();
        window.location.href = "/";
    };

    handleToggle = () => {
        this.setState({ dropDownActive: !this.state.dropDownActive });
    };

    renderExitLogout = () => (
        <li className="border-left">
            <button onClick={this.logout}>{I18n.t("header.links.logout")}</button>
        </li>
    );

    renderProfileLink(currentUser) {
        return (
            <button onClick={this.handleToggle}>
                <i className="fa fa-user-circle-o" />
                {currentUser.display_name}
                {this.renderDropDownIndicator()}
            </button>
        );
    }

    renderDropDownIndicator() {
        return this.state.dropDownActive ? <i className="fa fa-caret-up" /> : <i className="fa fa-caret-down" />;
    }

    renderDropDown(currentUser) {
        return this.state.dropDownActive ? <UserProfile currentUser={currentUser} /> : null;
    }

    renderEnvironmentName = environment =>
        environment === "production" ? null : <li className="environment">{environment}</li>;

    render() {
        const { currentUser } = this.context;
        const { environment } = this.state;
        return (
            <div className="header-container">
                <div className="header">
                    <Link to="/" className="logo">
                        <img src={logo} alt="" />
                    </Link>
                    <ul className="links">
                        <li className={`title ${environment}`}>
                            <span>{I18n.t("header.title")}</span>
                        </li>
                        {this.renderEnvironmentName(environment)}
                        <li className="profile" tabIndex="1" onBlur={() => this.setState({ dropDownActive: false })}>
                            {this.renderProfileLink(currentUser)}
                            {this.renderDropDown(currentUser)}
                        </li>
                        <li>
                            <Link to="/help">{I18n.t("header.links.help")}</Link>
                        </li>
                        {this.renderExitLogout()}
                    </ul>
                </div>
            </div>
        );
    }
}

Header.propTypes = {};

Header.contextType = ApplicationContext;
