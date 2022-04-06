/*
 * Copyright 2019-2022 SURF.
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
import IMS_57514_PORT_JSON from "./data/surf/ims/port_by_ims_service/57514.json";
import PROCESS_ASSIGNEES_JSON from "./data/processes/assignees.json";
import SUBSCRIPTION_PROCESSES_JSON from "./data/processes/process-subscriptions-by-subscription-id/9296e2c4.json";
import PROCESS_STATUSES_JSON from "./data/processes/statuses.json";
import PRODUCTS_JSON from "./data/products.json";
import DOMAIN_MODEL_JSON from "./data/subscriptions/domain-model/ipbgp-9296e2c4.json";
import DOMAIN_MODEL_IPPREFIX_1e7b202f from "./data/subscriptions/domain-model/ipprefix-1e7b202f.json";
import DOMAIN_MODEL_IPPREFIX_1fb1781f from "./data/subscriptions/domain-model/ipprefix-1fb1781f.json";
import IN_USE_BY_JSON from "./data/subscriptions/in_use_by/9296e2c4.json";
import WORKFLOWS_JSON from "./data/subscriptions/workflows/9296e2c4.json";
import CRM_LOCATION_CODES_JSON from "./data/surf/crm/location_codes.json";
import CRM_ORGANISATIONS_JSON from "./data/surf/crm/organisations.json";
import IMS_31420_JSON from "./data/surf/ims/service_by_ims_service_id/31420.json";
import IMS_57514_SERVICE_JSON from "./data/surf/ims/service_by_ims_service_id/57514.json";
import IMS_81150_JSON from "./data/surf/ims/service_by_ims_service_id/81150.json";
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
    mock.onGet("subscriptions/domain-model/1e7b202f-dbe2-47fd-b07b-aa4c98c3d578").reply(
        200,
        DOMAIN_MODEL_IPPREFIX_1e7b202f
    );
    mock.onGet("subscriptions/domain-model/1fb1781f-bddf-4071-853d-a263f49e3c33").reply(
        200,
        DOMAIN_MODEL_IPPREFIX_1fb1781f
    );
    mock.onGet("processes/process-subscriptions-by-subscription-id/pid").reply(200, SUBSCRIPTION_PROCESSES_JSON);
    mock.onGet("processes/statuses").reply(200, PROCESS_STATUSES_JSON);
    mock.onGet("processes/assignees").reply(200, PROCESS_ASSIGNEES_JSON);
    mock.onGet("products").reply(200, PRODUCTS_JSON);
    mock.onGet("subscriptions/workflows/pid").reply(200, WORKFLOWS_JSON);
    mock.onGet("subscriptions/in_use_by/pid").reply(200, IN_USE_BY_JSON);
    mock.onGet("subscriptions/parent_subscriptions/pid").reply(200, IN_USE_BY_JSON); // Deprecated

    // IMS calls
    mock.onGet("surf/ims/service_by_ims_service_id/31420").reply(200, IMS_31420_JSON);
    mock.onGet("surf/ims/service_by_ims_service_id/57514").reply(200, IMS_57514_SERVICE_JSON);
    mock.onGet("surf/ims/service_by_ims_service_id/81150").reply(200, IMS_81150_JSON);
    mock.onGet("surf/ims/port_by_ims_service/57514").reply(200, IMS_57514_PORT_JSON);

    // CRM calls
    mock.onGet("surf/crm/location_codes").reply(200, CRM_LOCATION_CODES_JSON);
    mock.onGet("surf/crm/organisations").reply(200, CRM_ORGANISATIONS_JSON);

    //@ts-ignore
    return <SubscriptionDetailPage match={{ params: { id: "pid" } }} />;
};
