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
import {validEmailRegExp} from "../validations/Subscriptions";
import {lookupValueFromProcessState} from "../utils/ProcessState";


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
            interDependentState: {}
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

    storeInterDependentState = (name, value) => {
        const interDependentState = {...this.state.interDependentState};
        interDependentState[name] = value;
        this.setState({interDependentState: interDependentState});
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
        if (type === "int") {
            errors[name] = !/^\+?(0|[1-9]\d*)$/.test(value)
        } else if (type === "vlan" || type === "ssp_1_vlan" || type === "ssp_2_vlan") {
            errors[name] = !/^\d{1,4}$/.test(value) || value <= 1 || value >= 4096
        } else if (type === "guid") {
            errors[name] = !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
        } else if (type === "uuid") {
            errors[name] = !/^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89ABab][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}$/.test(value)
        } else if (type === "emails") {
            errors[name] = isEmpty(value);
        } else if (type === "nms_service_id") {
            errors[name] = !/^[0-9]{4}$/.test(value);
        } else if (type === "contact_persons") {
            errors[name] = isEmpty(value) || value.some(p => !validEmailRegExp.test(p.email))
        } else if (type === "multi_msp") {
            errors[name] = isEmpty(value) || value.some(msp => isEmpty(msp.subscription_id) || isEmpty(msp.vlan))
        } else if (type === "accept") {
            errors[name] = !value;
        } else if (type === "boolean") {
            errors[name] = isEmpty(!!value);
        } else if (type === "crm_port_id") {
            errors[name] = !/^\d{5}$/.test(value)
        } else if (type === "label") {
            errors[name] = false;
        }
        else {
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

    renderInput = (userInput, process) => {
        const name = userInput.name;
        const ignoreLabel = inputTypesWithoutLabelInformation.indexOf(userInput.type) > -1;
        return (
            <section key={name} className={`form-divider ${name}`}>
                {!ignoreLabel && <label htmlFor="name">{I18n.t(`process.${name}`)}</label>}
                {!ignoreLabel && <em>{I18n.t(`process.${name}_info`)}</em>}
                {this.chooseInput(userInput, process)}
                {this.state.errors[name] &&
                <em className="error">{I18n.t("process.format_error")}</em>}
            </section>);

    };

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
                return <input type="text" id={name} name={name} value={this.userInputValue(name)}
                              onChange={this.changeStringInput(name)} onBlur={this.validateUserInput(name)}/>;
            case "subscription_id":
                return <ReadOnlySubscriptionView subscriptionId={value}
                                                 products={this.props.products}
                                                 organisations={this.props.organisations}
                                                 className="indent"
                                                 storeInterDependentState={this.storeInterDependentState}/>;
            case "nms_service_id" :
            case "bandwidth":
            case "vlan" :
            case "ssp_1_vlan":
            case "ssp_2_vlan":
                return <input type="number" step="1" min="2" max="4095" id={name} name={name}
                              value={this.userInputValue(name)}
                              onChange={this.changeStringInput(name)} onBlur={this.validateUserInput(name)}/>;
            case "msp" :
                return <MultiServicePointSelect key={name} onChange={this.changeSelectInput(name)} msp={value}
                                                msps={this.props.multiServicePoints}
                                                organisations={this.props.organisations}/>;
            case "organisation" :
                return <OrganisationSelect key={name} organisations={this.props.organisations}
                                           onChange={this.changeSelectInput(name)}
                                           storeInterDependentState={this.storeInterDependentState}
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
                return <ContactPersons
                    persons={isEmpty(value) ? [{email: "", name: "", phone: ""}] : value}
                    interDependentState={this.state.interDependentState}
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
                const stepUserInput = this.state.stepUserInput;
                const productUserInput = stepUserInput.find(input => input.name === userInput.product_key);
                const productId = productUserInput ? productUserInput.value : null;
                return <IEEEInterfaceTypesForProductTagSelect onChange={this.changeSelectInput(name)}
                                                              interfaceType={value}
                                                              productId={productId}/>;
            case "ieee_interface_type_for_product_tag":
                const propsProductId = this.props.product.value || this.props.product.product_id;
                return <IEEEInterfaceTypesForProductTagSelect onChange={this.changeSelectInput(name)}
                                                              interfaceType={value}
                                                              productId={propsProductId}/>;
            case "free_ports_for_location_code_and_interface_type":
                const interfaceType = lookupValueFromProcessState(userInput.interface_type_key, currentState);
                const locationCode = lookupValueFromProcessState(userInput.location_code_key, currentState);
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
            case "location_code_ssp_1":
            case "location_code_ssp_2":
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
