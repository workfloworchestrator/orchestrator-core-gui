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

import "./Header.scss";

import I18n from "i18n-js";
import React from "react";
import { unmountComponentAtNode } from "react-dom";
import { Link } from "react-router-dom";

import { getGlobalStatus, logUserInfo } from "../api";
import logo from "../images/network-automation.png";
import statusLocked from "../images/status-locked.png";
import statusPausing from "../images/status-pausing.png";
import statusUnlocked from "../images/status-unlocked.png";
import ApplicationContext from "../utils/ApplicationContext";
import { setFlash } from "../utils/Flash";
import UserProfile from "./UserProfile";

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
                    : "production",
            globalLock: undefined,
            engineStatus: undefined
        };
    }

    logout = () => {
        const { currentUser } = this.context;
        const node = document.getElementById("app");
        unmountComponentAtNode(node);
        logUserInfo(currentUser.email, "logged out");
        localStorage.clear();
        window.location.href = "/";
    };

    handleToggle = () => {
        this.setState({ dropDownActive: !this.state.dropDownActive });
    };

    renderExitLogout = () => (
        <li className="border-left">
            <button id="logout" onClick={this.logout}>
                {I18n.t("header.links.logout")}
            </button>
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

    refeshStatus = () => {
        getGlobalStatus().then(globalStatus => {
            const { globalLock } = this.state;
            if (!globalStatus.global_lock && globalLock) {
                this.setState({ globalLock: globalStatus.global_lock });
                setFlash(I18n.t("settings.status.engine.false"));
            }
            this.setState({ globalLock: globalStatus.global_lock, engineStatus: globalStatus.global_status });
        });
    };

    generateStatusElements(globalLock, engineStatus) {
        if (globalLock && engineStatus === "PAUSED") {
            return [
                <li className="status-text">{I18n.t("settings.status.engine.true")}</li>,
                <li className="status">
                    <img className="status-logo" src={statusLocked} alt="" />
                </li>
            ];
        } else if (globalLock && engineStatus === "PAUSING") {
            return [
                <li className="status-text">{I18n.t("settings.status.engine.pausing")}</li>,
                <li className="status">
                    <img className="status-logo" src={statusPausing} alt="" />
                </li>
            ];
        } else if (!globalLock) {
            return [
                <li className="status-text">{I18n.t("settings.status.engine.running")}</li>,
                <li className="status">
                    <img className="status-logo" src={statusUnlocked} alt="" />
                </li>
            ];
        }
    }

    componentWillMount() {
        window.setInterval(this.refeshStatus, 3000);
    }

    render() {
        const { currentUser } = this.context;
        const { environment, globalLock, engineStatus } = this.state;
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
                        {this.generateStatusElements(globalLock, engineStatus)}
                        <li className="profile" tabIndex="1" onBlur={() => this.setState({ dropDownActive: false })}>
                            {currentUser && this.renderProfileLink(currentUser)}
                            {currentUser && this.renderDropDown(currentUser)}
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

Header.contextType = ApplicationContext;
