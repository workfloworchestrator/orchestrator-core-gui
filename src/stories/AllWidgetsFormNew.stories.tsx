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

import fetchMock from "fetch-mock";
import React from "react";
import { InputForm } from "utils/types";

import FORM_NEW from "./data/all-widgets-form-new.json";
import PRODUCTS from "./data/products.json";
import SUBSCRIPTION_JSON from "./data/subscription.json";
import SN7PortSubscriptions from "./data/subscriptions-sn7-ports.json";
import SN8PortSubscriptions from "./data/subscriptions-sn8-ports.json";
import { allNodeSubscriptions, contactPersons, freeCorelinkPorts, imsNodes } from "./data/UserInputForm.data";
import UserInputContainer from "./UserInputContainer";

export default {
    title: "Complete Input widgets form new",
    // Needed to match snapshot file to story, should be done bij injectFileNames but that does not work
    parameters: {
        fileName: __filename
    }
};

function prepare() {
    fetchMock.restore();
    fetchMock.get("/api/v2/subscriptions/all", allNodeSubscriptions);
    fetchMock.get(
        "/api/v2/subscriptions/ports?filter=tags,MSP-MSPNL-SSP&filter=statuses,active",
        SN7PortSubscriptions.filter(p => p.status === "active").filter(p =>
            ["MSP", "MSPNL", "SSP"].includes(p.product.tag)
        )
    );
    fetchMock.get(
        "/api/v2/subscriptions/ports?filter=tags,MSP-MSPNL&filter=statuses,active",
        SN7PortSubscriptions.filter(p => p.status === "active").filter(p => ["MSP", "MSPNL"].includes(p.product.tag))
    );
    fetchMock.get(
        "/api/v2/subscriptions?filter=tags,Node&filter=statuses,active-provisioning",
        SN8PortSubscriptions.filter(p => ["active", "provisioning"].includes(p.status)).filter(p =>
            ["Node"].includes(p.product.tag)
        )
    );
    fetchMock.get(
        "/api/v2/subscriptions/ports?filter=tags,IPS&filter=statuses,active",
        SN8PortSubscriptions.filter(p => p.status === "active").filter(p => ["IPS"].includes(p.product.tag))
    );
    fetchMock.get(
        "/api/v2/subscriptions/ports?filter=tags,IPBGP&filter=statuses,active",
        SN8PortSubscriptions.filter(p => p.status === "active").filter(p => ["IPBGP"].includes(p.product.tag))
    );
    fetchMock.get(
        "/api/v2/subscriptions/ports?filter=tags,SP-SPNL-MSC-MSCNL-AGGSP-AGGSPNL&filter=statuses,active",
        SN8PortSubscriptions.filter(p => p.status === "active").filter(p =>
            ["SP", "SPNL", "MSC", "MSCNL", "AGGSP", "AGGSPNL"].includes(p.product.tag)
        )
    );
    fetchMock.get(
        "/api/v2/subscriptions/ports?filter=tags,SP-SPNL&filter=statuses,active",
        SN8PortSubscriptions.filter(p => p.status === "active").filter(p => ["SP", "SPNL"].includes(p.product.tag))
    );
    fetchMock.get("glob:*/api/crm/contacts/*", contactPersons);

    fetchMock.get("glob:*/api/subscriptions/parent_subscriptions/*", []);
    fetchMock.get("glob:*/api/ims/free_corelink_ports/*", freeCorelinkPorts);
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

export const AllWidgetsFormNew = () => {
    prepare();

    return <UserInputContainer formName="Corelink form" stepUserInput={FORM_NEW as InputForm} />;
};
