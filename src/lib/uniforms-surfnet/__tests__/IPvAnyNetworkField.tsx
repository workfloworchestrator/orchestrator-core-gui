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
import fetchMock from "fetch-mock-jest";
import React from "react";
import Select from "react-select";

import IPPrefixTable from "../../../components/IpPrefixTable";
import SplitPrefix from "../../../components/SplitPrefix";
import { IPvAnyNetworkField } from "../src";
import createContext from "./_createContext";
import mount from "./_mount";

test("<IPvAnyNetworkField> - renders an table", () => {
    fetchMock.get("glob:*/api/ipam/prefix_filters", []);
    fetchMock.get("glob:*/api/ipam/ip_blocks/1", []);

    const element = <IPvAnyNetworkField name="x" />;
    const wrapper = mount(element, createContext({ x: { type: String } }));

    expect(wrapper.find(IPPrefixTable)).toHaveLength(1);
    expect(wrapper.find(SplitPrefix)).toHaveLength(0);
});

test("<IPvAnyNetworkField> - does not render an table when preselected", () => {
    fetchMock.get("glob:*/api/ipam/prefix_filters", []);
    fetchMock.get("glob:*/api/ipam/ip_blocks/1", []);

    const element = <IPvAnyNetworkField name="x" prefixMin={23} />;
    const wrapper = mount(element, createContext({ x: { type: String } }));

    expect(wrapper.find(IPPrefixTable)).toHaveLength(0);
    expect(wrapper.find(SplitPrefix)).toHaveLength(0);
});

test("<IPvAnyNetworkField> - renders an table and split component", () => {
    fetchMock.get("glob:*/api/ipam/prefix_filters", []);
    fetchMock.get("glob:*/api/ipam/ip_blocks/1", []);
    fetchMock.get("glob:*/api/ipam/free_subnets/10.0.0.0/16/16", []);

    const element = <IPvAnyNetworkField name="x" />;
    const wrapper = mount(element, createContext({ x: { type: String } }, { model: { x: "10.0.0.0/16" } }));

    expect(wrapper.find(IPPrefixTable)).toHaveLength(1);
    expect(wrapper.find(SplitPrefix)).toHaveLength(1);
});

test("<IPvAnyNetworkField> - renders a split component", () => {
    fetchMock.get("glob:*/api/ipam/prefix_filters", []);
    fetchMock.get("glob:*/api/ipam/ip_blocks/1", []);
    fetchMock.get("glob:*/api/ipam/free_subnets/10.0.0.0/16/16", []);
    const element = <IPvAnyNetworkField name="x" prefixMin={23} />;
    const wrapper = mount(element, createContext({ x: { type: String } }, { model: { x: "10.0.0.0/16" } }));

    expect(wrapper.find(IPPrefixTable)).toHaveLength(0);
    expect(wrapper.find(SplitPrefix)).toHaveLength(1);
});

test("<IPvAnyNetworkField> - renders a label", () => {
    fetchMock.get("glob:*/api/ipam/prefix_filters", []);
    fetchMock.get("glob:*/api/ipam/ip_blocks/1", []);

    const element = <IPvAnyNetworkField name="x" label="y" />;
    const wrapper = mount(element, createContext({ x: { type: String } }));

    expect(wrapper.find("label")).toHaveLength(1);
    expect(wrapper.find("label").text()).toBe("y");
    // expect(wrapper.find("label").prop("htmlFor")).toBe(wrapper.find("input").prop("id"));
});

test("<IPvAnyNetworkField> - renders a wrapper with unknown props", () => {
    fetchMock.get("glob:*/api/ipam/prefix_filters", []);
    fetchMock.get("glob:*/api/ipam/ip_blocks/1", []);

    const element = <IPvAnyNetworkField name="x" data-x="x" data-y="y" data-z="z" />;
    const wrapper = mount(element, createContext({ x: { type: String } }));

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
