import waitForComponentToPaint from "__tests__/waitForComponentToPaint";
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
import ReactSelect from "react-select";

import { ListField, SelectField } from "../src";
import createContext from "./_createContext";
import mount from "./_mount";

describe("<SelectField>", () => {
    test("<SelectField> - renders an input", () => {
        const element = <SelectField name="x" />;
        const wrapper = mount(element, createContext({ x: { type: String, allowedValues: ["a", "b"] } }));

        expect(wrapper.find(ReactSelect)).toHaveLength(1);
    });

    test("<SelectField> - renders a select with correct disabled state", () => {
        const element = <SelectField name="x" disabled />;
        const wrapper = mount(element, createContext({ x: { type: String, allowedValues: ["a", "b"] } }));

        expect(wrapper.find(ReactSelect)).toHaveLength(1);
        expect(wrapper.find(ReactSelect).prop("isDisabled")).toBe(true);
    });

    test("<SelectField> - renders a select with correct id (inherited)", () => {
        const element = <SelectField name="x" />;
        const wrapper = mount(element, createContext({ x: { type: String, allowedValues: ["a", "b"] } }));

        expect(wrapper.find(ReactSelect)).toHaveLength(1);
        expect(wrapper.find(ReactSelect).prop("id")).toBeTruthy();
    });

    test("<SelectField> - renders a select with correct id (specified)", () => {
        const element = <SelectField name="x" id="y" />;
        const wrapper = mount(element, createContext({ x: { type: String, allowedValues: ["a", "b"] } }));

        expect(wrapper.find(ReactSelect)).toHaveLength(1);
        expect(wrapper.find(ReactSelect).prop("id")).toBe("y");
    });

    test("<SelectField> - renders a select with correct name", () => {
        const element = <SelectField name="x" />;
        const wrapper = mount(element, createContext({ x: { type: String, allowedValues: ["a", "b"] } }));

        expect(wrapper.find(ReactSelect)).toHaveLength(1);
        expect(wrapper.find(ReactSelect).prop("name")).toBe("x");
    });

    test("<SelectField> - renders a select with correct options", () => {
        const element = <SelectField name="x" />;
        const wrapper = mount(element, createContext({ x: { type: String, allowedValues: ["a", "b"] } }));

        expect(wrapper.find(ReactSelect)).toHaveLength(1);
        expect(wrapper.find(ReactSelect).prop("options")).toStrictEqual([
            { label: "a", value: "a" },
            { label: "b", value: "b" }
        ]);
    });

    test("<SelectField> - renders a select with correct options (transform)", () => {
        const element = <SelectField name="x" transform={(x: string) => x.toUpperCase()} />;
        const wrapper = mount(element, createContext({ x: { type: String, allowedValues: ["a", "b"] } }));

        expect(wrapper.find(ReactSelect)).toHaveLength(1);
        expect(wrapper.find(ReactSelect).prop("options")).toStrictEqual([
            { label: "A", value: "a" },
            { label: "B", value: "b" }
        ]);
    });

    test("<SelectField> - renders a select with correct placeholder (fallback)", () => {
        const element = <SelectField name="x" placeholder="" />;
        const wrapper = mount(
            element,
            createContext({
                x: { type: String, allowedValues: ["a", "b"], optional: true }
            })
        );

        expect(wrapper.find(ReactSelect)).toHaveLength(1);
        expect(wrapper.find(ReactSelect).prop("options")).toStrictEqual([
            { label: "a", value: "a" },
            { label: "b", value: "b" }
        ]);
        expect(wrapper.find(ReactSelect).prop("placeholder")).toBe("Search and select a value...");
    });

    test("<SelectField> - renders a select with correct placeholder (implicit)", () => {
        const element = <SelectField name="x" placeholder="y" />;
        const wrapper = mount(element, createContext({ x: { type: String, allowedValues: ["a", "b"] } }));

        expect(wrapper.find(ReactSelect)).toHaveLength(1);
        expect(wrapper.find(ReactSelect).prop("options")).toStrictEqual([
            { label: "a", value: "a" },
            { label: "b", value: "b" }
        ]);
        expect(wrapper.find(ReactSelect).prop("placeholder")).toBe("y");
    });

    test("<SelectField> - renders a select with correct value (default)", () => {
        const element = <SelectField name="x" />;
        const wrapper = mount(element, createContext({ x: { type: String, allowedValues: ["a", "b"] } }));

        expect(wrapper.find(ReactSelect)).toHaveLength(1);
        expect(wrapper.find(ReactSelect).prop("value")).toBe(undefined);
    });

    test("<SelectField> - renders a select with correct value (model)", () => {
        const element = <SelectField name="x" />;
        const wrapper = mount(
            element,
            createContext({ x: { type: String, allowedValues: ["a", "b"] } }, { model: { x: "b" } })
        );

        expect(wrapper.find(ReactSelect)).toHaveLength(1);
        expect(wrapper.find(ReactSelect).prop("value")).toStrictEqual({ label: "b", value: "b" });
    });

    test("<SelectField> - renders a select with correct value (specified)", () => {
        const element = <SelectField name="x" value="b" />;
        const wrapper = mount(element, createContext({ x: { type: String, allowedValues: ["a", "b"] } }));

        expect(wrapper.find(ReactSelect)).toHaveLength(1);
        expect(wrapper.find(ReactSelect).prop("value")).toStrictEqual({ label: "b", value: "b" });
    });

    test("<SelectField> - renders a select which correctly reacts on change", () => {
        const onChange = jest.fn();

        const element = <SelectField name="x" />;
        const wrapper = mount(element, createContext({ x: { type: String, allowedValues: ["a", "b"] } }, { onChange }));

        expect(wrapper.find(ReactSelect)).toHaveLength(1);
        wrapper.find(ReactSelect).invoke("onChange")({ value: "b" });

        expect(onChange).toHaveBeenLastCalledWith("x", "b");
    });

    test("<SelectField> - renders a select which correctly reacts on change (empty)", () => {
        const onChange = jest.fn();

        const element = <SelectField name="x" />;
        const wrapper = mount(element, createContext({ x: { type: String, allowedValues: ["a", "b"] } }, { onChange }));

        expect(wrapper.find(ReactSelect)).toHaveLength(1);
        wrapper.find(ReactSelect).invoke("onChange")(undefined);

        expect(onChange).toHaveBeenLastCalledWith("x", undefined);
    });

    test("<SelectField> - renders a select which correctly reacts on change (same value)", () => {
        const onChange = jest.fn();

        const element = <SelectField name="x" />;
        const wrapper = mount(
            element,
            createContext({ x: { type: String, allowedValues: ["a", "b"] } }, { model: { x: "b" }, onChange })
        );

        expect(wrapper.find(ReactSelect)).toHaveLength(1);
        wrapper.find(ReactSelect).invoke("onChange")({ value: "b" });

        expect(onChange).toHaveBeenLastCalledWith("x", "b");
    });

    test("<SelectField> - renders a label", () => {
        const element = <SelectField name="x" label="y" />;
        const wrapper = mount(element, createContext({ x: { type: String, allowedValues: ["a", "b"] } }));

        expect(wrapper.find("label")).toHaveLength(1);
        expect(wrapper.find("label").prop("children")).toContain("y");
        expect(wrapper.find("label").prop("htmlFor")).toBe(wrapper.find(ReactSelect).prop("id"));
    });

    test("<SelectField> - renders a wrapper with unknown props", () => {
        const element = <SelectField name="x" data-x="x" data-y="y" data-z="z" />;
        const wrapper = mount(element, createContext({ x: { type: String, allowedValues: ["a", "b"] } }));

        expect(
            wrapper
                .find("section")
                .at(0)
                .prop("data-x")
        ).toBe("x");
        expect(
            wrapper
                .find("section")
                .at(0)
                .prop("data-y")
        ).toBe("y");
        expect(
            wrapper
                .find("section")
                .at(0)
                .prop("data-z")
        ).toBe("z");
    });

    test("<SelectField> - renders a select with correct value (as uniqueItem list child)", async () => {
        const element = <ListField name="x" />;
        const wrapper = mount(
            element,
            createContext(
                {
                    x: { type: Array, uniforms: { uniqueItems: true } },
                    "x.$": { type: String, allowedValues: ["a", "b"] }
                },
                { model: { x: ["a", undefined] } }
            )
        );

        await waitForComponentToPaint(wrapper);

        expect(wrapper.find(ReactSelect)).toHaveLength(2);
        expect(
            wrapper
                .find(ReactSelect)
                .at(0)
                .prop("value")
        ).toStrictEqual({ label: "a", value: "a" });
        expect(
            wrapper
                .find(ReactSelect)
                .at(1)
                .prop("value")
        ).toStrictEqual(undefined);
        expect(
            wrapper
                .find(ReactSelect)
                .at(1)
                .prop("options")
        ).toStrictEqual([{ label: "b", value: "b" }]);
    });
});

