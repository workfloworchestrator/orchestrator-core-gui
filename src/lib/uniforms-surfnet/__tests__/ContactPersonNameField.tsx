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
import Autocomplete from "components/inputForms/Autocomplete";
import { ContactPersonNameField } from "custom/uniforms";
import createContext from "lib/uniforms-surfnet/__tests__/_createContext";
import mount from "lib/uniforms-surfnet/__tests__/_mount";
import React from "react";

test("<ContactPersonNameField> - renders an input", () => {
    const element = <ContactPersonNameField name="x" />;
    const wrapper = mount(element, createContext({ x: { type: String } }));

    expect(wrapper.find("input")).toHaveLength(1);
});

test("<ContactPersonNameField> - renders an input with correct disabled state", () => {
    const element = <ContactPersonNameField name="x" disabled />;
    const wrapper = mount(element, createContext({ x: { type: String } }));

    expect(wrapper.find("input")).toHaveLength(1);
    expect(wrapper.find("input").prop("disabled")).toBe(true);
});

test("<ContactPersonNameField> - renders an input with correct id (inherited)", () => {
    const element = <ContactPersonNameField name="x" />;
    const wrapper = mount(element, createContext({ x: { type: String } }));

    expect(wrapper.find("input")).toHaveLength(1);
    expect(wrapper.find("input").prop("id")).toBeTruthy();
});

test("<ContactPersonNameField> - renders an input with correct id (specified)", () => {
    const element = <ContactPersonNameField name="x" id="y" />;
    const wrapper = mount(element, createContext({ x: { type: String } }));

    expect(wrapper.find("input")).toHaveLength(1);
    expect(wrapper.find("input").prop("id")).toBe("y");
});

test("<ContactPersonNameField> - renders an input with correct name", () => {
    const element = <ContactPersonNameField name="x" />;
    const wrapper = mount(element, createContext({ x: { type: String } }));

    expect(wrapper.find("input")).toHaveLength(1);
    expect(wrapper.find("input").prop("name")).toBe("x");
});

test("<ContactPersonNameField> - renders an input with correct placeholder", () => {
    const element = <ContactPersonNameField name="x" placeholder="y" />;
    const wrapper = mount(element, createContext({ x: { type: String } }));

    expect(wrapper.find("input")).toHaveLength(1);
    expect(wrapper.find("input").prop("placeholder")).toBe("y");
});

test("<ContactPersonNameField> - renders an input with correct type", () => {
    const element = <ContactPersonNameField name="x" />;
    const wrapper = mount(element, createContext({ x: { type: String } }));

    expect(wrapper.find("input")).toHaveLength(1);
    expect(wrapper.find("input").prop("type")).toBe("text");
});

test("<ContactPersonNameField> - renders an input with correct value (default)", () => {
    const element = <ContactPersonNameField name="x" />;
    const wrapper = mount(element, createContext({ x: { type: String } }));

    expect(wrapper.find("input")).toHaveLength(1);
    expect(wrapper.find("input").prop("value")).toBe("");
});

test("<ContactPersonNameField> - renders an input with correct value (model)", () => {
    const element = <ContactPersonNameField name="x" />;
    const wrapper = mount(element, createContext({ x: { type: String } }, { model: { x: "y" } }));

    expect(wrapper.find("input")).toHaveLength(1);
    expect(wrapper.find("input").prop("value")).toBe("y");
});

test("<ContactPersonNameField> - renders an input with correct value (specified)", () => {
    const element = <ContactPersonNameField name="x" value="y" />;
    const wrapper = mount(element, createContext({ x: { type: String } }));

    expect(wrapper.find("input")).toHaveLength(1);
    expect(wrapper.find("input").prop("value")).toBe("y");
});

test("<ContactPersonNameField> - renders an input which correctly reacts on change", () => {
    const onChange = jest.fn();

    const element = <ContactPersonNameField name="x" />;
    const wrapper = mount(element, createContext({ x: { type: String } }, { onChange }));

    expect(wrapper.find("input")).toHaveLength(1);
    expect(wrapper.find("input").simulate("change", { target: { value: "y" } })).toBeTruthy();
    expect(onChange).toHaveBeenLastCalledWith("x", "y");
});

test("<ContactPersonNameField> - renders an input which correctly reacts on change (empty)", () => {
    const onChange = jest.fn();

    const element = <ContactPersonNameField name="x" />;
    const wrapper = mount(element, createContext({ x: { type: String } }, { onChange }));

    expect(wrapper.find("input")).toHaveLength(1);
    expect(wrapper.find("input").simulate("change", { target: { value: "" } })).toBeTruthy();
    expect(onChange).toHaveBeenLastCalledWith("x", "");
});

