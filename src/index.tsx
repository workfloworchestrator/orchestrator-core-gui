/*
 * Copyright 2019-2020 SURF.
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

import Oidc, { UserManager, UserManagerSettings, WebStorageStateStore } from "oidc-client";
import { AuthContext, AuthProvider } from "oidc-react";
import React from "react";
import ReactDOM from "react-dom";

import { logUserInfo, setUser } from "./api";
import { ENV } from "./env";
import App from "./pages/App";

const appElement = document.getElementById("app");

if (ENV.OAUTH2_ENABLED) {
    const REDIRECT_URL_KEY = "redirectUrl";

    // Enable to enable logging in oidc library
    Oidc.Log.logger = console;

    const oidcConfig: UserManagerSettings = {
        authority: ENV.OAUTH2_OPENID_CONNECT_URL || "",
        client_id: ENV.OAUTH2_CLIENT_ID || "",
        redirect_uri: `${window.location.protocol}//${window.location.host}/authorize`,
        response_type: "code",
        scope: ENV.OAUTH2_SCOPE || "openid",
        loadUserInfo: true,
        userStore: new WebStorageStateStore({ store: localStorage })
    };

    const userManager = new UserManager(oidcConfig);

    ReactDOM.render(
        <AuthProvider
            userManager={userManager}
            onBeforeSignIn={() => {
                localStorage.setItem(REDIRECT_URL_KEY, window.location.href);
            }}
            onSignIn={user => {
                if (user !== null) {
                    setUser(user);

                    if (user.profile.email) {
                        logUserInfo(user.profile.email, "logged in");
                    }
                }

                userManager.clearStaleState();

                const redirectUrl = localStorage.getItem(REDIRECT_URL_KEY) || "/";
                localStorage.removeItem(REDIRECT_URL_KEY);
                window.location.replace(redirectUrl);
            }}
            onSignOut={() => {
                setUser(null);

                window.location.assign("/");

                userManager.signinRedirect({});
            }}
        >
            <AuthContext.Consumer>
                {props => {
                    setUser(props.userData || null);

                    if (props.userData && !props.userData.expired) {
                        return <App />;
                    }
                }}
            </AuthContext.Consumer>
        </AuthProvider>,
        appElement
    );
} else {
    ReactDOM.render(<App />, appElement);
}