describe("<SelectField checkboxes>", () => {
    test("<SelectField checkboxes> - renders a set of checkboxes", () => {
        const element = <SelectField checkboxes name="x" />;
        const wrapper = mount(element, createContext({ x: { type: String, allowedValues: ["a", "b"] } }));

        expect(wrapper.find("input")).toHaveLength(2);
    });

    test("<SelectField checkboxes> - renders a set of checkboxes with correct disabled state", () => {
        const element = <SelectField checkboxes name="x" disabled />;
        const wrapper = mount(element, createContext({ x: { type: String, allowedValues: ["a", "b"] } }));

        expect(wrapper.find("input")).toHaveLength(2);
        expect(
            wrapper
                .find("input")
                .at(0)
                .prop("disabled")
        ).toBe(true);
        expect(
            wrapper
                .find("input")
                .at(1)
                .prop("disabled")
        ).toBe(true);
    });

    test("<SelectField checkboxes> - renders a set of checkboxes with correct id (inherited)", () => {
        const element = <SelectField checkboxes name="x" />;
        const wrapper = mount(element, createContext({ x: { type: String, allowedValues: ["a", "b"] } }));

        expect(wrapper.find("input")).toHaveLength(2);
        expect(
            wrapper
                .find("input")
                .at(0)
                .prop("id")
        ).toBeTruthy();
        expect(
            wrapper
                .find("input")
                .at(1)
                .prop("id")
        ).toBeTruthy();
    });

    test("<SelectField checkboxes> - renders a set of checkboxes with correct id (specified)", () => {
        const element = <SelectField checkboxes name="x" id="y" />;
        const wrapper = mount(element, createContext({ x: { type: String, allowedValues: ["a", "b"] } }));

        expect(wrapper.find("input")).toHaveLength(2);
        expect(
            wrapper
                .find("input")
                .at(0)
                .prop("id")
        ).toBe("y-YQ");
        expect(
            wrapper
                .find("input")
                .at(1)
                .prop("id")
        ).toBe("y-Yg");
    });

    test("<SelectField checkboxes> - renders a set of checkboxes with correct name", () => {
        const element = <SelectField checkboxes name="x" />;
        const wrapper = mount(element, createContext({ x: { type: String, allowedValues: ["a", "b"] } }));

        expect(wrapper.find("input")).toHaveLength(2);
        expect(
            wrapper
                .find("input")
                .at(0)
                .prop("name")
        ).toBe("x");
        expect(
            wrapper
                .find("input")
                .at(1)
                .prop("name")
        ).toBe("x");
    });

    test("<SelectField checkboxes> - renders a set of checkboxes with correct options", () => {
        const element = <SelectField checkboxes name="x" />;
        const wrapper = mount(element, createContext({ x: { type: String, allowedValues: ["a", "b"] } }));

        expect(wrapper.find("label")).toHaveLength(2);
        expect(
            wrapper
                .find("label")
                .at(0)
                .text()
        ).toBe("a");
        expect(
            wrapper
                .find("label")
                .at(1)
                .text()
        ).toBe("b");
    });

    test("<SelectField checkboxes> - renders a set of checkboxes with correct options (transform)", () => {
        const element = <SelectField checkboxes name="x" transform={(x: string) => x.toUpperCase()} />;
        const wrapper = mount(element, createContext({ x: { type: String, allowedValues: ["a", "b"] } }));

        expect(wrapper.find("label")).toHaveLength(2);
        expect(
            wrapper
                .find("label")
                .at(0)
                .text()
        ).toBe("A");
        expect(
            wrapper
                .find("label")
                .at(1)
                .text()
        ).toBe("B");
    });

    test("<SelectField checkboxes> - renders a set of checkboxes with correct value (default)", () => {
        const element = <SelectField checkboxes name="x" />;
        const wrapper = mount(element, createContext({ x: { type: String, allowedValues: ["a", "b"] } }));

        expect(wrapper.find("input")).toHaveLength(2);
        expect(
            wrapper
                .find("input")
                .at(0)
                .prop("checked")
        ).toBe(false);
        expect(
            wrapper
                .find("input")
                .at(1)
                .prop("checked")
        ).toBe(false);
    });

    test("<SelectField checkboxes> - renders a set of checkboxes with correct value (model)", () => {
        const element = <SelectField checkboxes name="x" />;
        const wrapper = mount(
            element,
            createContext({ x: { type: String, allowedValues: ["a", "b"] } }, { model: { x: "b" } })
        );

        expect(wrapper.find("input")).toHaveLength(2);
        expect(
            wrapper
                .find("input")
                .at(0)
                .prop("checked")
        ).toBe(false);
        expect(
            wrapper
                .find("input")
                .at(1)
                .prop("checked")
        ).toBe(true);
    });

    test("<SelectField checkboxes> - renders a set of checkboxes with correct value (specified)", () => {
        const element = <SelectField checkboxes name="x" value="b" />;
        const wrapper = mount(element, createContext({ x: { type: String, allowedValues: ["a", "b"] } }));

        expect(wrapper.find("input")).toHaveLength(2);
        expect(
            wrapper
                .find("input")
                .at(0)
                .prop("checked")
        ).toBe(false);
        expect(
            wrapper
                .find("input")
                .at(1)
                .prop("checked")
        ).toBe(true);
    });

    test("<SelectField checkboxes> - renders a set of checkboxes which correctly reacts on change", () => {
        const onChange = jest.fn();

        const element = <SelectField checkboxes name="x" />;
        const wrapper = mount(element, createContext({ x: { type: String, allowedValues: ["a", "b"] } }, { onChange }));

        expect(wrapper.find("input")).toHaveLength(2);
        expect(
            wrapper
                .find("input")
                .at(1)
                .simulate("change")
        ).toBeTruthy();
        expect(onChange).toHaveBeenLastCalledWith("x", "b");
    });

    test("<SelectField checkboxes> - renders a set of checkboxes which correctly reacts on change (array check)", () => {
        const onChange = jest.fn();

        const element = <SelectField checkboxes name="x" />;
        const wrapper = mount(
            element,
            createContext(
                {
                    x: { type: Array },
                    "x.$": { type: String, allowedValues: ["a", "b"] }
                },
                { onChange }
            )
        );

        expect(wrapper.find("input")).toHaveLength(2);
        expect(
            wrapper
                .find("input")
                .at(1)
                .simulate("change")
        ).toBeTruthy();
        expect(onChange).toHaveBeenLastCalledWith("x", ["b"]);
    });

    test("<SelectField checkboxes> - renders a set of checkboxes which correctly reacts on change (array uncheck)", () => {
        const onChange = jest.fn();

        const element = <SelectField checkboxes name="x" value={["b"]} />;
        const wrapper = mount(
            element,
            createContext(
                {
                    x: { type: Array },
                    "x.$": { type: String, allowedValues: ["a", "b"] }
                },
                { onChange }
            )
        );

        expect(wrapper.find("input")).toHaveLength(2);
        expect(
            wrapper
                .find("input")
                .at(1)
                .simulate("change")
        ).toBeTruthy();
        expect(onChange).toHaveBeenLastCalledWith("x", []);
    });

    test("<SelectField checkboxes> - renders a set of checkboxes which correctly reacts on change (same value)", () => {
        const onChange = jest.fn();

        const element = <SelectField checkboxes name="x" />;
        const wrapper = mount(
            element,
            createContext({ x: { type: String, allowedValues: ["a", "b"] } }, { model: { x: "b" }, onChange })
        );

        expect(wrapper.find("input")).toHaveLength(2);
        expect(
            wrapper
                .find("input")
                .at(0)
                .simulate("change")
        ).toBeTruthy();
        expect(onChange).toHaveBeenLastCalledWith("x", "a");
    });

    test("<SelectField checkboxes> - renders a label", () => {
        const element = <SelectField checkboxes name="x" label="y" />;
        const wrapper = mount(element, createContext({ x: { type: String, allowedValues: ["a", "b"] } }));

        expect(wrapper.find("label")).toHaveLength(3);
        expect(
            wrapper
                .find("label")
                .at(0)
                .text()
        ).toBe("y");
    });

    test("<SelectField checkboxes> - renders a wrapper with unknown props", () => {
        const element = <SelectField checkboxes name="x" data-x="x" data-y="y" data-z="z" />;
        const wrapper = mount(element, createContext({ x: { type: String, allowedValues: ["a", "b"] } }));

        expect(
            wrapper
                .find("section")
                .at(0)
                .prop("data-x")
        ).toBe("x");
        expect(
            wrapper
                .find("section")
                .at(0)
                .prop("data-y")
        ).toBe("y");
        expect(
            wrapper
                .find("section")
                .at(0)
                .prop("data-z")
        ).toBe("z");
    });

    test("<SelectField checkboxes> - renders a set of checkboxes with correct value (as uniqueItem list child)", async () => {
        const element = (
            <ListField name="x">
                <SelectField checkboxes name="$" />
            </ListField>
        );
        const wrapper = mount(
            element,
            createContext(
                {
                    x: { type: Array, uniforms: { uniqueItems: true } },
                    "x.$": { type: String, allowedValues: ["a", "b"] }
                },
                { model: { x: ["a", undefined] } }
            )
        );

        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("label")).toHaveLength(3);
        expect(
            wrapper
                .find("label")
                .at(0)
                .text()
        ).toBe("a");
        expect(
            wrapper
                .find("label")
                .at(1)
                .text()
        ).toBe("b");
        expect(
            wrapper
                .find("label")
                .at(2)
                .text()
        ).toBe("b");

        expect(wrapper.find("input")).toHaveLength(3);
        expect(
            wrapper
                .find("input")
                .at(0)
                .prop("checked")
        ).toBe(true);
        expect(
            wrapper
                .find("input")
                .at(1)
                .prop("checked")
        ).toBe(false);
        expect(
            wrapper
                .find("input")
                .at(2)
                .prop("checked")
        ).toBe(false);
    });
});
