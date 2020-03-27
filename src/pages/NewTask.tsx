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

import "./NewTask.scss";

import I18n from "i18n-js";
import React from "react";

import { catchErrorStatus, startProcess, workflowsByTarget } from "../api";
import UserInputFormWizard from "../components/UserInputFormWizard";
import WorkflowSelect from "../components/WorkflowSelect";
import ApplicationContext from "../utils/ApplicationContext";
import { setFlash } from "../utils/Flash";
import { EngineStatus, FormNotCompleteResponse, InputField, Option, Workflow } from "../utils/types";

interface IState {
    workflows?: Workflow[];
    workflow?: string;
    stepUserInput?: InputField[];
    hasNext?: boolean;
}

export default class NewTask extends React.Component<{}, IState> {
    context!: React.ContextType<typeof ApplicationContext>;

    state: IState = {};

    componentDidMount = () =>
        workflowsByTarget("SYSTEM").then((workflows: Workflow[]) => this.setState({ workflows: workflows }));

    validSubmit = (taskInput: {}[]) => {
        const { workflow } = this.state;
        if (!workflow) {
            return Promise.reject();
        }

        return startProcess(workflow, taskInput).then(process => {
            this.context.redirect(`/tasks?highlight=${process.id}`);
            setFlash(I18n.t("task.flash.create", { name: I18n.t(`workflow.${workflow}`), pid: process.id }));
        });
    };

    changeWorkflow = (option: Option) => {
        this.setState({ workflow: option.value });
        if (option) {
            let promise = startProcess(option.value, []);

            let promise2 = catchErrorStatus<EngineStatus>(promise, 503, json => {
                setFlash(I18n.t("settings.status.engine.true"), "error");
                this.context.redirect("/processes");
            });

            catchErrorStatus<FormNotCompleteResponse>(promise2, 510, json => {
                this.setState({ stepUserInput: json.form, hasNext: json.hasNext });
            });
        }
    };

    render() {
        const { workflows, workflow, stepUserInput, hasNext } = this.state;
        return (
            <div className="mod-new-task">
                <section className="card">
                    <section className="form-step">
                        <h3>{I18n.t("task.new_task")}</h3>
                        <section className="form-divider">
                            <label>{I18n.t("task.workflow")}</label>
                            <em>{I18n.t("task.workflow_info")}</em>
                            <WorkflowSelect
                                workflows={workflows || []}
                                onChange={this.changeWorkflow}
                                workflow={workflow}
                            />
                        </section>
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
            </div>
        );
    }
}

NewTask.contextType = ApplicationContext;
