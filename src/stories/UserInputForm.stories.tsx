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

import mock from "axios-mock";
import React from "react";
import SN8PortSubscriptions from "stories/data/subscriptions-sn8-ports.json";
import {
    allNodeSubscriptions,
    contactPersons,
    corelinkPorts10G,
    freeCorelinkPorts,
    imsNodes,
} from "stories/data/UserInputForm.data";
import UserInputContainer from "stories/UserInputContainer";
import {
    Bandwidth,
    ContactPerson,
    ImsNodeId,
    Organisation,
    createForm,
    imsPortIdProperty,
    loadVlanMocks,
    servicePortsProperty,
} from "stories/utils";

export default {
    title: "UserInputForm",
    // Needed to match snapshot file to story, should be done bij injectFileNames but that does not work
    parameters: {
        fileName: __filename,
    },
};

export const Contactpersons = () => {
    mock.onGet("surf/subscriptions/ports?filter=tags%2CMSP-SSP-MSPNL%2Cstatuses%2Cactive").reply(200, []);
    mock.onGet("surf/subscriptions/ports?filter=tags%2CSP-SPNL%2Cstatuses%2Cactive").reply(200, []);
    mock.onGet("subscriptions/all").reply(200, []);
    mock.onGet(/surf\/crm\/contacts\/.*/).reply(200, contactPersons);

    const form = createForm({ organisation: Organisation, contact_persons: ContactPerson });

    return <UserInputContainer formName="Organisation and contacts" stepUserInput={form} />;
};

export const Corelink = () => {
    mock.onGet("subscriptions/?filter=tags%2CNode%2Cstatuses%2Cactive-provisioning").reply(200, allNodeSubscriptions);
    mock.onGet("subscriptions/?filter=tags,Node,statuses,active-provisioning").reply(200, allNodeSubscriptions);
    mock.onGet(/surf\/ims\/free_ports\/.*\/10000\/all/).reply(200, corelinkPorts10G);

    const form = createForm({
        ims_port_id_1: imsPortIdProperty({ interfaceSpeed: 10000, nodeStatuses: ["active", "provisioning"] }),
        ims_port_id_2: imsPortIdProperty({ interfaceSpeed: 10000, nodeStatuses: ["active", "provisioning"] }),
    });

    return <UserInputContainer formName="Corelink form" stepUserInput={form} />;
};

export const CorelinkAddLink = () => {
    mock.onGet("subscriptions/?filter=tags%2CNode%2Cstatuses%2Cactive-provisioning").reply(200, allNodeSubscriptions);
    mock.onGet(/surf\/ims\/free_ports\/.*\/10000\/all/).reply(200, freeCorelinkPorts);

    const form = createForm({
        ims_port_id_1: imsPortIdProperty({
            nodeSubscriptionId: "5e3341c2-0017-4d32-9005-56e9b2cbf86c",
            interfaceSpeed: 10000,
            nodeStatuses: ["active", "provisioning"],
        }),
        ims_port_id_2: imsPortIdProperty({
            nodeSubscriptionId: "faf4766b-072c-4494-a8d7-8feaf60e2446",
            interfaceSpeed: 10000,
            nodeStatuses: ["active", "provisioning"],
        }),
    });

    return <UserInputContainer formName="Corelink add link form" stepUserInput={form} />;
};

CorelinkAddLink.storyName = "Corelink add link";

export const Nodes = () => {
    mock.onGet("surf/subscriptions/ports?filter=tags%2CMSP-SSP-MSPNL%2Cstatuses%2Cactive").reply(200, []);
    mock.onGet("surf/subscriptions/ports?filter=tags%2CSP-SPNL%2Cstatuses%2Cactive").reply(200, []);
    mock.onGet("subscriptions/all").reply(200, allNodeSubscriptions);
    mock.onGet("surf/ims/nodes/MT001A/PL?unsubscribed_only=true").reply(200, imsNodes);

    const form = createForm({
        ims_node_id: ImsNodeId,
    });

    return <UserInputContainer formName="Node form" stepUserInput={form} />;
};

