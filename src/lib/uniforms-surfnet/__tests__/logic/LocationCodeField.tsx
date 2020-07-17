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
import React from "react";
import ApplicationContext, { ApplicationContextInterface } from "utils/ApplicationContext";

import { SelectField } from "../../src";
import LocationCodeField from "../../src/logic/LocationCodeField";
import createContext from "../_createContext";
import mount from "../_mount";

describe("<LocationCodeField>", () => {
    test("<LocationCodeField> - calls selectField with all locationCodes", () => {
        const mockSelectField = (jest.fn(() => <br />) as any) as typeof SelectField;

        const element = (
            <ApplicationContext.Provider value={{ locationCodes: ["aaa", "bbb"] } as ApplicationContextInterface}>
                <LocationCodeField name="x" inputComponent={mockSelectField} />
            </ApplicationContext.Provider>
        );
        const wrapper = mount(element, createContext({ x: { type: String } }));
        expect(wrapper.html()).toBe("<br>");
        expect(mockSelectField).toHaveBeenCalledTimes(1);
        expect(mockSelectField).toHaveBeenCalledWith(
            expect.objectContaining({
                allowedValues: ["aaa", "bbb"],
                disabled: false,
                error: null,
                errorMessage: "",
                required: true,
                showInlineError: false,
                value: undefined,
                placeholder: "Search and select a location code..."
            }),
            {}
        );
    });

    test("<LocationCodeField> - calls selectField with specified locationCodes", () => {
        const mockSelectField = (jest.fn(() => <br />) as any) as typeof SelectField;

        const element = (
            <ApplicationContext.Provider value={{ locationCodes: ["aaa", "bbb"] } as ApplicationContextInterface}>
                <LocationCodeField name="x" inputComponent={mockSelectField} locationCodes={["ccc", "ddd"]} />
            </ApplicationContext.Provider>
        );
        const wrapper = mount(element, createContext({ x: { type: String } }));
        expect(wrapper.html()).toBe("<br>");
        expect(mockSelectField).toHaveBeenCalledTimes(1);
        expect(mockSelectField).toHaveBeenCalledWith(
            expect.objectContaining({
                allowedValues: ["ccc", "ddd"],
                disabled: false,
                error: null,
                errorMessage: "",
                required: true,
                showInlineError: false,
                value: undefined,
                placeholder: "Search and select a location code..."
            }),
            {}
        );
    });
});
