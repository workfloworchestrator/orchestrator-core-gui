/*
 * Copyright 2019-2020 SURF.
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

import { action } from "@storybook/addon-actions";
import React from "react";

import UserInputFormWizard from "../components/inputForms/UserInputFormWizard";
import { InputForm } from "../utils/types";

interface IProps {
    stepUserInput: InputForm;
    formName: string;
}

export default class UserInputContainer extends React.Component<IProps> {
    render() {
        const { stepUserInput, formName } = this.props;
        return (
            <div className="mod-new-process">
                <section className="card">
                    <section className="form-step divider">
                        <h1>{formName}</h1>
                        <UserInputFormWizard
                            stepUserInput={stepUserInput}
                            validSubmit={value => {
                                action("submit")(value);
                                return Promise.resolve();
                            }}
                            cancel={action("cancel")}
                        />
                    </section>
                </section>
            </div>
        );
    }
}
