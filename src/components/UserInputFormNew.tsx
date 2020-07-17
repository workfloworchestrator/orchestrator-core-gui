/*
 * Copyright 2019-2020 SURF.
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

import "./UserInputFormNew.scss";

import I18n from "i18n-js";
import cloneDeep from "lodash/cloneDeep";
import get from "lodash/get";
import React from "react";
import { filterDOMProps, joinName } from "uniforms";
import { JSONSchemaBridge } from "uniforms-bridge-json-schema";
import { AutoForm } from "uniforms-unstyled";

import {
    AcceptField,
    AutoFields,
    ContactPersonNameField,
    IPvAnyNetworkField,
    ImsNodeIdField,
    ImsPortIdField,
    LabelField,
    LocationCodeField,
    LongTextField,
    OptGroupField,
    OrganisationField,
    ProductField,
    SubscriptionField,
    SubscriptionSummaryField,
    SummaryField,
    VlanField
} from "../lib/uniforms-surfnet/src";
import ApplicationContext from "../utils/ApplicationContext";
import { ValidationError } from "../utils/types";
import { stop } from "../utils/Utils";
import ConfirmationDialog from "./ConfirmationDialog";
import { SubscriptionsContextProvider } from "./subscriptionContext";

interface FieldError {
    message: string;
    params: {};
    dataPath: string;
}

interface UniformsError {
    details: FieldError[];
}

interface IProps {
    stepUserInput: {};
    validSubmit: (userInput: { [index: string]: any }) => Promise<void>;
    cancel: (e: React.MouseEvent<HTMLButtonElement>) => void;
    previous: (e: React.MouseEvent<HTMLButtonElement>) => void;
    hasNext?: boolean;
    hasPrev?: boolean;
    userInput: {};
}

interface IState {
    confirmationDialogOpen: boolean;
    nrOfValidationErrors: number;
    processing: boolean;
}

filterDOMProps.register("description");
filterDOMProps.register("const");
filterDOMProps.register("default");
filterDOMProps.register("required");
filterDOMProps.register("pattern");
filterDOMProps.register("examples");
filterDOMProps.register("allOf");
filterDOMProps.register("options");

class CustomTitleJSONSchemaBridge extends JSONSchemaBridge {
    getField(name: string) {
        const field = super.getField(name);
        //@ts-ignore
        const { type = field.type } = this._compiledSchema[name];

        if (!field.component) {
            if (type === "string") {
                if (field.format === "subscriptionId") {
                    field.component = SubscriptionField;
                } else if (field.format === "productId") {
                    field.component = ProductField;
                } else if (field.format === "locationCode") {
                    field.component = LocationCodeField;
                } else if (field.format === "organisationId") {
                    field.component = OrganisationField;
                } else if (field.format === "contactPersonName") {
                    field.component = ContactPersonNameField;
                } else if (field.format === "vlan") {
                    field.component = VlanField;
                } else if (field.format === "long") {
                    field.component = LongTextField;
                } else if (field.format === "label") {
                    field.component = LabelField;
                } else if (field.format === "summary") {
                    field.component = SummaryField;
                } else if (field.format === "showDowngradeRedundantChoice") {
                    field.component = SummaryField;
                } else if (field.format === "subscription") {
                    field.component = SubscriptionSummaryField;
                } else if (field.format === "accept") {
                    field.component = AcceptField;
                } else if (field.format === "ipvanynetwork") {
                    field.component = IPvAnyNetworkField;
                }
            } else if (type === "integer") {
                if (field.format === "imsPortId") {
                    field.component = ImsPortIdField;
                } else if (field.format === "imsNodeId") {
                    field.component = ImsNodeIdField;
                }
            } else if (type === "object") {
                if (field.format === "optGroup") {
                    field.component = OptGroupField;
                }
            }
        }

        return field;
    }

    getProps(name: string) {
        let props = super.getProps(name);
        const translation_key = name.replace(/\.\d+/, "_fields");
        props.label = I18n.t(`forms.fields.${translation_key}`);
        props.description = I18n.t(`forms.fields.${translation_key}_info`, { defaultValue: "" });
        props.id = `input-${name}`;

        // See https://github.com/vazco/uniforms/issues/748
        if (props.const) {
            props.disabled = true;
            props.default = props.const;
            delete props["const"];
        }

        if (props.maxItems !== undefined) {
            props.maxCount = props.maxItems;
            delete props["maxItems"];
        }

        if (props.minItems !== undefined) {
            props.minCount = props.minItems;
            props.initialCount = props.minItems;
            delete props["minItems"];
        }

        if (props.maximum !== undefined) {
            props.max = props.maximum;
            delete props["maximum"];
        }

        if (props.minimum !== undefined) {
            props.min = props.minimum;
            delete props["minimum"];
        }

        if (props.multipleOf !== undefined) {
            props.step = props.multipleOf;
            delete props["multipleOf"];
        }

        return props;
    }

    getInitialValue(name: string, props: any = {}): any {
        const { default: _default, const: _const, type: _type } = this.getField(name);
        let {
            default: defaultValue = _default !== undefined ? _default : get(this.schema.default, name),
            const: constValue = _const,
            type = _type
            // @ts-ignore
        } = this._compiledSchema[name];

        // use const if present
        if (defaultValue === undefined) defaultValue = constValue;

        // See https://github.com/vazco/uniforms/issues/749
        if (defaultValue === undefined) {
            const nameArray = joinName(null, name);
            const relativeName = nameArray.pop()!;
            const parentName = joinName(nameArray);
            if (parentName !== "") {
                const model = this.getInitialValue(parentName, { lookUpParent: true });
                defaultValue = get(model, relativeName);
            }
        }

        if (defaultValue !== undefined) return cloneDeep(defaultValue);

        if (type === "array" && !props.lookUpParent) {
            const item = this.getInitialValue(joinName(name, "0"));
            const items = props.initialCount || 0;
            return Array(items).fill(item);
        }

        if (type === "object") return {};

        return undefined;
    }
}

export default class UserInputForm extends React.Component<IProps, IState> {
    context!: React.ContextType<typeof ApplicationContext>;
    state: IState = {
        confirmationDialogOpen: false,
        processing: false,
        nrOfValidationErrors: 0
    };

    public static defaultProps = {
        previous: () => {},
        hasPrev: false,
        hasNext: false
    };

    cancel = (e: React.FormEvent) => {
        stop(e);
        this.setState({ confirmationDialogOpen: true });
    };

    submit = async (userInput: {}) => {
        const { processing } = this.state;

        if (!processing) {
            this.setState({ processing: true });

            try {
                await this.props.validSubmit(userInput);
                this.setState({ processing: false });
                return null;
            } catch (error) {
                this.setState({ processing: false });

                if (error.response.status === 400) {
                    let json = await error.response.json();

                    this.setState({ nrOfValidationErrors: json.validation_errors.length });

                    // eslint-disable-next-line no-throw-literal
                    throw {
                        details: json.validation_errors.map((e: ValidationError) => ({
                            message: e.msg,
                            params: e.ctx || {},
                            dataPath: "." + e.loc.join(".")
                        }))
                    };
                }

                // Let the error escape so it can be caught by our own onerror handler instead of being silenced by uniforms
                setTimeout(() => {
                    throw error;
                }, 0);

                // The form will clear the errors so also remove the warning
                this.setState({ nrOfValidationErrors: 0 });

                // The error we got contains no validation errors so don't send it to uniforms
                return null;
            }
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
                {this.state.processing && <i className="fa fa-circle-notch fa-spin" />}
            </button>
        ) : (
            <button type="submit" id="button-submit-form-submit" tabIndex={0} className={`button blue`}>
                {I18n.t("process.submit")}
                {this.state.processing && <i className="fa fa-circle-notch fa-spin" />}
            </button>
        );

        return (
            <section className="buttons">
                {prevButton}
                {nextButton}
            </section>
        );
    };

    render() {
        const { confirmationDialogOpen, nrOfValidationErrors } = this.state;
        const { cancel, stepUserInput, userInput } = this.props;

        const bridge = new CustomTitleJSONSchemaBridge(stepUserInput, () => {});

        return (
            <div className="mod-process-step">
                <ConfirmationDialog
                    isOpen={confirmationDialogOpen}
                    cancel={cancel}
                    confirm={() => this.setState({ confirmationDialogOpen: false })}
                    leavePage={true}
                />
                <section className="card">
                    <SubscriptionsContextProvider>
                        <AutoForm
                            schema={bridge}
                            onSubmit={this.submit}
                            showInlineError={true}
                            validate="onSubmit"
                            model={userInput}
                        >
                            <AutoFields />
                            {/* Show top level validation info about backend validation */}
                            {nrOfValidationErrors > 0 && (
                                <section className="form-errors">
                                    <em className="error backend-validation-metadata">
                                        {I18n.t("process.input_fields_have_validation_errors", {
                                            nrOfValidationErrors: nrOfValidationErrors
                                        })}
                                    </em>
                                </section>
                            )}
                            {this.renderButtons()}
                        </AutoForm>
                    </SubscriptionsContextProvider>
                </section>
            </div>
        );
    }
}

UserInputForm.contextType = ApplicationContext;