export const Sn8PortselectAllOrganisations = () => {
    mock.onGet("surf/subscriptions/ports?filter=tags%2CSP-SPNL-MSC-MSCNL-AGGSP%2Cstatuses%2Cactive").reply(200, []);
    mock.onGet("surf/subscriptions/ports?filter=tags%2CSP-SPNL%2Cstatuses%2Cactive").reply(
        200,
        SN8PortSubscriptions.filter((p) => p.status === "active")
    );
    mock.onGet("subscriptions/all").reply(200, []);
    mock.onGet(/subscriptions\/parent_subscriptions\/.*/).reply(200, []);
    loadVlanMocks();

    const form = createForm({
        organisation: Organisation,
        bandwidth: Bandwidth,
        service_ports: servicePortsProperty(
            { visiblePortMode: "normal", tags: ["SP", "SPNL", "MSC", "MSCNL", "AGGSP"] },
            2,
            2
        ),
    });

    return <UserInputContainer formName="SN8 portselect form, showing all ports" stepUserInput={form} />;
};

Sn8PortselectAllOrganisations.storyName = "SN8 Portselect all organisations";

export const Sn8PortselectTagged = () => {
    mock.onGet("surf/subscriptions/ports?filter=tags%2CSP-SPNL%2Cstatuses%2Cactive").reply(
        200,
        SN8PortSubscriptions.filter((p) => p.status === "active")
            .filter((p) => ["SP", "SPNL"].includes(p.product.tag))
            .filter((p) => p.port_mode === "tagged")
    );
    mock.onGet("subscriptions/all").reply(200, []);
    mock.onGet(/subscriptions\/parent_subscriptions\/.*/).reply(200, []);
    loadVlanMocks();

    const form = createForm({
        organisation: Organisation,
        bandwidth: Bandwidth,
        service_ports: servicePortsProperty({ visiblePortMode: "tagged", tags: ["SP", "SPNL"] }, 2, 6),
    });

    return <UserInputContainer formName="SN8 portselect form, showing all ports" stepUserInput={form} />;
};

Sn8PortselectTagged.storyName = "SN8 Portselect tagged";

export const Sn8PortselectUntagged = () => {
    mock.onGet("/api/surf/subscriptions/ports?filter=tags%2CSP-SPNL%2Cstatuses%2Cactive").reply(
        200,
        SN8PortSubscriptions.filter((p) => p.status === "active")
            .filter((p) => ["SP", "SPNL"].includes(p.product.tag))
            .filter((p) => p.port_mode === "untagged")
    );
    mock.onGet("/api/subscriptions/all").reply(200, []);
    mock.onGet(/subscriptions\/parent_subscriptions\/.*/).reply(200, []);
    loadVlanMocks();

    const form = createForm({
        organisation: Organisation,
        bandwidth: Bandwidth,
        service_ports: servicePortsProperty({ visiblePortMode: "untagged", tags: ["SP", "SPNL"] }, 1, 6),
    });

    return <UserInputContainer formName="SN8 portselect form, showing all ports" stepUserInput={form} />;
};

Sn8PortselectUntagged.storyName = "SN8 Portselect untagged";

export const Sn8PortselectSelectedOrganisation = () => {
    mock.onGet("surf/subscriptions/ports?filter=tags%2CSP-SPNL-MSC-MSCNL-AGGSP%2Cstatuses%2Cactive").reply(
        200,
        SN8PortSubscriptions.filter((p) => p.status === "active")
    );
    mock.onGet("subscriptions/all").reply(200, []);
    mock.onGet(/subscriptions\/parent_subscriptions\/.*/).reply(200, []);
    loadVlanMocks();

    const form = createForm({
        organisation: Organisation,
        bandwidth: Bandwidth,
        service_ports: servicePortsProperty(
            {
                organisationKey: "organisation",
                visiblePortMode: "normal",
                tags: ["SP", "SPNL", "MSC", "MSCNL", "AGGSP"],
            },
            1,
            6
        ),
    });

    return (
        <UserInputContainer
            formName="SN8 portselect, showing only ports for selected organisation"
            stepUserInput={form}
        />
    );
};

Sn8PortselectSelectedOrganisation.storyName = "SN8 Portselect selected organisation";
