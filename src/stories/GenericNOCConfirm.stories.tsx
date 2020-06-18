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

import { action } from "@storybook/addon-actions";
import fetchMock from "fetch-mock";
import { JSONSchema6 } from "json-schema";
import React from "react";

import GenericNOCConfirm from "../components/GenericNOCConfirm";
import UserInputContainer from "./UserInputContainer";

export default {
    title: "GenericNOCConfirm",
    // Needed to match snapshot file to story, should be done by injectFileNames but that does not work
    parameters: {
        fileName: __filename
    }
};

export const Legacy = () => (
    <GenericNOCConfirm name="noc_remove_static_ip_confirmation" onChange={action("changed checkbox: ")} />
);

export const Complex = () => (
    <GenericNOCConfirm
        name="confirm_migrate_sap"
        onChange={action("changed checkbox: ")}
        data={[
            ["confirm_migrate_sap", "label"],
            ["confirm_migrate_sap_info", "info"],
            ["next_step_service_affecting", "warning"],
            ["http://example.com", "url"],
            ["check_delete_sn7_service_config", "checkbox"],
            ["check_ims_defined", "label"],
            ["check_ims_circuit", ">checkbox", { circuit_name: "ims circuit 1" }],
            ["check_ims_circuit", ">checkbox", { circuit_name: "ims circuit 2" }],
            ["check_port_patched_sn7_sn8", "checkbox?"]
        ]}
    />
);

export const LegacyInForm = () => {
    fetchMock.restore();
    fetchMock.get("/api/v2/subscriptions/ports?filter=tags,MSP-SSP-MSPNL&filter=statuses,active", []);
    fetchMock.get("/api/v2/subscriptions/ports?filter=tags,SP-SPNL&filter=statuses,active", []);
    fetchMock.get("/api/v2/subscriptions/all", []);
    return (
        <UserInputContainer
            formName="NOC Confirm"
            stepUserInput={[{ name: "noc_remove_static_ip_confirmation", type: "accept" }]}
        />
    );
};

LegacyInForm.story = {
    name: "Legacy in form"
};

export const ComplexInForm = () => {
    fetchMock.restore();
    fetchMock.get("/api/v2/subscriptions/ports?filter=tags,MSP-SSP-MSPNL&filter=statuses,active", []);
    fetchMock.get("/api/v2/subscriptions/ports?filter=tags,SP-SPNL&filter=statuses,active", []);
    fetchMock.get("/api/v2/subscriptions/all", []);
    return (
        <UserInputContainer
            formName="NOC Confirm"
            stepUserInput={[
                {
                    name: "confirm_migrate_sap",
                    type: "accept",
                    data: [
                        ["confirm_migrate_sap", "label"],
                        ["confirm_migrate_sap_info", "info"],
                        ["next_step_service_affecting", "warning"],
                        ["http://example.com", "url"],
                        ["check_delete_sn7_service_config", "checkbox"],
                        ["check_ims_defined", "label"],
                        ["check_ims_circuit", ">checkbox", { circuit_name: "ims circuit 1" }],
                        ["check_ims_circuit", ">checkbox", { circuit_name: "ims circuit 2" }],
                        ["check_port_patched_sn7_sn8", "checkbox?"]
                    ]
                }
            ]}
        />
    );
};

ComplexInForm.story = {
    name: "Complex in form"
};

export const AcceptField = () => {
    return (
        <UserInputContainer
            formName="NOC Confirm"
            stepUserInput={{
                title: "Validator",
                type: "object",
                properties: {
                    confirm_migrate_sap: {
                        title: "Accept",
                        default: true,
                        type: "string",
                        format: "accept",
                        uniforms: {
                            data: [
                                ["check_delete_sn7_service_config", "label"],
                                ["check_port_patched_sn7_sn8", "label"],
                                ["next_step_service_affecting", "warning"],
                                ["confirm_migrate_sap", "checkbox"],
                                ["skip_migrate_sap_workflow", "skip"]
                            ]
                        }
                    } as JSONSchema6
                }
            }}
        />
    );
};

AcceptField.story = {
    name: "Accept Field"
};
