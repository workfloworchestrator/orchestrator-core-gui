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

import { action } from "@storybook/addon-actions";
import SubscriptionProductTagSelect from "../components/SubscriptionProductTagSelect";

import fetchMock from "fetch-mock";

import SN7PortSubscriptions from "./data/subscriptions-sn7-ports.json";

export default {
    title: "SubscriptionProductTagSelect"
};

export const OnlyTags = () => {
    fetchMock.restore();
    fetchMock.get("/api/subscriptions/tag/SP%2CMSP/", SN7PortSubscriptions);
    return <SubscriptionProductTagSelect onChange={action("clicked")} tags={["SP", "MSP"]} />;
};

OnlyTags.story = {
    name: "Only tags"
};

export const FilteredOnProduct = () => {
    fetchMock.restore();
    fetchMock.get("/api/subscriptions/tag/SP%2CMSP/", SN7PortSubscriptions);
    return (
        <SubscriptionProductTagSelect
            onChange={action("clicked")}
            tags={["SP", "MSP"]}
            // Fetch MSP 1G
            productId="efbe1235-93df-49ee-bbba-e51434e0be17"
        />
    );
};

FilteredOnProduct.story = {
    name: "Filtered on Product"
};

export const FilteredOnProductWithExcludedSubs = () => {
    fetchMock.restore();
    fetchMock.get("/api/subscriptions/tag/SP%2CMSP/", SN7PortSubscriptions);
    return (
        <SubscriptionProductTagSelect
            onChange={action("clicked")}
            tags={["SP", "MSP"]}
            // Fetch MSP 1G
            productId="efbe1235-93df-49ee-bbba-e51434e0be17"
            excludedSubscriptionIds={["ac8c28ba-60e8-4d31-9d42-6c04a616677b", "83c6facb-8764-4adf-8fb7-79923b111b38"]}
        />
    );
};

FilteredOnProductWithExcludedSubs.story = {
    name: "Filtered on Product with excluded subs"
};
