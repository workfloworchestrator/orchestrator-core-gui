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
import fetchMock from "fetch-mock";
import React from "react";
import ApplicationContext, { ApplicationContextInterface } from "utils/ApplicationContext";

import ORGANISATIONS_JSON from "../../../../stories/data/organisations.json";
import OrganisationField from "../../src/logic/OrganisationField";
import createContext from "../_createContext";
import mount from "../_mount";

describe("<OrganisationField>", () => {
    test("<OrganisationField> - calls selectField with all organisations", () => {
        const SelectField = jest.fn(() => <br />);

        fetchMock.restore();
        const element = (
            <ApplicationContext.Provider value={{ organisations: ORGANISATIONS_JSON } as ApplicationContextInterface}>
                <OrganisationField name="x" inputComponent={SelectField as React.FC<any>} />
            </ApplicationContext.Provider>
        );
        const wrapper = mount(element, createContext({ x: { type: String } }));
        expect(wrapper.html()).toBe("<br>");
        expect(SelectField).toHaveBeenCalledTimes(1);
        expect(SelectField).toHaveBeenCalledWith(
            expect.objectContaining({
                allowedValues: [
                    "2f47f65a-0911-e511-80d0-005056956c1a",
                    "88503161-0911-e511-80d0-005056956c1a",
                    "bae56b42-0911-e511-80d0-005056956c1a",
                    "c37bbc49-d7e2-e611-80e3-005056956c1a",
                    "9865c1cb-0911-e511-80d0-005056956c1a",
                    "772cee0f-c4e1-e811-810e-0050569555d1",
                    "29865c1cb-0911-e511-80d0-005056956c1a",
                    "872cee0f-c4e1-e811-810e-0050569555d1"
                ],
                disabled: false,
                error: null,
                errorMessage: "",
                required: true,
                showInlineError: false,
                value: undefined
            }),
            {}
        );
        //@ts-ignore
        expect(SelectField.mock.calls[0][0].transform("2f47f65a-0911-e511-80d0-005056956c1a")).toBe(
            "Centrum Wiskunde & Informatica"
        );
    });
});
