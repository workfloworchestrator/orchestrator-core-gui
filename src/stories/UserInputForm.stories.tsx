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

import { number } from "@storybook/addon-knobs";
import fetchMock from "fetch-mock";
import React from "react";

import SN7PortSubscriptions from "./data/subscriptions-sn7-ports.json";
import SN8PortSubscriptions from "./data/subscriptions-sn8-ports.json";
import {
    allNodeSubscriptions,
    contactPersons,
    corelinkPorts10G,
    freeCorelinkPorts,
    imsNodes
} from "./data/UserInputForm.data";
import UserInputContainer from "./UserInputContainer";
import {
    Bandwidth,
    ContactPerson,
    ImsNodeId,
    Organisation,
    createForm,
    imsPortIdProperty,
    loadVlanMocks,
    servicePortsProperty
} from "./utils";

export default {
    title: "UserInputForm",
    // Needed to match snapshot file to story, should be done bij injectFileNames but that does not work
    parameters: {
        fileName: __filename
    }
};

export const Contactpersons = () => {
    fetchMock.restore();
    fetchMock.get("/api/v2/subscriptions/ports?filter=tags%2CMSP-SSP-MSPNL%2Cstatuses%2Cactive", []);
    fetchMock.get("/api/v2/subscriptions/ports?filter=tags%2CSP-SPNL%2Cstatuses%2Cactive", []);
    fetchMock.get("/api/v2/subscriptions/all", []);
    fetchMock.get("glob:*/api/crm/contacts/*", contactPersons);

    const form = createForm({ organisation: Organisation, contact_persons: ContactPerson });

    return <UserInputContainer formName="Organisation and contacts" stepUserInput={form} />;
};

export const ServicePort = () => {
    fetchMock.restore();
    fetchMock.get("glob:*/api/ims/free_ports/*", corelinkPorts10G);
    fetchMock.get("/api/ims/nodes/MT001A/IS", imsNodes);

    const form = createForm({
        ims_port_id_1: imsPortIdProperty({
            locationCode: "MT001A",
            interfaceType: "1000BASE-LX"
        })
    });

    return <UserInputContainer formName="Service port form" stepUserInput={form} />;
};

export const Corelink = () => {
    fetchMock.restore();
    fetchMock.get("/api/v2/subscriptions?filter=tags%2CNode%2Cstatuses%2Cactive-provisioning", allNodeSubscriptions);
    fetchMock.get("glob:*/api/ims/free_corelink_ports/*/10000", corelinkPorts10G);

    const form = createForm({
        ims_port_id_1: imsPortIdProperty({ interfaceType: 10000 }),
        ims_port_id_2: imsPortIdProperty({ interfaceType: 10000 })
    });

    return <UserInputContainer formName="Corelink form" stepUserInput={form} />;
};

export const CorelinkAddLink = () => {
    fetchMock.restore();
    fetchMock.get("/api/v2/subscriptions?filter=tags%2CNode%2Cstatuses%2Cactive-provisioning", allNodeSubscriptions);
    fetchMock.get("glob:*/api/ims/free_corelink_ports/*/10000", freeCorelinkPorts);

    const form = createForm({
        ims_port_id_1: imsPortIdProperty({
            nodeSubscriptionId: "5e3341c2-0017-4d32-9005-56e9b2cbf86c",
            interfaceType: 10000
        }),
        ims_port_id_2: imsPortIdProperty({
            nodeSubscriptionId: "faf4766b-072c-4494-a8d7-8feaf60e2446",
            interfaceType: 10000
        })
    });

    return <UserInputContainer formName="Corelink add link form" stepUserInput={form} />;
};

CorelinkAddLink.story = {
    name: "Corelink add link"
};

export const Nodes = () => {
    fetchMock.restore();
    fetchMock.get("/api/v2/subscriptions/ports?filter=tags%2CMSP-SSP-MSPNL%2Cstatuses%2Cactive", []);
    fetchMock.get("/api/v2/subscriptions/ports?filter=tags%2CSP-SPNL%2Cstatuses%2Cactive", []);
    fetchMock.get("/api/v2/subscriptions/all", allNodeSubscriptions);
    fetchMock.get("/api/ims/nodes/MT001A/PL", imsNodes);

    const form = createForm({
        ims_node_id: ImsNodeId
    });

    return <UserInputContainer formName="Node form" stepUserInput={form} />;
};

