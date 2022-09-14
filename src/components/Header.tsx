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

import { EuiFlexItem, EuiHeader, EuiHeaderLink, EuiHeaderLinks, EuiHeaderSectionItem, EuiText } from "@elastic/eui";
import EngineStatusBanner from "components/engineStatusBanner";
import FailedTaskBanner from "components/failedTaskBanner";
import manifest from "custom/manifest.json";
import { ENV } from "env";
import logo from "images/logo.svg";
import { Profile } from "oidc-client";
import { useAuth } from "oidc-react";
import { useContext, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router-dom";
import ApplicationContext from "utils/ApplicationContext";

import { headerStyling } from "./HeaderStyling";
import UserProfile from "./UserProfile";

const getEnvironmentName = (hostname: string) =>
    hostname.indexOf("staging") > -1
        ? "staging"
        : hostname === "localhost"
        ? `local ${manifest.name}`
        : hostname.indexOf("dev") > -1
        ? "development"
        : "production";

const HeaderWithAuth = () => {
    const { userData, signOut } = useAuth();
    const hostname = window.location.hostname;
    const [dropDownActive, setDropDownActive] = useState(false);
    const context = useContext(ApplicationContext);
    const environmentName = getEnvironmentName(hostname);

    const handleToggle = () => setDropDownActive(!dropDownActive);

    const logout = () => {
        if (userData && userData.profile.email) {
            context.apiClient.logUserInfo(userData.profile.email, "logged out");
        }
        signOut();
    };

    const renderProfileLink = (currentUser: Profile) => {
        return (
            <button onClick={handleToggle}>
                <i className="fa fa-user-circle" />
                {currentUser.name}
                {renderDropDownIndicator()}
            </button>
        );
    };

    const switchTheme = () => {
        if (context.theme === "dark") {
            localStorage.removeItem("darkMode");
            window.location.reload();
        } else {
            localStorage.setItem("darkMode", "yes");
            window.location.reload();
        }
    };

    const renderDropDownIndicator = () => {
        return dropDownActive ? <i className="fa fa-caret-up" /> : <i className="fa fa-caret-down" />;
    };

    const renderDropDown = () => {
        return dropDownActive ? <UserProfile /> : null;
    };

    const currentUser = userData?.profile;

    return (
        <EuiFlexItem css={headerStyling}>
            <EuiHeader className="header">
                <EuiHeaderSectionItem border="none">
                    <Link to="/" className="header__logo">
                        <img className={`header__logo-img ${context.theme}`} src={logo} alt="logo" />
                    </Link>
                    <EuiHeaderSectionItem border="none">
                        <EuiText grow={false}>
                            <h1 className={`header__app-title`}>
                                <FormattedMessage id="header.title" />
                            </h1>
                        </EuiText>
                        {environmentName !== "production" && (
                            <EuiText grow={false}>
                                <h1 className={`header__app-title ${environmentName}`}>{environmentName}</h1>
                            </EuiText>
                        )}
                    </EuiHeaderSectionItem>
                </EuiHeaderSectionItem>

                <EuiHeaderSectionItem border="none">
                    <EuiHeaderLinks aria-label="App navigation links extra">
                        <EngineStatusBanner />
                        <FailedTaskBanner />
                        <EuiHeaderLink
                            id="switchTheme"
                            color="primary"
                            onClick={switchTheme}
                            iconType={context.theme === "dark" ? "sun" : "moon"}
                        />
                        <EuiHeaderLink id="logout" color="primary" onClick={logout} iconType="exit" />

                        {currentUser && (
                            <EuiHeaderLink className="profile" tabIndex={1} onBlur={() => setDropDownActive(false)}>
                                {currentUser && renderProfileLink(currentUser)}
                                {currentUser && renderDropDown()}
                            </EuiHeaderLink>
                        )}
                    </EuiHeaderLinks>
                </EuiHeaderSectionItem>
            </EuiHeader>
        </EuiFlexItem>
    );
};

const HeaderWithoutAuth = () => {
    const hostname = window.location.hostname;
    const context = useContext(ApplicationContext);
    const environmentName = getEnvironmentName(hostname);

    const switchTheme = () => {
        if (context.theme === "dark") {
            localStorage.removeItem("darkMode");
            window.location.reload();
        } else {
            localStorage.setItem("darkMode", "yes");
            window.location.reload();
        }
    };

    return (
        <EuiFlexItem css={headerStyling}>
            <EuiHeader className="header">
                <EuiHeaderSectionItem border="none">
                    <Link to="/" className="header__logo">
                        <img className={`header__logo-img ${context.theme}`} src={logo} alt="logo" />
                    </Link>
                    <EuiHeaderSectionItem border="none">
                        <EuiText grow={false}>
                            <h1 className={`header__app-title`}>
                                <FormattedMessage id="header.title" />
                            </h1>
                        </EuiText>
                        {environmentName !== "production" && (
                            <EuiText grow={false}>
                                <h1 className={`header__app-title ${environmentName}`}>{environmentName}</h1>
                            </EuiText>
                        )}
                    </EuiHeaderSectionItem>
                </EuiHeaderSectionItem>

                <EuiHeaderSectionItem border="none">
                    <EuiHeaderLinks aria-label="App navigation links extra">
                        <EngineStatusBanner />
                        <FailedTaskBanner />
                        <EuiHeaderLink
                            id="switchTheme"
                            color="primary"
                            onClick={switchTheme}
                            iconType={context.theme === "dark" ? "sun" : "moon"}
                        />
                        <EuiHeaderLink id="logout" color="primary" iconType="exit" />
                    </EuiHeaderLinks>
                </EuiHeaderSectionItem>
            </EuiHeader>
        </EuiFlexItem>
    );
};

export default function Header() {
    if (ENV.OAUTH2_ENABLED) {
        return <HeaderWithAuth />;
    }

    return <HeaderWithoutAuth />;
}