test("<ContactPersonNameField> - renders an input which correctly reacts on change (same value)", () => {
    const onChange = jest.fn();

    const element = <ContactPersonNameField name="x" />;
    const wrapper = mount(element, createContext({ x: { type: String } }, { model: { x: "y" }, onChange }));

    expect(wrapper.find("input")).toHaveLength(1);
    expect(wrapper.find("input").simulate("change", { target: { value: "y" } })).toBeTruthy();
    expect(onChange).toHaveBeenLastCalledWith("x", "y");
});

test("<ContactPersonNameField> - renders a label", () => {
    const element = <ContactPersonNameField name="x" label="y" />;
    const wrapper = mount(element, createContext({ x: { type: String } }));

    expect(wrapper.find("label")).toHaveLength(1);
    expect(wrapper.find("label").text()).toBe("y");
    expect(wrapper.find("label").prop("htmlFor")).toBe(wrapper.find("input").prop("id"));
});

test("<ContactPersonNameField> - renders a wrapper with unknown props", () => {
    const element = <ContactPersonNameField name="x" data-x="x" data-y="y" data-z="z" />;
    const wrapper = mount(element, createContext({ x: { type: String } }));

    expect(wrapper.find("section").at(0).prop("data-x")).toBe("x");
    expect(wrapper.find("section").at(0).prop("data-y")).toBe("y");
    expect(wrapper.find("section").at(0).prop("data-z")).toBe("z");
});

test("<ContactPersonNameField> - renders autocomplete based on key", async () => {
    mock.onGet("surf/crm/contacts/abc").reply(200, [{ name: "name", email: "a@b.nl", phone: "" }]);

    const element = <ContactPersonNameField name="x" organisationKey="key" />;
    const wrapper = mount(element, createContext({ x: { type: String } }, { model: { x: "n", key: "abc" } }));

    expect(wrapper.find("input")).toHaveLength(1);
    expect(wrapper.find("input").simulate("change", { target: { value: "n" } })).toBeTruthy();

    await waitForComponentToPaint(wrapper);

    expect(wrapper.find(Autocomplete)).toHaveLength(1);
    expect(wrapper.find(Autocomplete).props()).toMatchObject({
        query: "n",
        suggestions: [{ name: "name", email: "a@b.nl", phone: "" }],
    });
});

test("<ContactPersonNameField> - renders autocomplete based on id", async () => {
    mock.onGet("surf/crm/contacts/abc").reply(200, [{ name: "name", email: "a@b.nl", phone: "" }]);

    const element = <ContactPersonNameField name="x" organisationId="abc" />;
    const wrapper = mount(element, createContext({ x: { type: String } }, { model: { x: "n" } }));

    expect(wrapper.find("input")).toHaveLength(1);
    expect(wrapper.find("input").simulate("change", { target: { value: "n" } })).toBeTruthy();

    await waitForComponentToPaint(wrapper);

    expect(wrapper.find(Autocomplete)).toHaveLength(1);
    expect(wrapper.find(Autocomplete).props()).toMatchObject({
        query: "n",
        suggestions: [{ name: "name", email: "a@b.nl", phone: "" }],
    });
});

test("<ContactPersonNameField> - selects item with keystrokes", async () => {
    const onChange = jest.fn();

    mock.onGet("surf/crm/contacts/abc").reply(200, [{ name: "name", email: "a@b.nl", phone: "p" }]);

    const element = <ContactPersonNameField name="x" organisationId="abc" />;
    const wrapper = mount(element, createContext({ x: { type: String } }, { model: { x: "n" }, onChange }));

    expect(wrapper.find("input")).toHaveLength(1);
    expect(wrapper.find("input").simulate("change", { target: { value: "n" } })).toBeTruthy();

    await waitForComponentToPaint(wrapper);

    expect(wrapper.find(Autocomplete)).toHaveLength(1);
    expect(wrapper.render()).toMatchSnapshot();

    expect(wrapper.find("input").simulate("keyDown", { keyCode: 40 })).toBeTruthy();
    expect(wrapper.find("input").simulate("keyDown", { keyCode: 13 })).toBeTruthy();

    await waitForComponentToPaint(wrapper);

    expect(wrapper.find(Autocomplete)).toHaveLength(0);
    expect(wrapper.render()).toMatchSnapshot();

    expect(onChange).toHaveBeenNthCalledWith(1, "x", "n");
    expect(onChange).toHaveBeenNthCalledWith(2, "x", "name");
    expect(onChange).toHaveBeenNthCalledWith(3, "email", "a@b.nl");
    expect(onChange).toHaveBeenNthCalledWith(4, "phone", "p");
});
