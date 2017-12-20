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
import IEEEInterfaceTypesForProductTagSelect from "./IEEEInterfaceTypesForProductTagSelect";
import FreePortSelect from "./FreePortSelect";
import LocationCodeSelect from "./LocationCodeSelect";
import CheckBox from "./CheckBox";
import ContactPersons from "./ContactPersons";
import StateValue from "./StateValue";

import "./UserInputForm.css";
import ReadOnlySubscriptionView from "./ReadOnlySubscriptionView";
import MultipleMSPs from "./MultipleMSPs";
import {lookupValueFromNestedState} from "../utils/NestedState";
import {doValidateUserInput} from "../validations/UserInput";
import VirtualLAN from "./VirtualLAN";
import {randomCrmIdentifier} from "../locale/en";


const inputTypesWithoutLabelInformation = ["boolean", "subscription_termination_confirmation", "label"];

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
            processing: false,
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
        stepUserInput.forEach(input => doValidateUserInput(input, input.value, errors));
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

    validateUserInput = name => e => {
        const value = e.target.value;
        const userInput = this.state.stepUserInput.find(input => input.name === name);
        const errors = {...this.state.errors};
        doValidateUserInput(userInput, value, errors);
        this.setState({errors: errors});
    };

    onError = name => value => this.setState({errors: {...this.state.errors, name: value}});

    renderInput = (userInput, process) => {
        const name = userInput.name;
        const ignoreLabel = inputTypesWithoutLabelInformation.indexOf(userInput.type) > -1;
        const error = this.state.errors[name];
        return (
            <section key={name} className={`form-divider ${name}`}>
                {!ignoreLabel && <label htmlFor="name">{I18n.t(`process.${name}`)}</label>}
                {!ignoreLabel && this.renderInputInfoLabel(name)}
                {this.chooseInput(userInput, process)}
                {error &&
                <em className="error">{I18n.t("process.format_error")}</em>}
            </section>);

    };

    renderInputInfoLabel = name => {
        if (name.indexOf("crm_port_id") > -1) {
            return <em>{I18n.t(`process.${name}_info`, {example: randomCrmIdentifier()})}</em>;
        }
        return <em>{I18n.t(`process.${name}_info`)}</em>;
    };

    findValueFromInputStep = relatedKey => {
        const stepUserInput = this.state.stepUserInput;
        const relatedUserInput = stepUserInput.find(input => input.name === relatedKey);
        return relatedUserInput ? relatedUserInput.value : null;
    } ;

    chooseInput = (userInput, process) => {
        const name = userInput.name;
        const value = userInput.value;
        const currentState = this.props.currentState;
        switch (userInput.type) {
            case "string" :
            case "guid":
            case "uuid":
            case "crm_port_id":
            case "ims_free_port":
            case "port":
            case "ims_port_id":
            case "ims_id":
            case "isalias":
                return <input type="text" id={name} name={name} value={value || ""}
                              onChange={this.changeStringInput(name)} onBlur={this.validateUserInput(name)}/>;
            case "subscription_id":
                return <ReadOnlySubscriptionView subscriptionId={value}
                                                 products={this.props.products}
                                                 organisations={this.props.organisations}
                                                 className="indent"/>;
            case "nms_service_id" :
            case "bandwidth":
                return <input type="number" id={name} name={name}
                              value={value || ""}
                              onChange={this.changeStringInput(name)} onBlur={this.validateUserInput(name)}/>;
            case "vlan" :
            case "vlan_range" :
                const subscriptionIdMSP = this.findValueFromInputStep(userInput.msp_key);
                return <VirtualLAN vlan={value} onChange={this.changeStringInput(name)}
                                   subscriptionIdMSP={subscriptionIdMSP} onBlur={this.validateUserInput(name)}/>
            case "msp" :
                return <MultiServicePointSelect key={name} onChange={this.changeSelectInput(name)} msp={value}
                                                msps={this.props.multiServicePoints}
                                                organisations={this.props.organisations}/>;
            case "organisation" :
                return <OrganisationSelect key={name} organisations={this.props.organisations}
                                           onChange={this.changeSelectInput(name)}
                                           organisation={value}/>;
            case "product" :
                return <ProductSelect products={this.props.products}
                                      onChange={this.changeSelectInput(name)}
                                      product={value}/>;
            case "ssp_product" :
                return <ProductSelect products={this.props.products.filter(prod => prod.tag === "SSP")}
                                      onChange={this.changeSelectInput(name)}
                                      product={value}/>;
            case "contact_persons" :
                const organisationId = lookupValueFromNestedState(userInput.organisation_key, currentState) ||
                    this.findValueFromInputStep(userInput.organisation_key);
                return <ContactPersons
                    persons={isEmpty(value) ? [{email: "", name: "", phone: ""}] : value}
                    organisationId={organisationId}
                    onChange={this.changeNestedInput(name)}/>;
            case "emails" :
                return <EmailInput emails={this.userInputToEmail(value)}
                                   onChangeEmails={this.changeArrayInput(name)}
                                   placeholder={""} multipleEmails={true} emailRequired={true}/>;
            case "email" :
                return <EmailInput emails={this.userInputToEmail(value)}
                                   onChangeEmails={this.changeArrayInput(name)}
                                   placeholder={""} multipleEmails={false}/>;
            case "ieee_interface_type":
                const productId = this.findValueFromInputStep(userInput.product_key);
                return <IEEEInterfaceTypesForProductTagSelect onChange={this.changeSelectInput(name)}
                                                              interfaceType={value}
                                                              productId={productId}/>;
            case "ieee_interface_type_for_product_tag":
                const propsProductId = this.props.product.value || this.props.product.product_id;
                return <IEEEInterfaceTypesForProductTagSelect onChange={this.changeSelectInput(name)}
                                                              interfaceType={value}
                                                              productId={propsProductId}/>;
            case "free_ports_for_location_code_and_interface_type":
                const interfaceType = lookupValueFromNestedState(userInput.interface_type_key, currentState);
                const locationCode = lookupValueFromNestedState(userInput.location_code_key, currentState);
                return <FreePortSelect
                    onChange={this.changeSelectInput(name)}
                    freePort={value}
                    interfaceType={interfaceType}
                    locationCode={locationCode}/>;
            case "subscription_termination_confirmation":
                return <div>
                    <CheckBox name={name} value={value || false}
                              onChange={this.changeBooleanInput(name)}
                              info={I18n.t(`process.${name}`)}/>
                    <section className="form-divider"></section>
                    <ReadOnlySubscriptionView subscriptionId={process.current_state.subscription_id}
                                              products={this.props.products}
                                              organisations={this.props.organisations}
                                              className="indent"/>
                </div>;
            case "accept":
            case "boolean":
                return <CheckBox name={name} value={value || false}
                                 onChange={this.changeBooleanInput(name)}
                                 info={I18n.t(`process.${name}`)}/>;
            case "location_code":
                return <LocationCodeSelect onChange={this.changeSelectInput(name)}
                                           locationCodes={this.props.locationCodes}
                                           locationCode={value}/>;
            case "label_with_state":
                return <StateValue className={userInput.name} value={value}/>;
            case "label":
                return <p className={userInput.name}>{I18n.t(`process.${userInput.name}`)}</p>;
            case "multi_msp":
                return <MultipleMSPs msps={isEmpty(value) ? [
                    {subscription_id: null, vlan: ""},
                    {subscription_id: null, vlan: ""}
                ] : value}
                                     availableMSPs={this.props.multiServicePoints}
                                     organisations={this.props.organisations}
                                     onChange={this.changeNestedInput(name)}/>;
            default:
                throw new Error(`Invalid / unknown type ${userInput.type}`);
        }
    };

    userInputToEmail = (input) => input ? input.split(",") : [];

    render() {
        const {
            confirmationDialogOpen, confirmationDialogAction, cancelDialogAction, stepUserInput,
            leavePage
        } = this.state;
        const {process} = this.props;
        return (
            <div className="mod-process-step">
                <ConfirmationDialog isOpen={confirmationDialogOpen}
                                    cancel={cancelDialogAction}
                                    confirm={confirmationDialogAction}
                                    leavePage={leavePage}/>
                <section className="card">
                    <section className="form-step">
                        {stepUserInput.map(input => this.renderInput(input, process))}
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
    locationCodes: PropTypes.array.isRequired,
    product: PropTypes.object,
    validSubmit: PropTypes.func.isRequired,
    process: PropTypes.object,
};
