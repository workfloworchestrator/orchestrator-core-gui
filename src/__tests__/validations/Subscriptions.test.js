import {searchConstruct} from "../../validations/Subscriptions";

const testSearchConstructer = (query, expected) => {
    const res = searchConstruct(query);
    expect(res).toEqual(expected)
};
test("Simple search", () => {
    testSearchConstructer("customer:'Hogeschool Avans '",
        {"customer_name": "hogeschool avans"});
});

test("Simple search without quotes", () => {
    testSearchConstructer("customer:Hogeschool Avans ",
        {"customer_name": "hogeschool", "global_search": "avans"});
});

test("Simple search with space", () => {
    testSearchConstructer("customer:Avans ",
        {"customer_name": "avans"});
});

test("Common use-case", () => {
    testSearchConstructer("customer:Avans Something",
        {"customer_name": "avans", "global_search": "something"});
});

test("Multiple search terms global", () => {
    testSearchConstructer("customer:Avans Something else",
        {"customer_name": "avans", "global_search": "something else"});
});

test("Complex query", () => {
    testSearchConstructer("customer : 'Avans Hoge' product:msp something",
        {"customer_name": "avans hoge", "product_name":"msp", "global_search": "something"});
});

test("Very complex query", () => {
    testSearchConstructer("customer : 'Avans Hoge' product:'msp <=> msp' something more",
        {"customer_name": "avans hoge", "product_name":"msp <=> msp", "global_search": "something more"});
});

test("Multiple searches on the same keyword", () => {
    testSearchConstructer("description:UU description:MSP",
        {"description": ["uu", "msp"]})
});

test("Multiple searches on the same keyword with quotes", () => {
    testSearchConstructer("description:uu description:msp description:'1 Gbit/s'",
        {"description": ["uu", "msp", "1 gbit/s"]})
});