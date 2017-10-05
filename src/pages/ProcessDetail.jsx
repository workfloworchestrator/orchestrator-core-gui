import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import ConfirmationDialog from "../components/ConfirmationDialog";

import {process, resumeProcess} from "../api";
import {isEmpty, stop} from "../utils/Utils";
import {setFlash} from "../utils/Flash";
import "./ProcessDetail.css";
import OrganisationSelect from "../components/OrganisationSelect";
import MultiServicePointSelect from "../components/MultiServicePointSelect";
import Highlight from "react-highlight";
import "highlight.js/styles/default.css";
import ProductSelect from "../components/ProductSelect";
import EmailInput from "../components/EmailInput";

export default class ProcessDetail extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            process: {steps: []},
            notFound: false,
            tabs: ["user_input", "process"],
            selectedTab: "process",
            loaded: false,
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this.setState({confirmationDialogOpen: false}),
            cancelDialogAction: () => this.props.history.push("/processes"),
            leavePage: true,
            errors: {},
            isNew: true,
            userInputAllowed: true,
            stepUserInput: []
        };
    }

    componentWillMount = () => {
        process(this.props.match.params.id)
            .catch(err => {
                if (err.response && err.response.status === 404) {
                    this.setState({notFound: true, loaded: true});
                } else {
                    throw err;
                }
            }).then(processInstance => {
            const step = processInstance.steps.find(step => step.status === "pending");
            const stepUserInput = step && step.form;
            const {configuration, currentUser} = this.props;
            const requiredTeamMembership = configuration[processInstance.assignee];
            /**
             * This is the hook to enforce the correct membership for editing the user_input. For now we
             * don't enforce anything.
             * TODO
             */
            const userInputAllowed = (currentUser || currentUser.memberships.find(membership => membership === requiredTeamMembership));
            const tabs = (stepUserInput && userInputAllowed ? this.state.tabs : ["process"]);
            const selectedTab = (stepUserInput && userInputAllowed ? "user_input" : "process" );
            //Pre-fill the value of the user_input if the current_state already contains the value
            const state = processInstance.current_state || {};
            if (!isEmpty(state) && !isEmpty(stepUserInput)) {
                stepUserInput.forEach(userInput => userInput.value = state[userInput.name]);
            }
            this.setState({
                process: processInstance, loaded: true, isNew: false, stepUserInput: stepUserInput,
                userInputAllowed: userInputAllowed, tabs: tabs, selectedTab: selectedTab
            })
        });
    };

    cancel = e => {
        stop(e);
        this.setState({confirmationDialogOpen: true});
    };

    submit = e => {
        stop(e);
        const id = this.state.process.id;
        const userInput = this.userInput();
        if (this.validateAllUserInput()) {
            resumeProcess(id, userInput)
                .then(result => {
                    this.props.history.push(`/processes`);
                    setFlash(I18n.t("process.flash.update", {name: this.state.process.workflow}));
                });
        }
    };

    validateAllUserInput = () => {
        const errors = {...this.state.errors};
        const userInput = this.userInput();
        userInput.forEach(input => this.doValidateUserInput(input, input.value, errors));
        this.setState({errors: errors});
        return !Object.keys(errors).some(key => errors[key]);
    };

    renderButtons = () => {
        const invalid = this.isInvalid();
        return (<section className="buttons">
            <a className="button" onClick={this.cancel}>
                {I18n.t("process.cancel")}
            </a>
            <a tabIndex={0} className={`button ${invalid ? "grey disabled" : "blue"}`} onClick={this.submit}>
                {I18n.t("process.submit")}
            </a>
        </section>);
    };

    switchTab = tab => e => {
        stop(e);
        this.setState({selectedTab: tab});
    };

    isInvalid = () => Object.keys(this.state.errors).some(key => this.state.errors[key]);

    userInput = () => this.state.process.steps.find(step => step.status === "pending").form;

    userInputValue = name => {
        const userInput = this.userInput();
        return userInput.find(input => input.name === name).value || "";
    };


    changeUserInput = (name, value) => {
        const userInput = [...this.userInput()];
        userInput.find(input => input.name === name).value = value;
        this.setState({process: {...this.state.process, user_input: userInput}});
    };

    changeStringInput = name => e => {
        const value = e.target.value;
        this.changeUserInput(name, value);
    };

    changeSelectInput = name => option => {
        const value = option ? option.value : null;
        this.changeUserInput(name, value);
        this.validateUserInput(name)({target: {value: value}});
    };

    changeArrayInput = name => arr => {
        const value = (arr || []).join(",");
        this.changeUserInput(name, value);
        this.validateUserInput(name)({target: {value: value}});
    };


    doValidateUserInput = (userInput, value, errors) => {
        if (userInput.type === "int" || userInput.type === "capacity") {
            errors[userInput.name] = !/^\+?(0|[1-9]\d*)$/.test(value)
        } else if (userInput.type === "emails") {
            errors[userInput.name] = isEmpty(value);
        } else {
            errors[userInput.name] = isEmpty(value);
        }
    };

    validateUserInput = name => e => {
        const value = e.target.value;
        const userInput = this.userInput().find(input => input.name === name);
        const errors = {...this.state.errors};
        this.doValidateUserInput(userInput, value, errors);
        this.setState({errors: errors});
    };

    renderInput = userInput => {
        const name = userInput.name;
        return (
            <section key={name} className="form-divider">
                <label htmlFor="name">{I18n.t(`process.${name}`)}</label>
                <em>{I18n.t(`process.${name}_info`)}</em>
                <div className="validity-input-wrapper">
                    {this.chooseInput(userInput)}
                </div>
                {this.state.errors[name] &&
                <em className="error">{I18n.t("process.format_error")}</em>}
            </section>);

    };

    chooseInput = userInput => {
        const name = userInput.name;
        switch (userInput.type) {
            case "string" :
            case "capacity" :
            case "vlan" :
            case "ims_id":
                return <input type="text" id={name} name={name} value={this.userInputValue(name)}
                              onChange={this.changeStringInput(name)} onBlur={this.validateUserInput(name)}/>;
            case "msp" :
                return <MultiServicePointSelect key={name} onChange={this.changeSelectInput(name)} msp={userInput.value}
                                                msps={this.props.multiServicePoints}
                                                organisations={this.props.organisations}/>;
            case "organisation" :
                return <OrganisationSelect key={name} organisations={this.props.organisations}
                                           onChange={this.changeSelectInput(name)}
                                           organisation={userInput.value}/>;
            case "product" :
                return <ProductSelect products={this.props.products}
                                      onChange={this.changeSelectInput(name)}
                                      product={userInput.value}/>;
            case "emails" :
                return <EmailInput emails={this.userInputToEmail(userInput.value)} onChangeEmails={this.changeArrayInput(name)}
                                   placeholder={""} multipleEmails={true} emailRequired={true}/>
            case "email" :
                return <EmailInput emails={this.userInputToEmail(userInput.value)} onChangeEmails={this.changeArrayInput(name)}
                                   placeholder={""} multipleEmails={false} />
            default:
                throw new Error(`Invalid / unknown type ${userInput.type}`);
        }
    };

    userInputToEmail = (input) => input ? input.split(",") : [];

    renderUserInput = (process, step, stepUserInput) => {
        return (
            <section className="form-step">
                <h3>{I18n.t("process.userInput", {name: step.name, product: process.product})}</h3>
                {stepUserInput.map(input => this.renderInput(input))}
            </section>)
    };

    renderTabContent = (renderStepForm, selectedTab, process, step, stepUserInput) => {
        if (selectedTab === "process") {
            return <section className="card">
                <section className="process-detail">
                    <Highlight className="JSON">
                        {JSON.stringify(process, null, 4)}
                    </Highlight>
                </section>
            </section>;
        } else {
            return <section className="card">
                {this.renderUserInput(process, step, stepUserInput)}
                {this.renderButtons()}
            </section>;
        }
    };

    renderTab = (tab, selectedTab) =>
        <span key={tab} className={tab === selectedTab ? "active" : ""}
              onClick={this.switchTab(tab)}>
            {I18n.t(`process.tabs.${tab}`)}
        </span>
    ;

    render() {
        const {
            loaded, notFound, process, tabs, confirmationDialogOpen, confirmationDialogAction, cancelDialogAction,
            leavePage, stepUserInput, userInputAllowed, selectedTab
        } = this.state;
        const step = process.steps.find(step => step.status === "pending");
        const renderNotFound = loaded && notFound;
        const renderContent = loaded && !notFound;
        const renderStepForm = renderContent && stepUserInput && userInputAllowed;
        return (
            <div className="mod-process-detail">
                <ConfirmationDialog isOpen={confirmationDialogOpen}
                                    cancel={cancelDialogAction}
                                    confirm={confirmationDialogAction}
                                    leavePage={leavePage}/>
                <section className="tabs">
                    {tabs.map(tab => this.renderTab(tab, selectedTab))}
                </section>
                {renderContent && this.renderTabContent(renderStepForm, selectedTab, process, step, stepUserInput)}
                {renderNotFound && <section>{I18n.t("process.notFound")}</section>}
            </div>
        );
    }
}

ProcessDetail.propTypes = {
    history: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    configuration: PropTypes.object.isRequired,
    organisations: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired,
    multiServicePoints: PropTypes.array.isRequired
};

