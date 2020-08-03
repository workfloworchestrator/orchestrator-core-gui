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
import ReactSelect from "react-select";
import { IMSPort, Subscription } from "utils/types";

import waitForComponentToPaint from "../../../__tests__/waitForComponentToPaint";
import ImsPortIdField from "../src/ImsPortIdField";
import createContext from "./_createContext";
import mount from "./_mount";

describe("<ImsPortIdField>", () => {
    test("<ImsPortIdField> - renders inputs legacy", async () => {
        fetchMock.get("glob:*/api/ims/nodes/MT001A/IS", [{ id: 1, name: "name", status: "IS" }]);
        fetchMock.get("glob:*/api/v2/subscriptions?filter=tags%2CNode%2Cstatuses%2Cactive-provisioning", [{}]);
        const element = <ImsPortIdField name="x" locationCode="MT001A" interfaceType="1000BASE-LX" />;

        const wrapper = mount(element, createContext({ x: { type: Number } }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find(ReactSelect)).toHaveLength(2);
        expect(
            wrapper
                .find(ReactSelect)
                .at(0)
                .props()
        ).toMatchObject({
            options: [{ label: "name", value: "1" }],
            value: undefined,
            isDisabled: false
        });
        expect(
            wrapper
                .find(ReactSelect)
                .at(1)
                .props()
        ).toMatchObject({ options: [], value: undefined, isDisabled: true, placeholder: "First select a node" });
    });

    test("<ImsPortIdField> - reacts on change inputs legacy", async () => {
        fetchMock.get("glob:*/api/ims/nodes/MT001A/IS", [{ id: 1, name: "name", status: "IS" }]);
        fetchMock.get("glob:*/api/v2/subscriptions?filter=tags%2CNode%2Cstatuses%2Cactive-provisioning", [{}]);
        fetchMock.get("glob:*/api/ims/free_ports/1/1000BASE-LX/free/patched", [
            { id: 1, iface_type: "iface_type", port: "0/0/0", status: "IS" }
        ] as IMSPort[]);
        const element = <ImsPortIdField name="x" locationCode="MT001A" interfaceType="1000BASE-LX" />;

        const wrapper = mount(element, createContext({ x: { type: Number } }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find(ReactSelect)).toHaveLength(2);
        wrapper
            .find(ReactSelect)
            .at(0)
            .invoke("onChange")({ label: "name", value: "1" });
        await waitForComponentToPaint(wrapper);
        expect(
            wrapper
                .find(ReactSelect)
                .at(0)
                .props()
        ).toMatchObject({
            options: [{ label: "name", value: "1" }],
            value: { label: "name", value: "1" },
            isDisabled: false
        });
        expect(
            wrapper
                .find(ReactSelect)
                .at(1)
                .props()
        ).toMatchObject({
            options: [{ label: "0/0/0 (IS) (iface_type)", value: 1 }],
            value: undefined,
            isDisabled: false,
            placeholder: "Select a port"
        });
    });

    test("<ImsPortIdField> - renders inputs", async () => {
        fetchMock.get("glob:*/api/v2/subscriptions?filter=tags%2CNode%2Cstatuses%2Cactive-provisioning", [
            { subscription_id: "abcdefghij", name: "name", status: "active", description: "description" }
        ] as Subscription[]);
        const element = <ImsPortIdField name="x" interfaceType={1000} />;

        const wrapper = mount(element, createContext({ x: { type: Number } }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find(ReactSelect)).toHaveLength(2);
        expect(
            wrapper
                .find(ReactSelect)
                .at(0)
                .props()
        ).toMatchObject({
            options: [{ label: "abcdefgh description", value: "abcdefghij" }],
            value: undefined,
            isDisabled: false
        });
        expect(
            wrapper
                .find(ReactSelect)
                .at(1)
                .props()
        ).toMatchObject({ options: [], value: undefined, isDisabled: true, placeholder: "First select a node" });
    });

    test("<ImsPortIdField> - reacts on change inputs", async () => {
        fetchMock.get("glob:*/api/v2/subscriptions?filter=tags%2CNode%2Cstatuses%2Cactive-provisioning", [
            { subscription_id: "abcdefghij", name: "name", status: "active", description: "description" }
        ] as Subscription[]);
        fetchMock.get("glob:*/api/ims/free_corelink_ports/abcdefghij/1000", [
            { id: 1, iface_type: "iface_type", port: "0/0/0", status: "IS" }
        ] as IMSPort[]);
        const element = <ImsPortIdField name="x" interfaceType={1000} />;

        const wrapper = mount(element, createContext({ x: { type: Number } }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find(ReactSelect)).toHaveLength(2);
        wrapper
            .find(ReactSelect)
            .at(0)
            .invoke("onChange")({ label: "abcdefgh description", value: "abcdefghij" });
        await waitForComponentToPaint(wrapper);
        expect(
            wrapper
                .find(ReactSelect)
                .at(0)
                .props()
        ).toMatchObject({
            options: [{ label: "abcdefgh description", value: "abcdefghij" }],
            value: { label: "abcdefgh description", value: "abcdefghij" },
            isDisabled: false
        });
        expect(
            wrapper
                .find(ReactSelect)
                .at(1)
                .props()
        ).toMatchObject({
            options: [{ label: "0/0/0 (IS) (iface_type)", value: 1 }],
            value: undefined,
            isDisabled: false,
            placeholder: "Select a port"
        });
    });

    test("<ImsPortIdField> - renders inputs node set", async () => {
        fetchMock.get("glob:*/api/v2/subscriptions?filter=tags%2CNode%2Cstatuses%2Cactive-provisioning", [
            { subscription_id: "abcdefghij", name: "name", status: "active", description: "description" }
        ] as Subscription[]);
        fetchMock.get("glob:*/api/ims/free_corelink_ports/abcdefghij/1000", [
            { id: 1, iface_type: "iface_type", port: "0/0/0", status: "IS" }
        ] as IMSPort[]);

        const element = <ImsPortIdField name="x" nodeSubscriptionId="abcdefghij" interfaceType={1000} />;

        const wrapper = mount(element, createContext({ x: { type: Number } }));
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find(ReactSelect)).toHaveLength(2);
        expect(
            wrapper
                .find(ReactSelect)
                .at(0)
                .props()
        ).toMatchObject({
            options: [{ label: "abcdefgh description", value: "abcdefghij" }],
            value: { label: "abcdefgh description", value: "abcdefghij" },
            isDisabled: true
        });
        expect(
            wrapper
                .find(ReactSelect)
                .at(1)
                .props()
        ).toMatchObject({
            options: [{ label: "0/0/0 (IS) (iface_type)", value: 1 }],
            value: undefined,
            isDisabled: false,
            placeholder: "Select a port"
        });
    });
});
