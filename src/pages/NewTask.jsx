import React from "react";
import I18n from "i18n-js";
import { initialWorkflowInput, startTask, workflowsByTarget } from "../api";
import { isEmpty } from "../utils/Utils";
import { setFlash } from "../utils/Flash";
import UserInputForm from "../components/UserInputForm";
import ApplicationContext from "../utils/ApplicationContext";
import WorkflowSelect from "../components/WorkflowSelect";

import "./NewTask.scss";

export default class NewTask extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            workflows: [],
            workflow: {},
            stepUserInput: []
        };
    }

    componentDidMount = () => workflowsByTarget("SYSTEM").then(workflows => this.setState({ workflows: workflows }));

    validSubmit = taskInput => {
        const { workflow } = this.state;
        if (!isEmpty(workflow)) {
            let result = startTask(workflow.value, taskInput);
            result.then(() => {
                this.context.redirect(`/tasks`);
                setFlash(I18n.t("task.flash.create", { name: workflow.label }));
            });
            return result;
        }
    };

    changeWorkflow = option => {
        this.setState({ stepUserInput: [] }, () => {
            this.setState({ workflow: option });
            if (option) {
                initialWorkflowInput(option.value).then(result => this.setState({ stepUserInput: result }));
            }
        });
    };

    render() {
        const { workflows, workflow, stepUserInput } = this.state;
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
                            <UserInputForm stepUserInput={stepUserInput} validSubmit={this.validSubmit} />
                        )}
                    </section>
                </section>
            </div>
        );
    }
}

NewTask.propTypes = {};

NewTask.contextType = ApplicationContext;
