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

import { action } from "@storybook/addon-actions";
import React from "react";

import UserInputFormWizard from "../components/UserInputFormWizard";

export default {
    title: "UserInputFormWizard",
    // Needed to match snapshot file to story, should be done by injectFileNames but that does not work
    parameters: {
        fileName: __filename
    }
};

export const Wizard = () => {
    return (
        <UserInputFormWizard
            validSubmit={forms => {
                action("submit")(forms);
                if (forms.length === 1) {
                    return Promise.reject({
                        response: {
                            status: 510,
                            json: () =>
                                Promise.resolve({
                                    form: [
                                        {
                                            name: "ims_port_id_2",
                                            type: "generic_select",
                                            choices: ["1", "2", "3"]
                                        }
                                    ],
                                    hasNext: false
                                })
                        }
                    });
                } else {
                    return Promise.resolve();
                }
            }}
            stepUserInput={[
                {
                    name: "ims_port_id_1",
                    type: "generic_select",
                    choices: ["a", "b", "c"]
                }
            ]}
            hasNext={true}
            cancel={action("cancel")}
        />
    );
};
