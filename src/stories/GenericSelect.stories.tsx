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

import { Store } from "@sambego/storybook-state";
import { action } from "@storybook/addon-actions";
import { array, boolean } from "@storybook/addon-knobs";
import React from "react";

import GenericSelect from "../components/GenericSelect";

const store = new Store({
    selected: ""
});

export default {
    title: "GenericSelect",
    parameters: {
        state: { store: store },
        // Needed to match snapshot file to story, should be done by injectFileNames but that does not work
        fileName: __filename
    }
};

export const Default = () => (
    <GenericSelect
        selected={store.state.selected}
        onChange={e => {
            action("onChange")(e);
            store.set({ selected: e.value });
        }}
        disabled={boolean("Disabled", false)}
        choices={array("Values", ["SAP 1", "SAP 2", "SAP 3"])}
    />
);