export const Sn7PortselectAllOrganisations = () => {
    fetchMock.restore();
    fetchMock.get(
        "/api/v2/subscriptions/ports?filter=tags%2CMSP-SSP-MSPNL%2Cstatuses%2Cactive",
        SN7PortSubscriptions.filter(p => p.status === "active")
    );
    fetchMock.get("/api/v2/subscriptions/ports?filter=tags%2CSP-SPNL%2Cstatuses%2Cactive", []);
    fetchMock.get("/api/v2/subscriptions/all", []);
    fetchMock.get("glob:*/api/subscriptions/parent_subscriptions/*", []);
    loadVlanMocks();

    const form = createForm({
        organisation: Organisation,
        bandwidth: Bandwidth,
        service_ports: servicePortsProperty({ tags: ["MSP", "SSP", "MSPNL"] }, 1, 6)
    });

    return <UserInputContainer formName="SN7 portselect form, showing all ports" stepUserInput={form} />;
};

Sn7PortselectAllOrganisations.story = {
    name: "SN7 Portselect all organisations"
};

export const Sn7PortselectMspOnly = () => {
    fetchMock.restore();
    fetchMock.get(
        "/api/v2/subscriptions/ports?filter=tags%2CMSP-MSPNL%2Cstatuses%2Cactive",
        SN7PortSubscriptions.filter(p => p.status === "active").filter(p => ["MSP", "MSPNL"].includes(p.product.tag))
    );
    fetchMock.get("/api/v2/subscriptions/ports?filter=tags%2CSP-SPNL%2Cstatuses%2Cactive", []);
    fetchMock.get("/api/v2/subscriptions/all", []);
    fetchMock.get("glob:*/api/subscriptions/parent_subscriptions/*", []);
    loadVlanMocks();

    const form = createForm({
        organisation: Organisation,
        bandwidth: Bandwidth,
        service_ports: servicePortsProperty({ tags: ["MSP", "MSPNL"] }, 1, 6)
    });

    return <UserInputContainer formName="SN7 portselect form, showing all ports" stepUserInput={form} />;
};

Sn7PortselectMspOnly.story = {
    name: "SN7 Portselect MSP only"
};

export const Sn7PortselectSelectedOrganisation = () => {
    fetchMock.restore();
    fetchMock.get(
        "/api/v2/subscriptions/ports?filter=tags%2CMSP-SSP-MSPNL%2Cstatuses%2Cactive",
        SN7PortSubscriptions.filter(p => p.status === "active")
    );
    fetchMock.get("/api/v2/subscriptions/ports?filter=tags%2CSP-SPNL%2Cstatuses%2Cactive", []);
    fetchMock.get("/api/v2/subscriptions/all", []);
    fetchMock.get("glob:*/api/subscriptions/parent_subscriptions/*", []);
    loadVlanMocks();

    const form = createForm({
        organisation: Organisation,
        bandwidth: Bandwidth,
        service_ports: servicePortsProperty({ organisationKey: "organisation", tags: ["MSP", "SSP", "MSPNL"] }, 1, 6)
    });

    return (
        <UserInputContainer
            formName="SN7 portselect, showing only ports for selected organisation"
            stepUserInput={form}
        />
    );
};

Sn7PortselectSelectedOrganisation.story = {
    name: "SN7 Portselect selected organisation"
};

export const Sn7PortselectBandwidth = () => {
    fetchMock.restore();
    fetchMock.get(
        "/api/v2/subscriptions/ports?filter=tags%2CMSP-SSP-MSPNL%2Cstatuses%2Cactive",
        SN7PortSubscriptions.filter(p => p.status === "active")
    );
    fetchMock.get("/api/v2/subscriptions/ports?filter=tags%2CSP-SPNL%2Cstatuses%2Cactive", []);
    fetchMock.get("/api/v2/subscriptions/all", []);
    fetchMock.get("glob:*/api/subscriptions/parent_subscriptions/*", []);
    fetchMock.get("glob:*/api/fixed_inputs/port_speed_by_subscription_id/*", [1000]);
    loadVlanMocks();

    const form = createForm({
        service_ports: servicePortsProperty({ bandwidthKey: "current_bandwidth", tags: ["MSP", "SSP", "MSPNL"] }, 1),
        current_bandwidth: {
            maximum: 1000000,
            minimum: 0,
            title: "Service Speed",
            type: "integer",
            value: number("bandwidth", 1000)
        },
        new_bandwidth: {
            maximum: 1000000,
            minimum: 0,
            title: "Service Speed",
            type: "integer"
        }
    });

    return <UserInputContainer formName="SN7 portselect form, showing all ports" stepUserInput={form} />;
};

