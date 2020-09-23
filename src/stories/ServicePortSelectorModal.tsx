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

import SN8PortSubscriptions from "./data/subscriptions-sn8-ports.json";
import { allNodeSubscriptions, freeCorelinkPorts } from "./data/UserInputForm.data";
import UserInputContainer from "./UserInputContainer";
import { createForm, imsPortIdProperty } from "./utils";

export const CorelinkAddLink = () => {
    fetchMock.restore();
    fetchMock.get("/api/v2/subscriptions?filter=tags%2CNode%2Cstatuses%2Cactive-provisioning", allNodeSubscriptions);
    fetchMock.get("glob:*/api/ims/free_ports/*/10000/all", freeCorelinkPorts);

    const form = createForm({
        ims_port_id_1: imsPortIdProperty({
            nodeSubscriptionId: "5e3341c2-0017-4d32-9005-56e9b2cbf86c",
            interfaceSpeed: 10000,
            nodeStatuses: ["active", "provisioning"]
        }),
        ims_port_id_2: imsPortIdProperty({
            nodeSubscriptionId: "faf4766b-072c-4494-a8d7-8feaf60e2446",
            interfaceSpeed: 10000,
            nodeStatuses: ["active", "provisioning"]
        })
    });

    return <UserInputContainer formName="Corelink add link form" stepUserInput={form} />;
};
