/*
 * Copyright 2019 SURF.
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

import I18n from "i18n-js";
import isEqual from "lodash/isEqual";
import React from "react";

import { catchErrorStatus } from "../api/index";
import ApplicationContext from "../utils/ApplicationContext";
import { setFlash } from "../utils/Flash";
import { FormNotCompleteResponse, InputForm } from "../utils/types";
import { stop } from "../utils/Utils";
import UserInputForm from "./UserInputForm";
import UserInputFormNew from "./UserInputFormNew";

interface Form {
    form: InputForm;
    hasNext?: boolean;
}

interface IProps {
    stepUserInput: InputForm;
    validSubmit: (form: {}[]) => Promise<void>;
    cancel: () => void;
    hasNext: boolean;
}

interface IState {
    forms: Form[];
    userInputs: {}[];
}

export default class UserInputFormWizard extends React.Component<IProps, IState> {
    public static defaultProps = {
        hasNext: false
    };

    context!: React.ContextType<typeof ApplicationContext>;

    constructor(props: IProps) {
        super(props);

        this.state = { forms: [{ form: props.stepUserInput, hasNext: props.hasNext }], userInputs: [] };
    }

    componentWillReceiveProps(nextProps: IProps) {
        if (!isEqual(nextProps, this.state.forms[0])) {
            this.setState({ forms: [{ form: nextProps.stepUserInput, hasNext: nextProps.hasNext }] });
        }
    }

    previous = (e: React.MouseEvent<HTMLButtonElement>) => {
        stop(e);
        let { forms } = this.state;

        forms.pop();

        this.setState({ forms: forms });
    };

    submit = (currentFormData: {}) => {
        const { forms, userInputs } = this.state;
        let newUserInputs = userInputs.slice(0, forms.length - 1);
        newUserInputs.push(currentFormData);

        let result = this.props.validSubmit(newUserInputs);
        return catchErrorStatus<FormNotCompleteResponse>(result, 510, json => {
            // Scroll to top when navigating to next screen of wizard
            window.scrollTo(0, 0);
            setFlash(I18n.t("process.flash.wizard_next_step"));
            this.setState({ forms: [...forms, { form: json.form, hasNext: json.hasNext }], userInputs: newUserInputs });
        });
    };

    render() {
        const { forms } = this.state;

        const currentForm = forms[forms.length - 1];

        if (!currentForm) {
            return null;
        }
        if (Array.isArray(currentForm.form)) {
            return (
                <UserInputForm
                    // Generate a key based on input widget names that results in a new
                    // instance of UserInputForm if the form changes
                    key={currentForm.form.map(item => item.name).join()}
                    stepUserInput={currentForm.form}
                    validSubmit={this.submit}
                    previous={this.previous}
                    hasNext={currentForm.hasNext}
                    hasPrev={forms.length > 1}
                    cancel={this.props.cancel}
                />
            );
        } else {
            return (
                <UserInputFormNew
                    // Generate a key based on input widget names that results in a new
                    // instance of UserInputForm if the form changes
                    key={Object.keys(currentForm.form).join()}
                    stepUserInput={currentForm.form}
                    validSubmit={this.submit}
                    previous={this.previous}
                    hasNext={currentForm.hasNext}
                    hasPrev={forms.length > 1}
                    cancel={this.props.cancel}
                />
            );
        }
    }
}

UserInputFormWizard.contextType = ApplicationContext;
