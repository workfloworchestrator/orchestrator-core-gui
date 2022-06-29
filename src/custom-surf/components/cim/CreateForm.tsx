import UserInputFormWizard from "components/inputForms/UserInputFormWizard";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import ApplicationContext from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";
import { EngineStatus, Form, FormNotCompleteResponse } from "utils/types";

interface IProps {
    preselectedInput?: any;
    formKey: string;
    handleSubmit: (userInputs: any) => void;
}

export default function CreateForm(props: IProps) {
    const intl = useIntl();
    const { preselectedInput, formKey, handleSubmit } = props;
    const { products, redirect, customApiClient } = useContext(ApplicationContext);
    const [form, setForm] = useState<Form>({});
    const { stepUserInput, hasNext } = form;

    const submit = useCallback(
        (userInputs: {}[]) => {
            // if (preselectedInput.product) {
            // Todo: decide if we want to implement pre-selections and design a way to do it generic
            //     userInputs = [{ preselectedInput }, ...processInput];
            // }
            let promise = customApiClient.startForm(formKey, userInputs).then(
                (form) => {
                    // Let parent component handle the submit
                    handleSubmit(form);
                    setFlash(intl.formatMessage({ id: "cim.flash" }, { name: formKey }));
                },
                (e) => {
                    throw e;
                }
            );

            // Todo: fix type
            return customApiClient.catchErrorStatus<EngineStatus>(promise, 503, (json) => {
                setFlash(
                    intl.formatMessage({ id: `settings.status.engine.${json.global_status.toLowerCase()}` }),
                    "error"
                );
                redirect("/tickets");
            });
        },
        [redirect, intl, customApiClient, formKey, handleSubmit]
    );

    useEffect(() => {
        if (formKey) {
            customApiClient.catchErrorStatus<FormNotCompleteResponse>(submit([]), 510, (json) => {
                setForm({
                    stepUserInput: json.form,
                    hasNext: json.hasNext ?? false,
                });
            });
        }
    }, [formKey, products, submit, preselectedInput, intl, customApiClient]);

    return (
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
    );
}
