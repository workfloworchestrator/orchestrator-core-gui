import fetchMock from "fetch-mock";
import React from "react";

import ImsPortIdField from "../src/ImsPortIdField";
import createContext from "./_createContext";
import mount from "./_mount";

describe("<ImsPortIdField>", () => {
    test("<ImsPortIdField> - renders inputs", done => {
        fetchMock.restore();
        // fetchMock.get("glob:*/api/subscriptions/*", SUBSCRIPTION_JSON);
        // fetchMock.get("glob:*/api/products/a3bf8b26-50a6-4586-8e58-ad552cb39798", PRODUCTS[22]);
        const element = <ImsPortIdField name="x" />;
        const wrapper = mount(element, createContext({ x: { type: Number } }));
        setImmediate(() => {
            wrapper.update();
            expect(wrapper.find("input")).toHaveLength(2);
            done();
        });
    });
});
