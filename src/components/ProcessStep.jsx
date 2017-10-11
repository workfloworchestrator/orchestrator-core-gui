import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import ConfirmationDialog from "./ConfirmationDialog";

import {isEmpty, stop} from "../utils/Utils";
import OrganisationSelect from "./OrganisationSelect";
import MultiServicePointSelect from "./MultiServicePointSelect";
import "highlight.js/styles/default.css";
import ProductSelect from "./ProductSelect";
import isEqual from "lodash/isEqual";
import EmailInput from "./EmailInput";
import IEEEInterfaceTypesSelectSelect from "./IEEEInterfaceTypesSelect";

import "./ProcessStep.css";


export default class ProcessStep extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this.setState({confirmationDialogOpen: false}),
            cancelDialogAction: () => this.props.history.push("/processes"),
            leavePage: true,
            errors: {},
            isNew: true,
            stepUserInput: [...props.stepUserInput]
        };
    }

    componentWillReceiveProps(nextProps) {
        if (!isEqual(nextProps.stepUserInput, this.state.stepUserInput)) {
            this.setState({stepUserInput: nextProps.stepUserInput});
        }
    };

    cancel = e => {
        stop(e);
        this.setState({confirmationDialogOpen: true});
    };

    submit = e => {
        stop(e);
        const {stepUserInput} = this.state;
        if (this.validateAllUserInput(stepUserInput)) {
            this.props.validSubmit(stepUserInput);
        }
    };

    validateAllUserInput = (stepUserInput) => {
        const errors = {...this.state.errors};
        stepUserInput.forEach(input => this.doValidateUserInput(input, input.value, errors));
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

    isInvalid = () => Object.keys(this.state.errors).some(key => this.state.errors[key]);

    userInputValue = name => {
        const userInput = this.state.stepUserInput;
        return userInput.find(input => input.name === name).value || "";
    };


    changeUserInput = (name, value) => {
        const userInput = [...this.state.stepUserInput];
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
        const type = userInput.type;
        const name = userInput.name;
        if (type === "int" || type === "capacity") {
            errors[name] = !/^\+?(0|[1-9]\d*)$/.test(value)
        } else if (type === "guid") {
            errors[name] = !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
        }
        else if (type === "emails") {
            errors[name] = isEmpty(value);
        } else {
            errors[name] = isEmpty(value);
        }
    };

    validateUserInput = name => e => {
        const value = e.target.value;
        const userInput = this.state.stepUserInput.find(input => input.name === name);
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
            case "guid":
            case "ims_free_port":
            case "port":
            case "ims_port_id":
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
                return <EmailInput emails={this.userInputToEmail(userInput.value)}
                                   onChangeEmails={this.changeArrayInput(name)}
                                   placeholder={""} multipleEmails={true} emailRequired={true}/>
            case "email" :
                return <EmailInput emails={this.userInputToEmail(userInput.value)}
                                   onChangeEmails={this.changeArrayInput(name)}
                                   placeholder={""} multipleEmails={false}/>
            case "ieee_interface_type":
                return <IEEEInterfaceTypesSelectSelect onChange={this.changeSelectInput(name)}
                                                interfaceTypes={this.props.ieeeInterfaceTypes}
                                                interfaceType={userInput.value}/>
            default:
                throw new Error(`Invalid / unknown type ${userInput.type}`);
        }
    };

    userInputToEmail = (input) => input ? input.split(",") : [];

    render() {
        const {confirmationDialogOpen, confirmationDialogAction, cancelDialogAction, stepUserInput, leavePage} = this.state;
        return (
            <div className="mod-process-step">
                <ConfirmationDialog isOpen={confirmationDialogOpen}
                                    cancel={cancelDialogAction}
                                    confirm={confirmationDialogAction}
                                    leavePage={leavePage}/>
                <section className="card">
                    <section className="form-step">
                        {stepUserInput.map(input => this.renderInput(input))}
                    </section>
                    {this.renderButtons()}
                </section>
            </div>
        );
    }
}

ProcessStep.propTypes = {
    history: PropTypes.object.isRequired,
    stepUserInput: PropTypes.array.isRequired,
    organisations: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired,
    multiServicePoints: PropTypes.array.isRequired,
    ieeeInterfaceTypes: PropTypes.array.isRequired,
    validSubmit: PropTypes.func.isRequired
};

