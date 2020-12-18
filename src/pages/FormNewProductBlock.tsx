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
import { EuiPageBody, EuiPageContent } from "@elastic/eui";
import UserInputForm from "components/inputForms/UserInputForm";
import { JSONSchema6 } from "json-schema";
import React from "react";

import { setFlash } from "../utils/Flash";
import { stop } from "../utils/Utils";

const schema: JSONSchema6 = {
    title: "Product Block",
    description: "A product from Acme's catalog",
    type: "object",
    properties: {
        name: { type: "string" },
        description: { type: "string" },
        tag: { type: "string" },
        type: { type: "string" },
        status: { default: "hop1", type: "string", enum: ["hop1", "hop2"] },
        resource_types: { default: "hop1", type: "string", enum: ["hop1", "hop2"] },
        create_date: { type: "string", format: "date-time" },
        end_date: { type: "string", format: "date-time" }
    },
    required: ["name", "description", "tag"]
};

interface IState {}

export default class FormProduct extends React.Component {
    state: IState = {};

    cancel = (e: React.FormEvent) => {
        stop(e);
        // this.setState({ confirmationDialogOpen: true });
    };

    previous = (e: React.MouseEvent<HTMLButtonElement>) => {
        stop(e);
    };

    submit = async (userInput: any = {}) => {
        // TODO: Not sure how to validate that the scheme is OK without calling the backend
        // TODO2: Investigate why default values are not in userinput
        // debugger;
        console.log(userInput);
        setFlash("Form submitted");
    };

    render() {
        return (
            <EuiPageBody>
                <EuiPageContent>
                    <UserInputForm
                        stepUserInput={schema}
                        validSubmit={this.submit}
                        cancel={this.cancel}
                        previous={this.previous}
                        hasNext={false}
                        hasPrev={false}
                        userInput={{}}
                    />
                </EuiPageContent>
            </EuiPageBody>
        );
    }
}
