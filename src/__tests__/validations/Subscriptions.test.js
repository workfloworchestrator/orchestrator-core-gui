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

import { searchConstruct } from "../../validations/Subscriptions";

const testSearchConstructer = (query, expected) => {
    const res = searchConstruct(query);
    expect(res).toEqual(expected);
};
test("Simple search", () => {
    testSearchConstructer("customer:'Hogeschool Avans '", {
        customer_name: "hogeschool avans"
    });
});

test("Simple search without quotes", () => {
    testSearchConstructer("customer:Hogeschool Avans ", {
        customer_name: "hogeschool",
        global_search: "avans"
    });
});

test("Simple search with space", () => {
    testSearchConstructer("customer:Avans ", { customer_name: "avans" });
});

test("Common use-case", () => {
    testSearchConstructer("customer:Avans Something", {
        customer_name: "avans",
        global_search: "something"
    });
});

test("Multiple search terms global", () => {
    testSearchConstructer("customer:Avans Something else", {
        customer_name: "avans",
        global_search: "something else"
    });
});

test("Complex query", () => {
    testSearchConstructer("customer : 'Avans Hoge' product:msp something", {
        customer_name: "avans hoge",
        product_name: "msp",
        global_search: "something"
    });
});

test("Very complex query", () => {
    testSearchConstructer("customer : 'Avans Hoge' product:'msp <=> msp' something more", {
        customer_name: "avans hoge",
        product_name: "msp <=> msp",
        global_search: "something more"
    });
});

test("Multiple searches on the same keyword", () => {
    testSearchConstructer("description:UU description:MSP", {
        description: ["uu", "msp"]
    });
});

test("Multiple searches on the same keyword with quotes", () => {
    testSearchConstructer("description:uu description:msp description:'1 Gbit/s'", {
        description: ["uu", "msp", "1 gbit/s"]
    });
});
