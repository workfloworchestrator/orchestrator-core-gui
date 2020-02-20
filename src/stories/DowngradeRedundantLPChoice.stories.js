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

import fetchMock from "fetch-mock";
import { action } from "@storybook/addon-actions";
import { boolean } from "@storybook/addon-knobs";
import { Store } from "@sambego/storybook-state";

import DowngradeRedundantLPChoice from "../components/DowngradeRedundantLPChoice";

import SN8PortSubscriptions from "./data/subscriptions-sn8-ports.json";
import LR_SUBSCRIPTION from "./data/subscription-lr.json";
import LR_SUBSCRIPTION_SAME_PORTS from "./data/subscription-lr-same-ports.json";

const imsServicePrimary = {
    aliases: ["SUBSCRIPTION_ID=9C8C13D5-6954-461A-A931-32894C193AA0"],
    customer_id: "5203E539-0A11-E511-80D0-005056956C1A",
    domain: "SURFNET8",
    endpoints: [
        { id: 12345, type: "service", vlanranges: [{ end: 4, start: 4, sub_circuit_id: null }] },
        { id: 12346, type: "internet", vlanranges: [{ end: 5, start: 5, sub_circuit_id: null }] }
    ],
    extra_info: "10 Gbit/s SN8 SURFinternet BGP in DOETINCHEM van Graafschap College",
    id: 41097,
    location: null,
    name: "DTC001A_DTC001A_IP_BGP_GRAAFSCHAP_9C8C13D5",
    order_id: "SN8 PROCESS 4953FFE3-A2DB-4E90-BCAB-5DD22CD564FD",
    product: "IP",
    speed: "SERVICE",
    status: "3"
};
const imsServiceSecondary = {
    aliases: ["SUBSCRIPTION_ID=9C8C13D5-6954-461A-A931-32894C193AA0"],
    customer_id: "5203E539-0A11-E511-80D0-005056956C1A",
    domain: "SURFNET8",
    endpoints: [
        { id: 12347, type: "service", vlanranges: [{ end: 6, start: 6, sub_circuit_id: null }] },
        { id: 12348, type: "service", vlanranges: [{ end: 7, start: 7, sub_circuit_id: null }] }
    ],
    extra_info: "10 Gbit/s SN8 SURFinternet BGP in DOETINCHEM van Graafschap College",
    id: 41096,
    location: null,
    name: "DTC001A_DTC001A_IP_BGP_GRAAFSCHAP_9C8C13D5",
    order_id: "SN8 PROCESS 4953FFE3-A2DB-4E90-BCAB-5DD22CD564FD",
    product: "IP",
    speed: "SERVICE",
    status: "3"
};

const imsPortServiceSp = { name: "DTC001A_SP_UNTAGGED_GRAAFSCHAP_F9ACBF45", product: "SP" };

const imsPortServiceAggSp = { name: "GN001A_AGGSP_TAGGED_ESNET_2C815189", product: "AGGSP" };

const imsPortServiceMsc = {
    aliases: ["SUBSCRIPTION_ID=9BD8664F-57E1-42D5-A7A8-0D12D379283C"],
    customer_id: "534FC287-0911-E511-80D0-005056956C1A",
    domain: "SURFNET8",
    endpoints: [{ id: 40951, type: "service", vlanranges: [{ end: 4001, start: 4001, sub_circuit_id: null }] }],
    extra_info: "Multi Service Carrier op GN001A for Hogeschool van Amsterdam",
    id: 42936,
    location: null,
    name: "GN001A_MSCNL_TAGGED_HVA_9BD8664F",
    order_id: "PID: 009210BA-5AA9-4A64-A128-099E4B91C4FC",
    product: "SVLAN",
    speed: "SERVICE",
    status: "IS"
};

const imsPortSp = {
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
};

const imsPortAggSp = {
    id: 106207,
    line_name: "GN001A_AGGSP_TAGGED_ESNET_2C815189",
    location: "GN001A",
    node: "GN001A-JNX-HANS81-VTB",
    port: "AE20"
};

const store = new Store({
    value: undefined
});

export default {
    title: "DowngradeRedundantLPChoice",
    parameters: { state: { store: store } }
};

export const DifferentPorts = () => {
    fetchMock.restore();
    fetchMock.get("/api/subscriptions/subscription_id", LR_SUBSCRIPTION);
    fetchMock.get("/api/subscriptions/8a600d14-3901-43e0-89e2-9961294821e4", SN8PortSubscriptions[0]);
    fetchMock.get("/api/subscriptions/85c379b7-fa57-4d36-a033-617c890592ba", SN8PortSubscriptions[2]);
    fetchMock.get("/api/subscriptions/6c9b7b56-7c35-4f18-a8b3-da2b7fa9835b", SN8PortSubscriptions[3]);
    fetchMock.get("/api/subscriptions/46fd5ba3-0a1c-433d-8bc9-ff324a5b4550", SN8PortSubscriptions[4]);

    fetchMock.get("/api/ims/service_by_ims_service_id/41097", imsServicePrimary);
    fetchMock.get("/api/ims/service_by_ims_service_id/41096", imsServiceSecondary);

    fetchMock.get("/api/ims/service_by_ims_service_id/12345", imsPortServiceSp);
    fetchMock.get("/api/ims/port_by_ims_service/12345", imsPortSp);
    fetchMock.get("/api/ims/service_by_ims_service_id/12346", imsPortServiceAggSp);
    fetchMock.get("/api/ims/port_by_ims_service/12346", imsPortAggSp);
    fetchMock.get("/api/ims/service_by_ims_service_id/12347", imsPortServiceSp);
    fetchMock.get("/api/ims/port_by_ims_service/12347", imsPortSp);
    fetchMock.get("/api/ims/service_by_ims_service_id/12348", imsPortServiceSp);
    fetchMock.get("/api/ims/port_by_ims_service/12348", imsPortSp);

    return (
        <DowngradeRedundantLPChoice
            key="subscription_id"
            subscriptionId="subscription_id"
            value={store.state.value}
            readOnly={boolean("readOnly")}
            onChange={e => {
                store.set({ value: e.target.value });
                action("On Change")(e);
            }}
        />
    );
};

