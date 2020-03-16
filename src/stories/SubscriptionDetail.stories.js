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

import StoryRouter from "storybook-react-router";
import fetchMock from "fetch-mock";

import SubscriptionDetail from "../pages/SubscriptionDetail";

import PRODUCTS from "./data/products.json";
import SN8PortSubscriptions from "./data/subscriptions-sn8-ports.json";
import SUBSCRIPTION_JSON from "./data/subscription.json";

export default {
    title: "SubscriptionDetail",
    decorators: [StoryRouter()]
};

export const Subscription = () => {
    fetchMock.restore();

    fetchMock.get("/api/subscriptions/pid", SUBSCRIPTION_JSON);
    fetchMock.get("/api/processes/process-subscriptions-by-subscription-id/9c8c13d5-6954-461a-a931-32894c193aa0", [
        {
            created_at: 1574768649,
            id: "bfe5050d-0d1c-4149-baaf-834610d1d450",
            pid: "4953ffe3-a2db-4e90-bcab-5dd22cd564fd",
            process: {
                assignee: "SYSTEM",
                created_by: "urn:collab:person:surfnet.nl:vanbaekel",
                customer_id: "5203e539-0a11-e511-80d0-005056956c1a",
                failed_reason: null,
                last_modified_at: 1574768652,
                last_status: "completed",
                last_step: "Done",
                pid: "4953ffe3-a2db-4e90-bcab-5dd22cd564fd",
                product_id: "40128a3f-1303-48be-bda0-375bb3299432",
                started_at: 1574768648,
                traceback: null,
                workflow: "migrate_sn7_ip_bgp_ipss_to_sn8"
            },
            subscription_id: "9c8c13d5-6954-461a-a931-32894c193aa0",
            workflow_target: "CREATE"
        }
    ]);

    fetchMock.get(
        "/api/products/a3bf8b26-50a6-4586-8e58-ad552cb39798",
        PRODUCTS.filter(p => p.product_id === "a3bf8b26-50a6-4586-8e58-ad552cb39798")[0]
    );

    fetchMock.get("/api/v2/subscriptions/workflows/9c8c13d5-6954-461a-a931-32894c193aa0", {
        create: [{ description: "Create SN8 IP BGP", name: "create_sn8_ip_bgp" }],
        modify: [
            { description: "Change port", name: "modify_sn8_ip_bgp_change_port" },
            { description: "Change a SN8 IP BGP subscription", name: "modify_sn8_ip_bgp" }
        ],
        terminate: [{ description: "Terminate SN8 IP BGP", name: "terminate_sn8_ip_bgp" }],
        system: [{ description: "Validate SN8 IP BGP", name: "validate_sn8_ip_bgp" }]
    });

    fetchMock.get("/api/subscriptions/parent_subscriptions/9c8c13d5-6954-461a-a931-32894c193aa0", []);
    fetchMock.get("/api/ims/service_by_ims_service_id/36261", {
        aliases: ["SUBSCRIPTION_ID=9C8C13D5-6954-461A-A931-32894C193AA0"],
        customer_id: "5203E539-0A11-E511-80D0-005056956C1A",
        domain: "SURFNET8",
        endpoints: [
            { id: 36260, type: "service", vlanranges: [{ end: 0, start: 0, sub_circuit_id: null }] },
            { id: 31420, type: "internet", vlanranges: [{ end: 0, start: 0, sub_circuit_id: null }] }
        ],
        extra_info: "10 Gbit/s SN8 SURFinternet BGP in DOETINCHEM van Graafschap College",
        id: 36261,
        location: null,
        name: "DTC001A_DTC001A_IP_BGP_GRAAFSCHAP_9C8C13D5",
        order_id: "SN8 PROCESS 4953FFE3-A2DB-4E90-BCAB-5DD22CD564FD",
        product: "IP",
        speed: "SERVICE",
        status: "3"
    });
    fetchMock.get("/api/ims/service_by_ims_service_id/36260", {
        aliases: ["SUBSCRIPTION_ID=F9ACBF45-4BFD-45DB-892C-774EB967B033"],
        customer_id: "5203E539-0A11-E511-80D0-005056956C1A",
        domain: null,
        endpoints: [{ id: 683015, type: "port", vlanranges: null }],
        extra_info: "10 Gbit/s SP te DOETINCHEM van Graafschap College",
        id: 36260,
        location: null,
        name: "DTC001A_SP_UNTAGGED_GRAAFSCHAP_F9ACBF45",
        order_id: "SNNP-77718",
        product: "SP",
        speed: "10GBASE-SR",
        status: "3"
    });

    fetchMock.get("/api/ims/service_by_ims_service_id/31420", {
        aliases: [],
        customer_id: "C9B5E717-0B11-E511-80D0-005056956C1A",
        domain: null,
        endpoints: [],
        extra_info: null,
        id: 31420,
        location: null,
        name: "SURFINTERNETWOLK",
        order_id: "XX",
        product: "SURFMULTIPOINT",
        speed: "INTERNETWOLK",
        status: "3"
    });
    fetchMock.get("/api/ims/port_by_ims_service/36260", {
        connector_type: "LC/PC",
        fiber_type: "multi-mode",
        id: 683015,
        iface_type: "10GBASE-SR",
        line_name: "DTC001A_SP_UNTAGGED_GRAAFSCHAP_F9ACBF45",
        location: "DTC001A",
        node: "DTC001A-JNX-02",
        patchposition: "DTC001A_ODF01/02 ()",
        port: "0/1/1",
        status: "3"
    });
    fetchMock.get("/api/subscriptions/b7ed368f-f6d5-497e-9118-2daeb5d06653", SN8PortSubscriptions[0]);
    fetchMock.get("/api/ipam/prefix_by_id/166", {
        addresses: [
            {
                address: "145.145.4.26",
                description: null,
                fqdn: "graafschap-router.customer.surf.net",
                id: 1635,
                mac: null,
                name: "graafschap-router.customer.surf.net",
                prefix: 166,
                prefix__label: "default(4): 145.145.4.24/30",
                state: 1,
                state__label: "Default Resource: Ready",
                tags: ["ip", "Customer", "orchestrator"],
                vrf: 1,
                vrf__label: "global"
            },
            {
                address: "145.145.4.25",
                description: null,
                fqdn: "e0-1-1-0.dtc001a-jnx-01.surf.net",
                id: 1634,
                mac: null,
                name: "e0-1-1-0.dtc001a-jnx-01.surf.net",
                prefix: 166,
                prefix__label: "default(4): 145.145.4.24/30",
                state: 1,
                state__label: "Default Resource: Ready",
                tags: ["ip", "SURFnet", "orchestrator"],
                vrf: 1,
                vrf__label: "global"
            }
        ],
        afi: "4",
        asn: 1,
        asn__label: "AS1103 (SURFnet)",
        description: "Ptp for 9c8c13d5-6954-461a-a931-32894c193aa0 d9713a9f-bab6-4e78-b56e-5c5cc2c1fb26",
        id: 166,
        parent: 8,
        parent__label: "default(4): 145.145.0.0/18",
        prefix: "145.145.4.24/30",
        state: 1,
        state__label: "Default Resource: Ready",
        sub_prefixes: [],
        tags: ["ip", "orchestrator"],
        vrf: 1,
        vrf__label: "global"
    });
    fetchMock.get("/api/v2/crm/dienstafname/9c8c13d5-6954-461a-a931-32894c193aa0", {
        guid: "d9713a9f-bab6-4e78-b56e-5c5cc2c1fb26",
        code: "MSP",
        status: "_Opgezegd"
    });

    return <SubscriptionDetail match={{ params: { id: "pid" } }} />;
};
