interface Window {
    __env__: {
        BACKEND_URL: string;
        OAUTH2_ENABLED: string;
        OAUTH2_OPENID_CONNECT_URL: string;
        OAUTH2_CLIENT_ID: string;
        OAUTH2_SCOPE: string;
    };
}

// We normally load env from window.__env__ as defined in public/env.js which
// is generated on server startup (see Dockerfile) for development we fall back to process.env
// @ts-ignore
export const ENV = window.__env__ || {
    BACKEND_URL: process.env.REACT_APP_BACKEND_URL,
    OAUTH2_ENABLED: process.env.REACT_APP_OAUTH2_ENABLED,
    OAUTH2_OPENID_CONNECT_URL: process.env.REACT_APP_OAUTH2_OPENID_CONNECT_URL,
    OAUTH2_CLIENT_ID: process.env.REACT_APP_OAUTH2_CLIENT_ID,
    OAUTH2_SCOPE: process.env.REACT_APP_OAUTH2_SCOPE
};
