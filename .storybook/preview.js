import "../src/pages/App.scss";
import "./storybook.scss";

import { EuiProvider } from "@elastic/eui";
import { action } from "@storybook/addon-actions";
import { withKnobs } from "@storybook/addon-knobs";
import mock from "axios-mock";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { setIntlConfig, withIntl } from "storybook-addon-intl";
import { useDarkMode } from "storybook-dark-mode";

import en from "../src/locale/en";
import { parse_translations_dict } from "../src/locale/i18n";
import nl from "../src/locale/nl";
import LOCATION_CODES from "../src/stories/data/location_codes.json";
import ORGANISATIONS from "../src/stories/data/organisations.json";
import PRODUCTS from "../src/stories/data/products.json";
import ApplicationContext, { apiClient, customApiClient } from "../src/utils/ApplicationContext";

const withContainerSection = (cb) => <section className="storybook-container">{cb()}</section>;
const queryClient = new QueryClient();

function withContext(Story) {
    const isDarkMode = useDarkMode();
    const themeType = isDarkMode ? "dark" : "light";
    return (
        <QueryClientProvider client={queryClient}>
            <EuiProvider colorMode={themeType}>
                <ApplicationContext.Provider
                    value={{
                        organisations: ORGANISATIONS,
                        locationCodes: LOCATION_CODES,
                        products: PRODUCTS,
                        redirect: action("Change url"),
                        allowed: (resource) => true,
                        apiClient: apiClient,
                        customApiClient: customApiClient,
                        theme: themeType,
                    }}
                >
                    <link
                        rel="stylesheet"
                        type="text/css"
                        href={isDarkMode || false ? "/eui_theme_dark.css" : "/eui_theme_light.css"}
                    />
                    <link rel="stylesheet" type="text/css" href={isDarkMode || false ? "/dark.css" : "/light.css"} />
                    <Story />
                </ApplicationContext.Provider>
            </EuiProvider>
        </QueryClientProvider>
    );
}

const messages = {
    en: parse_translations_dict(en),
    nl: parse_translations_dict(nl),
};
const getMessages = (locale) => messages[locale];

// Set intl configuration
setIntlConfig({
    locales: ["en", "nl"],
    defaultLocale: "en",
    getMessages,
    onError: (_) => {},
});

export const decorators = [withKnobs, withContainerSection, withContext, withIntl];

// Set runtime config
window.__env__ = {};
window.__env__.BACKEND_URL = "";
window.__env__.OAUTH2_ENABLED = false;
window.__env__.OAUTH2_OPENID_CONNECT_URL = "";
window.__env__.OAUTH2_CLIENT_ID = "";
window.__env__.OAUTH2_SCOPE = "";
window.__env__.CHECK_STATUS_INTERVAL = 0;
