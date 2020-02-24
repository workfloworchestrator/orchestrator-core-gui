/*
 * Copyright 2019 SURF.
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

import React from "react";

import { action } from "@storybook/addon-actions";
import { array, boolean } from "@storybook/addon-knobs";
import { Store } from "@sambego/storybook-state";

import LocationCodeSelect from "../components/LocationCodeSelect";

import LOCATION_CODES from "./data/location_codes.json";

const store = new Store({
    locationCode: ""
});

export default {
    title: "LocationCodeSelect",
    parameters: { state: { store: store } }
};

export const __Default = () => (
    <LocationCodeSelect
        id="location-code-select"
        locationCode={store.state.locationCode}
        locationCodes={LOCATION_CODES}
        onChange={e => {
            action("onChange")(e);
            store.set({ locationCode: e.value });
        }}
        disabled={boolean("Disabled")}
    />
);
