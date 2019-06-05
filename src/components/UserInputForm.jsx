import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import ConfirmationDialog from "./ConfirmationDialog";

import {isEmpty, stop} from "../utils/Utils";
import OrganisationSelect from "./OrganisationSelect";
import ProductSelect from "./ProductSelect";
import isEqual from "lodash/isEqual";
import IEEEInterfaceTypesForProductTagSelect from "./IEEEInterfaceTypesForProductTagSelect";
import LocationCodeSelect from "./LocationCodeSelect";
import CheckBox from "./CheckBox";
import ContactPersons from "./ContactPersons";
import StateValue from "./StateValue";
import NodeIdPortSelect from "./NodeIdPortSelect"

import ReadOnlySubscriptionView from "./ReadOnlySubscriptionView";
import MultipleServicePorts from "./MultipleServicePorts";
import NOCConfirm from "./NOCConfirm";
import NOCNetworkConfirm from "./NOCNetworkConfirm";
import IPPrefix from "./IPPrefix";
import {findValueFromInputStep, lookupValueFromNestedState} from "../utils/NestedState";
import {doValidateUserInput} from "../validations/UserInput";
import VirtualLAN from "./VirtualLAN";
import {randomCrmIdentifier} from "../locale/en";
import SubscriptionsSelect from "./SubscriptionsSelect";
import BandwidthSelect from "./BandwidthSelect";
import GenericSelect from "./GenericSelect";
import {filterProductsByBandwidth} from "../validations/Products";
import DowngradeRedundantLPChoice from "./DowngradeRedundantLPChoice";
import TransitionProductSelect from "./TransitionProductSelect";
import DowngradeRedundantLPConfirmation from "./DowngradeRedundantLPConfirmation";
import * as moment from "moment";
import NodeSelect from "./NodeSelect";
import NodePortSelect from "./NodePortSelect";
import "./UserInputForm.scss";
import BfdSettings from "./BfdSettings";
import NumericInput from "react-numeric-input";
import MultipleServicePortsSN8 from "./MultipleServicePortsSN8";
import SubscriptionProductTagSelect from "./SubscriptionProductTagSelect";
import TableSummary from "./TableSummary";
import {subscriptionsByTags, subscriptionsWithTags} from "../api";


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
            customErrors: {},
            uniqueErrors: {},
            uniqueSelectInputs: {},
            isNew: true,
            stepUserInput: [...props.stepUserInput],
            product: {},
            processing: false,
            randomCrm: randomCrmIdentifier(),
            subscriptionsLoaded: false,
            servicePortsLoadedSN7: !!this.props.servicePortsSN7,
            servicePortsLoadedSN8: !!this.props.servicePortsSN8,
            subscriptions: [],
            servicePortsSN7: this.props.servicePortsSN7 ? this.props.servicePortsSN7 : [],
            servicePortsSN8: this.props.servicePortsSN8 ? this.props.servicePortsSN8 : [],
        }
    };

    loadSubscriptions = () => {
        subscriptionsWithTags().then(subscriptions => {
            this.setState({subscriptionsLoaded: true, subscriptions: subscriptions});
        });
    };

    loadServicePortsSN7 = () => {
        subscriptionsByTags(["MSP", "SSP", "MSPNL"]).then(result => {
            this.setState({servicePortsSN7: result, servicePortsLoadedSN7: true});
        })
    };

    loadServicePortsSN8 = () => {
        subscriptionsByTags(["SP", "SPNL"], ["active"]).then(result => {
            this.setState({servicePortsSN8: result, servicePortsLoadedSN8: true});
        })
    };

    componentDidMount = () => {
        if (this.props.preloadSubscriptions) {
            console.log("UserInputForm: Preloading subscriptions")
            this.loadSubscriptions()
        }
        if (this.props.preloadServicePortsSN7) {
            console.log("UserInputForm: Preloading SN7 ServicePorts")
            this.loadServicePortsSN7()
        }
        if (this.props.preloadServicePortsSN8) {
            console.log("UserInputForm: Preloading SN8 ServicePorts")
            this.loadServicePortsSN8()
        }
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
            let promise = this.props.validSubmit(stepUserInput);
            promise.catch(err => {
                if (err.response && err.response.status === 400) {
                    err.response.json().then(json => json => {
                        const errors = {...this.state.errors};
                        json.forEach((item) => {
                            errors[item.loc[0]] = true;
                        })
                        this.setState({errors: errors, processing: false});
                    });
                } else {
                    throw err;
                }
            });
        }
    };

    reportCustomError = name => isError => {
        const customErrors = {...this.state.customErrors};
        customErrors[name] = isError;
        this.setState({customErrors: customErrors});
    };

    validateAllUserInput = stepUserInput => {
        const errors = {...this.state.errors};
        stepUserInput.forEach(input => doValidateUserInput(input, input.value, errors));
        this.setState({errors: errors});
        return !Object.keys(errors).some(key => errors[key]);
    };

    renderButtons = () => {
        const invalid = this.isInvalid() || this.state.processing;
        return (<section className="buttons">
            <button className="button" onClick={this.cancel}>
                {I18n.t("process.cancel")}
            </button>
            <button tabIndex={0} className={`button ${invalid ? "grey disabled" : "blue"}`} onClick={this.submit}>
                {I18n.t("process.submit")}
            </button>
        </section>);
    };

    isInvalid = () => Object.values(this.state.errors)
        .concat(Object.values(this.state.uniqueErrors))
        .concat(Object.values(this.state.customErrors))
        .some(val => val);

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
        this.validateUserInput(name)({target: {value: value}})
    };

    changeSelectInput = name => option => {
        const value = option ? option.value : null;
        this.changeUserInput(name, value);
        this.validateUserInput(name)({target: {value: value}});
    };

    changeDateInput = name => dd => {
        const value = moment(dd).format("YYYY-MM-DD");
        this.changeUserInput(name, value);
    };

    clearDateInput = (name, target) => trigger => {
        this.changeUserInput(name, target);
    };

    changeNumericInput = name => (valueAsNumber, valueAsString, inputElement) => {
        this.changeUserInput(name, valueAsNumber);
    };

    enforceSelectInputUniqueness = (hash, name, value) => {
        // Block multiple select drop-downs sharing a base list identified by 'hash' to select the same value more than once
        const uniqueSelectInputs = {...this.state.uniqueSelectInputs};
        const uniqueErrors = {...this.state.uniqueErrors};
        if (isEmpty(uniqueSelectInputs[hash])) {
            uniqueSelectInputs[hash] = {"names": {}, "values": {}};
        }
        const names = uniqueSelectInputs[hash]["names"];
        const values = uniqueSelectInputs[hash]["values"];
        if (!values[value]) {
            values[value] = 0;
        }
        values[value] += 1;
        if (names[name]) {
            values[names[name]] -= 1;
        }
        names[name] = value;
        Object.keys(names).forEach(name => uniqueErrors[name] = values[names[name]] > 1);
        this.setState({uniqueErrors: uniqueErrors, uniqueSelectInputs: uniqueSelectInputs});
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

    validateUserInput = name => e => {
        const value = e.target.value;
        const userInput = this.state.stepUserInput.find(input => input.name === name);
        const errors = {...this.state.errors};
        doValidateUserInput(userInput, value, errors);
        this.setState({errors: errors});
    };

    renderInput = (userInput, process) => {
        const name = userInput.name;
        const ignoreLabel = inputTypesWithoutLabelInformation.indexOf(userInput.type) > -1;
        const error = this.state.errors[name];
        const customError = this.state.customErrors[name];
        const uniqueError = this.state.uniqueErrors[name];
        return (
            <section key={name} className={`form-divider ${name}`}>
                {!ignoreLabel && this.renderInputLabel(userInput)}
                {!ignoreLabel && this.renderInputInfoLabel(userInput)}
                {this.chooseInput(userInput, process)}
                {(error || customError) &&
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

    initialPorts = minimum => {
        if (minimum === 1) {
            return [{subscription_id: null, vlan: ""}];
        } else {
            return [{subscription_id: null, vlan: ""}, {subscription_id: null, vlan: ""}];
        }
    };

    chooseInput = (userInput, process) => {
        const name = userInput.name;
        const value = userInput.value;
        const {currentState, products, organisations, preselectedInput} = this.props;
        const stepUserInput = this.state.stepUserInput;

        const {servicePortsSN7, servicePortsSN8, subscriptions} = this.state;

        let organisationId;
        switch (userInput.type) {
            case "string":
            case "uuid":
            case "crm_port_id":
            case "ims_id":
            case "isalias":
            case "stp":
            case "isis_metric":
            case "mtu":
                return <input type="text" id={name} name={name} value={value || ""} readOnly={userInput.readonly}
                              onChange={this.changeStringInput(name)} onBlur={this.validateUserInput(name)}/>;
            case "jira_ticket":
                return <input type="text" id={name} name={name} value={value || `${userInput.jira_ticket_suffix}-`}
                              readOnly={userInput.readonly} onChange={this.changeStringInput(name)}
                              onBlur={this.validateUserInput(name)}/>;
            case "subscription_id":
                return <ReadOnlySubscriptionView subscriptionId={value}
                                                 products={products}
                                                 organisations={organisations}
                                                 className="indent"/>;
            case "nms_service_id":
            case "bandwidth":
                return <BandwidthSelect stepUserInput={stepUserInput} name={name} onBlur={this.validateUserInput(name)}
                                        onChange={this.changeStringInput(name)} value={value || ""}
                                        portsKey={userInput.ports_key} disabled={userInput.readonly}/>;
            case "vlan_range":
                const subscriptionIdMSP = findValueFromInputStep(userInput.msp_key, stepUserInput);
                const imsCircuitId = lookupValueFromNestedState(userInput.ims_circuit_id, currentState);
                return <VirtualLAN vlan={value} onChange={this.changeStringInput(name)}
                                   subscriptionIdMSP={subscriptionIdMSP} onBlur={this.validateUserInput(name)}
                                   imsCircuitId={imsCircuitId} reportError={this.reportCustomError(userInput.type)}/>
            case "organisation":
                return <OrganisationSelect key={name} organisations={organisations}
                                           onChange={this.changeSelectInput(name)}
                                           organisation={value}
                                           disabled={userInput.readonly}/>;
            case "product":
                return <ProductSelect products={products}
                                      onChange={this.changeSelectInput(name)}
                                      product={value}
                                      disabled={userInput.readonly}/>;
            case "transition_product":
                const subscriptionId = lookupValueFromNestedState(userInput.subscription_id_key, currentState) ||
                    findValueFromInputStep(userInput.subscription_id_key, stepUserInput);
                const newProductId = lookupValueFromNestedState("product", currentState);
                return <TransitionProductSelect
                    onChange={this.changeSelectInput(name)}
                    product={value}
                    subscriptionId={subscriptionId}
                    disabled={userInput.readonly}
                    transitionType={userInput.transition_type}
                    newProductId={newProductId}
                />;
            case "contact_persons":
                organisationId = lookupValueFromNestedState(userInput.organisation_key, currentState) ||
                    findValueFromInputStep(userInput.organisation_key, stepUserInput);
                return <ContactPersons
                    persons={isEmpty(value) ? [{email: "", name: "", phone: ""}] : value}
                    organisationId={organisationId}
                    onChange={this.changeNestedInput(name)}/>;
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
            case "node_id_port_select":
                const intType = lookupValueFromNestedState(userInput.interface_type_key, currentState);
                const locCode = lookupValueFromNestedState(userInput.location_code_key, currentState);

                return <NodeIdPortSelect  onChange={this.changeSelectInput(name)}
                                          locationCode={locCode}
                                          interfaceType={intType}
                />;
            case "downgrade_redundant_lp_choice":
                return <DowngradeRedundantLPChoice products={products}
                                                   organisations={organisations}
                                                   onChange={this.changeStringInput(name)}
                                                   subscriptionId={process.current_state.subscription_id}
                                                   value={value}
                                                   readOnly={userInput.readonly}/>;
            case "downgrade_redundant_lp_confirmation":
                const primary = lookupValueFromNestedState(userInput.primary, currentState);
                const secondary = lookupValueFromNestedState(userInput.secondary, currentState);
                const choice = lookupValueFromNestedState(userInput.choice, currentState);
                return <div>
                    <CheckBox name={name} value={value || false}
                              onChange={this.changeBooleanInput(name)}
                              info={I18n.t(`process.noc_confirmation`)}/>
                    <section className="form-divider"></section>
                    <DowngradeRedundantLPConfirmation products={products}
                                                      organisations={organisations}
                                                      subscriptionId={process.current_state.subscription_id}
                                                      className="indent"
                                                      primary={primary}
                                                      secondary={secondary}
                                                      choice={choice}/>
                </div>
            case "noc_modification_confirmation":
                const {human_service_speed, new_human_service_speed, nms_service_id} = process.current_state;
                const infoLabel = I18n.t(`process.noc_modification_confirmation_prefix`)  + nms_service_id +
                        I18n.t(`process.noc_modification_confirmation_infix1`) +
                        human_service_speed + I18n.t(`process.noc_modification_confirmation_infix2`)
                    + new_human_service_speed;
                return <div>
                    <CheckBox name={name} value={value||false}
                              onChange={this.changeBooleanInput(name)}
                              info={infoLabel}/>
                </div>;
            case "noc_subtask_confirmation":
                const {is_redundant} = process.current_state;
                let circuits = [];
                if (is_redundant){
                    const {ims_circuit_name_1, ims_circuit_name_2} = process.current_state;
                    circuits = [ims_circuit_name_1, ims_circuit_name_2];
                } else  {
                    circuits = [process.current_state.ims_circuit_name];
                };
                return <NOCConfirm onChange={this.changeNestedInput(name)} is_redundant={is_redundant}
                                    circuits={circuits} />;
            case "noc_network_confirmation":
                const {jira_ticket_uri} = process.current_state;

                return <NOCNetworkConfirm onChange={this.changeNestedInput(name)}
                    jira_ticket_uri={jira_ticket_uri} />;
            case "subscription_termination_confirmation":
                return <div>
                    <CheckBox name={name} value={value || false}
                              onChange={this.changeBooleanInput(name)}
                              info={I18n.t(`process.${name}`)}/>
                    <section className="form-divider"></section>
                    <ReadOnlySubscriptionView subscriptionId={process.current_state.subscription_id}
                                              products={products}
                                              organisations={organisations}
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
                return <p className={`label ${userInput.name}`}>{I18n.t(`process.${userInput.name}`, userInput.i18n_state)}</p>;
            case "service_ports":
                organisationId = lookupValueFromNestedState(userInput.organisation_key, currentState) ||
                    findValueFromInputStep(userInput.organisation_key, stepUserInput);
                const bandwidthKey = userInput.bandwidth_key || "bandwidth";
                const bandwidthMsp = findValueFromInputStep(bandwidthKey, stepUserInput) ||
                    lookupValueFromNestedState(bandwidthKey, currentState);
                const productIds = filterProductsByBandwidth(products, bandwidthMsp)
                    .map(product => product.product_id);
                const availableServicePorts = productIds.length === products.length ? servicePortsSN7 :
                    servicePortsSN7.filter(sp => productIds.includes(sp.product_id));
                const ports = isEmpty(value) ? this.initialPorts(userInput.minimum) : value
                return <div>
                    {!isEmpty(this.props.refreshSubscriptions) && !userInput.readonly &&
                        <section className="refresh-service-ports">
                            <i className="fa fa-refresh" onClick={this.props.refreshSubscriptions}></i>
                        </section>
                    }
                    <MultipleServicePorts servicePorts={ports}
                                         availableServicePorts={availableServicePorts}
                                         organisations={organisations}
                                         onChange={this.changeNestedInput(name)}
                                         organisationId={organisationId}
                                         minimum={userInput.minimum}
                                         maximum={userInput.maximum}
                                         disabled={userInput.readonly}
                                         isElan={userInput.elan}
                                         organisationPortsOnly={userInput.organisationPortsOnly}
                                         mspOnly={userInput.mspOnly}
                                         reportError={this.reportCustomError(userInput.type)}/>
                    </div>;
            case "service_ports_sn8":
                organisationId = lookupValueFromNestedState(userInput.organisation_key, currentState) ||
                    findValueFromInputStep(userInput.organisation_key, stepUserInput);
                const bandwidthKeySN8 = userInput.bandwidth_key || "bandwidth";
                const bandwidthServicePortSN8 = findValueFromInputStep(bandwidthKeySN8, stepUserInput) ||
                    lookupValueFromNestedState(bandwidthKeySN8, currentState);
                const productIdsSN8 = filterProductsByBandwidth(products, bandwidthServicePortSN8)
                    .map(product => product.product_id);
                const availableServicePortsSN8 = productIdsSN8.length === products.length ? servicePortsSN8 :
                     servicePortsSN8.filter(sp => productIdsSN8.includes(sp.product_id));
                const portsSN8 = isEmpty(value) ? this.initialPorts(userInput.minimum) : value;
                return <div>
                    {!isEmpty(this.props.refreshSubscriptions) && !userInput.readonly &&
                        <section className="refresh-service-ports">
                            <i className="fa fa-refresh" onClick={this.props.refreshSubscriptions}></i>
                        </section>
                    }
                    <MultipleServicePortsSN8 servicePorts={portsSN8}
                                             availableServicePorts={availableServicePortsSN8}
                                             organisations={organisations}
                                             onChange={this.changeNestedInput(name)}
                                             organisationId={organisationId}
                                             minimum={userInput.minimum}
                                             maximum={userInput.maximum}
                                             disabled={userInput.readonly}
                                             isElan={userInput.elan}
                                             organisationPortsOnly={userInput.organisationPortsOnly}
                                             visiblePortMode={userInput.visiblePortMode}
                                             disabledPorts={userInput.disabledPorts}
                                             reportError={this.reportCustomError(userInput.type)}/>
                </div>;
            case "subscriptions":
                const productIdForSubscription = userInput.product_id || findValueFromInputStep(userInput.product_key, stepUserInput);
                return <SubscriptionsSelect onChange={this.changeArrayInput(name)}
                                            productId={productIdForSubscription}
                                            subscriptions={this.commaSeperatedArray(value)}
                                            minimum={userInput.minimum}
                                            maximum={userInput.maximum}/>;
            case "subscription_product_tag":
                return <SubscriptionProductTagSelect onChange={this.changeSelectInput(name)}
                                            tags={userInput.tags}
                                            productId={lookupValueFromNestedState(userInput.product_key, currentState)}
                                            subscription={value}
                                            excludedSubscriptionIds={userInput.excluded_subscriptions}/>;
            case "ip_prefix":
                const preselectedPrefix = isEmpty(preselectedInput.prefix) ? null : `${preselectedInput.prefix}/${preselectedInput.prefixlen}`;
                return <IPPrefix preselectedPrefix={preselectedPrefix} prefix_min={parseInt(preselectedInput.prefix_min)}
                           onChange={this.changeNestedInput(name)}
                        /> ;
            case "nodes_for_location_code_and_status":
                const status = lookupValueFromNestedState(userInput.node_status_key, currentState);
                const locationCodeNode = lookupValueFromNestedState(userInput.location_code_key, currentState);
                return <NodeSelect onChange={this.changeUniqueSelectInput(name, `${locationCodeNode}_${status}`)}
                                   status={status}
                                   locationCode={locationCodeNode}
                                   node={value}/>;
            case "corelink":
                const corelinkInterfaceSpeed = lookupValueFromNestedState(userInput.interface_type_key, currentState);
                const nodeSubscriptions = subscriptions.length ? subscriptions.filter((subscription) => subscription.tag === 'Node' && subscription.status !== 'terminated') : []
                return <NodePortSelect onChange={this.changeUniqueSelectInput(name, 'corelink')}
                                       interfaceType={corelinkInterfaceSpeed}
                                       nodes={nodeSubscriptions}
                                       port={value}/>;
            case "corelink_add_link":
                const interfaceType = lookupValueFromNestedState(userInput.interface_type_key, currentState);
                const nodeSubscriptionId = lookupValueFromNestedState(userInput.node_key, currentState);
                return <NodePortSelect onChange={this.changeUniqueSelectInput(name, 'corelink')}
                       interfaceType={interfaceType}
                       nodes={subscriptions.filter((subscription) => subscription.subscription_id === nodeSubscriptionId)}
                       port={value}/>;
            case "generic_select":
                return <GenericSelect onChange={this.changeSelectInput(name)}
                                      choices={userInput.choices}
                                      selected={value}
                                      disabled={userInput.readonly}/>;
            case "bfd":
                return <BfdSettings name={name} value={value} onChange={this.changeUserInput} readOnly={userInput.readonly}/>;
            case "numeric":
                if (userInput.state_key_for_maximum !== '') {
                    userInput.maximum = lookupValueFromNestedState(userInput.state_key_for_maximum, currentState);
                }
                return <NumericInput onChange={this.changeNumericInput(name)}
                                     min={userInput.minimum || Number.MIN_SAFE_INTEGER}
                                     max={userInput.maximum || Number.MAX_SAFE_INTEGER}
                                     step={userInput.step || 1}
                                     precision={userInput.precision || 0}
                                     value={value}
                                     strict={true}
                                     readOnly={userInput.readonly || false}/>;
            case "migration_summary":
                return <TableSummary data={userInput.data}/>;
            default:
                throw new Error(`Invalid / unknown type ${userInput.type}`);
        }
    };

    commaSeperatedArray = (input) => input ? input.split(",") : [];

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
    locationCodes: PropTypes.array.isRequired,
    product: PropTypes.object,
    validSubmit: PropTypes.func.isRequired,
    refreshSubscriptions: PropTypes.func,
    process: PropTypes.object,
    preselectedInput: PropTypes.object,

    preloadSubscriptions: PropTypes.bool,
    preloadServicePortsSN7: PropTypes.bool,
    preloadServicePortsSN8: PropTypes.bool,
    subscriptions: PropTypes.array,
    servicePortsSN7: PropTypes.array,
    servicePortsSN8: PropTypes.array,

};

UserInputForm.defaultProps = {
    preloadSubscriptions: false,
    preloadServicePortsSN7: false,
    preloadServicePortsSN8: false,
    subscriptions: [],
    servicePortsSN7: [],
    servicePortsSN8: [],
};

