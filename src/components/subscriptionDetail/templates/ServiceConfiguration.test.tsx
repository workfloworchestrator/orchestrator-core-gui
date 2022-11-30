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

import withApplicationContext from "__tests__/withApplicationContext";
import withQueryClientContext from "__tests__/withQueryClientContext";
import { ENV } from "env";
import { mount } from "enzyme";

import { RenderServiceConfiguration } from "./ServiceConfiguration";

const data = {
    subscriptionId: "70201206-05d3-4486-8fa8-e778d1efc9e1",
    subscriptionInstances: [
        [
            "firewall",
            {
                name: "FW",
                subscription_instance_id: "da3bf1ea-37fa-466c-bfb0-4c115fed3fd5",
                owner_subscription_id: "70201206-05d3-4486-8fa8-e778d1efc9e1",
                label: null,
                asn: 1,
                customer_asn: 2,
                l2_endpoints: [
                    {
                        name: "FW L2 Endpoint",
                        subscription_instance_id: "47e9dc18-231a-4a3c-8c12-a15ee9e15d89",
                        owner_subscription_id: "70201206-05d3-4486-8fa8-e778d1efc9e1",
                        label: null,
                        endpoint_description: "l2 endpoint test 1",
                        in_use_by_ids: ["0ff4d09d-062a-48c4-ab52-406754c47fe8", "764fdsf3-062a-48c4-ab52-406754c47fe8"],
                    },
                    {
                        name: "FW L2 Endpoint",
                        subscription_instance_id: "47e9dc18-231a-4a3c-8c12-a15ee9e15d90",
                        owner_subscription_id: "70201206-05d3-4486-8fa8-e778d1efc9e1",
                        label: null,
                        endpoint_description: "l2 endpoint test 2",
                        in_use_by_ids: [],
                    },
                ],
                l3_endpoints: [
                    {
                        name: "FW L3 Endpoint",
                        subscription_instance_id: "c658fad7-5f38-458f-bfe2-600bad3055e2",
                        owner_subscription_id: "70201206-05d3-4486-8fa8-e778d1efc9e1",
                        label: null,
                        endpoint_description: "l3 endpoint test",
                        in_use_by_ids: ["0ff4d09d-062a-48c4-ab52-406754c47fe8"],
                        related_subscription: {
                            name: "SN8 Service Port",
                            subscription_instance_id: "47e9dc18-231a-4a3c-8c12-a15ee1111111",
                            owner_subscription_id: "70201206-05d3-4486-8fa8-e778d1e11111",
                            description: "Service port test diff owner",
                            vlanrange: "6",
                        },
                    },
                ],
            },
        ],
    ],
    inUseBySubscriptions: {
        "0ff4d09d-062a-48c4-ab52-406754c47fe8": {
            subscription_id: "96e6092f-e0b5-4769-b3ae-1be3244bb48b",
            start_date: 1658317097.727405,
            description: "TEST L2VPN 1 Gbit/s",
            status: "active",
            product_id: "ad1694ba-9c4a-496c-85ec-82d16a6d5b50",
            customer_id: "0c43b714-0a11-e511-80d0-005056956c1a",
            insync: true,
            note: null,
            name: null,
            end_date: null,
            product: {
                product_id: "ad1694ba-9c4a-496c-85ec-82d16a6d5b50",
                name: "L2VPN",
                description: "L2VPN",
                product_type: "L2VPN",
                status: "active",
                tag: "L2VPN",
                created_at: 1580831567.084876,
                end_date: 1596492000,
            },
            customer_descriptions: [],
            tag: null,
        },
        "764fdsf3-062a-48c4-ab52-406754c47fe8": {
            subscription_id: "96e6092f-e0b5-4769-b3ae-1be3244bb49a",
            start_date: 1658317097.727405,
            description: "TEST L2VPN 2 Gbit/s",
            status: "active",
            product_id: "ad1694ba-9c4a-496c-85ec-82d16a6d5b50",
            customer_id: "0c43b714-0a11-e511-80d0-005056956c1a",
            insync: true,
            note: null,
            name: null,
            end_date: null,
            product: {
                product_id: "ad1694ba-9c4a-496c-85ec-82d16a6d5b50",
                name: "L2VPN",
                description: "L2VPN",
                product_type: "L2VPN",
                status: "active",
                tag: "L2VPN",
                created_at: 1580831567.084876,
                end_date: 1596492000,
            },
            customer_descriptions: [],
            tag: null,
        },
    },
};

describe("RenderServiceConfiguration", () => {
    ENV.IMS_URL = "https://ims-test/forms/";
    test("Should render correctly", () => {
        const wrapper = mount(
            withQueryClientContext(
                withApplicationContext(
                    <RenderServiceConfiguration
                        subscription_id={data.subscriptionId}
                        subscriptionInstances={data.subscriptionInstances}
                        inUseBySubscriptions={data.inUseBySubscriptions}
                    />
                )
            )
        );
        expect(wrapper.debug()).toMatchSnapshot();
    });

    test("Should correctly render with related subscriptions", () => {
        const wrapper = mount(
            withQueryClientContext(
                withApplicationContext(
                    <RenderServiceConfiguration
                        subscription_id={data.subscriptionId}
                        subscriptionInstances={data.subscriptionInstances}
                        inUseBySubscriptions={data.inUseBySubscriptions}
                        isExpandedView={true}
                    />
                )
            )
        );
        expect(wrapper.debug()).toMatchSnapshot();
    });

    test("Should correctly expand and collapse an expandable row", () => {
        const wrapper = mount(
            withQueryClientContext(
                withApplicationContext(
                    <RenderServiceConfiguration
                        subscription_id={data.subscriptionId}
                        subscriptionInstances={data.subscriptionInstances}
                        inUseBySubscriptions={data.inUseBySubscriptions}
                    />
                )
            )
        );
        const tabButton = wrapper.find({ children: "FW L2 Endpoint" });
        tabButton.at(0).simulate("click");

        const button = wrapper.find({ children: "expand" }).first();
        expect(button.text()).toEqual("expand");
        button.at(0).simulate("click");

        expect(button.text()).toEqual("collapse");
        expect(wrapper.debug()).toMatchSnapshot();

        button.at(0).simulate("click");
        expect(button.text()).toEqual("expand");
    });
});
