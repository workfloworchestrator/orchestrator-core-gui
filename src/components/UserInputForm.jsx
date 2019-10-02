/*
 * Copyright 2019 SURF.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import ConfirmationDialog from "./ConfirmationDialog";

import { isEmpty, stop } from "../utils/Utils";
import OrganisationSelect from "./OrganisationSelect";
import ProductSelect from "./ProductSelect";
import isEqual from "lodash/isEqual";
import IEEEInterfaceTypesForProductTagSelect from "./IEEEInterfaceTypesForProductTagSelect";
import LocationCodeSelect from "./LocationCodeSelect";
import CheckBox from "./CheckBox";
import ContactPersons from "./ContactPersons";
import StateValue from "./StateValue";
import NodeIdPortSelect from "./NodeIdPortSelect";

import ReadOnlySubscriptionView from "./ReadOnlySubscriptionView";
import MultipleServicePorts from "./MultipleServicePorts";
import GenericNOCConfirm from "./GenericNOCConfirm";
import IPPrefix from "./IPPrefix";
import { findValueFromInputStep } from "../utils/NestedState";
import { doValidateUserInput } from "../validations/UserInput";
import { randomCrmIdentifier } from "../locale/en";
import SubscriptionsSelect from "./SubscriptionsSelect";
import BandwidthSelect from "./BandwidthSelect";
import GenericSelect from "./GenericSelect";
import DowngradeRedundantLPChoice from "./DowngradeRedundantLPChoice";
import TransitionProductSelect from "./TransitionProductSelect";
import DowngradeRedundantLPConfirmation from "./DowngradeRedundantLPConfirmation";
import NodeSelect from "./NodeSelect";
import NodePortSelect from "./NodePortSelect";
import "./UserInputForm.scss";
import BfdSettings from "./BfdSettings";
import NumericInput from "react-numeric-input";
import SubscriptionProductTagSelect from "./SubscriptionProductTagSelect";
import TableSummary from "./TableSummary";
import { nodeSubscriptions, catchErrorStatus } from "../api";
import ApplicationContext from "../utils/ApplicationContext";
import { applyIdNamingConvention } from "../utils/Utils";
import GenericMultiSelect from "./GenericMultiSelect";

const inputTypesWithoutLabelInformation = ["boolean", "accept", "subscription_downgrade_confirmation", "label"];

export default class UserInputForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this.setState({ confirmationDialogOpen: false }),
            cancelDialogAction: () => this.context.redirect("/processes"),
            leavePage: true,
            errors: {},
            validationErrors: {},
            customErrors: {},
            uniqueErrors: {},
            uniqueSelectInputs: {},
            isNew: true,
            stepUserInput: [...props.stepUserInput],
            product: {},
            processing: false,
            randomCrm: randomCrmIdentifier(),
            nodeSubscriptionsLoaded: false,
            nodeSubscriptions: []
        };
    }

    loadNodeSubscriptions = () => {
        nodeSubscriptions(["active", "provisioning"]).then(result => {
            this.setState({ nodeSubscriptions: result, nodeSubscriptionsLoaded: true });
        });
    };

    componentDidMount = () => {
        const { nodeSubscriptionsLoaded, stepUserInput } = this.state;

        if (!nodeSubscriptionsLoaded && stepUserInput.find(input => input.type.startsWith("corelink")) !== undefined) {
            this.loadNodeSubscriptions();
        }
    };

    componentWillReceiveProps(nextProps) {
        if (!isEqual(nextProps.stepUserInput, this.state.stepUserInput)) {
            this.setState({ stepUserInput: [...nextProps.stepUserInput] });

            this.componentDidMount();
        }
    }

    cancel = e => {
        stop(e);
        this.setState({ confirmationDialogOpen: true });
    };

    updateValidationErrors = validationErrors => {
        const errors = { ...this.state.errors };
        let newValidationErrors = {};

        validationErrors.validation_errors.forEach(item => {
            errors[item.loc[0]] = true;
            if (item.loc[0] in newValidationErrors) {
                // multiple errors for one input
                newValidationErrors[item.loc[0]] = `${newValidationErrors[item.loc[0]]} or ${item.msg}`;
            } else {
                newValidationErrors[item.loc[0]] = item.msg;
            }
        });
        this.setState({ errors: errors, validationErrors: newValidationErrors, processing: false });
    };

    submit = e => {
        stop(e);
        const { stepUserInput, processing } = this.state;

        if (this.validateAllUserInput(stepUserInput) && !this.isInvalid() && !processing) {
            this.setState({ processing: true, errors: {} });

            const processInput = stepUserInput.reduce((acc, input) => {
                acc[input.name] = input.value;

                // Add missing default
                if (input.type === "boolean" && input.value === undefined) {
                    acc[input.name] = false;
                }
                return acc;
            }, {});

            let promise = this.props.validSubmit(processInput);
            catchErrorStatus(promise, 400, json => {
                this.updateValidationErrors(json);
            }).then(() => {
                this.setState({ errors: [], processing: false });
            });
        }
    };

    reportCustomError = name => isError => {
        const customErrors = { ...this.state.customErrors };
        customErrors[name] = isError;
        this.setState({ customErrors: customErrors });
    };

    validateAllUserInput = stepUserInput => {
        const errors = { ...this.state.errors };
        stepUserInput.forEach(input => {
            //the value can be true or false, but there is datavalidation
            //dependent on whether the SKIP AcceptType checkbox is checked or all others
            //as implemented in changeAcceptOrSkip function
            //this is a hack to make the front-end validation work
            if (input.type !== "accept_or_skip") {
                doValidateUserInput(input, input.value, errors);
            }
        });
        this.setState({ errors: errors });
        return !Object.keys(errors).some(key => errors[key]);
    };

    renderButtons = () => {
        const invalid = this.isInvalid() || this.state.processing;
        const { hasNext, hasPrev } = this.props;

        const prevButton = hasPrev ? (
            <button type="button" className="button" id="button-prev-form-submit" onClick={this.props.previous}>
                {I18n.t("process.previous")}
            </button>
        ) : (
            <button type="button" className="button" id="button-cancel-form-submit" onClick={this.cancel}>
                {I18n.t("process.cancel")}
            </button>
        );

        const nextButton = hasNext ? (
            <button
                type="submit"
                id="button-next-form-submit"
                tabIndex={0}
                className={`button ${invalid ? "grey disabled" : "blue"}`}
                onClick={this.submit}
            >
                {I18n.t("process.next")}
            </button>
        ) : (
            <button
                type="submit"
                id="button-submit-form-submit"
                tabIndex={0}
                className={`button ${invalid ? "grey disabled" : "blue"}`}
                onClick={this.submit}
            >
                {I18n.t("process.submit")}
            </button>
        );

        return (
            <section className="buttons">
                {prevButton}
                {nextButton}
            </section>
        );
    };

    isInvalid = () =>
        Object.values(this.state.errors)
            .concat(Object.values(this.state.uniqueErrors))
            .concat(Object.values(this.state.customErrors))
            .some(val => val);

    changeUserInput = (name, value) => {
        const userInput = [...this.state.stepUserInput];
        userInput.find(input => input.name === name).value = value;
        this.setState({
            process: { ...this.state.process, user_input: userInput }
        });
    };

    changeStringInput = name => e => {
        const value = e.target.value;
        this.changeUserInput(name, value);
    };

    changeBooleanInput = name => e => {
        const value = e.target.checked;
        this.changeUserInput(name, value);
        this.validateUserInput(name)({ target: { value: value } });
    };

    changeSelectInput = name => option => {
        const value = option ? option.value : null;
        this.changeUserInput(name, value);
        this.validateUserInput(name)({ target: { value: value } });
    };

    changeNumericInput = name => (valueAsNumber, valueAsString, inputElement) => {
        this.changeUserInput(name, valueAsNumber);
    };

    enforceSelectInputUniqueness = (hash, name, value) => {
        // Block multiple select drop-downs sharing a base list identified by 'hash' to select the same value more than once
        const uniqueSelectInputs = { ...this.state.uniqueSelectInputs };
        const uniqueErrors = { ...this.state.uniqueErrors };
        if (isEmpty(uniqueSelectInputs[hash])) {
            uniqueSelectInputs[hash] = { names: {}, values: {} };
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
        Object.keys(names).forEach(name => (uniqueErrors[name] = values[names[name]] > 1));
        this.setState({
            uniqueErrors: uniqueErrors,
            uniqueSelectInputs: uniqueSelectInputs
        });
    };

    changeUniqueSelectInput = (name, hash) => option => {
        const value = option ? option.value : null;
        this.changeUserInput(name, value);
        this.enforceSelectInputUniqueness(hash, name, value);
        this.validateUserInput(name)({ target: { value: value } });
    };

    changeNestedInput = name => newValue => {
        this.changeUserInput(name, newValue);
        this.validateUserInput(name)({ target: { value: newValue } });
    };

    changeAcceptOrSkip = name => (newValue, from_skip) => {
        this.changeUserInput(name, newValue);
        this.validateUserInput(name)({ target: { value: from_skip } });
    };

    changeArrayInput = name => arr => {
        const value = (arr || []).join(",");
        this.changeUserInput(name, value);
        this.validateUserInput(name)({ target: { value: value } });
    };

    validateUserInput = name => e => {
        const value = e.target.value;
        const userInput = this.state.stepUserInput.find(input => input.name === name);
        const errors = { ...this.state.errors };
        doValidateUserInput(userInput, value, errors);
        this.setState({ errors: errors });
    };

    renderInput = userInput => {
        if (userInput.type === "hidden") {
            return;
        }

        const name = userInput.name;
        const ignoreLabel = inputTypesWithoutLabelInformation.indexOf(userInput.type) > -1;
        const error = this.state.errors[name];
        const customError = this.state.customErrors[name];
        const uniqueError = this.state.uniqueErrors[name];
        const validationError = this.state.validationErrors[name];
        return (
            <section key={name} className={`form-divider ${name}`}>
                {!ignoreLabel && this.renderInputLabel(userInput)}
                {!ignoreLabel && this.renderInputInfoLabel(userInput)}
                {this.chooseInput(userInput)}
                {(error || customError || validationError) && (
                    <em className="error">{validationError ? validationError : I18n.t("process.format_error")}</em>
                )}
                {uniqueError && <em className="error">{I18n.t("process.uniquenessViolation")}</em>}
            </section>
        );
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
            return <em>{I18n.t(`process.${name}_info`, { example: this.state.randomCrm })}</em>;
        }
        return this.i18nContext(`process.${name}_info`, userInput);
    };

    chooseInput = userInput => {
        const name = userInput.name;
        const value = userInput.value;
        const { products, organisations, locationCodes } = this.context;
        const stepUserInput = this.state.stepUserInput;

        const { nodeSubscriptions } = this.state;

        let organisationId;
        switch (userInput.type) {
            case "string":
            case "uuid":
            case "crm_port_id":
            case "nms_service_id":
            case "isalias":
            case "jira_ticket":
            case "stp":
                return (
                    <input
                        type="text"
                        id={`${applyIdNamingConvention(name)}`}
                        name={name}
                        value={value || ""}
                        readOnly={userInput.readonly}
                        onChange={this.changeStringInput(name)}
                        onBlur={this.validateUserInput(name)}
                        autoComplete="no-value"
                    />
                );
            case "subscription_id":
                return <ReadOnlySubscriptionView subscriptionId={value} className="indent" />;
            case "bandwidth":
                const servicePorts = findValueFromInputStep(userInput.ports_key, stepUserInput);
                return (
                    <BandwidthSelect
                        servicePorts={servicePorts}
                        name={name}
                        onChange={this.changeStringInput(name)}
                        value={value || ""}
                        disabled={userInput.readonly}
                        reportError={this.reportCustomError(name)}
                    />
                );
            case "organisation":
                return (
                    <OrganisationSelect
                        id="organisation-select"
                        key={name}
                        organisations={organisations}
                        onChange={this.changeSelectInput(name)}
                        organisation={value}
                        disabled={userInput.readonly}
                    />
                );
            case "product":
                return (
                    <ProductSelect
                        id="product-select"
                        products={products}
                        onChange={this.changeSelectInput(name)}
                        product={value}
                        disabled={userInput.readonly}
                    />
                );
            case "transition_product":
                return (
                    <TransitionProductSelect
                        onChange={this.changeSelectInput(name)}
                        product={value}
                        subscriptionId={userInput.subscription_id}
                        disabled={userInput.readonly}
                        transitionType={userInput.transition_type}
                    />
                );
            case "contact_persons":
                const organisation_key = userInput.organisation_key || "organisation";
                organisationId = userInput.organisation || findValueFromInputStep(organisation_key, stepUserInput);
                return (
                    <ContactPersons
                        id="contact-persons"
                        persons={isEmpty(value) ? [{ email: "", name: "", phone: "" }] : value}
                        organisationId={organisationId}
                        onChange={this.changeNestedInput(name)}
                    />
                );
            case "ieee_interface_type":
                const key = userInput.product_key || "product";
                const productId = findValueFromInputStep(key, stepUserInput);
                return (
                    <IEEEInterfaceTypesForProductTagSelect
                        onChange={this.changeSelectInput(name)}
                        interfaceType={value}
                        productId={productId}
                    />
                );
            case "node_id_port_select":
                return (
                    <NodeIdPortSelect
                        onChange={this.changeSelectInput(name)}
                        locationCode={userInput.location_code}
                        interfaceType={userInput.interface_type}
                    />
                );
            case "downgrade_redundant_lp_choice":
                return (
                    <DowngradeRedundantLPChoice
                        products={products}
                        organisations={organisations}
                        onChange={this.changeStringInput(name)}
                        subscriptionId={userInput.subscription_id}
                        value={value}
                        readOnly={userInput.readonly}
                    />
                );
            case "downgrade_redundant_lp_confirmation":
                return (
                    <div>
                        <CheckBox
                            name={name}
                            value={value || false}
                            onChange={this.changeBooleanInput(name)}
                            info={I18n.t(`process.noc_confirmation`)}
                        />
                        <section className="form-divider" />
                        <DowngradeRedundantLPConfirmation
                            products={products}
                            organisations={organisations}
                            subscriptionId={userInput.subscription_id}
                            className="indent"
                            primary={userInput.primary}
                            secondary={userInput.secondary}
                            choice={userInput.choice}
                        />
                    </div>
                );
            case "accept":
                return <GenericNOCConfirm name={name} onChange={this.changeNestedInput(name)} data={userInput.data} />;
            case "accept_or_skip":
                return <GenericNOCConfirm name={name} onChange={this.changeAcceptOrSkip(name)} data={userInput.data} />;
            case "boolean":
                return (
                    <CheckBox
                        name={name}
                        value={value || false}
                        onChange={this.changeBooleanInput(name)}
                        info={I18n.t(`process.${name}`)}
                    />
                );
            case "location_code":
                return (
                    <LocationCodeSelect
                        id="location-code-select"
                        onChange={this.changeSelectInput(name)}
                        locationCodes={locationCodes}
                        locationCode={value}
                    />
                );
            case "label_with_state":
                return <StateValue className={name} value={value} />;
            case "label":
                return <p className={`label ${name}`}>{I18n.t(`process.${name}`, userInput.i18n_state)}</p>;
            case "service_ports":
            case "service_ports_sn8":
                organisationId =
                    userInput.organisation || findValueFromInputStep(userInput.organisation_key, stepUserInput);
                const bandwidthKey = userInput.bandwidth_key || "bandwidth";
                const bandwidth = findValueFromInputStep(bandwidthKey, stepUserInput) || userInput.bandwidth;
                return (
                    <MultipleServicePorts
                        servicePorts={value}
                        sn8={userInput.type === "service_ports_sn8"}
                        organisations={organisations}
                        onChange={this.changeNestedInput(name)}
                        organisationId={organisationId}
                        minimum={userInput.minimum}
                        maximum={userInput.maximum}
                        disabled={userInput.readonly}
                        isElan={userInput.elan}
                        organisationPortsOnly={userInput.organisationPortsOnly}
                        mspOnly={userInput.mspOnly}
                        visiblePortMode={userInput.visiblePortMode}
                        reportError={this.reportCustomError(name)}
                        bandwidth={bandwidth}
                        nodeId={userInput.node}
                    />
                );
            case "subscriptions":
                const productIdForSubscription = userInput.product_id;
                return (
                    <SubscriptionsSelect
                        onChange={this.changeArrayInput(name)}
                        productId={productIdForSubscription}
                        subscriptions={this.commaSeperatedArray(value)}
                        minimum={userInput.minimum}
                        maximum={userInput.maximum}
                    />
                );
            case "subscription_product_tag":
                return (
                    <SubscriptionProductTagSelect
                        onChange={this.changeSelectInput(name)}
                        tags={userInput.tags}
                        productId={userInput.product_id}
                        subscription={value}
                        excludedSubscriptionIds={userInput.excluded_subscriptions}
                    />
                );
            case "ip_prefix":
                return (
                    <IPPrefix
                        preselectedPrefix={value}
                        prefix_min={parseInt(userInput.prefix_min)}
                        onChange={this.changeNestedInput(name)}
                    />
                );
            case "nodes_for_location_code_and_status":
                return (
                    <NodeSelect
                        onChange={this.changeSelectInput(name)}
                        locationCode={userInput.location_code}
                        node={value}
                        status={userInput.status}
                    />
                );
            case "corelink":
                return (
                    <NodePortSelect
                        onChange={this.changeUniqueSelectInput(name, "corelink")}
                        interfaceType={userInput.interface_speed}
                        nodes={nodeSubscriptions}
                        port={value}
                    />
                );
            case "corelink_add_link":
                return (
                    <NodePortSelect
                        onChange={this.changeUniqueSelectInput(name, "corelink")}
                        interfaceType={userInput.interface_speed}
                        nodes={
                            userInput.node
                                ? nodeSubscriptions.filter(
                                      subscription => subscription.subscription_id === userInput.node
                                  )
                                : []
                        }
                        port={value}
                    />
                );
            case "generic_select":
                return (
                    <GenericSelect
                        onChange={this.changeSelectInput(name)}
                        choices={userInput.choices}
                        selected={value}
                        disabled={userInput.readonly}
                    />
                );
            case "generic_multi_select":
                return (
                    <GenericMultiSelect
                        onChange={this.changeNestedInput(name)}
                        selections={value}
                        choices={userInput.choices}
                        productId="f5b3fabf-e81a-4fab-98b4-deb6760bfd26"
                        subscriptions={["Floemp1"]}
                        minimum={userInput.minimum}
                        maximum={userInput.maximum}
                    />
                );
            case "bfd":
                return (
                    <BfdSettings
                        name={name}
                        value={value}
                        onChange={this.changeUserInput}
                        readOnly={userInput.readonly}
                    />
                );
            case "numeric":
                return (
                    <NumericInput
                        onChange={this.changeNumericInput(name)}
                        min={userInput.minimum || Number.MIN_SAFE_INTEGER}
                        max={userInput.maximum || Number.MAX_SAFE_INTEGER}
                        step={userInput.step || 1}
                        precision={userInput.precision || 0}
                        value={value}
                        strict={true}
                        readOnly={userInput.readonly || false}
                    />
                );
            case "migration_summary":
                return <TableSummary data={userInput.data} />;
            default:
                throw new Error(`Invalid / unknown type ${userInput.type}`);
        }
    };

    commaSeperatedArray = input => (input ? input.split(",") : []);

    render() {
        const {
            confirmationDialogOpen,
            confirmationDialogAction,
            cancelDialogAction,
            stepUserInput,
            leavePage
        } = this.state;

        return (
            <div className="mod-process-step">
                <ConfirmationDialog
                    isOpen={confirmationDialogOpen}
                    cancel={cancelDialogAction}
                    confirm={confirmationDialogAction}
                    leavePage={leavePage}
                />
                <section className="card">
                    <section className="form-step">{stepUserInput.map(input => this.renderInput(input))}</section>
                    {this.renderButtons()}
                </section>
            </div>
        );
    }
}

UserInputForm.propTypes = {
    stepUserInput: PropTypes.array.isRequired,
    validSubmit: PropTypes.func.isRequired,
    previous: PropTypes.func,
    hasNext: PropTypes.bool,
    hasPrev: PropTypes.bool
};

UserInputForm.defaultProps = {
    previous: () => {},
    hasPrev: false,
    hasNext: false
};

UserInputForm.contextType = ApplicationContext;
