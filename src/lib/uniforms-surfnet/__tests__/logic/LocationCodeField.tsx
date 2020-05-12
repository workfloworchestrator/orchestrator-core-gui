import React from "react";
import ApplicationContext, { ApplicationContextInterface } from "utils/ApplicationContext";

import LocationCodeField from "../../src/logic/LocationCodeField";
import createContext from "../_createContext";
import mount from "../_mount";

describe("<LocationCodeField>", () => {
    test("<LocationCodeField> - calls selectField with all locationCodes", () => {
        const SelectField = jest.fn(() => <br />) as React.FC<any>;

        const element = (
            <ApplicationContext.Provider value={{ locationCodes: ["aaa", "bbb"] } as ApplicationContextInterface}>
                <LocationCodeField name="x" inputComponent={SelectField} />
            </ApplicationContext.Provider>
        );
        const wrapper = mount(element, createContext({ x: { type: String } }));
        expect(wrapper.html()).toBe("<br>");
        expect(SelectField).toHaveBeenCalledTimes(1);
        expect(SelectField).toHaveBeenCalledWith(
            expect.objectContaining({
                allowedValues: ["aaa", "bbb"],
                disabled: false,
                error: null,
                errorMessage: "",
                required: true,
                showInlineError: false,
                value: undefined
            }),
            {}
        );
    });

    test("<LocationCodeField> - calls selectField with specified locationCodes", () => {
        const SelectField = jest.fn(() => <br />) as React.FC<any>;

        const element = (
            <ApplicationContext.Provider value={{ locationCodes: ["aaa", "bbb"] } as ApplicationContextInterface}>
                <LocationCodeField name="x" inputComponent={SelectField} locationCodes={["ccc", "ddd"]} />
            </ApplicationContext.Provider>
        );
        const wrapper = mount(element, createContext({ x: { type: String } }));
        expect(wrapper.html()).toBe("<br>");
        expect(SelectField).toHaveBeenCalledTimes(1);
        expect(SelectField).toHaveBeenCalledWith(
            expect.objectContaining({
                allowedValues: ["ccc", "ddd"],
                disabled: false,
                error: null,
                errorMessage: "",
                required: true,
                showInlineError: false,
                value: undefined
            }),
            {}
        );
    });
});
