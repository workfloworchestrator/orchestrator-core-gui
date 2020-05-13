import "../src/pages/App.scss";
import "./storybook.scss";

import { withState } from "@sambego/storybook-state";
import { action } from "@storybook/addon-actions";
import { withKnobs } from "@storybook/addon-knobs";
import { addDecorator } from "@storybook/react";
import I18n from "i18n-js";
import React from "react";

import en from "../src/locale/en"; // We need to import this
import LOCATION_CODES from "../src/stories/data/location_codes.json";
import ORGANISATIONS from "../src/stories/data/organisations.json";
import PRODUCTS from "../src/stories/data/products.json";
import ApplicationContext from "../src/utils/ApplicationContext";

addDecorator(withKnobs);

addDecorator(withState());

const withContainerSection = cb => <section className="storybook-container">{cb()}</section>;
addDecorator(withContainerSection);

function withContext(storyFn) {
    return (
        <ApplicationContext.Provider
            value={{
                organisations: ORGANISATIONS,
                locationCodes: LOCATION_CODES,
                products: PRODUCTS,
                redirect: action("Change url")
            }}
        >
            {storyFn()}
        </ApplicationContext.Provider>
    );
}
addDecorator(withContext);

I18n.locale = "en";

// Set runtime config
window.__env__ = {};
window.__env__.BACKEND_URL = "";
window.__env__.OAUTH2_ENABLED = false;
window.__env__.OAUTH2_OPENID_CONNECT_URL = "";
window.__env__.OAUTH2_CLIENT_ID = "";
window.__env__.OAUTH2_SCOPE = "";
