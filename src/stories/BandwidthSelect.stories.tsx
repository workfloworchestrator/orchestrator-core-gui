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

import { State, Store } from "@sambego/storybook-state";
import { action } from "@storybook/addon-actions";
import { boolean, select } from "@storybook/addon-knobs";
import fetchMock from "fetch-mock";
import React from "react";

import BandwidthSelect from "../components/BandwidthSelect";

const store = new Store({
    value: 1000
});

export default {
    title: "Bandwidth",
    // Needed to match snapshot file to story, should be done bij injectFileNames but that does not work
    parameters: {
        fileName: __filename
    }
};

export const Bandwidth = () => {
    fetchMock.restore();
    fetchMock.get("glob:*/api/fixed_inputs/port_speed_by_subscription_id/48f28a55-7764-4c84-9848-964d14906a27", [1000]);
    fetchMock.get("glob:*/api/fixed_inputs/port_speed_by_subscription_id/55c96135-e308-4126-b53f-0a3cf23331f5", [
        10000
    ]);
    return (
        <State store={store}>
            {state => (
                <BandwidthSelect
                    servicePorts={select(
                        "servicePorts",
                        {
                            "Restricted by service port 1G": [
                                // @ts-ignore
                                { subscription_id: "48f28a55-7764-4c84-9848-964d14906a27", tag: "MSP", vlan: "2" }
                            ],
                            "Restricted by service port 10G": [
                                // @ts-ignore
                                { subscription_id: "55c96135-e308-4126-b53f-0a3cf23331f5", tag: "MSP", vlan: "2" }
                            ],
                            "Not restricted by service port": []
                        },
                        [{ subscription_id: "48f28a55-7764-4c84-9848-964d14906a27", tag: "MSP", vlan: "2" }]
                    )}
                    name="bandwidth"
                    reportError={action("reportError")}
                    onChange={(e: any) => {
                        store.set({ value: e.target.value });
                        action("onChange")(e);
                    }}
                    value={state.value}
                    disabled={boolean("Read only", false)}
                />
            )}
        </State>
    );
};