Sn7PortselectBandwidth.story = {
    name: "SN7 Portselect bandwidth"
};

export const Sn8PortselectAllOrganisations = () => {
    fetchMock.restore();
    fetchMock.get("/api/v2/subscriptions/ports?filter=tags%2CSP-SPNL-MSC-MSCNL-AGGSP%2Cstatuses%2Cactive", []);
    fetchMock.get(
        "/api/v2/subscriptions/ports?filter=tags%2CSP-SPNL%2Cstatuses%2Cactive",
        SN8PortSubscriptions.filter(p => p.status === "active")
    );
    fetchMock.get("/api/v2/subscriptions/all", []);
    fetchMock.get("glob:*/api/subscriptions/parent_subscriptions/*", []);
    loadVlanMocks();

    const form = createForm({
        organisation: Organisation,
        bandwidth: Bandwidth,
        service_ports: servicePortsProperty(
            { visiblePortMode: "normal", tags: ["SP", "SPNL", "MSC", "MSCNL", "AGGSP"] },
            2,
            2
        )
    });

    return <UserInputContainer formName="SN8 portselect form, showing all ports" stepUserInput={form} />;
};

Sn8PortselectAllOrganisations.story = {
    name: "SN8 Portselect all organisations"
};

export const Sn8PortselectTagged = () => {
    fetchMock.restore();
    fetchMock.get(
        "/api/v2/subscriptions/ports?filter=tags%2CSP-SPNL%2Cstatuses%2Cactive",
        SN8PortSubscriptions.filter(p => p.status === "active")
            .filter(p => ["SP", "SPNL"].includes(p.product.tag))
            .filter(p => p.port_mode === "tagged")
    );
    fetchMock.get("/api/v2/subscriptions/all", []);
    fetchMock.get("glob:*/api/subscriptions/parent_subscriptions/*", []);
    loadVlanMocks();

    const form = createForm({
        organisation: Organisation,
        bandwidth: Bandwidth,
        service_ports: servicePortsProperty({ visiblePortMode: "tagged", tags: ["SP", "SPNL"] }, 2, 6)
    });

    return <UserInputContainer formName="SN8 portselect form, showing all ports" stepUserInput={form} />;
};

Sn8PortselectTagged.story = {
    name: "SN8 Portselect tagged"
};

export const Sn8PortselectUntagged = () => {
    fetchMock.restore();
    fetchMock.get(
        "/api/v2/subscriptions/ports?filter=tags%2CSP-SPNL%2Cstatuses%2Cactive",
        SN8PortSubscriptions.filter(p => p.status === "active")
            .filter(p => ["SP", "SPNL"].includes(p.product.tag))
            .filter(p => p.port_mode === "untagged")
    );
    fetchMock.get("/api/v2/subscriptions/all", []);
    fetchMock.get("glob:*/api/subscriptions/parent_subscriptions/*", []);
    loadVlanMocks();

    const form = createForm({
        organisation: Organisation,
        bandwidth: Bandwidth,
        service_ports: servicePortsProperty({ visiblePortMode: "untagged", tags: ["SP", "SPNL"] }, 1, 6)
    });

    return <UserInputContainer formName="SN8 portselect form, showing all ports" stepUserInput={form} />;
};

Sn8PortselectUntagged.story = {
    name: "SN8 Portselect untagged"
};

export const Sn8PortselectSelectedOrganisation = () => {
    fetchMock.restore();
    fetchMock.get(
        "/api/v2/subscriptions/ports?filter=tags%2CSP-SPNL-MSC-MSCNL-AGGSP%2Cstatuses%2Cactive",
        SN8PortSubscriptions.filter(p => p.status === "active")
    );
    fetchMock.get("/api/v2/subscriptions/all", []);
    fetchMock.get("glob:*/api/subscriptions/parent_subscriptions/*", []);
    loadVlanMocks();

    const form = createForm({
        organisation: Organisation,
        bandwidth: Bandwidth,
        service_ports: servicePortsProperty(
            {
                organisationKey: "organisation",
                visiblePortMode: "normal",
                tags: ["SP", "SPNL", "MSC", "MSCNL", "AGGSP"]
            },
            1,
            6
        )
    });

    return (
        <UserInputContainer
            formName="SN8 portselect, showing only ports for selected organisation"
            stepUserInput={form}
        />
    );
};

Sn8PortselectSelectedOrganisation.story = {
    name: "SN8 Portselect selected organisation"
};
