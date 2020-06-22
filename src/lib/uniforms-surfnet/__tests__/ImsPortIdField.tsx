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

import ImsPortIdField from "../src/ImsPortIdField";
import createContext from "./_createContext";
import mount from "./_mount";

describe("<ImsPortIdField>", () => {
    test("<ImsPortIdField> - renders inputs", done => {
        fetchMock.restore();
        // fetchMock.get("glob:*/api/subscriptions/*", SUBSCRIPTION_JSON);
        // fetchMock.get("glob:*/api/products/a3bf8b26-50a6-4586-8e58-ad552cb39798", PRODUCTS[22]);
        const element = <ImsPortIdField name="x" />;
        const wrapper = mount(element, createContext({ x: { type: Number } }));
        setImmediate(() => {
            wrapper.update();
            expect(wrapper.find("input")).toHaveLength(2);
            done();
        });
    });
});
