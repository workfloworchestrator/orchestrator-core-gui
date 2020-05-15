import { mount } from "enzyme";
import React from "react";

import AcceptField from "../src/AcceptField";
import createContext from "./_createContext";

const TEST_ACCEPT_DATA = [
    ["label", "label"],
    ["info", "info"],
    ["warning", "warning"],
    ["http://example.com", "url"],
    ["checkbox1", "checkbox"],
    ["label_with_context", "label", { foo: "bar" }],
    ["sub_checkbox", ">checkbox"],
    ["sub_checkbox2", ">checkbox"],
    ["optional_checkbox", "checkbox?"],
    ["skip_checkbox", "skip"]
];

describe("<AcceptField>", () => {
    test("<AcceptField> - legacy renders an input", () => {
        const element = <AcceptField name="x" />;
        const wrapper = mount(element, createContext({ x: { type: String } }));
        expect(wrapper.find("input")).toHaveLength(1);
    });

    test("<AcceptField> - legacy renders a input which correctly reacts on change", () => {
        const onChange = jest.fn();

        const element = <AcceptField name="x" />;
        const wrapper = mount(element, createContext({ x: { type: String } }, { onChange }));

        expect(wrapper.find("input[name='x']")).toHaveLength(1);
        expect(wrapper.find("input[name='x']").simulate("change", { target: { checked: true } })).toBeTruthy();
        expect(onChange).toHaveBeenLastCalledWith("x", "ACCEPTED");
        expect(wrapper.find("input[name='x']").simulate("change", { target: { checked: false } })).toBeTruthy();
        expect(onChange).toHaveBeenLastCalledWith("x", "INCOMPLETE");
    });

    test("<AcceptField> - renders inputs", () => {
        const element = <AcceptField name="x" />;
        const wrapper = mount(
            element,
            createContext({
                x: {
                    type: String,
                    uniforms: {
                        data: TEST_ACCEPT_DATA
                    }
                }
            })
        );
        expect(wrapper.find("input")).toHaveLength(5);
    });
    test("<AcceptField> - renders a input which correctly reacts on change", () => {
        const onChange = jest.fn();

        const element = <AcceptField name="x" />;
        const wrapper = mount(
            element,
            createContext(
                {
                    x: {
                        type: String,
                        uniforms: {
                            data: TEST_ACCEPT_DATA
                        }
                    }
                },
                { onChange }
            )
        );

        expect(wrapper.find("input[name='checkbox1']")).toHaveLength(1);
        expect(wrapper.find("input[name='sub_checkbox']")).toHaveLength(1);
        expect(wrapper.find("input[name='sub_checkbox2']")).toHaveLength(1);
        expect(wrapper.find("input[name='optional_checkbox']")).toHaveLength(1);
        expect(wrapper.find("input[name='skip_checkbox']")).toHaveLength(1);

        expect(wrapper.find("input[name='checkbox1']").simulate("change", { target: { checked: true } })).toBeTruthy();
        expect(onChange).toHaveBeenLastCalledWith("x", "INCOMPLETE");

        expect(
            wrapper.find("input[name='sub_checkbox']").simulate("change", { target: { checked: true } })
        ).toBeTruthy();
        expect(onChange).toHaveBeenLastCalledWith("x", "INCOMPLETE");

        expect(
            wrapper.find("input[name='optional_checkbox']").simulate("change", { target: { checked: true } })
        ).toBeTruthy();
        expect(onChange).toHaveBeenLastCalledWith("x", "INCOMPLETE");

        expect(
            wrapper.find("input[name='sub_checkbox2']").simulate("change", { target: { checked: true } })
        ).toBeTruthy();
        expect(onChange).toHaveBeenLastCalledWith("x", "ACCEPTED");

        expect(
            wrapper.find("input[name='optional_checkbox']").simulate("change", { target: { checked: false } })
        ).toBeTruthy();
        expect(onChange).toHaveBeenLastCalledWith("x", "ACCEPTED");

        expect(
            wrapper.find("input[name='skip_checkbox']").simulate("change", { target: { checked: true } })
        ).toBeTruthy();
        expect(onChange).toHaveBeenLastCalledWith("x", "SKIPPED");

        expect(
            wrapper.find("input[name='skip_checkbox']").simulate("change", { target: { checked: false } })
        ).toBeTruthy();
        expect(onChange).toHaveBeenLastCalledWith("x", "ACCEPTED");

        expect(wrapper.find("input[name='checkbox1']").simulate("change", { target: { checked: false } })).toBeTruthy();
        expect(onChange).toHaveBeenLastCalledWith("x", "INCOMPLETE");
    });
});
