import { mount } from "enzyme";
import React from "react";
import ApplicationContext, { ApplicationContextInterface } from "utils/ApplicationContext";

import LocationCodeField from "../../src/logic/LocationCodeField";
import createContext from "../_createContext";

describe("<LocationCodeField>", () => {
    test.skip("<LocationCodeField> - renders inputs", done => {
        const SelectField = jest.fn() as React.FC<any>;

        const element = (
            <ApplicationContext.Provider value={{ locationCodes: ["aaa", "bbb"] } as ApplicationContextInterface}>
                <LocationCodeField name="x" inputComponent={SelectField} />
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
