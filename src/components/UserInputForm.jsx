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
import {findValueFromInputStep, lookupValueFromNestedState} from "../utils/NestedState";
import {doValidateUserInput} from "../validations/UserInput";
import VirtualLAN from "./VirtualLAN";
import {randomCrmIdentifier} from "../locale/en";
import SubscriptionsSelect from "./SubscriptionsSelect";
import BandwidthSelect from "./BandwidthSelect";
import {filterProductsByTagAndBandwidth} from "../validations/Products";


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
            uniqueErrors: {},
            uniqueSelectInputs: {},
            isNew: true,
            stepUserInput: [...props.stepUserInput],
            product: {},
            processing: false,
            randomCrm: randomCrmIdentifier()
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

    isInvalid = () => Object.keys(this.state.errors).some(key => this.state.errors[key]) ||
                      Object.keys(this.state.uniqueErrors).some(key => this.state.uniqueErrors[key])

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

    enforceSelectInputUniqueness = (hash, name, value) => {
        // Block multiple select drop-downs sharing a base list identified by 'hash' to select the same value more than once
        const hashTable = {...this.state.uniqueSelectInputs};
        const errors = {...this.state.uniqueErrors};
        if(!(hash in hashTable)) hashTable[hash] = {'names': {}, 'values': {}};
        const names = hashTable[hash]['names'];
        const values = hashTable[hash]['values'];
        if(!(value in values)) values[value] = 0;
        values[value] += 1;
        if(name in names) values[names[name]] -= 1;
        names[name] = value;
        Object.keys(names).forEach(name => {errors[name] = values[names[name]] > 1;});
        this.setState({uniqueErrors: errors});
        this.setState({uniqueSelectInputs: hashTable});
    };

    changeUniqueSelectInput = (name, hash) => option => {
        const value = option ? option.value : null;
        this.changeUserInput(name, value);
        this.enforceSelectInputUniqueness(hash, name, value);
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
        doValidateUserInput(userInput, value, errors);
        this.setState({errors: errors});
    };

    onError = name => value => this.setState({errors: {...this.state.errors, name: value}});

    renderInput = (userInput, process) => {
        const name = userInput.name;
        const ignoreLabel = inputTypesWithoutLabelInformation.indexOf(userInput.type) > -1;
        const error = this.state.errors[name];
        const uniqueError = this.state.uniqueErrors[name];
        return (
            <section key={name} className={`form-divider ${name}`}>
                {!ignoreLabel && <label htmlFor="name">{I18n.t(`process.${name}`)}</label>}
                {!ignoreLabel && this.renderInputInfoLabel(name)}
                {this.chooseInput(userInput, process)}
                {error &&
                <em className="error">{I18n.t("process.format_error")}</em>}
                {uniqueError &&
                <em className="error">{I18n.t("process.uniquenessViolation")}</em>}
            </section>);
    };

    renderInputInfoLabel = name => {
        if (name.indexOf("crm_port_id") > -1) {
            return <em>{I18n.t(`process.${name}_info`, {example: this.state.randomCrm})}</em>;
        }
        return <em>{I18n.t(`process.${name}_info`)}</em>;
    };

    chooseInput = (userInput, process) => {
        const name = userInput.name;
        const value = userInput.value;
        const {currentState} = this.props;
        const stepUserInput = this.state.stepUserInput;
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
            case "stp":
                return <input type="text" id={name} name={name} value={value || ""}
                              onChange={this.changeStringInput(name)} onBlur={this.validateUserInput(name)}/>;
            case "subscription_id":
                return <ReadOnlySubscriptionView subscriptionId={value}
                                                 products={this.props.products}
                                                 organisations={this.props.organisations}
                                                 className="indent"/>;
            case "nms_service_id" :
            case "bandwidth":
                return <BandwidthSelect stepUserInput={stepUserInput} name={name} onBlur={this.validateUserInput(name)}
                                        onChange={this.changeStringInput(name)} value={value || ""}
                                        portsKey={userInput.ports_key} disabled={userInput.readonly}/>;
            case "vlan" :
            case "vlan_range" :
                const subscriptionIdMSP = findValueFromInputStep(userInput.msp_key, stepUserInput);
                const imsCircuitId = lookupValueFromNestedState(userInput.ims_circuit_id, currentState);
                return <VirtualLAN vlan={value} onChange={this.changeStringInput(name)}
                                   subscriptionIdMSP={subscriptionIdMSP} onBlur={this.validateUserInput(name)}
                                   imsCircuitId={imsCircuitId}/>
            case "msp" :
                const bandwidthMsp = findValueFromInputStep("bandwidth", stepUserInput) ||
                    lookupValueFromNestedState("bandwidth", currentState);
                const mspProductIds = filterProductsByTagAndBandwidth(this.props.products, "MSP", bandwidthMsp)
                    .map(product => product.product_id);
                const mspSubscriptions = this.props.multiServicePoints
                    .filter(msp => mspProductIds.includes(msp.product_id));
                return <MultiServicePointSelect key={name} onChange={this.changeSelectInput(name)} msp={value}
                                                msps={mspSubscriptions}
                                                organisations={this.props.organisations}/>;
            case "organisation" :
                return <OrganisationSelect key={name} organisations={this.props.organisations}
                                           onChange={this.changeSelectInput(name)}
                                           organisation={value}
                                           disabled={userInput.readonly}/>;
            case "product" :
                return <ProductSelect products={this.props.products}
                                      onChange={this.changeSelectInput(name)}
                                      product={value}
                                      disabled={userInput.readonly}/>;
            case "ssp_product" :
                const bandwidth = findValueFromInputStep("bandwidth", stepUserInput) ||
                    lookupValueFromNestedState("bandwidth", currentState);
                const sspProducts = filterProductsByTagAndBandwidth(this.props.products, "SSP", bandwidth)
                return <ProductSelect products={sspProducts}
                                      onChange={this.changeSelectInput(name)}
                                      product={value}/>;
            case "contact_persons" :
                const organisationId = lookupValueFromNestedState(userInput.organisation_key, currentState) ||
                    findValueFromInputStep(userInput.organisation_key, stepUserInput);
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
                const productId = findValueFromInputStep(userInput.product_key, stepUserInput);
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
                const uniqueIdentifier = interfaceType + locationCode;
                return <FreePortSelect
                    onChange={this.changeUniqueSelectInput(name, uniqueIdentifier)}
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
            case "subscription":
                const productIdForSubscription = findValueFromInputStep(userInput.product_key, stepUserInput);
                return <SubscriptionsSelect onChange={this.changeSelectInput(name)}
                                            productId={productIdForSubscription}
                                            subscription={value}/>;
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
