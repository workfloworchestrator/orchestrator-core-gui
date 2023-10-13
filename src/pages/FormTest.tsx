/*
 * Copyright 2019-2023 SURF.
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

import { EuiPage, EuiPageBody } from "@elastic/eui";
import CreateForm from "components/CreateForm";
import FormHeader from "components/FormHeader";
import { formStyling } from "custom/pages/FormStyling";
import React from "react";

export default function FormTest() {
    const handleSubmit = (userInputs: any) => {
        console.log("Form succes! Payload: ", userInputs);
    };

    return (
        <EuiPage css={formStyling}>
            <EuiPageBody component="div">
                <FormHeader
                    title="Form test"
                    explainTitle="A form that uses all available form elements"
                    explainDescription={<p>Nothing will happen when you submit. This is a test form after all.</p>}
                />
                <CreateForm formKey="all_form_fields" handleSubmit={handleSubmit} />
            </EuiPageBody>
        </EuiPage>
    );
}
