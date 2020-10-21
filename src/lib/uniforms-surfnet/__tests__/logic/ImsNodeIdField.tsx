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

import waitForComponentToPaint from "__tests__/waitForComponentToPaint";
import mock from "axios-mock";
import createContext from "lib/uniforms-surfnet/__tests__/_createContext";
import mount from "lib/uniforms-surfnet/__tests__/_mount";
import { ImsNodeIdField, SelectField } from "lib/uniforms-surfnet/src";
import React from "react";

jest.mock("lib/uniforms-surfnet/src/SelectField", () => {
    return { __esModule: true, default: jest.fn(() => <br />) };
});

describe("<ImsNodeIdField>", () => {
    test("<ImsNodeIdField> - shows loading placeholder", async () => {
        mock.onGet("ims/nodes/kb001a/PL").reply(200, []);

        const element = <ImsNodeIdField name="x" locationCode="kb001a" />;
        const wrapper = mount(element, createContext({ x: { type: Number } }));

        expect(wrapper.html()).toBe("<br>");
        expect(wrapper.find(SelectField)).toHaveLength(1);
        expect(wrapper.find(SelectField).props()).toMatchObject({
            placeholder: "Loading nodes, please wait..."
        });

        await waitForComponentToPaint(wrapper);
    });
    test("<ImsNodeIdField> - calls selectField with all nodes", async () => {
        mock.onGet("ims/nodes/kb001a/PL").reply(200, [{ id: 1, name: "Some Node" }]);

        const element = <ImsNodeIdField name="x" locationCode="kb001a" />;
        const wrapper = mount(element, createContext({ x: { type: Number } }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.html()).toBe("<br>");
        expect(wrapper.find(SelectField)).toHaveLength(1);
        expect(wrapper.find(SelectField).props()).toMatchObject({
            allowedValues: ["1"],
            disabled: false,
            error: null,
            errorMessage: "",
            required: true,
            showInlineError: false,
            value: undefined,
            placeholder: "Select a node"
        });
        //@ts-ignore
        expect(wrapper.find(SelectField).prop("transform")("1")).toBe("Some Node");
    });

    test("<ImsNodeIdField> - calls api with right status", async () => {
        mock.onGet("ims/nodes/kb001a/IS").reply(200, [{ id: 1, name: "Some Node" }]);

        const element = <ImsNodeIdField name="x" locationCode="kb001a" status="IS" />;
        const wrapper = mount(element, createContext({ x: { type: Number } }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.html()).toBe("<br>");
        expect(wrapper.find(SelectField)).toHaveLength(1);
        expect(wrapper.find(SelectField).props()).toMatchObject({
            allowedValues: ["1"],
            disabled: false,
            error: null,
            errorMessage: "",
            required: true,
            showInlineError: false,
            value: undefined,
            placeholder: "Select a node"
        });
        //@ts-ignore
        expect(wrapper.find(SelectField).prop("transform")("1")).toBe("Some Node");
    });
});
