import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import ConfirmationDialog from "./ConfirmationDialog";

import {isEmpty, stop} from "../utils/Utils";
import OrganisationSelect from "./OrganisationSelect";
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
import MultipleServicePorts from "./MultipleServicePorts";
import IPBlocks from "./IPBlocks";

import {findValueFromInputStep, lookupValueFromNestedState} from "../utils/NestedState";
import {doValidateUserInput} from "../validations/UserInput";
import VirtualLAN from "./VirtualLAN";
import {randomCrmIdentifier} from "../locale/en";
import SubscriptionsSelect from "./SubscriptionsSelect";
import BandwidthSelect from "./BandwidthSelect";
import {filterProductsByBandwidth, filterProductsByTag} from "../validations/Products";
import DowngradeRedundantLPChoice from "./DowngradeRedundantLPChoice";
import TransitionProductSelect from "./TransitionProductSelect";
import DowngradeRedundantLPConfirmation from "./DowngradeRedundantLPConfirmation";


const inputTypesWithoutLabelInformation = ["boolean", "subscription_termination_confirmation",
    "subscription_downgrade_confirmation", "label"];

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
        if (!(hash in hashTable)) hashTable[hash] = {'names': {}, 'values': {}};
        const names = hashTable[hash]['names'];
        const values = hashTable[hash]['values'];
        if (!(value in values)) values[value] = 0;
        values[value] += 1;
        if (name in names) values[names[name]] -= 1;
        names[name] = value;
        Object.keys(names).forEach(name => {
            errors[name] = values[names[name]] > 1;
        });
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

	changeIPBlockInput = name => newValue => {
		//this.changeUserInput(name, newValue);
		this.validateUserInput(name, newValue);
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
                {!ignoreLabel && this.renderInputLabel(userInput)}
                {!ignoreLabel && this.renderInputInfoLabel(userInput)}
                {this.chooseInput(userInput, process)}
                {error &&
                <em className="error">{I18n.t("process.format_error")}</em>}
                {uniqueError &&
                <em className="error">{I18n.t("process.uniquenessViolation")}</em>}
            </section>);
    };

    i18nContext = (i18nName, userInput) => {
        if (i18nName.endsWith("_info")) {
            return <em>{I18n.t(i18nName, userInput.i18n_state)}</em>;
        }
        return <label htmlFor="name">{I18n.t(i18nName, userInput.i18n_state)}</label>;
    };

    renderInputLabel = userInput => this.i18nContext(`process.${userInput.name}`, userInput);

    renderInputInfoLabel = userInput => {
        const name = userInput.name;
        if (name.indexOf("crm_port_id") > -1) {
            return <em>{I18n.t(`process.${name}_info`, {example: this.state.randomCrm})}</em>;
        }
        return this.i18nContext(`process.${name}_info`, userInput);
    };

    chooseInput = (userInput, process) => {
        const name = userInput.name;
        const value = userInput.value;
        const {currentState} = this.props;
        const stepUserInput = this.state.stepUserInput;
        let organisationId;
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
            case "msp_product":
                const tags = ["MSP"];
                const mspProducts = filterProductsByTag(this.props.products, tags);
                return <ProductSelect products={mspProducts}
                                      onChange={this.changeSelectInput(name)}
                                      product={value}/>;

            case "rmsp_product":
                const rmsptags = ["RMSP"];
                const rmspProducts = filterProductsByTag(this.props.products, rmsptags);
                return <ProductSelect products={rmspProducts}
                                      onChange={this.changeSelectInput(name)}
                                      product={value}/>;

            case "netherlight_msp_product":
                const nlTags = ["MSPNL"];
                const nlMspProducts = filterProductsByTag(this.props.products, nlTags);
                return <ProductSelect products={nlMspProducts}
                                      onChange={this.changeSelectInput(name)}
                                      product={value}/>;

            case "transition_product":
                const subscriptionId = lookupValueFromNestedState(userInput.subscription_id_key, currentState) ||
                    findValueFromInputStep(userInput.subscription_id_key, stepUserInput);
                return <TransitionProductSelect
                    onChange={this.changeSelectInput(name)}
                    product={value}
                    subscriptionId={subscriptionId}
                    disabled={userInput.readonly}
                    transitionType={userInput.transition_type}/>;
            case "contact_persons" :
                organisationId = lookupValueFromNestedState(userInput.organisation_key, currentState) ||
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
            case "downgrade_redundant_lp_choice":
                return <DowngradeRedundantLPChoice products={this.props.products}
                                                   organisations={this.props.organisations}
                                                   onChange={this.changeStringInput(name)}
                                                   subscriptionId={process.current_state.subscription_id}
                                                   value={value}
                                                   readOnly={userInput.readonly}/>
            case "downgrade_redundant_lp_confirmation":
                const primary = lookupValueFromNestedState(userInput.primary, currentState);
                const secondary = lookupValueFromNestedState(userInput.secondary, currentState);
                const choice = lookupValueFromNestedState(userInput.choice, currentState);
                return <div>
                    <CheckBox name={name} value={value || false}
                              onChange={this.changeBooleanInput(name)}
                              info={I18n.t(`process.noc_confirmation`)}/>
                    <section className="form-divider"></section>
                    <DowngradeRedundantLPConfirmation products={this.props.products}
                                                      organisations={this.props.organisations}
                                                      subscriptionId={process.current_state.subscription_id}
                                                      className="indent"
                                                      primary={primary}
                                                      secondary={secondary}
                                                      choice={choice}/>
                </div>
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
            case "read_only_subscription":
                return <div>
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
                return <p className={userInput.name}>{I18n.t(`process.${userInput.name}`, userInput.i18n_state)}</p>;
            case "service_ports":
                organisationId = lookupValueFromNestedState(userInput.organisation_key, currentState) ||
                    findValueFromInputStep(userInput.organisation_key, stepUserInput);
                const bandwidthKey = userInput.bandwidth_key || "bandwidth";
                const bandwidthMsp = findValueFromInputStep(bandwidthKey, stepUserInput) ||
                    lookupValueFromNestedState(bandwidthKey, currentState);
                const productIds = filterProductsByBandwidth(this.props.products, bandwidthMsp)
                    .map(product => product.product_id);
                const servicePorts= this.props.servicePorts
                    .filter(sp => productIds.includes(sp.product_id));

                return <MultipleServicePorts servicePorts={isEmpty(value) ? [
                    {subscription_id: null, vlan: ""},
                    {subscription_id: null, vlan: ""}
                ] : value}
                                             availableServicePorts={servicePorts}
                                             organisations={this.props.organisations}
                                             onChange={this.changeNestedInput(name)}
                                             organisationId={organisationId}
                                             maximum={userInput.maximum}
                                             disabled={userInput.readonly}
                />;
			case "ip_blocks":
				return <IPBlocks ipBlocks={isEmpty(value) ? [{ipam_prefix_id: "", error_msg: "", display_value: ""}] : value} 
					validateFunc={this.changeIPBlockInput(name)} 
					/> ;
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
    servicePorts: PropTypes.array.isRequired,
    locationCodes: PropTypes.array.isRequired,
    product: PropTypes.object,
    validSubmit: PropTypes.func.isRequired,
    process: PropTypes.object,
};
