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

import React from "react";
import UserInputContainer from "stories/UserInputContainer";

import { createForm } from "../../../stories/utils";

export default {
    title: "Uniforms/AcceptField",
    // Needed to match snapshot file to story, should be done by injectFileNames but that does not work
    parameters: {
        fileName: __filename
    }
};

export const Legacy = () => {
    return (
        <UserInputContainer
            formName="NOC Confirm"
            stepUserInput={createForm({ noc_remove_static_ip_confirmation: { type: "string", format: "accept" } })}
        />
    );
};

export const Complex = () => {
    return (
        <UserInputContainer
            formName="NOC Confirm"
            stepUserInput={createForm({
                noc_remove_static_ip_confirmation: {
                    type: "string",
                    format: "accept",
                    data: [
                        ["confirm_migrate_sap", "label"],
                        ["confirm_migrate_sap_info", "info"],
                        ["next_step_service_affecting", "warning"],
                        ["margin", "margin"],
                        ["some value", "value"],
                        ["http://example.com", "url"],
                        ["check_delete_sn7_service_config", "checkbox"],
                        ["check_ims_defined", "label"],
                        ["sub_checkbox_1", ">checkbox", { circuit_name: "ims circuit 1" }],
                        ["sub_checkbox_2", ">checkbox", { circuit_name: "ims circuit 2" }],
                        ["optional _checkbox", "checkbox?"],
                        ["skip", "skip"]
                    ]
                }
            })}
        />
    );
};
