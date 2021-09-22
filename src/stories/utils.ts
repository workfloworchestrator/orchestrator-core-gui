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
import { JSONSchema6 } from "json-schema";

export function vlanData() {
    let vlans = [];

    if (Math.random() * 3 >= 1) {
        const single = Math.floor(Math.random() * 10);
        vlans.push([single]);
    }
    if (Math.random() * 2 >= 1) {
        const start = Math.floor(Math.random() * 400) + 10;
        const end = Math.floor(Math.random() * 400) + 10 + start;
        vlans.push([start, end]);
    }
    return vlans;
}

export function loadVlanMocks() {
    mock.onGet(/subscriptions\/vlans-by-service-port\/0.*/).reply(200, vlanData());
    mock.onGet(/subscriptions\/vlans-by-service-port\/1.*/).reply(200, vlanData(), {
        overwriteRoutes: false,
    });
    mock.onGet(/subscriptions\/vlans-by-service-port\/2.*/).reply(200, vlanData(), {
        overwriteRoutes: false,
    });
    mock.onGet(/subscriptions\/vlans-by-service-port\/3.*/).reply(200, vlanData(), {
        overwriteRoutes: false,
    });
    mock.onGet(/subscriptions\/vlans-by-service-port\/4.*/).reply(200, vlanData(), {
        overwriteRoutes: false,
    });
    mock.onGet(/subscriptions\/vlans-by-service-port\/5.*/).reply(200, vlanData(), {
        overwriteRoutes: false,
    });
    mock.onGet(/subscriptions\/vlans-by-service-port\/6.*/).reply(200, vlanData(), {
        overwriteRoutes: false,
    });
    mock.onGet(/subscriptions\/vlans-by-service-port\/7.*/).reply(200, vlanData(), {
        overwriteRoutes: false,
    });
    mock.onGet(/subscriptions\/vlans-by-service-port\/8.*/).reply(200, vlanData(), {
        overwriteRoutes: false,
    });
    mock.onGet(/subscriptions\/vlans-by-service-port\/9.*/).reply(200, vlanData(), {
        overwriteRoutes: false,
    });
    mock.onGet(/subscriptions\/vlans-by-service-port\/a.*/).reply(200, vlanData(), {
        overwriteRoutes: false,
    });
    mock.onGet(/subscriptions\/vlans-by-service-port\/b.*/).reply(200, vlanData(), {
        overwriteRoutes: false,
    });
    mock.onGet(/subscriptions\/vlans-by-service-port\/c.*/).reply(200, vlanData(), {
        overwriteRoutes: false,
    });
    mock.onGet(/subscriptions\/vlans-by-service-port\/d.*/).reply(200, vlanData(), {
        overwriteRoutes: false,
    });
    mock.onGet(/subscriptions\/vlans-by-service-port\/e.*/).reply(200, vlanData(), {
        overwriteRoutes: false,
    });
    mock.onGet(/subscriptions\/vlans-by-service-port\/f.*/).reply(200, vlanData(), {
        overwriteRoutes: false,
    });
}

export function createForm(properties: {}, required?: string[]): JSONSchema6 {
    return {
        properties: properties,
        required: required ?? Object.keys(properties),
        title: "Validator",
        type: "object",
    };
}

export const ContactPerson = {
    items: {
        properties: {
            email: {
                format: "email",
                title: "Email",
                type: "string",
            },
            name: {
                title: "Name",
                type: "string",
                format: "contactPersonName",
            },
            phone: {
                default: "",
                title: "Phone",
                type: "string",
            },
        },
        required: ["email", "name"],
        title: "ContactPerson",
        type: "object",
    },
    minItems: 1,
    title: "Contact Persons",
    type: "array",
};
export const Organisation = {
    title: "Organisation",
    type: "string",
    format: "organisationId",
};

export const Bandwidth = {
    maximum: 1000000,
    minimum: 0,
    title: "Service Speed",
    type: "integer",
};

export const ImsNodeId = {
    title: "ImsNodeId",
    type: "integer",
    format: "imsNodeId",
};

export function imsPortIdProperty(options: {}) {
    return {
        title: "ImsPortId",
        type: "integer",
        format: "imsPortId",
        ...options,
    };
}

export function servicePortsProperty(portOptions: {}, minItems = 1, maxItems = 2) {
    return {
        items: {
            properties: {
                subscription_id: {
                    title: "Subscription Id",
                    type: "string",
                    format: "subscriptionId",
                    visiblePortMode: "normal",
                    tags: ["SP", "SPNL", "MSC", "MSCNL", "AGGSP"],
                    ...portOptions,
                },
                vlan: {
                    examples: ["345", "20-23,45,50-100"],
                    pattern: "^([1-4][0-9]{0,3}(-[1-4][0-9]{0,3})?,?)+$",
                    title: "Vlan",
                    type: "string",
                    format: "vlan",
                },
            },
            required: ["subscription_id", "vlan", "tag", "port_mode"],
            title: "ServicePort",
            type: "object",
        },
        maxItems: maxItems,
        minItems: minItems,
        title: "Service Ports",
        type: "array",
    };
}
