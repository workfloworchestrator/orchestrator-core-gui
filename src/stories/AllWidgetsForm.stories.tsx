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
import FORM from "stories/data/all-widgets-form.json";
import IP_BLOCKS from "stories/data/ip_blocks.json";
import PRODUCTS from "stories/data/products.json";
import SUBSCRIPTION_JSON from "stories/data/subscription.json";
import SN7PortSubscriptions from "stories/data/subscriptions-sn7-ports.json";
import SN8PortSubscriptions from "stories/data/subscriptions-sn8-ports.json";
import { allNodeSubscriptions, contactPersons, freeCorelinkPorts, imsNodes } from "stories/data/UserInputForm.data";
import UserInputContainer from "stories/UserInputContainer";
import { InputForm } from "utils/types";

export default {
    title: "Complete Input widgets form new",
    // Needed to match snapshot file to story, should be done bij injectFileNames but that does not work
    parameters: {
        fileName: __filename
    }
};

function prepare() {
    fetchMock.restore();
    fetchMock.get("/api/ipam/prefix_filters", [{ id: 1, prefix: "10.0.0.0/8", version: 4 }]);
    fetchMock.get("/api/ipam/ip_blocks/1", IP_BLOCKS);
    fetchMock.get("/api/ipam/free_subnets/10.0.0.0/24/25", ["10.0.0.0/25"]);
    fetchMock.get("/api/v2/subscriptions?filter=statuses%2Cactive", allNodeSubscriptions);
    fetchMock.get(
        "/api/v2/subscriptions/ports?filter=tags%2CMSP-MSPNL-SSP%2Cstatuses%2Cactive",
        SN7PortSubscriptions.filter(p => p.status === "active").filter(p =>
            ["MSP", "MSPNL", "SSP"].includes(p.product.tag)
        )
    );
    fetchMock.get("/api/v2/subscriptions?filter=tags%2CIP_PREFIX%2Cstatuses%2Cactive", []);
    fetchMock.get(
        "/api/v2/subscriptions/ports?filter=tags%2CMSP-MSPNL%2Cstatuses%2Cactive",
        SN7PortSubscriptions.filter(p => p.status === "active").filter(p => ["MSP", "MSPNL"].includes(p.product.tag))
    );
    fetchMock.get(
        "/api/v2/subscriptions?filter=tags%2CNode%2Cstatuses%2Cactive",
        SN8PortSubscriptions.filter(p => ["active"].includes(p.status)).filter(p => ["Node"].includes(p.product.tag))
    );
    fetchMock.get(
        "/api/v2/subscriptions?filter=tags%2CNode%2Cstatuses%2Cactive-provisioning",
        SN8PortSubscriptions.filter(p => ["active", "provisioning"].includes(p.status)).filter(p =>
            ["Node"].includes(p.product.tag)
        )
    );
    fetchMock.get(
        "/api/v2/subscriptions?filter=tags%2CIPS%2Cstatuses%2Cactive-provisioning",
        SN8PortSubscriptions.filter(p => p.status === "active").filter(p => ["IPS"].includes(p.product.tag))
    );
    fetchMock.get(
        "/api/v2/subscriptions?filter=tags%2CIPBGP%2Cstatuses%2Cactive-provisioning",
        SN8PortSubscriptions.filter(p => p.status === "active").filter(p => ["IPBGP"].includes(p.product.tag))
    );
    fetchMock.get(
        "/api/v2/subscriptions/ports?filter=tags%2CSP-SPNL-MSC-MSCNL-AGGSP-AGGSPNL%2Cstatuses%2Cactive",
        SN8PortSubscriptions.filter(p => p.status === "active").filter(p =>
            ["SP", "SPNL", "MSC", "MSCNL", "AGGSP", "AGGSPNL"].includes(p.product.tag)
        )
    );
    fetchMock.get(
        "/api/v2/subscriptions/ports?filter=tags%2CSP-SPNL%2Cstatuses%2Cactive",
        SN8PortSubscriptions.filter(p => p.status === "active").filter(p => ["SP", "SPNL"].includes(p.product.tag))
    );
    fetchMock.get("glob:*/api/crm/contacts/*", contactPersons);

    fetchMock.get("glob:*/api/subscriptions/parent_subscriptions/*", []);
    fetchMock.get("glob:*/api/ims/free_ports/*/1000/*", freeCorelinkPorts);
    fetchMock.get("/api/ims/nodes/MT001A/PL", imsNodes);
    fetchMock.get("/api/ims/nodes/Asd001a/IS", imsNodes);
    fetchMock.get("/api/ims/nodes/Asd001a/PL", imsNodes);
    fetchMock.get("/api/subscriptions/b7ed368f-f6d5-497e-9118-2daeb5d06653", SUBSCRIPTION_JSON);
    fetchMock.get("/api/subscriptions/e89776be-16c3-4bee-af98-8e73bf6492a7", SUBSCRIPTION_JSON);
    fetchMock.get("/api/subscriptions/product/2b2125f2-a074-4e44-8d4b-edc677381d46", imsNodes);
    fetchMock.get("/api/subscriptions/tag/IPS/", []);
    fetchMock.get("/api/subscriptions/tag/IPBGP/", []);
    fetchMock.get("/api/products/ieee_interface_types/e89776be-16c3-4bee-af98-8e73bf6492a7", ["1000BASE-T"]);
    fetchMock.get("/api/products/a3bf8b26-50a6-4586-8e58-ad552cb39798", PRODUCTS[0]);
    fetchMock.get("glob:*/api/ims/vlans/*", [[3, 5]]);
}

export const AllWidgetsForm = () => {
    prepare();

    return <UserInputContainer formName="All widgets form" stepUserInput={FORM as InputForm} />;
};
