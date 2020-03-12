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

import ConfirmationDialog from "./ConfirmationDialog";

import { capitalizeFirstLetter, isEmpty, stop } from "../utils/Utils";
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
import { InputField, Subscription, ValidationError, Option } from "../utils/types";

const inputTypesWithoutLabelInformation = ["boolean", "accept", "subscription_downgrade_confirmation", "label"];
const inputTypesWithDelegatedValidation = [
    "bfd",
    "contact_persons",
    "generic_multi_select",
    "service_ports",
    "service_ports_sn8",
    "subscriptions"
];

interface IProps {
    stepUserInput: InputField[];
    validSubmit: (userInput: { [index: string]: any }) => Promise<void>;
    cancel: () => void;
    previous: (e: React.MouseEvent<HTMLButtonElement>) => void;
    hasNext?: boolean;
    hasPrev?: boolean;
}

interface IState {
    confirmationDialogOpen: boolean;
    confirmationDialogAction: () => void;
    leavePage: boolean;
    validationErrors: ValidationError[];
    uniqueErrors: { [index: string]: boolean };
    uniqueSelectInputs: {
        [index: string]: { names: { [index: string]: string }; values: { [index: string]: number } };
    };
    isNew: boolean;
    stepUserInput: InputField[];
    product: {};
    processing: boolean;
    randomCrm: string;
    nodeSubscriptions?: Subscription[];
    process?: {};
}

export default class UserInputForm extends React.Component<IProps, IState> {
    context!: React.ContextType<typeof ApplicationContext>;

    public static defaultProps = {
        previous: () => {},
        hasPrev: false,
        hasNext: false
    };

    constructor(props: IProps) {
        super(props);
        this.state = {
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this.setState({ confirmationDialogOpen: false }),
            leavePage: true,
            validationErrors: [],
            uniqueErrors: {},
            uniqueSelectInputs: {},
            isNew: true,
            stepUserInput: [...props.stepUserInput],
            product: {},
            processing: false,
            randomCrm: randomCrmIdentifier()
        };
    }

    loadNodeSubscriptions = () => {
        nodeSubscriptions(["active", "provisioning"]).then(result => {
            this.setState({ nodeSubscriptions: result });
        });
    };

    componentDidMount = () => {
        const { stepUserInput, nodeSubscriptions } = this.state;

        if (!nodeSubscriptions && stepUserInput.find(input => input.type.startsWith("corelink")) !== undefined) {
            this.loadNodeSubscriptions();
        }
    };

    componentWillReceiveProps(nextProps: IProps) {
        if (!isEqual(nextProps.stepUserInput, this.state.stepUserInput)) {
            this.setState({ stepUserInput: [...nextProps.stepUserInput] });

            this.componentDidMount();
        }
    }

    cancel = (e: React.FormEvent) => {
        stop(e);
        this.setState({ confirmationDialogOpen: true });
    };

    updateValidationErrors = (validationErrors: { validation_errors: ValidationError[] }) => {
        const { stepUserInput } = this.state;
        let newValidationErrors = validationErrors.validation_errors;

        // resolve input type for all validation errors and enrich it with input type
        newValidationErrors.forEach(item => {
            const step = stepUserInput.filter(step => step.name === item.loc[0]);
            if (step.length === 1) {
                item.input_type = step[0].type;
            } else {
                console.log(`Unhandled exception in validation response for item: ${item}`);
                item.input_type = "root";
            }
        });
        this.setState({ validationErrors: newValidationErrors, processing: false });
    };

    submit = (e: React.FormEvent<HTMLFormElement>) => {
        stop(e);
        const { stepUserInput, processing } = this.state;

        if (!processing) {
            this.setState({ processing: true });

            const processInput: { [index: string]: any } = stepUserInput.reduce((acc, input) => {
                acc[input.name] = input.value;

                // Add missing defaults
                if (input.type === "boolean" && input.value === undefined) {
                    acc[input.name] = false;
                }
                return acc;
            }, {});

            let promise = this.props.validSubmit(processInput);
            catchErrorStatus<{ validation_errors: ValidationError[] }>(promise, 400, json => {
                this.updateValidationErrors(json);
            }).then(() => {
                this.setState({ processing: false });
            });
        }
    };

