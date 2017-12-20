import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import {initialWorkflowInput, startTask, workflowsByTarget} from "../api";
import {isEmpty} from "../utils/Utils";
import {setFlash} from "../utils/Flash";
import UserInputForm from "../components/UserInputForm";

import "./NewTask.css";
import WorkflowSelect from "../components/WorkflowSelect";

export default class NewTask extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            workflows: [],
            workflow: {},
            stepUserInput: []
        };
    }

    componentDidMount = () => workflowsByTarget("SYSTEM").then(workflows => this.setState({workflows: workflows}));

    validSubmit = (stepUserInput) => {
        const {workflow} = this.state;
        if (!isEmpty(workflow)) {
            //create a copy to prevent re-rendering
            let taskInput = [...stepUserInput];
            taskInput = taskInput.reduce((acc, input) => {
                acc[input.name] = input.value;
                return acc;
            }, {});
            taskInput["workflow_key"] = workflow.value;
            startTask(taskInput)
                .then(() => {
                    this.props.history.push(`/tasks`);
                    setFlash(I18n.t("task.flash.create", {name: workflow.label}));
                });
        }
    };

    changeWorkflow = option => {
        this.setState({stepUserInput: []}, () => {
            this.setState({workflow: option});
            if (option) {
                initialWorkflowInput(option.value).then(result => this.setState({stepUserInput: result}));
            }
        });
    };

    render() {
        const {workflows, workflow, stepUserInput} = this.state;
        const {history} = this.props;
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
                                workflow={isEmpty(workflows) ? undefined : workflow.value}/>
                        </section>
                        {!isEmpty(workflow) &&
                        <UserInputForm stepUserInput={stepUserInput}
                                       multiServicePoints={[]}
                                       history={history}
                                       organisations={[]}
                                       products={[]}
                                       locationCodes={[]}
                                       product={({})}
                                       validSubmit={this.validSubmit}/>}
                    </section>
                </section>
            </div>
        );
    }
}

NewTask.propTypes = {
    history: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired
};
