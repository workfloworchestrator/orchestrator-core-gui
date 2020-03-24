import "../src/pages/App.scss";
import "./storybook.scss";

import { withState } from "@sambego/storybook-state";
import { action } from "@storybook/addon-actions";
import { withKnobs } from "@storybook/addon-knobs";
import { addons } from "@storybook/addons";
import { addDecorator } from "@storybook/react";
import React from "react";

import LOCATION_CODES from "../src/stories/data/location_codes.json";
import ORGANISATIONS from "../src/stories/data/organisations.json";
import PRODUCTS from "../src/stories/data/products.json";
import ApplicationContext from "../src/utils/ApplicationContext";
import surfnetTheme from "./surfnetTheme";

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
