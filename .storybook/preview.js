import { addDecorator } from "@storybook/react";
import React from "react";
import ApplicationContext from "../src/utils/ApplicationContext";
import { action } from "@storybook/addon-actions";

import surfnetTheme from "./surfnetTheme";
import { addons } from "@storybook/addons";
import { withState } from "@sambego/storybook-state";
import { withKnobs } from "@storybook/addon-knobs";

import "../src/pages/App.scss";
import "./storybook.scss";

import PRODUCTS from "../src/stories/data/products.json";
import ORGANISATIONS from "../src/stories/data/organisations.json";
import LOCATION_CODES from "../src/stories/data/location_codes.json";

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
                currentUser: {},
                configuration: {},
                redirect: action("Change url")
            }}
        >
            {storyFn()}
        </ApplicationContext.Provider>
    );
}
addDecorator(withContext);

addons.setConfig({
    surfnetTheme
});
