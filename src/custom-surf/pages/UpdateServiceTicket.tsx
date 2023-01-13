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
import OpenForm from "custom/components/cim/OpenForm";
import FormHeader from "custom/components/FormHeader";
import { formStyling } from "custom/pages/FormStyling";
import { UpdateServiceTicketPayload } from "custom/types";
import { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import ApplicationContext from "utils/ApplicationContext";

import { ServiceTicket } from "../types";

interface IProps {
    id: string;
}

export default function UpdateServiceTicket() {
    const { id } = useParams<IProps>();
    const { redirect, customApiClient } = useContext(ApplicationContext);
    const [ticketName, setTicketName] = useState<string>("ticket");

    useMemo(async () => {
        let ticket_meta = await customApiClient.cimGetTicketMetadata(id);
        setTicketName(ticket_meta.ims_pw_id);
    }, [id, customApiClient]);

    const handleSubmit = (userInputs: any) => {
        const payload: UpdateServiceTicketPayload = {
            cim_ticket_id: id,
            title_nl: userInputs.title_nl,
            description_nl: userInputs.description_nl,
            title_en: userInputs.title_en,
            description_en: userInputs.description_en,
            mail_subject: userInputs.mail_subject,
            start_date: userInputs.start_date,
            end_date: userInputs.end_date,
        };
        console.log(payload);
        customApiClient.cimUpdateTicket(payload).then((_) => redirect(`/tickets/${id}/`));
    };

    const handleCancel = () => {
        redirect(`/tickets/${id}`);
    };

    return (
        <EuiPage css={formStyling}>
            <EuiPageBody component="div">
                <FormHeader
                    title={`Prepare to send ${ticketName} UPDATE email to institutes`}
                    explainTitle="What is this?"
                    explainDescription={
                        <p>This wizard will guide you through the process of sending the UPDATE email to institutes.</p>
                    }
                />
                <OpenForm
                    formKey="update_ticket_form"
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancel}
                    ticketId={id}
                />
            </EuiPageBody>
        </EuiPage>
    );
}
