/*
 * Copyright 2019-2022 SURF.
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

import "components/Header.scss";

import { EuiButtonIcon, EuiHeader, EuiHeaderLink, EuiHeaderLinks, EuiHeaderSectionItem, EuiText } from "@elastic/eui";
import EngineStatusBanner from "components/engineStatusBanner";
import FailedTaskBanner from "components/failedTaskBanner";
import UserProfile from "components/UserProfile";
import logo from "images/logo.svg";
import { Profile } from "oidc-client";
import { AuthContextProps, withAuth } from "oidc-react";
import React from "react";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";
import { Link } from "react-router-dom";
import ApplicationContext from "utils/ApplicationContext";

interface IState {
    dropDownActive: boolean;
    environment: string;
}

interface IProps extends WrappedComponentProps, AuthContextProps {}

class Header extends React.PureComponent<IProps, IState> {
    constructor(props: IProps) {
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
        };
    }

    handleToggle = () => {
        this.setState({ dropDownActive: !this.state.dropDownActive });
    };

    logout = () => {
        if (this.props.userData && this.props.userData.profile.email) {
            this.context.apiClient.logUserInfo(this.props.userData.profile.email, "logged out");
        }
        this.props.signOut();
    };

    renderProfileLink(currentUser: Profile) {
        return (
            <button onClick={this.handleToggle}>
                <i className="fa fa-user-circle" />
                {currentUser.name}
                {this.renderDropDownIndicator()}
            </button>
        );
    }

    switchTheme = () => {
        if (this.context.theme === "dark") {
            localStorage.removeItem("darkMode");
            window.location.reload();
        } else {
            localStorage.setItem("darkMode", "yes");
            window.location.reload();
        }
    };

    renderDropDownIndicator() {
        return this.state.dropDownActive ? <i className="fa fa-caret-up" /> : <i className="fa fa-caret-down" />;
    }

    renderDropDown() {
        return this.state.dropDownActive ? <UserProfile /> : null;
    }

    render() {
        const currentUser = this.props.userData?.profile;
        const { environment } = this.state;

        return (
            <EuiHeader className="header">
                <EuiHeaderSectionItem border="none">
                    <Link to="/" className="header__logo">
                        <img className={`header__logo-img ${this.context.theme}`} src={logo} alt="logo" />
                    </Link>
                    <EuiHeaderSectionItem border="none">
                        <EuiText grow={false}>
                            <h1 className={`header__app-title`}>
                                <FormattedMessage id="header.title" />
                            </h1>
                        </EuiText>
                        {environment !== "production" && (
                            <EuiText grow={false}>
                                <h1 className={`header__app-title ${environment}`}>{environment}</h1>
                            </EuiText>
                        )}
                    </EuiHeaderSectionItem>
                </EuiHeaderSectionItem>

                <EuiHeaderSectionItem border="none">
                    <EuiHeaderLinks aria-label="App navigation links extra">
                        <EngineStatusBanner />
                        <FailedTaskBanner />
                        <EuiHeaderLink id="switchTheme" onClick={this.switchTheme}>
                            <EuiButtonIcon iconType={this.context.theme === "dark" ? "sun" : "moon"} />
                        </EuiHeaderLink>
                        <EuiHeaderLink id="logout" onClick={this.logout}>
                            <EuiButtonIcon iconType="exit" />
                        </EuiHeaderLink>

                        {currentUser && (
                            <EuiHeaderLink
                                className="profile"
                                tabIndex={1}
                                onBlur={() => this.setState({ dropDownActive: false })}
                            >
                                {currentUser && this.renderProfileLink(currentUser)}
                                {currentUser && this.renderDropDown()}
                            </EuiHeaderLink>
                        )}
                    </EuiHeaderLinks>
                </EuiHeaderSectionItem>
            </EuiHeader>
        );
    }
}

Header.contextType = ApplicationContext;

export default injectIntl(withAuth(Header));
