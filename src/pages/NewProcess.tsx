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

import "pages/NewProcess.scss";

import { EuiPage, EuiPageBody } from "@elastic/eui";
import UserInputFormWizard from "components/inputForms/UserInputFormWizard";
import { JSONSchema6 } from "json-schema";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import ApplicationContext from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";
import { productById } from "utils/Lookups";
import { EngineStatus, FormNotCompleteResponse } from "utils/types";
import { isEmpty } from "utils/Utils";
import { TARGET_CREATE } from "validations/Products";

interface PreselectedInput {
    product?: string;
    organisation?: string;
    prefix?: string;
    prefixlen?: string;
    prefix_min?: string;
}

interface IProps {
    preselectedInput: PreselectedInput;
}

interface Form {
    stepUserInput?: JSONSchema6;
    hasNext?: boolean;
}

export default function NewProcess(props: IProps) {
    const intl = useIntl();
    const { preselectedInput } = props;
    const { products, redirect, apiClient } = useContext(ApplicationContext);
    const [form, setForm] = useState<Form>({});
    const { stepUserInput, hasNext } = form;

    const submit = useCallback(
        (processInput: {}[]) => {
            if (preselectedInput.product) {
                processInput = [{ product: preselectedInput.product }, ...processInput];
            }

            const productId = (processInput as { product: string }[])[0].product;
            const product = productById(productId, products);
            const workflow = product.workflows.find((wf) => wf.target === TARGET_CREATE)!.name;

            let promise = apiClient.startProcess(workflow, processInput).then(
                (process) => {
                    redirect(`/processes?highlight=${process.id}`);
                    setFlash(
                        intl.formatMessage(
                            { id: "process.flash.create_create" },
                            { name: product.name, pid: process.id }
                        )
                    );
                },
                (e) => {
                    throw e;
                }
            );

            return apiClient.catchErrorStatus<EngineStatus>(promise, 503, (json) => {
                setFlash(
                    intl.formatMessage({ id: `settings.status.engine.${json.global_status.toLowerCase()}` }),
                    "error"
                );
                redirect("/processes");
            });
        },
        [redirect, products, preselectedInput, intl, apiClient]
    );

    useEffect(() => {
        if (preselectedInput.product) {
            apiClient.catchErrorStatus<FormNotCompleteResponse>(submit([]), 510, (json) => {
                setForm({
                    stepUserInput: json.form,
                    hasNext: json.hasNext ?? false,
                });
            });
        } else {
            setForm({
                stepUserInput: {
                    title: intl.formatMessage({ id: "process.choose_product" }),
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
    }, [products, submit, preselectedInput, intl, apiClient]);

    return (
        <EuiPage>
            <EuiPageBody component="div" className="mod-new-process">
                <section className="card">
                    <h1>
                        <FormattedMessage id="process.new_process" />
                    </h1>
                    {stepUserInput && (
                        <UserInputFormWizard
                            stepUserInput={stepUserInput}
                            validSubmit={submit}
                            cancel={() => redirect("/processes")}
                            hasNext={hasNext ?? false}
                        />
                    )}
                </section>
            </EuiPageBody>
        </EuiPage>
    );
}
