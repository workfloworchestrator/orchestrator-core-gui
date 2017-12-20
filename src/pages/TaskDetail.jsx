import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import {resumeTask, task} from "../api";
import {isEmpty, stop} from "../utils/Utils";
import {setFlash} from "../utils/Flash";
import UserInputForm from "../components/UserInputForm";
import TaskStateDetails from "../components/TaskStateDetails";
import {lookupValueFromNestedState} from "../utils/NestedState";
import {abortTask, deleteTask, retryTask} from "../api/index";

import "./TaskDetail.css";
import ConfirmationDialog from "../components/ConfirmationDialog";
import {actionOptions} from "../validations/Processes";

export default class TaskDetail extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            task: {steps: []},
            notFound: false,
            tabs: ["user_input", "task"],
            selectedTab: "task",
            loaded: false,
            stepUserInput: [],
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this,
            confirm: () => this,
            confirmationDialogQuestion: "",
        };
    }

    componentWillMount = () => {
        task(this.props.match.params.id)
            .then(taskInstance => {
                /**
                 * This is the hook to enforce the correct membership for editing the user_input. For now we
                 * don't enforce anything.
                 * TODO
                 */

                const {configuration, currentUser} = this.props;

                const userInputAllowed = (currentUser || currentUser.memberships.find(membership => membership === requiredTeamMembership));
                let stepUserInput = [];
                if (taskInstance.last_status.toLowerCase() === "suspended" && userInputAllowed) {
                    const step = taskInstance.steps.find(step => step.name === taskInstance.last_step && step.status === "pending");
                    stepUserInput = step && step.form;
                }
                const requiredTeamMembership = configuration[taskInstance.assignee];
                const tabs = !isEmpty(stepUserInput) ? this.state.tabs : ["task"];
                const selectedTab = !isEmpty(stepUserInput) ? "user_input" : "task";
                //Pre-fill the value of the user_input if the current_state already contains the value
                const state = taskInstance.current_state || {};
                if (!isEmpty(state) && !isEmpty(stepUserInput)) {
                    stepUserInput.forEach(userInput => userInput.value = lookupValueFromNestedState(userInput.name, state));
                }
                this.setState({
                    task: taskInstance, loaded: true, stepUserInput: stepUserInput, tabs: tabs, selectedTab: selectedTab
                });
            }).catch(err => {
            if (err.response && err.response.status === 404) {
                this.setState({notFound: true, loaded: true});
            } else {
                throw err;
            }
        });
    };

    handleDeleteTask = task => e => {
        stop(e);
        this.confirmation(I18n.t("tasks.deleteConfirmation", {
                name: task.productName,
                customer: task.customerName
            }), () =>
                deleteTask(task.id).then(() => {
                    this.props.history.push(`/tasks`);
                    setFlash(I18n.t("tasks.flash.delete", {name: task.productName}));
                })
        );
    };

    handleAbortTask = task => e => {
        stop(e);
        this.confirmation(I18n.t("tasks.abortConfirmation", {
                name: task.productName,
                customer: task.customerName
            }), () =>
                abortTask(task.id).then(() => {
                    this.props.history.push(`/tasks`);
                    setFlash(I18n.t("tasks.flash.abort", {name: task.productName}));
                })
        );
    };

    handleRetryTask = task => e => {
        stop(e);
        this.confirmation(I18n.t("tasks.retryConfirmation", {
                name: task.productName,
                customer: task.customerName
            }), () =>
                retryTask(task.id).then(() => {
                    this.props.history.push(`/tasks`);
                    setFlash(I18n.t("tasks.flash.retry", {name: task.productName}));
                })
        );
    };

    cancelConfirmation = () => this.setState({confirmationDialogOpen: false});

    confirmation = (question, action) => this.setState({
        confirmationDialogOpen: true,
        confirmationDialogQuestion: question,
        confirmationDialogAction: () => {
            this.cancelConfirmation();
            action();
        }
    });


    renderActions = task => {
        const options = actionOptions(task, () => false, this.handleRetryTask(task),
            this.handleDeleteTask(task), this.handleAbortTask(task), "last_status")
            .filter(option => option.label !== "user_input" && option.label !== "details");
        return <section className="task-actions">
            {options.map((option, index) => <a key={index} className={`button ${option.danger ? " red" : " blue"}`}
                                               onClick={option.action}>
                {I18n.t(`tasks.${option.label}`)}
            </a>)}
        </section>
    };


    validSubmit = stepUserInput => {
        const {task} = this.state;
        resumeTask(task.id, stepUserInput)
            .then(() => {
                this.props.history.push(`/tasks`);
                setFlash(I18n.t("task.flash.update", {name: task.workflow_name}));
            });
    };

    switchTab = tab => e => {
        stop(e);
        this.setState({selectedTab: tab});
    };

    renderTabContent = (renderStepForm, selectedTab, task, step, stepUserInput, subscriptionTaskLink, multiServicePoints) => {
        const {history} = this.props;

        if (selectedTab === "task") {
            return <section className="card">
                {this.renderActions(task)}
                <TaskStateDetails task={task}/>
            </section>;
        } else {
            return <section className="card">
                <section className="header-info">
                    <h3>{I18n.t("task.workflow", {name: task.workflow})}</h3>
                    <h3>{I18n.t("task.userInput", {name: step.name})}</h3>
                </section>
                <UserInputForm locationCodes={[]}
                               stepUserInput={stepUserInput}
                               products={[]}
                               organisations={[]}
                               history={history}
                               multiServicePoints={[]}
                               product={({})}
                               currentState={task.current_state}
                               validSubmit={this.validSubmit}
                               task={task}/>
            </section>;
        }
    };

    renderTab = (tab, selectedTab) =>
        <span key={tab} className={tab === selectedTab ? "active" : ""}
              onClick={this.switchTab(tab)}>
            {I18n.t(`task.tabs.${tab}`)}
        </span>;

    render() {
        const {
            loaded, notFound, task, tabs, stepUserInput, selectedTab, subscriptionTaskLink,
            confirmationDialogOpen, confirmationDialogAction, confirmationDialogQuestion, multiServicePoints
        } = this.state;
        const step = task.steps.find(step => step.status === "pending");
        const renderNotFound = loaded && notFound;
        const renderContent = loaded && !notFound;
        const renderStepForm = renderContent && !isEmpty(stepUserInput);
        return (
            <div className="mod-task-detail">
                <ConfirmationDialog isOpen={confirmationDialogOpen}
                                    cancel={this.cancelConfirmation}
                                    confirm={confirmationDialogAction}
                                    question={confirmationDialogQuestion}/>
                <section className="tabs">
                    {tabs.map(tab => this.renderTab(tab, selectedTab))}
                </section>
                {renderContent && this.renderTabContent(renderStepForm, selectedTab, task, step, stepUserInput,
                    subscriptionTaskLink, multiServicePoints)}
                {renderNotFound && <section className="not-found card"><h1>{I18n.t("task.notFound")}</h1></section>}
            </div>
        );
    }
}

TaskDetail.propTypes = {
    history: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    configuration: PropTypes.object.isRequired,
};
