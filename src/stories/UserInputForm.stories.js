/*
 * Copyright 2019 SURF.
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

import { number } from "@storybook/addon-knobs";
import UserInputContainer from "./UserInputContainer";
import {
    allNodeSubscriptions,
    contactPersons,
    corelinkPorts10G,
    imsNodes,
    freeCorelinkPorts
} from "./data/UserInputForm.data";
import fetchMock from "fetch-mock";
import { loadVlanMocks } from "./utils";

import SN7PortSubscriptions from "./data/subscriptions-sn7-ports.json";
import SN8PortSubscriptions from "./data/subscriptions-sn8-ports.json";

export default {
    title: "UserInputForm"
};

export const Contactpersons = () => {
    fetchMock.restore();
    fetchMock.get("/api/v2/subscriptions/ports?filter=tags,MSP-SSP-MSPNL&filter=statuses,active", []);
    fetchMock.get("/api/v2/subscriptions/ports?filter=tags,SP-SPNL&filter=statuses,active", []);
    fetchMock.get("/api/v2/subscriptions/all", []);
    fetchMock.get("glob:*/api/crm/contacts/*", contactPersons);
    return (
        <UserInputContainer
            formName="Organisation and contacts"
            stepUserInput={[
                { name: "organisation", type: "organisation" },
                {
                    name: "contact_persons",
                    organisation_key: "organisation",
                    type: "contact_persons"
                }
            ]}
        />
    );
};

export const Corelink = () => {
    fetchMock.restore();
    fetchMock.get("/api/v2/subscriptions/ports?filter=tags,MSP-SSP-MSPNL&filter=statuses,active", []);
    fetchMock.get("/api/v2/subscriptions/ports?filter=tags,SP-SPNL&filter=statuses,active", []);
    fetchMock.get("/api/v2/subscriptions?filter=tags,Node&filter=statuses,active-provisioning", []);
    fetchMock.get("/api/v2/subscriptions/all", allNodeSubscriptions);
    fetchMock.get("glob:*/api/ims/free_corelink_ports/*", corelinkPorts10G);
    return (
        <UserInputContainer
            formName="Corelink form"
            stepUserInput={[
                {
                    service_speed: "1000BASE-LX",
                    name: "ims_port_id_1",
                    type: "corelink",
                    location_code: "MT001A"
                },
                {
                    service_speed: "1000BASE-LX",
                    name: "ims_port_id_2",
                    type: "corelink",
                    location_code: "MT001A"
                }
            ]}
        />
    );
};

export const CorelinkAddLink = () => {
    fetchMock.restore();
    fetchMock.get("/api/v2/subscriptions/ports?filter=tags,MSP-SSP-MSPNL&filter=statuses,active", []);
    fetchMock.get("/api/v2/subscriptions/ports?filter=tags,SP-SPNL&filter=statuses,active", []);
    fetchMock.get("/api/v2/subscriptions?filter=tags,Node&filter=statuses,active-provisioning", []);
    fetchMock.get("/api/v2/subscriptions/all", allNodeSubscriptions);
    fetchMock.get("glob:*/api/ims/free_corelink_ports/*", freeCorelinkPorts);
    return (
        <UserInputContainer
            formName="Corelink add link form"
            stepUserInput={[
                {
                    name: "ims_port_id_1",
                    type: "corelink_add_link",
                    node: "d38d8b25-d9f5-4a25-b1b0-d29057c47420",
                    service_speed: "1000BASE-LX"
                },
                {
                    name: "ims_port_id_2",
                    type: "corelink_add_link",
                    node: "5d2123e6-197d-4bb6-93c6-446d474d98fd",
                    service_speed: "1000BASE-LX"
                }
            ]}
        />
    );
};

CorelinkAddLink.story = {
    name: "Corelink add link"
};

export const Nodes = () => {
    fetchMock.restore();
    fetchMock.get("/api/v2/subscriptions/ports?filter=tags,MSP-SSP-MSPNL&filter=statuses,active", []);
    fetchMock.get("/api/v2/subscriptions/ports?filter=tags,SP-SPNL&filter=statuses,active", []);
    fetchMock.get("/api/v2/subscriptions/all", allNodeSubscriptions);
    fetchMock.get("/api/ims/nodes/MT001A/PL", imsNodes);
    return (
        <UserInputContainer
            formName="Node form"
            stepUserInput={[
                {
                    name: "ims_node_id",
                    type: "nodes_for_location_code_and_status",
                    location_code: "MT001A"
                }
            ]}
        />
    );
};

export const Sn7PortselectAllOrganisations = () => {
    fetchMock.restore();
    fetchMock.get(
        "/api/v2/subscriptions/ports?filter=tags,MSP-SSP-MSPNL&filter=statuses,active",
        SN7PortSubscriptions.filter(p => p.status === "active")
    );
    fetchMock.get("/api/v2/subscriptions/ports?filter=tags,SP-SPNL&filter=statuses,active", []);
    fetchMock.get("/api/v2/subscriptions/all", []);
    fetchMock.get("glob:*/api/subscriptions/parent_subscriptions/*", []);
    loadVlanMocks();
    return (
        <UserInputContainer
            formName="SN7 portselect form, showing all ports"
            stepUserInput={[
                { name: "organisation", type: "organisation" },
                {
                    name: "bandwidth",
                    ports_key: ["service_ports"],
                    readonly: false,
                    type: "bandwidth"
                },
                {
                    maximum: 6,
                    minimum: 1,
                    name: "bgp_ip_service_ports",
                    organisationPortsOnly: false,
                    organisation_key: "organisation",
                    type: "service_ports",
                    mspOnly: false,
                    tags: ["MSP", "SSP", "MSPNL"]
                }
            ]}
        />
    );
};

Sn7PortselectAllOrganisations.story = {
    name: "SN7 Portselect all organisations"
};

export const Sn7PortselectMspOnly = () => {
    fetchMock.restore();
    fetchMock.get(
        "/api/v2/subscriptions/ports?filter=tags,MSP-MSPNL&filter=statuses,active",
        SN7PortSubscriptions.filter(p => p.status === "active").filter(p => ["MSP", "MSPNL"].includes(p.product.tag))
    );
    fetchMock.get("/api/v2/subscriptions/ports?filter=tags,SP-SPNL&filter=statuses,active", []);
    fetchMock.get("/api/v2/subscriptions/all", []);
    fetchMock.get("glob:*/api/subscriptions/parent_subscriptions/*", []);
    loadVlanMocks();
    return (
        <UserInputContainer
            formName="SN7 portselect form, showing all ports"
            stepUserInput={[
                { name: "organisation", type: "organisation" },
                {
                    name: "bandwidth",
                    ports_key: ["service_ports"],
                    readonly: false,
                    type: "bandwidth"
                },
                {
                    maximum: 6,
                    minimum: 1,
                    name: "bgp_ip_service_ports",
                    organisationPortsOnly: false,
                    organisation_key: "organisation",
                    type: "service_ports",
                    mspOnly: true,
                    tags: ["MSP", "MSPNL"]
                }
            ]}
        />
    );
};

Sn7PortselectMspOnly.story = {
    name: "SN7 Portselect MSP only"
};

export const Sn7PortselectSelectedOrganisation = () => {
    fetchMock.restore();
    fetchMock.get(
        "/api/v2/subscriptions/ports?filter=tags,MSP-SSP-MSPNL&filter=statuses,active",
        SN7PortSubscriptions.filter(p => p.status === "active")
    );
    fetchMock.get("/api/v2/subscriptions/ports?filter=tags,SP-SPNL&filter=statuses,active", []);
    fetchMock.get("/api/v2/subscriptions/all", []);
    fetchMock.get("glob:*/api/subscriptions/parent_subscriptions/*", []);
    loadVlanMocks();
    return (
        <UserInputContainer
            formName="SN7 portselect, showing only ports for selected organisation"
            stepUserInput={[
                { name: "organisation", type: "organisation" },
                {
                    name: "bandwidth",
                    ports_key: ["service_ports"],
                    readonly: false,
                    type: "bandwidth"
                },
                {
                    maximum: 6,
                    minimum: 1,
                    name: "bgp_ip_service_ports",
                    organisationPortsOnly: true,
                    organisation_key: "organisation",
                    type: "service_ports",
                    mspOnly: false,
                    tags: ["MSP", "SSP", "MSPNL"]
                }
            ]}
        />
    );
};

Sn7PortselectSelectedOrganisation.story = {
    name: "SN7 Portselect selected organisation"
};

export const Sn7PortselectBandwidth = () => {
    fetchMock.restore();
    fetchMock.get(
        "/api/v2/subscriptions/ports?filter=tags,MSP-SSP-MSPNL&filter=statuses,active",
        SN7PortSubscriptions.filter(p => p.status === "active")
    );
    fetchMock.get("/api/v2/subscriptions/ports?filter=tags,SP-SPNL&filter=statuses,active", []);
    fetchMock.get("/api/v2/subscriptions/all", []);
    fetchMock.get("glob:*/api/subscriptions/parent_subscriptions/*", []);
    fetchMock.get("glob:*/api/fixed_inputs/port_speed_by_subscription_id/*", [1000]);
    loadVlanMocks();
    return (
        <UserInputContainer
            formName="SN7 portselect form, showing all ports"
            stepUserInput={[
                {
                    name: "service_ports",
                    type: "service_ports",
                    bandwidth_key: "current_bandwidth",
                    minimum: 1,
                    tags: ["MSP", "SSP", "MSPNL"]
                },
                {
                    name: "current_bandwidth",
                    type: "bandwidth",
                    readonly: true,
                    value: number("bandwidth", 1000)
                },
                {
                    name: "new_bandwidth",
                    type: "bandwidth",
                    ports_key: "service_ports"
                }
            ]}
        />
    );
};

Sn7PortselectBandwidth.story = {
    name: "SN7 Portselect bandwidth"
};

export const Sn8PortselectAllOrganisations = () => {
    fetchMock.restore();
    fetchMock.get("/api/v2/subscriptions/ports?filter=tags,SP-SPNL-MSC-MSCNL-AGGSP&filter=statuses,active", []);
    fetchMock.get(
        "/api/v2/subscriptions/ports?filter=tags,SP-SPNL&filter=statuses,active",
        SN8PortSubscriptions.filter(p => p.status === "active")
    );
    fetchMock.get("/api/v2/subscriptions/all", []);
    fetchMock.get("glob:*/api/subscriptions/parent_subscriptions/*", []);
    loadVlanMocks();
    return (
        <UserInputContainer
            formName="SN8 portselect form, showing all ports"
            stepUserInput={[
                { name: "organisation", type: "organisation" },
                {
                    name: "bandwidth",
                    ports_key: ["service_ports"],
                    readonly: false,
                    type: "bandwidth"
                },
                {
                    maximum: 2,
                    minimum: 2,
                    name: "bgp_ip_service_ports",
                    organisationPortsOnly: false,
                    organisation_key: "organisation",
                    type: "service_ports_sn8",
                    visiblePortMode: "normal",
                    tags: ["SP", "SPNL", "MSC", "MSCNL", "AGGSP"]
                }
            ]}
        />
    );
};

Sn8PortselectAllOrganisations.story = {
    name: "SN8 Portselect all organisations"
};

export const Sn8PortselectTagged = () => {
    fetchMock.restore();
    fetchMock.get(
        "/api/v2/subscriptions/ports?filter=tags,SP-SPNL&filter=statuses,active",
        SN8PortSubscriptions.filter(p => p.status === "active")
            .filter(p => ["SP", "SPNL"].includes(p.product.tag))
            .filter(p => p.port_mode === "tagged")
    );
    fetchMock.get("/api/v2/subscriptions/all", []);
    fetchMock.get("glob:*/api/subscriptions/parent_subscriptions/*", []);
    loadVlanMocks();
    return (
        <UserInputContainer
            formName="SN8 portselect form, showing all ports"
            stepUserInput={[
                { name: "organisation", type: "organisation" },
                {
                    name: "bandwidth",
                    ports_key: ["service_ports"],
                    readonly: false,
                    type: "bandwidth"
                },
                {
                    maximum: 6,
                    minimum: 2,
                    name: "bgp_ip_service_ports",
                    organisationPortsOnly: false,
                    organisation_key: "organisation",
                    type: "service_ports_sn8",
                    visiblePortMode: "tagged",
                    tags: ["SP", "SPNL"]
                }
            ]}
        />
    );
};

Sn8PortselectTagged.story = {
    name: "SN8 Portselect tagged"
};

export const Sn8PortselectUntagged = () => {
    fetchMock.restore();
    fetchMock.get(
        "/api/v2/subscriptions/ports?filter=tags,SP-SPNL&filter=statuses,active",
        SN8PortSubscriptions.filter(p => p.status === "active")
            .filter(p => ["SP", "SPNL"].includes(p.product.tag))
            .filter(p => p.port_mode === "untagged")
    );
    fetchMock.get("/api/v2/subscriptions/all", []);
    fetchMock.get("glob:*/api/subscriptions/parent_subscriptions/*", []);
    loadVlanMocks();
    return (
        <UserInputContainer
            formName="SN8 portselect form, showing all ports"
            stepUserInput={[
                { name: "organisation", type: "organisation" },
                {
                    name: "bandwidth",
                    ports_key: ["service_ports"],
                    readonly: false,
                    type: "bandwidth"
                },
                {
                    maximum: 6,
                    minimum: 1,
                    name: "bgp_ip_service_ports",
                    organisationPortsOnly: false,
                    organisation_key: "organisation",
                    type: "service_ports_sn8",
                    visiblePortMode: "untagged",
                    tags: ["SP", "SPNL"]
                }
            ]}
        />
    );
};

Sn8PortselectUntagged.story = {
    name: "SN8 Portselect untagged"
};

export const Sn8PortselectSelectedOrganisation = () => {
    fetchMock.restore();
    fetchMock.get(
        "/api/v2/subscriptions/ports?filter=tags,SP-SPNL-MSC-MSCNL-AGGSP&filter=statuses,active",
        SN8PortSubscriptions.filter(p => p.status === "active")
    );
    fetchMock.get("/api/v2/subscriptions/all", []);
    fetchMock.get("glob:*/api/subscriptions/parent_subscriptions/*", []);
    loadVlanMocks();
    return (
        <UserInputContainer
            formName="SN8 portselect, showing only ports for selected organisation"
            stepUserInput={[
                { name: "organisation", type: "organisation" },
                {
                    name: "bandwidth",
                    ports_key: ["service_ports"],
                    readonly: false,
                    type: "bandwidth"
                },
                {
                    maximum: 6,
                    minimum: 1,
                    name: "bgp_ip_service_ports",
                    organisationPortsOnly: true,
                    organisation_key: "organisation",
                    type: "service_ports_sn8",
                    visiblePortMode: "normal",
                    tags: ["SP", "SPNL", "MSC", "MSCNL", "AGGSP"]
                }
            ]}
        />
    );
};

Sn8PortselectSelectedOrganisation.story = {
    name: "SN8 Portselect selected organisation"
};
