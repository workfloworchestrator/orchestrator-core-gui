import { mount } from "enzyme";
import fetchMock from "fetch-mock";
import React from "react";
import ApplicationContext, { ApplicationContextInterface } from "utils/ApplicationContext";

import ORGANISATIONS_JSON from "../../../../stories/data/organisations.json";
import OrganisationField from "../../src/logic/OrganisationField";
import createContext from "../_createContext";

describe("<OrganisationField>", () => {
    test.skip("<OrganisationField> - renders inputs", done => {
        const SelectField = jest.fn() as React.FC<any>;

        fetchMock.restore();
        const element = (
            <ApplicationContext.Provider value={{ organisations: ORGANISATIONS_JSON } as ApplicationContextInterface}>
                <OrganisationField name="x" inputComponent={SelectField} />
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
