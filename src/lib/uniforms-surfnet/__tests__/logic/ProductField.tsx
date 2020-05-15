import { mount } from "enzyme";
import fetchMock from "fetch-mock";
import React from "react";
import ApplicationContext, { ApplicationContextInterface } from "utils/ApplicationContext";

import PRODUCTS_JSON from "../../../../stories/data/products.json";
import ProductField from "../../src/logic/ProductField";
import createContext from "../_createContext";

describe("<ProductField>", () => {
    test.skip("<ProductField> - renders inputs", done => {
        const SelectField = jest.fn() as React.FC<any>;

        fetchMock.restore();
        const element = (
            <ApplicationContext.Provider
                value={({ products: PRODUCTS_JSON } as unknown) as ApplicationContextInterface}
            >
                <ProductField name="x" inputComponent={SelectField} />
            </ApplicationContext.Provider>
        );
        const wrapper = mount(element, createContext({ x: { type: String } }));
        setImmediate(() => {
            wrapper.update();
            expect(wrapper.find("input")).toHaveLength(24);
            done();
        });
    });
});
