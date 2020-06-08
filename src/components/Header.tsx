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
import { Profile } from "oidc-client";
import { AuthContextProps, withAuth } from "oidc-react";
import React from "react";
import { Link } from "react-router-dom";

import { getGlobalStatus, logUserInfo } from "../api";
import logo from "../images/network-automation.png";
import ApplicationContext from "../utils/ApplicationContext";
import { setFlash } from "../utils/Flash";
import { GlobalStatus } from "../utils/types";
import UserProfile from "./UserProfile";

interface IState {
    dropDownActive: boolean;
    environment: string;
    globalLock: boolean;
    engineStatus: GlobalStatus;
}

class Header extends React.PureComponent<AuthContextProps, IState> {
    constructor(props: AuthContextProps) {
        super(props);
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
            globalLock: false,
            engineStatus: "RUNNING"
        };
    }

    handleToggle = () => {
        this.setState({ dropDownActive: !this.state.dropDownActive });
    };

    logout = () => {
        if (this.props.userData && this.props.userData.profile.email) {
            logUserInfo(this.props.userData.profile.email, "logged out");
        }
        this.props.signOut();
    };

    renderExitLogout = () => (
        <li className="border-left">
            <button id="logout" onClick={this.logout}>
                {I18n.t("header.links.logout")}
            </button>
        </li>
    );

    renderProfileLink(currentUser: Profile) {
        return (
            <button onClick={this.handleToggle}>
                <i className="fa fa-user-circle" />
                {currentUser.name}
                {this.renderDropDownIndicator()}
            </button>
        );
    }

    renderDropDownIndicator() {
        return this.state.dropDownActive ? <i className="fa fa-caret-up" /> : <i className="fa fa-caret-down" />;
    }

    renderDropDown() {
        return this.state.dropDownActive ? <UserProfile /> : null;
    }

    renderEnvironmentName = (environment: string) =>
        environment === "production" ? null : <li className="environment">{environment}</li>;

    refeshStatus = () => {
        getGlobalStatus().then(globalStatus => {
            const { globalLock } = this.state;
            if (!globalStatus.global_lock && globalLock) {
                this.setState({ globalLock: globalStatus.global_lock });
                setFlash(I18n.t("settings.status.engine.restarted"));
            }
            this.setState({ globalLock: globalStatus.global_lock, engineStatus: globalStatus.global_status });
        });
    };

    generateStatusElements(engineStatus: GlobalStatus) {
        const message = I18n.t(`settings.status.engine.${engineStatus.toLowerCase()}`);

        return (
            <li className="status-text">
                {message} <i className={`fa fa-circle status ${engineStatus.toLowerCase()}`}></i>
            </li>
        );
    }

    componentWillMount() {
        window.setInterval(this.refeshStatus, 3000);
    }

    render() {
        const currentUser = this.props.userData?.profile;
        const { environment, engineStatus } = this.state;
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
                        {this.generateStatusElements(engineStatus)}
                        <li className="profile" tabIndex={1} onBlur={() => this.setState({ dropDownActive: false })}>
                            {currentUser && this.renderProfileLink(currentUser)}
                            {currentUser && this.renderDropDown()}
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

export default withAuth(Header);
