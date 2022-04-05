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

import "pages/NewTask.scss";

import { EuiPage, EuiPageBody } from "@elastic/eui";
import UserInputFormWizard from "components/inputForms/UserInputFormWizard";
import { JSONSchema6 } from "json-schema";
import React from "react";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";
import ApplicationContext from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";
import { EngineStatus, InputForm } from "utils/types";

interface IState {
    stepUserInput?: InputForm;
    hasNext?: boolean;
}

class NewTask extends React.Component<WrappedComponentProps, IState> {
    context!: React.ContextType<typeof ApplicationContext>;

    state: IState = {};

    componentDidMount = () => {
        this.context.apiClient.workflowsByTarget("SYSTEM").then((workflows) => {
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
                            options: options,
                        },
                    },
                } as JSONSchema6,
                hasNext: false,
            });
        });
    };

    validSubmit = (taskInput: {}[]) => {
        const { intl } = this.props;
        const { select_task } = taskInput[0] as { select_task: string };

        let promise = this.context.apiClient.startProcess(select_task, taskInput.slice(1)).then((process) => {
            this.context.redirect(`/tasks?highlight=${process.id}`);
            setFlash(
                intl.formatMessage(
                    { id: "task.flash.create" },
                    { name: intl.formatMessage({ id: `workflow.${select_task}` }), pid: process.id }
                )
            );
        });

        return this.context.apiClient.catchErrorStatus<EngineStatus>(promise, 503, (json) => {
            setFlash(intl.formatMessage({ id: "settings.status.engine.paused" }), "error");
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
                            <h1>
                                <FormattedMessage id="task.new_task" />
                            </h1>

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

export default injectIntl(NewTask);
