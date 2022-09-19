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

import { EuiPage, EuiPageBody, EuiPageHeader } from "@elastic/eui";
import Explain from "components/Explain";
import CreateForm from "custom/components/cim/CreateForm";
import { formStyling } from "custom/pages/FormStyling";
import { CreateServiceTicketPayload } from "custom/types";
import React, { useContext, useState } from "react";
import ApplicationContext from "utils/ApplicationContext";

export default function CreateServiceTicket() {
    const [showExplanation, setShowExplanation] = useState(false);
    const { redirect, customApiClient } = useContext(ApplicationContext);

    const handleSubmit = (userInputs: any) => {
        const ticket: CreateServiceTicketPayload = {
            ims_pw_id: userInputs.ims_ticket.name,
            jira_ticket_id: userInputs.jira_ticket.ticket_id,
            title_nl: userInputs.jira_ticket.summary,
            start_date: userInputs.jira_ticket.start_date,
            end_date: userInputs.jira_ticket.end_date,
            type: userInputs.ticket_type,
        };
        customApiClient.cimCreateTicket(ticket).then((_) => redirect("/tickets"));
    };

    return (
        <EuiPage css={formStyling}>
            <EuiPageBody component="div">
                <EuiPageHeader
                    pageTitle="Create ticket"
                    rightSideItems={[
                        <section className="explain">
                            <i className="fa fa-question-circle" onClick={() => setShowExplanation(true)} />
                        </section>,
                    ]}
                />
                <Explain
                    close={() => setShowExplanation(false)}
                    isVisible={showExplanation}
                    title="How to create a CIM ticket"
                >
                    <p>Starting a ticket will execute a state machine that guides you through the process.</p>
                </Explain>
                <CreateForm formKey="create_ticket_form" handleSubmit={handleSubmit} />
            </EuiPageBody>
        </EuiPage>
    );
}
