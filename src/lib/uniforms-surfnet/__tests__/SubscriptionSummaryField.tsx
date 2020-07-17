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

import waitForComponentToPaint from "__tests__/waitForComponentToPaint";
import fetchMock from "fetch-mock-jest";
import React from "react";

import PRODUCTS from "../../../stories/data/products.json";
import SUBSCRIPTION_JSON from "../../../stories/data/subscription.json";
import SubscriptionSummaryField from "../src/SubscriptionSummaryField";
import createContext from "./_createContext";
import mount from "./_mount";

describe("<SubscriptionSummaryField>", () => {
    test("<SubscriptionSummaryField> - renders inputs", async () => {
        fetchMock.get("glob:*/api/subscriptions/*", SUBSCRIPTION_JSON);
        fetchMock.get("glob:*/api/products/a3bf8b26-50a6-4586-8e58-ad552cb39798", PRODUCTS[22]);

        const element = <SubscriptionSummaryField name="x" />;

        const wrapper = mount(
            element,
            createContext({ x: { type: String, defaultValue: "48f28a55-7764-4c84-9848-964d14906a27" } })
        );
        await waitForComponentToPaint(wrapper);

        expect(wrapper.find("input")).toHaveLength(24);
    });
});

test("<SubscriptionSummaryField> - renders subscription information", async () => {
    fetchMock.get("glob:*/api/subscriptions/*", SUBSCRIPTION_JSON);
    fetchMock.get("glob:*/api/products/a3bf8b26-50a6-4586-8e58-ad552cb39798", PRODUCTS[22]);

    const element = <SubscriptionSummaryField name="x" />;

    const wrapper = mount(
        element,
        createContext({ x: { type: String, defaultValue: "48f28a55-7764-4c84-9848-964d14906a27" } })
    );
    await waitForComponentToPaint(wrapper);

    expect(wrapper.find("input").map(node => node.prop("value"))).toStrictEqual([
        "5203e539-0a11-e511-80d0-005056956c1a",
        "SN8 SURFinternet BGP",
        "active",
        "GRAAFSCHAP IP DTC001A-DTC001A",
        "36261",
        "8beaeb1b-e4ff-4bae-a1f8-6a58d7f37b08",
        "10000",
        "b7ed368f-f6d5-497e-9118-2daeb5d06653",
        "0",
        "1500",
        "166",
        "False",
        "secondary",
        "MD5",
        "default",
        "zoSUWUv8",
        "False",
        "False",
        "65380",
        "default",
        "SN8 SURFinternet BGP",
        "SN8 SURFinternet connection using BGP",
        "IP",
        "IPBGP"
    ]);
});
