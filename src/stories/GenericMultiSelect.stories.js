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

import GenericMultiSelect from "../components/GenericMultiSelect";

const store = new Store({
    selected: ""
});

export default {
    title: "GenericMultiSelect",
    parameters: { state: { store: store } }
};

export const Default = () => (
    <GenericMultiSelect
        selected={store.state.selected}
        onChange={e => {
            action("onChange")(e);
            store.set({ selected: e.value });
        }}
        selections={[]}
        minimum={1}
        maximum={10}
        disabled={boolean("Disabled")}
        choices={array("Values", [
            { value: "1", label: "SAP 1" },
            { value: "2", label: "SAP 2" },
            { value: "3", label: "SAP 3" },
            { value: "4", label: "SAP 4" },
            { value: "5", label: "SAP 5" }
        ])}
    />
);

export const WithSelections = () => (
    <GenericMultiSelect
        selected={store.state.selected}
        onChange={e => {
            action("onChange")(e);
            store.set({ selected: e.value });
        }}
        selections={[{ value: "1", label: "SAP 1" }]}
        minimum={1}
        maximum={10}
        disabled={boolean("Disabled")}
        choices={array("Values", [
            { value: "1", label: "SAP 1" },
            { value: "2", label: "SAP 2" },
            { value: "3", label: "SAP 3" },
            { value: "4", label: "SAP 4" },
            { value: "5", label: "SAP 5" }
        ])}
    />
);

WithSelections.story = {
    name: "With selections"
};

export const NonModifiableSelection = () => (
    <GenericMultiSelect
        selected={store.state.selected}
        onChange={e => {
            action("onChange")(e);
            store.set({ selected: e.value });
        }}
        selections={[
            { value: "1", label: "SAP 1", modifiable: false, nonremovable: true },
            { value: "2", label: "SAP 2" }
        ]}
        minimum={1}
        maximum={10}
        disabled={boolean("Disabled")}
        choices={array("Values", [
            { value: "1", label: "SAP 1" },
            { value: "2", label: "SAP 2" },
            { value: "3", label: "SAP 3" },
            { value: "4", label: "SAP 4" },
            { value: "5", label: "SAP 5" }
        ])}
    />
);

NonModifiableSelection.story = {
    name: "Non modifiable selection"
};

export const NonRemovableSelection = () => (
    <GenericMultiSelect
        selected={store.state.selected}
        onChange={e => {
            action("onChange")(e);
            store.set({ selected: e.value });
        }}
        selections={[
            { value: "1", label: "SAP 1" },
            { value: "2", label: "SAP 2", nonremovable: true }
        ]}
        minimum={1}
        maximum={10}
        disabled={boolean("Disabled")}
        choices={array("Values", [
            { value: "1", label: "SAP 1" },
            { value: "2", label: "SAP 2" },
            { value: "3", label: "SAP 3" },
            { value: "4", label: "SAP 4" },
            { value: "5", label: "SAP 5" }
        ])}
    />
);

NonRemovableSelection.story = {
    name: "Non removable selection"
};