export const MscPort = () => {
    fetchMock.restore();
    fetchMock.get("/api/subscriptions/subscription_id", LR_SUBSCRIPTION);
    fetchMock.get("/api/subscriptions/8a600d14-3901-43e0-89e2-9961294821e4", SN8PortSubscriptions[0]);
    fetchMock.get("/api/subscriptions/85c379b7-fa57-4d36-a033-617c890592ba", SN8PortSubscriptions[2]);
    fetchMock.get("/api/subscriptions/6c9b7b56-7c35-4f18-a8b3-da2b7fa9835b", SN8PortSubscriptions[3]);
    fetchMock.get("/api/subscriptions/46fd5ba3-0a1c-433d-8bc9-ff324a5b4550", SN8PortSubscriptions[4]);

    fetchMock.get("/api/ims/service_by_ims_service_id/41097", imsServicePrimary);
    fetchMock.get("/api/ims/service_by_ims_service_id/41096", imsServiceSecondary);

    fetchMock.get("/api/ims/service_by_ims_service_id/12345", imsPortServiceSp);
    fetchMock.get("/api/ims/port_by_ims_service/12345", imsPortSp);
    fetchMock.get("/api/ims/service_by_ims_service_id/12346", imsPortServiceAggSp);
    fetchMock.get("/api/ims/port_by_ims_service/12346", imsPortAggSp);
    fetchMock.get("/api/ims/service_by_ims_service_id/12347", imsPortServiceSp);
    fetchMock.get("/api/ims/port_by_ims_service/12347", imsPortSp);
    fetchMock.get("/api/ims/service_by_ims_service_id/12348", imsPortServiceMsc);

    return (
        <DowngradeRedundantLPChoice
            key="subscription_id"
            subscriptionId="subscription_id"
            value={store.state.value}
            readOnly={boolean("readOnly")}
            onChange={e => {
                store.set({ value: e.target.value });
                action("On Change")(e);
            }}
        />
    );
};

export const SamePorts = () => {
    fetchMock.restore();
    fetchMock.get("/api/subscriptions/subscription_id", LR_SUBSCRIPTION_SAME_PORTS);
    fetchMock.get("/api/subscriptions/8a600d14-3901-43e0-89e2-9961294821e4", SN8PortSubscriptions[0]);
    fetchMock.get("/api/subscriptions/6c9b7b56-7c35-4f18-a8b3-da2b7fa9835b", SN8PortSubscriptions[3]);

    fetchMock.get("/api/ims/service_by_ims_service_id/41097", {
        aliases: ["SUBSCRIPTION_ID=9C8C13D5-6954-461A-A931-32894C193AA0"],
        customer_id: "5203E539-0A11-E511-80D0-005056956C1A",
        domain: "SURFNET8",
        endpoints: [
            { id: 12345, type: "service", vlanranges: [{ end: 4, start: 4, sub_circuit_id: null }] },
            { id: 12346, type: "internet", vlanranges: [{ end: 5, start: 5, sub_circuit_id: null }] }
        ],
        extra_info: "10 Gbit/s SN8 SURFinternet BGP in DOETINCHEM van Graafschap College",
        id: 41097,
        location: null,
        name: "DTC001A_DTC001A_IP_BGP_GRAAFSCHAP_9C8C13D5",
        order_id: "SN8 PROCESS 4953FFE3-A2DB-4E90-BCAB-5DD22CD564FD",
        product: "IP",
        speed: "SERVICE",
        status: "3"
    });

    fetchMock.get("/api/ims/service_by_ims_service_id/41096", {
        aliases: ["SUBSCRIPTION_ID=9C8C13D5-6954-461A-A931-32894C193AA0"],
        customer_id: "5203E539-0A11-E511-80D0-005056956C1A",
        domain: "SURFNET8",
        endpoints: [
            { id: 12345, type: "service", vlanranges: [{ end: 6, start: 6, sub_circuit_id: null }] },
            { id: 12346, type: "service", vlanranges: [{ end: 7, start: 7, sub_circuit_id: null }] }
        ],
        extra_info: "10 Gbit/s SN8 SURFinternet BGP in DOETINCHEM van Graafschap College",
        id: 41096,
        location: null,
        name: "DTC001A_DTC001A_IP_BGP_GRAAFSCHAP_9C8C13D5",
        order_id: "SN8 PROCESS 4953FFE3-A2DB-4E90-BCAB-5DD22CD564FD",
        product: "IP",
        speed: "SERVICE",
        status: "3"
    });

    fetchMock.get("/api/ims/service_by_ims_service_id/12345", imsPortServiceSp);
    fetchMock.get("/api/ims/port_by_ims_service/12345", imsPortSp);
    fetchMock.get("/api/ims/service_by_ims_service_id/12346", imsPortServiceAggSp);
    fetchMock.get("/api/ims/port_by_ims_service/12346", imsPortAggSp);

    return (
        <DowngradeRedundantLPChoice
            key="subscription_id"
            subscriptionId="subscription_id"
            value={store.state.value}
            readOnly={boolean("readOnly")}
            onChange={e => {
                store.set({ value: e.target.value });
                action("On Change")(e);
            }}
        />
    );
};
