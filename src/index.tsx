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

import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { setUser } from "api/axios";
import { ENV } from "env";
import Oidc, { UserManager, UserManagerSettings, WebStorageStateStore } from "oidc-client";
import { AuthContext, AuthProvider } from "oidc-react";
import App, { history } from "pages/App";
import React from "react";
import ReactDOM from "react-dom";
import { apiClient } from "utils/ApplicationContext";
import { websocketService } from "websocketService";

const appElement = document.getElementById("app");

if (module.hot) {
    module.hot.accept();
}

if (ENV.TRACING_ENABLED) {
    console.log("Initialized Sentry");
    Sentry.init({
        dsn: ENV.SENTRY_DSN,
        release: "orchestrator-client@" + ENV.RELEASE,
        autoSessionTracking: true,
        environment: ENV.ENVIRONMENT,
        integrations: [
            new Integrations.BrowserTracing({
                routingInstrumentation: Sentry.reactRouterV5Instrumentation(history),
                tracingOrigins: [ENV.TRACING_ORIGINS],
            }),
        ],
        tracesSampleRate: Number(ENV.TRACE_SAMPLE_RATE),
        debug: false,
    });
}

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
        userStore: new WebStorageStateStore({ store: localStorage }),
    };

    const userManager = new UserManager(oidcConfig);

    ReactDOM.render(
        <AuthProvider
            userManager={userManager}
            onBeforeSignIn={() => {
                localStorage.setItem(REDIRECT_URL_KEY, window.location.href);
            }}
            onSignIn={(user) => {
                if (user !== null) {
                    setUser(user);
                    websocketService.setToken(user.access_token);

                    if (user.profile.email) {
                        // Todo: remove this ugliness
                        apiClient.logUserInfo(user.profile.email, "logged in").then();
                    }
                }

                userManager.clearStaleState();

                const redirectUrl = localStorage.getItem(REDIRECT_URL_KEY) || "/";
                localStorage.removeItem(REDIRECT_URL_KEY);
                window.location.replace(redirectUrl);
            }}
            onSignOut={() => {
                setUser(null);
                websocketService.setToken(null);

                window.location.assign("/");

                userManager.signinRedirect({});
            }}
        >
            <AuthContext.Consumer>
                {(props) => {
                    // @ts-ignore
                    setUser(props.userData || null);
                    websocketService.setToken(props?.userData?.access_token);

                    // @ts-ignore
                    if (props.userData && !props.userData.expired) {
                        return <App user={props?.userData.profile} />;
                    }
                }}
            </AuthContext.Consumer>
        </AuthProvider>,
        appElement
    );
} else {
    // Todo: also implement it in the if
    ReactDOM.render(
        <>
            <link
                rel="stylesheet"
                type="text/css"
                href={localStorage.getItem("darkMode") || false ? "/eui_theme_dark.css" : "/eui_theme_light.css"}
            />
            <link
                rel="stylesheet"
                type="text/css"
                href={localStorage.getItem("darkMode") || false ? "/dark.css" : "/light.css"}
            />
            <App />
        </>,
        appElement
    );
}
