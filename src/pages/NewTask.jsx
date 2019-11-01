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

import React from "react";
import I18n from "i18n-js";
import { startTask, workflowsByTarget, catchErrorStatus } from "../api";
import { isEmpty } from "../utils/Utils";
import { setFlash } from "../utils/Flash";
import UserInputFormWizard from "../components/UserInputFormWizard";
import ApplicationContext from "../utils/ApplicationContext";
import WorkflowSelect from "../components/WorkflowSelect";

import "./NewTask.scss";

export default class NewTask extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            workflows: [],
            workflow: {},
            stepUserInput: [],
            hasNext: false
        };
    }

    componentDidMount = () => workflowsByTarget("SYSTEM").then(workflows => this.setState({ workflows: workflows }));

    validSubmit = taskInput => {
        const { workflow } = this.state;
        if (!isEmpty(workflow)) {
            let result = startTask(workflow.value, taskInput);
            result
                .then(() => {
                    this.context.redirect(`/tasks`);
                    setFlash(I18n.t("task.flash.create", { name: workflow.label }));
                })
                .catch(error => {
                    // Todo: handle errors in a more uniform way. The error dialog is behind stack trace when enabled. This catch shouldn't be needed.
                });
            return result;
        }
    };

    changeWorkflow = option => {
        this.setState({ workflow: option });
        if (option) {
            let promise = startTask(option.value, []);
            catchErrorStatus(promise, 510, json => {
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
                                workflows={workflows}
                                onChange={this.changeWorkflow}
                                workflow={isEmpty(workflows) ? undefined : workflow.value}
                            />
                        </section>
                        {!isEmpty(workflow) && (
                            <UserInputFormWizard
                                stepUserInput={stepUserInput}
                                validSubmit={this.validSubmit}
                                hasNext={hasNext}
                            />
                        )}
                    </section>
                </section>
            </div>
        );
    }
}

NewTask.propTypes = {};

NewTask.contextType = ApplicationContext;
