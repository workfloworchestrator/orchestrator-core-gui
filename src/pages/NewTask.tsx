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

import "./NewTask.scss";

import { EuiPage, EuiPageBody } from "@elastic/eui";
import I18n from "i18n-js";
import { JSONSchema6 } from "json-schema";
import React from "react";

import { catchErrorStatus, startProcess, workflowsByTarget } from "../api";
import UserInputFormWizard from "../components/inputForms/UserInputFormWizard";
import ApplicationContext from "../utils/ApplicationContext";
import { setFlash } from "../utils/Flash";
import { EngineStatus, InputForm } from "../utils/types";

interface IState {
    stepUserInput?: InputForm;
    hasNext?: boolean;
}

export default class NewTask extends React.Component<{}, IState> {
    context!: React.ContextType<typeof ApplicationContext>;

    state: IState = {};

    componentDidMount = () => {
        workflowsByTarget("SYSTEM").then(workflows => {
            const options = workflows.reduce<{ [index: string]: string }>((acc, wf) => {
                acc[wf.name] = wf.description;
                return acc;
            }, {});
            this.setState({
                stepUserInput: {
                    type: "object",
                    properties: {
                        select_task: {
                            type: "string",
                            options: options
                        }
                    }
                } as JSONSchema6,
                hasNext: false
            });
        });
    };

    validSubmit = (taskInput: {}[]) => {
        const { select_task } = taskInput[0] as { select_task: string };

        let promise = startProcess(select_task, taskInput.slice(1)).then(process => {
            this.context.redirect(`/tasks?highlight=${process.id}`);
            setFlash(I18n.t("task.flash.create", { name: I18n.t(`workflow.${select_task}`), pid: process.id }));
        });

        return catchErrorStatus<EngineStatus>(promise, 503, json => {
            setFlash(I18n.t("settings.status.engine.paused"), "error");
            this.context.redirect("/processes");
        });
    };

    render() {
        const { stepUserInput, hasNext } = this.state;
        return (
            <EuiPage>
                <EuiPageBody component="div" className="mod-new-task">
                    <section className="card">
                        <section className="form-step">
                            <h1>{I18n.t("task.new_task")}</h1>

                            {stepUserInput && (
                                <UserInputFormWizard
                                    stepUserInput={stepUserInput}
                                    validSubmit={this.validSubmit}
                                    hasNext={hasNext || false}
                                    cancel={() => this.context.redirect("/tasks")}
                                />
                            )}
                        </section>
                    </section>
                </EuiPageBody>
            </EuiPage>
        );
    }
}

NewTask.contextType = ApplicationContext;
