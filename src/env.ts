/*
 * Copyright 2019-2023 SURF.
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
interface Env {
    BACKEND_URL: string;
    OAUTH2_ENABLED: string;
    OAUTH2_OPENID_CONNECT_URL: string;
    OAUTH2_CLIENT_ID: string;
    OAUTH2_SCOPE: string;
    CHECK_STATUS_INTERVAL: number;
    NETWORKDASHBOARD_URL: string;
    SENTRY_DSN: string;
    TRACING_ENABLED: boolean;
    TRACE_SAMPLE_RATE: number;
    RELEASE: string;
    ENVIRONMENT: string;
    TRACING_ORIGINS: string;
    IMS_URL: string;
    REVIEW_APP: boolean;
    CI_PROJECT_ID: string;
    CI_MERGE_REQUEST_IID: string;
    GITLAB_URL: string;
    CI_PROJECT_PATH: string;
    LOCALE: string;
    WS_PING_INTERVAL_IN_SECONDS: number;
}

// We normally load env from window.__env__ as defined in public/env.js which
// is generated on server startup (see Dockerfile) for development we fall back to process.env
// @ts-ignore
export const ENV: Env = window.__env__ || {
    BACKEND_URL: process.env.REACT_APP_BACKEND_URL,
    OAUTH2_ENABLED: ["true", "1", "yes", "on"].includes(
        (process.env.REACT_APP_OAUTH2_ENABLED || "true").toLocaleLowerCase()
    ),
    OAUTH2_OPENID_CONNECT_URL: process.env.REACT_APP_OAUTH2_OPENID_CONNECT_URL,
    OAUTH2_CLIENT_ID: process.env.REACT_APP_OAUTH2_CLIENT_ID,
    OAUTH2_SCOPE: process.env.REACT_APP_OAUTH2_SCOPE,
    CHECK_STATUS_INTERVAL: parseInt(process.env.REACT_APP_CHECK_STATUS_INTERVAL ?? "0"),
    NETWORKDASHBOARD_URL: process.env.REACT_APP_NETWORKDASHBOARD_URL,
    SENTRY_DSN: process.env.REACT_APP_SENTRY_DSN,
    TRACING_ENABLED: ["true", "1", "yes", "on"].includes(
        (process.env.REACT_APP_TRACING_ENABLED || "true").toLocaleLowerCase()
    ),
    TRACE_SAMPLE_RATE: process.env.REACT_APP_TRACE_SAMPLE_RATE,
    RELEASE: process.env.REACT_APP_RELEASE,
    ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT,
    TRACING_ORIGINS: process.env.REACT_APP_TRACING_ORIGINS,
    IMS_URL: process.env.REACT_APP_IMS_URL,
    REVIEW_APP: ["true", "1", "yes", "on"].includes((process.env.REACT_APP_REVIEW_APP || "true").toLocaleLowerCase()),
    CI_PROJECT_ID: process.env.REACT_APP_CI_PROJECT_ID,
    CI_MERGE_REQUEST_IID: process.env.REACT_APP_CI_MERGE_REQUEST_IID,
    GITLAB_URL: process.env.REACT_APP_GITLAB_URL,
    CI_PROJECT_PATH: process.env.REACT_APP_CI_PROJECT_PATH,
    LOCALE: process.env.REACT_APP_LOCALE || "en-GB",
    WS_PING_INTERVAL_IN_SECONDS: parseInt(process.env.WS_PING_INTERVAL_IN_SECONDS || "30"),
};
