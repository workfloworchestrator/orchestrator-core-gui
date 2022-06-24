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

import {
    EuiButton,
    EuiComboBox,
    EuiFieldText,
    EuiFlexGroup,
    EuiFlexItem,
    EuiFormRow,
    EuiLoadingSpinner,
    EuiPage,
    EuiPageBody,
    EuiPanel,
    EuiRadioGroup,
    EuiSpacer,
    EuiText,
    EuiTitle,
} from "@elastic/eui";
import Explain from "components/Explain";
import { JSONSchema6 } from "json-schema";
import { intl } from "locale/i18n";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { injectIntl, useIntl } from "react-intl";
import ApplicationContext, { customApiClient } from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";
import { productById } from "utils/Lookups";
import { EngineStatus, Form, FormNotCompleteResponse } from "utils/types";
import { isEmpty } from "utils/Utils";
import { TARGET_CREATE } from "validations/Products";

import UserInputFormWizard from "../inputForms/UserInputFormWizard";

interface PreselectedInput {
    formKey?: string;
}

interface IProps {
    preselectedInput: PreselectedInput;
}

export default function CreateServiceTicket(props: IProps) {
    const intl = useIntl();
    const { preselectedInput } = props;
    const { products, redirect, customApiClient } = useContext(ApplicationContext);
    const [form, setForm] = useState<Form>({});
    const { stepUserInput, hasNext } = form;
    const [showExplanation, setShowExplanation] = useState(false);

    const submit = useCallback(
        (userInputs: {}[]) => {
            // if (preselectedInput.formKey) {
            //     userInputs = [{ form_key: preselectedInput.formKey }, ...userInputs];
            // }

            let promise = customApiClient.startForm("customer_form", userInputs).then(
                (form) => {
                    // Todo: handle ticket output and cal the endpoint to save the ticket
                    console.log("Posted form inputs", form);
                    setFlash(
                        intl.formatMessage(
                            { id: "forms.flash.create_create" }
                            // { name: product.name, pid: process.id }
                        )
                    );
                },
                (e) => {
                    throw e;
                }
            );

            return customApiClient.catchErrorStatus<EngineStatus>(promise, 503, (json) => {
                setFlash(
                    intl.formatMessage({ id: `settings.status.engine.${json.global_status.toLowerCase()}` }),
                    "error"
                );
                redirect("/tickets");
            });
        },
        [redirect, preselectedInput, intl, customApiClient]
    );

    useEffect(() => {
        if (preselectedInput.formKey) {
            customApiClient.catchErrorStatus<FormNotCompleteResponse>(submit([]), 510, (json) => {
                setForm({
                    stepUserInput: json.form,
                    hasNext: json.hasNext ?? false,
                });
            });
        } else {
            setForm({
                stepUserInput: {
                    title: intl.formatMessage({ id: "forms.choose_form" }),
                    type: "object",
                    properties: {
                        product: {
                            type: "string",
                            format: "productId",
                            productIds: products
                                .filter((prod) => !isEmpty(prod.workflows.find((wf) => wf.target === TARGET_CREATE)))
                                .filter((prod) => prod.status === "active")
                                .map((product) => product.product_id),
                        },
                    },
                } as JSONSchema6,
                hasNext: true,
            });
        }
    }, [products, submit, preselectedInput, intl, customApiClient]);

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
                    <h1>Help me</h1>
                    <p>Demo for testing help typography</p>
                    <p>
                        The full text search can contain multiple search criteria that will AND-ed together. For example
                        <i>"customer_id:d253130e-0a11-e511-80d0-005056956c1a status:active tag:IP_PREFIX"</i> would only
                        return subscriptions matching the supplied <i>customer_id</i>, <i>status</i> and <i>tag</i>. Due
                        to how full text search works that query could be simplified to:{" "}
                        <i>"d253130e active ip_prefix"</i>.
                    </p>
                </Explain>
                <EuiText grow={true}>
                    <h1>Create ticket</h1>
                </EuiText>
                <div>
                    {stepUserInput && (
                        <UserInputFormWizard
                            stepUserInput={stepUserInput}
                            validSubmit={submit}
                            cancel={() => redirect("/tickets")}
                            hasNext={hasNext ?? false}
                        />
                    )}
                </div>
            </EuiPageBody>
        </EuiPage>
    );
}
