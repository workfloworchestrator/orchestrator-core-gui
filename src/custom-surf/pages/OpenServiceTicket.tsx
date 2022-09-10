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
import OpenForm from "custom/components/cim/OpenForm";
import { OpenServiceTicketPayload } from "custom/types";
import React, { useContext, useState } from "react";
import { useParams } from "react-router";
import ApplicationContext from "utils/ApplicationContext";

interface IProps {
    id: string;
}

export default function OpenServiceTicket() {
    const { id } = useParams<IProps>();
    const [showExplanation, setShowExplanation] = useState(false);
    const { redirect, customApiClient } = useContext(ApplicationContext);

    const handleSubmit = (userInputs: any) => {
        const payload: OpenServiceTicketPayload = {
            cim_ticket_id: id,
            title_nl: userInputs.title_nl,
            description_nl: userInputs.description_nl,
            title_en: userInputs.title_en,
            description_en: userInputs.description_en,
            mail_subject: userInputs.mail_subject,
        };
        customApiClient.cimOpenTicket(payload).then((_) => redirect(`/tickets/${id}/`));
    };

    const handleCancel = () => {
        redirect(`/tickets/${id}`);
    };

    return (
        <EuiPage>
            <EuiPageBody component="div">
                <div className="actions">
                    <div onClick={() => setShowExplanation(true)}>
                        <i className="fa fa-question-circle" />
                    </div>
                </div>
                <Explain close={() => setShowExplanation(false)} isVisible={showExplanation} title="What is this?">
                    <p>This wizard will guide you through the process of sending the OPEN email to institutes.</p>
                </Explain>
                <EuiText grow={true}>
                    <h1>Prepare to send OPEN email to institutes</h1>
                </EuiText>
                <OpenForm
                    formKey="open_ticket_form"
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancel}
                    ticketId={id}
                />
            </EuiPageBody>
        </EuiPage>
    );
}
