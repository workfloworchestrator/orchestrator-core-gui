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

import UserInputFormWizard from "components/inputForms/UserInputFormWizard";
import { ServiceTicketProcessState } from "custom/types";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import ApplicationContext from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";
import { Form, FormNotCompleteResponse } from "utils/types";

interface IProps {
    formKey: string;
    ticket_id: string;
    handleSubmit: (userInputs: any) => void;
    handleCancel: () => void;
}

export default function OpenForm(props: IProps) {
    const intl = useIntl();
    const { formKey, ticket_id, handleSubmit, handleCancel } = props;
    const { redirect, customApiClient } = useContext(ApplicationContext);
    const [form, setForm] = useState<Form>({});
    const { stepUserInput, hasNext } = form;

    const submit = useCallback(
        (userInputs: {}[]) => {
            // Pass the ticket id and next process state. Backend validates the state transition.
            userInputs = [{ ticket_id: ticket_id, next_process_state: ServiceTicketProcessState.OPEN }, ...userInputs];
            let promise = customApiClient.cimStartForm(formKey, userInputs).then(
                (form) => {
                    handleSubmit(form);
                    setFlash(intl.formatMessage({ id: `cim.flash.${formKey}` }));
                },
                (e) => {
                    throw e;
                }
            );

            return customApiClient.catchErrorStatus<any>(promise, 503, (json) => {
                setFlash(intl.formatMessage({ id: `cim.backendProblem` }), "error");
                redirect("/tickets");
            });
        },
        [redirect, intl, customApiClient, formKey, handleSubmit]
    );

    const cancel = useCallback(() => {
        // TODO ask user to confirm leaving the page
        handleCancel();
    }, [redirect, intl, customApiClient, formKey, handleCancel]);

    useEffect(() => {
        if (formKey) {
            customApiClient.catchErrorStatus<FormNotCompleteResponse>(submit([]), 510, (json) => {
                setForm({
                    stepUserInput: json.form,
                    hasNext: json.hasNext ?? false,
                });
            });
        }
    }, [formKey, submit, intl, customApiClient]);

    return (
        <div>
            {stepUserInput && (
                <UserInputFormWizard
                    stepUserInput={stepUserInput}
                    validSubmit={submit}
                    cancel={cancel}
                    hasNext={hasNext ?? false}
                />
            )}
        </div>
    );
}
