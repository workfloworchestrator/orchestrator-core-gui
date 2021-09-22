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
        fileName: __filename,
    },
};

function prepare() {
    mock.reset();
    mock.onGet("surf/ipam/prefix_filters").reply(200, [{ id: 1, prefix: "10.0.0.0/8", version: 4 }]);
    mock.onGet("surf/ipam/ip_blocks/1").reply(200, IP_BLOCKS);
    mock.onGet("surf/ipam/free_subnets/10.0.0.0/24/25").reply(200, ["10.0.0.0/25"]);
    mock.onGet("subscriptions/?filter=statuses%2Cactive").reply(200, { allNodeSubscriptions });
    mock.onGet("surf/subscriptions/ports?filter=tags%2CMSP-MSPNL-SSP%2Cstatuses%2Cactive").reply(
        200,
        SN7PortSubscriptions.filter((p) => p.status === "active").filter((p) =>
            ["MSP", "MSPNL", "SSP"].includes(p.product.tag)
        )
    );
    mock.onGet("subscriptions/?filter=tags%2CIP_PREFIX%2Cstatuses%2Cactive").reply(200, []);
    mock.onGet("surf/subscriptions/ports?filter=tags%2CMSP-MSPNL%2Cstatuses%2Cactive").reply(
        200,
        SN7PortSubscriptions.filter((p) => p.status === "active").filter((p) =>
            ["MSP", "MSPNL"].includes(p.product.tag)
        )
    );
    mock.onGet("subscriptions/?filter=tags%2CNode%2Cstatuses%2Cactive").reply(
        200,
        SN8PortSubscriptions.filter((p) => ["active"].includes(p.status)).filter((p) =>
            ["Node"].includes(p.product.tag)
        )
    );
    mock.onGet("subscriptions/?filter=tags%2CNode%2Cstatuses%2Cactive-provisioning").reply(
        200,
        SN8PortSubscriptions.filter((p) => ["active", "provisioning"].includes(p.status)).filter((p) =>
            ["Node"].includes(p.product.tag)
        )
    );
    mock.onGet("subscriptions/?filter=tags%2CIPS%2Cstatuses%2Cactive-provisioning").reply(
        200,
        SN8PortSubscriptions.filter((p) => p.status === "active").filter((p) => ["IPS"].includes(p.product.tag))
    );
    mock.onGet("subscriptions/?filter=tags%2CIPBGP%2Cstatuses%2Cactive-provisioning").reply(
        200,
        SN8PortSubscriptions.filter((p) => p.status === "active").filter((p) => ["IPBGP"].includes(p.product.tag))
    );
    mock.onGet("surf/subscriptions/ports?filter=tags%2CSP-SPNL-MSC-MSCNL-AGGSP-AGGSPNL%2Cstatuses%2Cactive").reply(
        200,
        SN8PortSubscriptions.filter((p) => p.status === "active").filter((p) =>
            ["SP", "SPNL", "MSC", "MSCNL", "AGGSP", "AGGSPNL"].includes(p.product.tag)
        )
    );
    mock.onGet("surf/subscriptions/ports?filter=tags%2CSP-SPNL%2Cstatuses%2Cactive").reply(
        200,
        SN8PortSubscriptions.filter((p) => p.status === "active").filter((p) => ["SP", "SPNL"].includes(p.product.tag))
    );
    mock.onGet(/surf\/crm\/contacts\/.*/).reply(200, contactPersons);

    mock.onGet(/subscriptions\/parent_subscriptions\/.*/).reply(200, []);
    mock.onGet(/surf\/ims\/free_ports\/.*\/1000\/.*/).reply(200, freeCorelinkPorts);
    mock.onGet("surf/ims/nodes/MT001A/PL?unsubscribed_only=true").reply(200, imsNodes);
    mock.onGet("surf/ims/nodes/Asd001a/IS").reply(200, imsNodes);
    mock.onGet("surf/ims/nodes/Asd001a/PL?unsubscribed_only=true").reply(200, imsNodes);
    mock.onGet("surf/subscriptions/b7ed368f-f6d5-497e-9118-2daeb5d06653").reply(200, SUBSCRIPTION_JSON);
    mock.onGet("surf/subscriptions/e89776be-16c3-4bee-af98-8e73bf6492a7").reply(200, SUBSCRIPTION_JSON);
    mock.onGet("subscriptions/workflows/e89776be-16c3-4bee-af98-8e73bf6492a7").reply(200, {
        create: [{ description: "Create SN8 IP BGP", name: "create_sn8_ip_bgp" }],
        modify: [
            { description: "Change port", name: "modify_sn8_ip_bgp_change_port" },
            { description: "Change a SN8 IP BGP subscription", name: "modify_sn8_ip_bgp" },
        ],
        terminate: [{ description: "Terminate SN8 IP BGP", name: "terminate_sn8_ip_bgp" }],
        system: [{ description: "Validate SN8 IP BGP", name: "validate_sn8_ip_bgp" }],
    });
    mock.onGet("surf/subscriptions/product/2b2125f2-a074-4e44-8d4b-edc677381d46").reply(200, imsNodes);
    mock.onGet("surf/subscriptions/tag/IPS/").reply(200, []);
    mock.onGet("surf/subscriptions/tag/IPBGP/").reply(200, []);
    mock.onGet("surf/products/ieee_interface_types/e89776be-16c3-4bee-af98-8e73bf6492a7").reply(200, ["1000BASE-T"]);
    mock.onGet("products/a3bf8b26-50a6-4586-8e58-ad552cb39798").reply(200, PRODUCTS[0]);
    mock.onGet(/surf\/subscriptions\/vlans-by-service-port\/.*/).reply(200, [[3, 5]]);
}

export const AllWidgetsForm = () => {
    prepare();

    return <UserInputContainer formName="All widgets form" stepUserInput={FORM as InputForm} />;
};
