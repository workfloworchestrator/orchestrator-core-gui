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
import withSubscriptions from "lib/uniforms-surfnet/__tests__/_withSubscriptions";
import { ListField, VlanField } from "lib/uniforms-surfnet/src";
import React from "react";
import { NestField } from "uniforms-unstyled";

describe("<VlanField>", () => {
    test("<VlanField> - renders an input", async () => {
        const element = <VlanField name="x" />;
        const wrapper = mount(element, createContext({ x: { type: String } }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(1);
    });

    test("<VlanField> - renders an input with correct disabled state", async () => {
        const element = <VlanField name="x" disabled />;
        const wrapper = mount(element, createContext({ x: { type: String } }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(1);
        expect(wrapper.find("input").prop("disabled")).toBe(true);
    });

    test("<VlanField> - renders an input with correct id (inherited)", async () => {
        const element = <VlanField name="x" />;
        const wrapper = mount(element, createContext({ x: { type: String } }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(1);
        expect(wrapper.find("input").prop("id")).toBeTruthy();
    });

    test("<VlanField> - renders an input with correct id (specified)", async () => {
        const element = <VlanField name="x" id="y" />;
        const wrapper = mount(element, createContext({ x: { type: String } }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(1);
        expect(wrapper.find("input").prop("id")).toBe("y");
    });

    test("<VlanField> - renders an input with correct name", async () => {
        const element = <VlanField name="x" />;
        const wrapper = mount(element, createContext({ x: { type: String } }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(1);
        expect(wrapper.find("input").prop("name")).toBe("x");
    });

    test("<VlanField> - renders an input with correct placeholder (no port chosen)", async () => {
        const element = <VlanField name="x" />;
        const wrapper = mount(element, createContext({ x: { type: String } }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(1);
        expect(wrapper.find("input").prop("placeholder")).toBe("First select a Service Port...");
    });

    test("<VlanField> - renders an input with correct placeholder (port chosen)", async () => {
        mock.onGet("ims/vlans/abc").reply(200, []);

        const element = <VlanField name="x" />;
        const wrapper = mount(element, createContext({ x: { type: String } }, { model: { subscription_id: "abc" } }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(1);
        expect(wrapper.find("input").prop("placeholder")).toBe("Enter a valid VLAN range...");
    });

    test("<VlanField> - renders an input with correct type", async () => {
        const element = <VlanField name="x" />;
        const wrapper = mount(element, createContext({ x: { type: String } }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(1);
        expect(wrapper.find("input").prop("type")).toBe("text");
    });

    test("<VlanField> - renders an input with correct value (default)", async () => {
        const element = <VlanField name="x" />;
        const wrapper = mount(element, createContext({ x: { type: String } }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(1);
        expect(wrapper.find("input").prop("value")).toBe("");
    });

    test("<VlanField> - renders an input with correct value (model)", async () => {
        const element = <VlanField name="x" />;
        const wrapper = mount(element, createContext({ x: { type: String } }, { model: { x: "2" } }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(1);
        expect(wrapper.find("input").prop("value")).toBe("2");
    });

    test("<VlanField> - renders an input with correct value (specified)", async () => {
        const element = <VlanField name="x" value="2" />;
        const wrapper = mount(element, createContext({ x: { type: String } }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(1);
        expect(wrapper.find("input").prop("value")).toBe("2");
    });

    test("<VlanField> - changes value based on portMode (not chosen)", async () => {
        const onChange = jest.fn();
        const { element, getSubscription } = withSubscriptions(<VlanField name="x" />);
        getSubscription.mockReturnValue({ port_mode: "tagged" });

        const wrapper = mount(element, createContext({ x: { type: String } }, { onChange, model: { x: "10" } }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(1);
        expect(onChange).toHaveBeenLastCalledWith("x", "");
    });

    test("<VlanField> - changes value based on portMode (untagged)", async () => {
        mock.onGet("ims/vlans/abc").reply(200, []);

        const onChange = jest.fn();
        const { element, getSubscription } = withSubscriptions(<VlanField name="x" />);
        getSubscription.mockReturnValue({ port_mode: "untagged" });

        const wrapper = mount(
            element,
            createContext({ x: { type: String } }, { onChange, model: { x: "2", subscription_id: "abc" } })
        );
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(1);
        expect(onChange).toHaveBeenLastCalledWith("x", "0");
    });

    test("<VlanField> - changes value based on portMode (tagged)", async () => {
        mock.onGet("ims/vlans/abc").reply(200, []);

        const onChange = jest.fn();
        const { element, getSubscription } = withSubscriptions(<VlanField name="x" />);
        getSubscription.mockReturnValue({ port_mode: "tagged" });

        const wrapper = mount(
            element,
            createContext({ x: { type: String } }, { onChange, model: { x: "0", subscription_id: "abc" } })
        );
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(1);
        expect(onChange).toHaveBeenLastCalledWith("x", "");
    });

    test("<VlanField> - renders an input that is correctly enabled/disabled based on portMode (not chosen)", async () => {
        const { element, getSubscription } = withSubscriptions(<VlanField name="x" />);
        getSubscription.mockReturnValue({ port_mode: "untagged" });

        const wrapper = mount(element, createContext({ x: { type: String } }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(1);
        expect(wrapper.find("input").prop("disabled")).toBe(true);
    });

    test("<VlanField> - renders an input that is correctly enabled/disabled based on portMode (untagged)", async () => {
        mock.onGet("ims/vlans/abc").reply(200, []);

        const { element, getSubscription } = withSubscriptions(<VlanField name="x" />);
        getSubscription.mockReturnValue({ port_mode: "untagged" });

        const wrapper = mount(
            element,
            createContext({ x: { type: String } }, { model: { x: "0", subscription_id: "abc" } })
        );
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(1);
        expect(wrapper.find("input").prop("disabled")).toBe(true);
        expect(wrapper.find(".euiFormRow__text")).toHaveLength(2);

        // First form label is is used as label for the form element. Second one for error under input.
        // @ts-ignore
        expect(wrapper.find(".euiFormRow__text").getNodesInternal()[1].props["children"]).toBe(
            "VLAN is only relevant for SN7 MSP or SN8 SP in tagged mode, not for link_member or untagged ports."
        );
        // expect(fetchMock).toHaveFetchedTimes(1, "glob:*/api/ims/vlans/abc");
        expect(wrapper.render()).toMatchSnapshot();
    });

    test("<VlanField> - renders an input that is correctly enabled/disabled based on portMode (untagged with used vlans)", async () => {
        mock.onGet("ims/vlans/abc").reply(200, [[0, 0]]);

        const { element, getSubscription } = withSubscriptions(<VlanField name="x" />);
        getSubscription.mockReturnValue({ port_mode: "untagged" });

        const wrapper = mount(
            element,
            createContext({ x: { type: String } }, { model: { x: "0", subscription_id: "abc" } })
        );
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(1);
        expect(wrapper.find("input").prop("disabled")).toBe(true);
        expect(wrapper.find(".euiFormRow__text")).toHaveLength(2);
        // First form label is is used as label for the form element. Second one for error under input.
        // @ts-ignore
        expect(
            wrapper
                .find(".euiFormRow__text")
                .at(1)
                .prop("children")
        ).toBe("VLAN is only relevant for SN7 MSP or SN8 SP in tagged mode, not for link_member or untagged ports.");
        // expect(fetchMock).toHaveFetchedTimes(1, "glob:*/api/ims/vlans/abc");
        expect(wrapper.render()).toMatchSnapshot();
    });

    test("<VlanField> - renders an input that is correctly enabled/disabled based on portMode (tagged)", async () => {
        mock.onGet("ims/vlans/abc").reply(200, []);

        const { element, getSubscription } = withSubscriptions(<VlanField name="x" />);
        getSubscription.mockReturnValue({ port_mode: "tagged" });

        const wrapper = mount(element, createContext({ x: { type: String } }, { model: { subscription_id: "abc" } }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(1);
        expect(wrapper.find("input").prop("disabled")).toBe(false);
        expect(wrapper.find(".euiFormRow__text")).toHaveLength(2);
        // First form label is is used as label for the form element. Second one for error under input.
        // @ts-ignore
        expect(
            wrapper
                .find(".euiFormRow__text")
                .at(1)
                .prop("children")
        ).toBe("This service port has no VLANs in use (yet).");
        // expect(fetchMock).toHaveFetchedTimes(1, "glob:*/api/ims/vlans/abc");
        expect(wrapper.render()).toMatchSnapshot();
    });

    test("<VlanField> - renders an input that is correctly enabled/disabled based on portMode (tagged with used Vlans)", async () => {
        mock.onGet("ims/vlans/abc").reply(200, [
            [3, 6],
            [10, 10]
        ]);

        const { element, getSubscription } = withSubscriptions(<VlanField name="x" />);
        getSubscription.mockReturnValue({ port_mode: "tagged" });

        const wrapper = mount(element, createContext({ x: { type: String } }, { model: { subscription_id: "abc" } }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(1);
        expect(wrapper.find("input").prop("disabled")).toBe(false);
        expect(wrapper.find(".euiFormRow__text")).toHaveLength(2);
        expect(
            wrapper
                .find(".euiFormRow__text")
                .at(1)
                .prop("children")
        ).toBe("Already used VLAN ranges for this service port: 3-6,10");
        // expect(fetchMock).toHaveFetchedTimes(1, "glob:*/api/ims/vlans/abc");
        expect(wrapper.render()).toMatchSnapshot();
    });

    test("<VlanField> - adds vlans taken in same list as used vlans", async () => {
        mock.onGet("ims/vlans/abc").reply(200, []);
        mock.onGet("ims/vlans/def").reply(200, []);

        const { element, getSubscription } = withSubscriptions(
            <ListField name="x">
                <NestField name="$">
                    <VlanField name="y" />
                </NestField>
            </ListField>
        );
        getSubscription.mockReturnValue({ port_mode: "tagged" });

        const wrapper = mount(
            element,
            createContext(
                { x: { type: Array }, "x.$": { type: Object }, "x.$.y": { type: String } },
                {
                    model: {
                        x: [
                            { subscription_id: "abc", y: "2,3" },
                            { subscription_id: "abc", y: "3" },
                            { subscription_id: "def", y: "3" }
                        ]
                    }
                }
            )
        );
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(3);
        expect(
            wrapper
                .find(".euiFormRow__text")
                .at(0)
                .props("children")["children"]
        ).toBe("Already used VLAN ranges for this service port: 3");
        // TODO: Sort is missing or some weird effect with the fetch mock?
        // expect(
        //     wrapper
        //         .find(".euiFormRow__text")
        //         .at(1)
        //         .props("children")["children"]
        // ).toBe("Already used VLAN ranges for this service port: 2-3");
        // expect(
        //     wrapper
        //         .find(".euiFormRow__text")
        //         .at(2)
        //         .props("children")["children"]
        // ).toBe("This service port has no VLANs in use (yet).");

        // expect(fetchMock).toHaveFetchedTimes(2, "glob:*/api/ims/vlans/abc");
        // expect(fetchMock).toHaveFetchedTimes(1, "glob:*/api/ims/vlans/def");
        expect(wrapper.render()).toMatchSnapshot();
    });

    test("<VlanField> - renders an input which correctly reacts on change", async () => {
        const onChange = jest.fn();

        const element = <VlanField name="x" />;
        const wrapper = mount(element, createContext({ x: { type: String } }, { onChange }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(1);
        expect(wrapper.find("input").simulate("change", { target: { value: "y" } })).toBeTruthy();
        expect(onChange).toHaveBeenLastCalledWith("x", "y");
    });

    test("<VlanField> - renders an input which correctly reacts on change (empty)", async () => {
        const onChange = jest.fn();

        const element = <VlanField name="x" />;
        const wrapper = mount(element, createContext({ x: { type: String } }, { onChange }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(1);
        expect(wrapper.find("input").simulate("change", { target: { value: "" } })).toBeTruthy();
        expect(onChange).toHaveBeenLastCalledWith("x", "");
    });

    test("<VlanField> - renders an input which correctly reacts on change (same value)", async () => {
        const onChange = jest.fn();

        const element = <VlanField name="x" />;
        const wrapper = mount(element, createContext({ x: { type: String } }, { model: { x: "y" }, onChange }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(1);
        expect(wrapper.find("input").simulate("change", { target: { value: "y" } })).toBeTruthy();
        expect(onChange).toHaveBeenLastCalledWith("x", "y");
    });

    test("<VlanField> - renders extra errors correctly (untagged and taken)", async () => {
        mock.onGet("ims/vlans/abc").reply(200, [[0, 0]]);

        const { element, getSubscription } = withSubscriptions(<VlanField name="x" showInlineError={true} />);
        getSubscription.mockReturnValue({ port_mode: "untagged" });

        const wrapper = mount(
            element,
            createContext({ x: { type: String } }, { model: { x: "0", subscription_id: "abc" } })
        );
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(1);
        expect(wrapper.find(".euiFormHelpText")).toHaveLength(1);
        // Not sure why we can't use "euiFormErrorText" here, not sure if the error is in the render...
        expect(
            wrapper
                .at(0)
                .children()
                .getNodeInternal().rendered.props.children.props["error"]
        ).toBe("This service port is already in use and cannot be chosen");
        // expect(fetchMock).toHaveFetchedTimes(1, "glob:*/api/ims/vlans/abc");
    });

    test("<VlanField> - renders extra errors correctly (invalid format)", async () => {
        mock.onGet("ims/vlans/abc").reply(200, []);

        const { element, getSubscription } = withSubscriptions(<VlanField name="x" showInlineError={true} />);
        getSubscription.mockReturnValue({ port_mode: "untagged" });

        const wrapper = mount(
            element,
            createContext({ x: { type: String } }, { model: { x: "abc", subscription_id: "abc" } })
        );
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(1);
        expect(wrapper.find(".euiFormHelpText")).toHaveLength(1);
        expect(wrapper.find(".euiFormHelpText").text()).toBe(
            "VLAN is only relevant for SN7 MSP or SN8 SP in tagged mode, not for link_member or untagged ports."
        );
        // expect(fetchMock).toHaveFetchedTimes(1, "glob:*/api/ims/vlans/abc");
    });

    test("<VlanField> - renders extra errors correctly (tagged and taken)", async () => {
        mock.onGet("ims/vlans/abc").reply(200, [[2, 2]]);

        const { element, getSubscription } = withSubscriptions(<VlanField name="x" showInlineError={true} />);
        getSubscription.mockReturnValue({ port_mode: "tagged" });

        const wrapper = mount(
            element,
            createContext({ x: { type: String } }, { model: { x: "2", subscription_id: "abc" } })
        );
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(1);
        expect(wrapper.find(".euiFormHelpText")).toHaveLength(1);
        expect(wrapper.find(".euiFormHelpText").text()).toBe("Already used VLAN ranges for this service port: 2");
        // expect(fetchMock).toHaveFetchedTimes(1, "glob:*/api/ims/vlans/abc");
    });

    test("<VlanField> - renders extra errors correctly (ims error)", async () => {
        mock.onGet("ims/vlans/abc").reply(400, []);

        const { element, getSubscription } = withSubscriptions(<VlanField name="x" showInlineError={true} />);
        getSubscription.mockReturnValue({ port_mode: "tagged" });

        const wrapper = mount(
            element,
            createContext({ x: { type: String } }, { model: { x: "2", subscription_id: "abc" } })
        );
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(1);
        expect(wrapper.find(".euiFormHelpText")).toHaveLength(1);
        // Todo: fix next line
        // expect(wrapper.find(".euiFormHelpText").text()).toBe(
        //     "This service port can not be found in IMS. It may be deleted or in an initial state."
        // );
        // expect(fetchMock).toHaveFetchedTimes(1, "glob:*/api/ims/vlans/abc");
    });

    test("<VlanField> - renders a label", async () => {
        const element = <VlanField name="x" label="y" />;
        const wrapper = mount(element, createContext({ x: { type: String } }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("label")).toHaveLength(1);
        expect(wrapper.find("label").text()).toBe("y");
        expect(wrapper.find("label").prop("htmlFor")).toBe(wrapper.find("input").prop("id"));
    });

    test("<VlanField> - renders a wrapper with unknown props", async () => {
        const element = <VlanField name="x" data-x="x" data-y="y" data-z="z" />;
        const wrapper = mount(element, createContext({ x: { type: String } }));
        await waitForComponentToPaint(wrapper);

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
});
