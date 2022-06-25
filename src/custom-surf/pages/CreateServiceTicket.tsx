/*
 * Copyright 2019-2022 SURF.
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

import { EuiPage, EuiPageBody, EuiText } from "@elastic/eui";
import Explain from "components/Explain";
import CreateForm from "custom/components/cim/CreateForm";
import React, { useState } from "react";

export default function CreateServiceTicket() {
    const [showExplanation, setShowExplanation] = useState(false);

    return (
        <EuiPage>
            <EuiPageBody component="div">
                <div className="actions">
                    <div onClick={() => setShowExplanation(true)}>
                        <i className="fa fa-question-circle" />
                    </div>
                </div>
                <Explain
                    close={() => setShowExplanation(false)}
                    isVisible={showExplanation}
                    title="How to create a CIM ticket"
                >
                    <p>Starting a ticket will execute a state machine that guides you through the process.</p>
                </Explain>
                <EuiText grow={true}>
                    <h1>Create ticket</h1>
                </EuiText>
                <CreateForm formKey="create_ticket_form"></CreateForm>
            </EuiPageBody>
        </EuiPage>
    );
}
