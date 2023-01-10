/*
 * Copyright 2019-2023 SURF.
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

import { ComponentMeta, ComponentStory } from "@storybook/react";
import mock from "axios-mock";
import SubscriptionDetailPage from "pages/SubscriptionDetailPage";
import React from "react";
import PROCESS_ASSIGNEES_JSON from "stories/data/processes/assignees.json";
import SUBSCRIPTION_PROCESSES_JSON from "stories/data/processes/process-subscriptions-by-subscription-id/358d5a85.json";
import PROCESS_STATUSES_JSON from "stories/data/processes/statuses.json";
import PRODUCTS_JSON from "stories/data/products.json";
import DOMAIN_MODEL_JSON from "stories/data/subscriptions/domain-model/ipbgp-358d5a85.json";
import DOMAIN_MODEL_IPPREFIX_1254f249 from "stories/data/subscriptions/domain-model/ipprefix-1254f249.json";
import IN_USE_BY_JSON from "stories/data/subscriptions/in_use_by/358d5a85.json";
import WORKFLOWS_JSON from "stories/data/subscriptions/workflows/358d5a85.json";
import CRM_LOCATION_CODES_JSON from "stories/data/surf/crm/location_codes.json";
import CRM_ORGANISATIONS_JSON from "stories/data/surf/crm/organisations.json";
import IMS_57514_PORT_JSON from "stories/data/surf/ims/port_by_ims_service/57514.json";
import IMS_31420_JSON from "stories/data/surf/ims/service_by_ims_service_id/31420.json";
import IMS_57514_SERVICE_JSON from "stories/data/surf/ims/service_by_ims_service_id/57514.json";
import IMS_79119_JSON from "stories/data/surf/ims/service_by_ims_service_id/79119.json";
import IPAM_83138_JSON from "stories/data/surf/ipam/prefix_by_id/83138.json";
import StoryRouter from "storybook-react-router";

export default {
    title: "SubscriptionDetailPage",
    component: SubscriptionDetailPage,
    decorators: [StoryRouter()],
} as ComponentMeta<typeof SubscriptionDetailPage>;

export const Subscription: ComponentStory<typeof SubscriptionDetailPage> = () => {
    mock.reset();

    // Coredb calls
    mock.onGet("subscriptions/domain-model/pid").reply(200, DOMAIN_MODEL_JSON);
    mock.onGet("subscriptions/domain-model/1254f249-a798-42e8-9a8b-58e4a784e869").reply(
        200,
        DOMAIN_MODEL_IPPREFIX_1254f249
    );
    mock.onGet("processes/process-subscriptions-by-subscription-id/pid").reply(200, SUBSCRIPTION_PROCESSES_JSON);
    mock.onGet("processes/statuses").reply(200, PROCESS_STATUSES_JSON);
    mock.onGet("processes/assignees").reply(200, PROCESS_ASSIGNEES_JSON);
    mock.onGet("products").reply(200, PRODUCTS_JSON);
    mock.onGet("subscriptions/workflows/pid").reply(200, WORKFLOWS_JSON);
    mock.onGet("subscriptions/in_use_by/pid").reply(200, IN_USE_BY_JSON);
    mock.onGet("subscriptions/parent_subscriptions/pid").reply(200, IN_USE_BY_JSON); // Deprecated

    mock.onPost("subscriptions/subscriptions_for_in_used_by_ids", ["cbf30313-a490-4f06-ac8a-7e07face0280"]).reply(200, {
        "cbf30313-a490-4f06-ac8a-7e07face0280": {
            subscription_id: "358d5a85-49c2-46e2-ac5c-f55601957282",
            start_date: 1646755090.029193,
            description: "ASTRON IP HB001A 100 Mbit/s",
            status: "active",
            product_id: "7a980481-8d2e-4779-9f51-3a29e8c88ad5",
            customer_id: "7c41e5e3-0911-e511-80d0-005056956c1a",
            insync: true,
            note: null,
            name: null,
            end_date: null,
            product: {
                product_id: "7a980481-8d2e-4779-9f51-3a29e8c88ad5",
                name: "SN8 SURFinternet BGP",
                description: "SN8 SURFinternet connection using BGP",
                product_type: "IP",
                status: "active",
                tag: "IPBGP",
                created_at: 1553023488.477112,
                end_date: null,
            },
            customer_descriptions: [],
            tag: null,
        },
    });

    // IMS calls
    mock.onGet("surf/ims/service_by_ims_service_id/31420").reply(200, IMS_31420_JSON);
    mock.onGet("surf/ims/service_by_ims_service_id/57514").reply(200, IMS_57514_SERVICE_JSON);
    mock.onGet("surf/ims/service_by_ims_service_id/79119").reply(200, IMS_79119_JSON);
    mock.onGet("surf/ims/port_by_ims_service/57514").reply(200, IMS_57514_PORT_JSON);

    // CRM calls
    mock.onGet("surf/crm/location_codes").reply(200, CRM_LOCATION_CODES_JSON);
    mock.onGet("surf/crm/organisations").reply(200, CRM_ORGANISATIONS_JSON);
    mock.onGet("surf/crm/dienstafname/undefined").reply(422, {
        detail: [{ loc: ["path", "subscription_id"], msg: "value is not a valid uuid", type: "type_error.uuid" }],
    });

    // IPAM calls
    mock.onGet("surf/ipam/prefix_by_id/83138").reply(200, IPAM_83138_JSON);

    //@ts-ignore
    return <SubscriptionDetailPage match={{ params: { id: "pid" } }} />;
};