    renderButtons = () => {
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
            <button type="submit" id="button-next-form-submit" tabIndex={0} className={`button blue`}>
                {I18n.t("process.next")}
                {this.state.processing && <i className="fa fa-circle-o-notch fa-spin" />}
            </button>
        ) : (
            <button type="submit" id="button-submit-form-submit" tabIndex={0} className={`button blue`}>
                {I18n.t("process.submit")}
                {this.state.processing && <i className="fa fa-circle-o-notch fa-spin" />}
            </button>
        );

        return (
            <section className="buttons">
                {prevButton}
                {nextButton}
            </section>
        );
    };

    changeUserInput = (name: string, value: any) => {
        const userInput = [...this.state.stepUserInput];
        userInput.find(input => input.name === name)!.value = value;
        this.setState({
            process: { ...this.state.process, user_input: userInput }
        });
    };

    changeStringInput = (name: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const target = e.target as HTMLInputElement;
        const value = target.value;
        this.changeUserInput(name, value);
    };

    changeBooleanInput = (name: string) => (e: React.FormEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        const value = target.checked;
        this.changeUserInput(name, value);
    };

    changeSelectInput = (name: string) => (option: Option | null) => {
        const value = option ? option.value : null;
        this.changeUserInput(name, value);
    };

    changeNumericInput = (name: string) => (
        valueAsNumber: number | null,
        _valueAsString: string,
        inputElement: HTMLInputElement
    ) => {
        this.changeUserInput(name, valueAsNumber);
    };

    enforceSelectInputUniqueness = (hash: string, name: string, value: string) => {
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

    changeUniqueSelectInput = (name: string, hash: string) => (option: Option) => {
        const value = option ? option.value : null;
        this.changeUserInput(name, value);
        this.enforceSelectInputUniqueness(hash, name, value!);
    };

    changeNestedInput = (name: string) => (newValue: any) => {
        this.changeUserInput(name, newValue);
    };

    changeArrayInput = (name: string) => (arr: string[]) => {
        const value = (arr || []).join(",");
        this.changeUserInput(name, value);
    };

    renderInput = (userInput: InputField) => {
        if (userInput.type === "hidden") {
            return;
        }

        const name = userInput.name;
        const ignoreLabel = inputTypesWithoutLabelInformation.indexOf(userInput.type) > -1;
        const uniqueError = this.state.uniqueErrors[name];
        const validationError = this.state.validationErrors.filter(item => item.loc[0] === name);

        return (
            <section key={name} id={`input-${name}`} className={`form-divider ${name}`}>
                {!ignoreLabel && this.renderInputLabel(userInput)}
                {!ignoreLabel && this.renderInputInfoLabel(userInput)}
                {this.chooseInput(userInput, validationError)}
                {validationError && !inputTypesWithDelegatedValidation.includes(userInput.type) && (
                    <em className="error">
                        {validationError
                            ? validationError.map((e, index) => (
                                  <div className="backend-validation" key={index}>
                                      {capitalizeFirstLetter(e.msg)}.
                                  </div>
                              ))
                            : I18n.t("process.format_error")}
                    </em>
                )}
                {uniqueError && <em className="error backend-validation">{I18n.t("process.uniquenessViolation")}</em>}
            </section>
        );
    };

    i18nContext = (i18nName: string, userInput: InputField) => {
        if (i18nName.endsWith("_info")) {
            return <em>{I18n.t(i18nName, userInput.i18n_state)}</em>;
        }
        return <label>{I18n.t(i18nName, userInput.i18n_state)}</label>;
    };

    renderInputLabel = (userInput: InputField) => this.i18nContext(`process.${userInput.name}`, userInput);

    renderInputInfoLabel = (userInput: InputField) => {
        const name = userInput.name;
        if (name.indexOf("crm_port_id") > -1) {
            return <em>{I18n.t(`process.${name}_info`, { example: this.state.randomCrm })}</em>;
        }
        return this.i18nContext(`process.${name}_info`, userInput);
    };

    chooseInput = (userInput: InputField, validationError: ValidationError[]) => {
        const { nodeSubscriptions } = this.state;
        const { products, locationCodes } = this.context;
        const name = userInput.name;
        const value = userInput.value;
        const stepUserInput = this.state.stepUserInput;
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
                        autoComplete="no-value"
                    />
                );
            case "text":
                return (
                    <textarea
                        id={`${applyIdNamingConvention(name)}`}
                        name={name}
                        value={value || ""}
                        readOnly={userInput.readonly}
                        onChange={this.changeStringInput(name)}
                        cols={30}
                        rows={5}
                    />
                );
            case "subscription_id":
                return <ReadOnlySubscriptionView subscriptionId={value} className="indent" />;
            case "bandwidth":
                // Todo: without the validation a refactor to a generic number field would also be possible
                return (
                    <BandwidthSelect
                        name={name}
                        onChange={this.changeStringInput(name)}
                        value={value}
                        disabled={userInput.readonly}
                    />
                );
            case "organisation":
                return (
                    <OrganisationSelect
                        id="organisation-select"
                        key={name}
                        onChange={this.changeSelectInput(name)}
                        organisation={value}
                        disabled={userInput.readonly}
                    />
                );
            case "product":
                return (
                    <ProductSelect
                        id="product-select"
                        onChange={this.changeSelectInput(name)}
                        products={products}
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
                        persons={isEmpty(value) ? [{ email: "", name: "", phone: "" }] : value}
                        organisationId={organisationId}
                        onChange={this.changeNestedInput(name)}
                        errors={validationError}
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
                        key={userInput.subscription_id}
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
                            subscriptionId={userInput.subscription_id}
                            primary={userInput.primary}
                            secondary={userInput.secondary}
                            choice={userInput.choice}
                        />
                    </div>
                );
            case "accept":
                return <GenericNOCConfirm name={name} onChange={this.changeNestedInput(name)} data={userInput.data} />;
            case "accept_or_skip":
                return <GenericNOCConfirm name={name} onChange={this.changeNestedInput(name)} data={userInput.data} />;
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
                        locationCodes={locationCodes || []}
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
                        productTags={userInput.tags}
                        onChange={this.changeNestedInput(name)}
                        organisationId={organisationId}
                        minimum={userInput.minimum}
                        maximum={userInput.maximum}
                        disabled={userInput.readonly}
                        disabledPorts={userInput.disabledPorts}
                        isElan={userInput.elan}
                        organisationPortsOnly={userInput.organisationPortsOnly}
                        mspOnly={userInput.mspOnly}
                        visiblePortMode={userInput.visiblePortMode}
                        bandwidth={bandwidth}
                        errors={validationError}
                    />
                );
            case "subscriptions":
                const productIdForSubscription = userInput.product_id;
                return (
                    <SubscriptionsSelect
                        onChange={this.changeArrayInput(name)}
                        productId={productIdForSubscription}
                        subscriptions={this.commaSeparatedArray(value)}
                        minimum={userInput.minimum}
                        maximum={userInput.maximum}
                        errors={validationError}
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
                        errors={[]}
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
                        nodes={nodeSubscriptions || []}
                        port={value}
                    />
                );
            case "corelink_add_link":
                return (
                    <NodePortSelect
                        onChange={this.changeUniqueSelectInput(name, "corelink")}
                        interfaceType={userInput.interface_speed}
                        nodes={
                            userInput.node && nodeSubscriptions
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
                        minimum={userInput.minimum}
                        maximum={userInput.maximum}
                        errors={validationError}
                    />
                );
            case "bfd":
                if (typeof value.enabled === "string") {
                    // Todo: remove after a fix is implemented in the backend: https://git.ia.surfsara.nl/automation/orchestrator/issues/422/designs
                    value.enabled = value.enabled !== "False";
                }
                return (
                    <BfdSettings
                        name={name}
                        value={value}
                        onChange={this.changeUserInput}
                        readOnly={userInput.readonly}
                        errors={validationError}
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

    commaSeparatedArray = (input: string) => (input ? input.split(",") : []);

    render() {
        const {
            confirmationDialogOpen,
            confirmationDialogAction,
            stepUserInput,
            leavePage,
            validationErrors
        } = this.state;
        const { cancel } = this.props;
        const numberOfValidationErrors = Object.keys(validationErrors).length;

        return (
            <div className="mod-process-step">
                <ConfirmationDialog
                    isOpen={confirmationDialogOpen}
                    cancel={cancel}
                    confirm={confirmationDialogAction}
                    leavePage={leavePage}
                />
                <section className="card">
                    <form onSubmit={this.submit}>
                        <section className="form-step">{stepUserInput.map(input => this.renderInput(input))}</section>
                        {/* Show top level validation info about backend validation */}
                        {numberOfValidationErrors > 0 && (
                            <section className="form-errors">
                                <em className="error backend-validation-metadata">
                                    {numberOfValidationErrors} {I18n.t("process.input_fields_have_validation_errors")}.
                                </em>
                            </section>
                        )}
                        {this.renderButtons()}
                    </form>
                </section>
            </div>
        );
    }
}

UserInputForm.contextType = ApplicationContext;
