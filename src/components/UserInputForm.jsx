import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import ConfirmationDialog from "./ConfirmationDialog";

import {isEmpty, stop} from "../utils/Utils";
import OrganisationSelect from "./OrganisationSelect";
import MultiServicePointSelect from "./MultiServicePointSelect";
import ProductSelect from "./ProductSelect";
import isEqual from "lodash/isEqual";
import EmailInput from "./EmailInput";
import IEEEInterfaceTypesSelect from "./IEEEInterfaceTypesSelect";
import IEEEInterfaceTypesForProductTagSelect from "./IEEEInterfaceTypesForProductTagSelect";
import FreePortSelect from "./FreePortSelect";
import LocationCodeSelect from "./LocationCodeSelect";
import CheckBox from "./CheckBox";
import ContactPersons from "./ContactPersons";

import "./UserInputForm.css";
import ReadOnlySubscriptionView from "./ReadOnlySubscriptionView";

export default class UserInputForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this.setState({confirmationDialogOpen: false}),
            cancelDialogAction: () => this.props.history.push("/processes"),
            leavePage: true,
            errors: {},
            isNew: true,
            stepUserInput: [...props.stepUserInput],
            product: {},
            processing: false
        };
    }

    componentWillReceiveProps(nextProps) {
        if (!isEqual(nextProps.stepUserInput, this.state.stepUserInput)) {
            this.setState({stepUserInput: [...nextProps.stepUserInput]});
        }
    };

    cancel = e => {
        stop(e);
        this.setState({confirmationDialogOpen: true});
    };

    submit = e => {
        stop(e);
        const {stepUserInput, processing} = this.state;
        if (this.validateAllUserInput(stepUserInput) && !processing) {
            this.setState({processing: true});
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
        const invalid = this.isInvalid() || this.state.processing;
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

    changeBooleanInput = name => e => {
        const value = e.target.checked;
        this.changeUserInput(name, value);
        const {stepUserInput} = this.state;
        this.validateAllUserInput(stepUserInput);
    };

    changeSelectInput = name => option => {
        const value = option ? option.value : null;
        this.changeUserInput(name, value);
        this.validateUserInput(name)({target: {value: value}});
    };

    changeNestedInput = name => newValue => {
        this.changeUserInput(name, newValue);
        this.validateUserInput(name)({target: {value: newValue}});
    };

    changeArrayInput = name => arr => {
        const value = (arr || []).join(",");
        this.changeUserInput(name, value);
        this.validateUserInput(name)({target: {value: value}});
    };


    doValidateUserInput = (userInput, value, errors) => {
        const type = userInput.type;
        const name = userInput.name;
        if (type === "int" || type === "vlan") {
            errors[name] = !/^\+?(0|[1-9]\d*)$/.test(value)
        } else if (type === "guid") {
            errors[name] = !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
        } else if (type === "emails") {
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
        const isBoolean = userInput.type === "boolean";
        return (
            <section key={name} className="form-divider">
                {!isBoolean && <label htmlFor="name">{I18n.t(`process.${name}`)}</label>}
                {!isBoolean && <em>{I18n.t(`process.${name}_info`)}</em>}
                {this.chooseInput(userInput)}
                {this.state.errors[name] &&
                <em className="error">{I18n.t("process.format_error")}</em>}
            </section>);

    };

    chooseInput = userInput => {
        const name = userInput.name;
        switch (userInput.type) {
            case "string" :
            case "vlan" :
            case "ssp_1_vlan" :
            case "ssp_2_vlan" :
            case "guid":
            case "ims_free_port":
            case "port":
            case "ims_port_id":
            case "ims_id":
                return <input type="text" id={name} name={name} value={this.userInputValue(name)}
                              onChange={this.changeStringInput(name)} onBlur={this.validateUserInput(name)}/>;
            case "subscription_id":
                return <ReadOnlySubscriptionView subscriptionId={userInput.value}
                                                 products={this.props.products}
                                                 organisations={this.props.organisations}
                                                 className="indent"/>
            case "bandwidth":
                return <input type="number" step="1" min="0" id={name} name={name} value={this.userInputValue(name)}
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
            case "ssp_product" :
                return <ProductSelect products={this.props.products.filter(prod => prod.product_type === "ssp")}
                                      onChange={this.changeSelectInput(name)}
                                      product={userInput.value}/>;
            case "contact_persons" :
                return <ContactPersons
                    persons={isEmpty(userInput.value) ? [{email: "", name: "", tel: ""}] : userInput.value}
                    onChange={this.changeNestedInput(name)}/>;
            case "emails" :
                return <EmailInput emails={this.userInputToEmail(userInput.value)}
                                   onChangeEmails={this.changeArrayInput(name)}
                                   placeholder={""} multipleEmails={true} emailRequired={true}/>;
            case "email" :
                return <EmailInput emails={this.userInputToEmail(userInput.value)}
                                   onChangeEmails={this.changeArrayInput(name)}
                                   placeholder={""} multipleEmails={false}/>;
            case "ieee_interface_type":
            case "ieee_interface_type_ssp_1":
            case "ieee_interface_type_ssp_2":
                return <IEEEInterfaceTypesSelect onChange={this.changeSelectInput(name)}
                                                 interfaceTypes={this.props.ieeeInterfaceTypes}
                                                 interfaceType={userInput.value}/>;
            case "ieee_interface_type_for_product_tag":
                return <IEEEInterfaceTypesForProductTagSelect onChange={this.changeSelectInput(name)}
                                                              interfaceType={userInput.value}
                                                              productTag={this.props.product.tag}/>;
            case "free_ports_for_location_code_and_interface_type":
                return <FreePortSelect onChange={this.changeSelectInput(name)}
                                       freePort={userInput.value}
                                       interfaceType={this.props.currentState.ieee_interface_type}
                                       locationCode={this.props.currentState.location_code}/>;
            case "free_ports_for_location_code_and_interface_type_ssp_1":
                return <FreePortSelect onChange={this.changeSelectInput(name)}
                                       freePort={userInput.value}
                                       interfaceType={this.props.currentState.ieee_interface_type_ssp_1}
                                       locationCode={this.props.currentState.location_code_ssp_1}/>;
            case "free_ports_for_location_code_and_interface_type_ssp_2":
                return <FreePortSelect onChange={this.changeSelectInput(name)}
                                       freePort={userInput.value}
                                       interfaceType={this.props.currentState.ieee_interface_type_ssp_2}
                                       locationCode={this.props.currentState.location_code_ssp_2}/>;
            case "boolean":
                return <CheckBox name={userInput.name} value={userInput.value || false}
                                 onChange={this.changeBooleanInput(userInput.name)}
                                 info={I18n.t(`process.${userInput.name}`)}/>;
            case "location_code":
            case "location_code_ssp_1":
            case "location_code_ssp_2":
                return <LocationCodeSelect onChange={this.changeSelectInput(name)}
                                           locationCodes={this.props.locationCodes}
                                           locationCode={userInput.value}/>;
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

UserInputForm.propTypes = {
    history: PropTypes.object.isRequired,
    stepUserInput: PropTypes.array.isRequired,
    organisations: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired,
    multiServicePoints: PropTypes.array.isRequired,
    ieeeInterfaceTypes: PropTypes.array.isRequired,
    locationCodes: PropTypes.array.isRequired,
    product: PropTypes.object,
    validSubmit: PropTypes.func.isRequired
};
