/*
 * Copyright 2019-2020 SURF.
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

import fetchMock from "fetch-mock";
import React from "react";

import waitForComponentToPaint from "../../../__tests__/waitForComponentToPaint";
import ImsPortIdField from "../src/ImsPortIdField";
import createContext from "./_createContext";
import mount from "./_mount";

describe("<ImsPortIdField>", () => {
    test("<ImsPortIdField> - renders inputs", async () => {
        fetchMock.get("glob:*/api/v2/subscriptions?filter=tags%2CNode%2Cstatuses%2Cactive-provisioning", "[]");
        const element = <ImsPortIdField name="x" interfaceType="1000BASE-LX" />;

        const wrapper = mount(element, createContext({ x: { type: Number } }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(2);
    });
});
