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

import "components/inputForms/UserInputForm.scss";

import { EuiButton, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import ConfirmationDialog from "components/modals/ConfirmationDialog";
import { SubscriptionsContextProvider } from "components/subscriptionContext";
import I18n from "i18n-js";
import invariant from "invariant";
import { JSONSchema6 } from "json-schema";
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
    VlanField,
} from "lib/uniforms-surfnet/src";
import cloneDeep from "lodash/cloneDeep";
import get from "lodash/get";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { filterDOMProps, joinName } from "uniforms";
import { JSONSchemaBridge } from "uniforms-bridge-json-schema";
import { AutoForm } from "uniforms-unstyled";
import ApplicationContext from "utils/ApplicationContext";
import { getQueryParameters } from "utils/QueryParameters";
import { ValidationError } from "utils/types";
import { stop } from "utils/Utils";

type JSONSchemaFormProperty = JSONSchema6 & { uniforms: any; defaultValue: any };

interface FieldError {
    message: string;
    params: {};
    dataPath: string;
}

interface UniformsError {
    details: FieldError[];
}

interface IProps extends RouteComponentProps {
    stepUserInput: JSONSchema6;
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

declare module "uniforms" {
    interface FilterDOMProps {
        customPropToFilter: never;
        description: never;
        const: never;
        default: never;
        required: never;
        pattern: never;
        examples: never;
        allOf: never;
        options: never;
    }
}
filterDOMProps.register("description");
filterDOMProps.register("const");
filterDOMProps.register("default");
filterDOMProps.register("required");
filterDOMProps.register("pattern");
filterDOMProps.register("examples");
filterDOMProps.register("allOf");
filterDOMProps.register("options");

function resolveRef(reference: string, schema: Record<string, any>) {
    invariant(
        reference.startsWith("#"),
        'Reference is not an internal reference, and only such are allowed: "%s"',
        reference
    );

    const resolvedReference = reference
        .split("/")
        .filter((part) => part && part !== "#")
        .reduce((definition, next) => definition[next], schema);

    invariant(resolvedReference, 'Reference not found in schema: "%s"', reference);

    return resolvedReference;
}
class CustomTitleJSONSchemaBridge extends JSONSchemaBridge {
    getField(name: string) {
        const field = this.getFieldFixed(name);
        //@ts-ignore
        const { type = field.type } = this._compiledSchema[name];
        const { format = field.format } = this._compiledSchema[name];

        if (!field.component) {
            if (type === "string") {
                if (format === "subscriptionId") {
                    field.component = SubscriptionField;
                } else if (format === "productId") {
                    field.component = ProductField;
                } else if (format === "locationCode") {
                    field.component = LocationCodeField;
                } else if (format === "organisationId") {
                    field.component = OrganisationField;
                } else if (format === "contactPersonName") {
                    field.component = ContactPersonNameField;
                } else if (format === "vlan") {
                    field.component = VlanField;
                } else if (format === "long") {
                    field.component = LongTextField;
                } else if (format === "label") {
                    field.component = LabelField;
                } else if (format === "summary") {
                    field.component = SummaryField;
                } else if (format === "subscription") {
                    field.component = SubscriptionSummaryField;
                } else if (format === "accept") {
                    field.component = AcceptField;
                } else if (format === "ipvanynetwork") {
                    field.component = IPvAnyNetworkField;
                }
            } else if (type === "integer") {
                if (format === "imsPortId") {
                    field.component = ImsPortIdField;
                } else if (format === "imsNodeId") {
                    field.component = ImsNodeIdField;
                }
            } else if (type === "object") {
                if (format === "optGroup") {
                    field.component = OptGroupField;
                }
            }
        }

        return field;
    }

    // This a copy of the super class function to provide a fix for https://github.com/vazco/uniforms/issues/863
    getFieldFixed(name: string) {
        return joinName(null, name).reduce((definition, next, nextIndex, array) => {
            const previous = joinName(array.slice(0, nextIndex));
            const isRequired = get(
                definition,
                "required",
                get(this._compiledSchema, [previous, "required"], [])
            ).includes(next);

            const _key = joinName(previous, next);
            const _definition = this._compiledSchema[_key] || {};

            if (next === "$" || next === "" + parseInt(next, 10)) {
                invariant(definition.type === "array", 'Field not found in schema: "%s"', name);
                definition = Array.isArray(definition.items) ? definition.items[parseInt(next, 10)] : definition.items;
            } else if (definition.type === "object") {
                invariant(definition.properties, 'Field properties not found in schema: "%s"', name);
                definition = definition.properties[next];
            } else {
                const [{ properties: combinedDefinition = {} } = {}] = ["allOf", "anyOf", "oneOf"]
                    .filter((key) => definition[key])
                    .map((key) => {
                        // FIXME: Correct type for `definition`.
                        const localDef = (definition[key] as any[]).map((subSchema) =>
                            subSchema.$ref ? resolveRef(subSchema.$ref, this.schema) : subSchema
                        );
                        return localDef.find(({ properties = {} }) => properties[next]);
                    });

                definition = combinedDefinition[next];
            }

            invariant(definition, 'Field not found in schema: "%s"', name);

            if (definition.$ref) {
                definition = resolveRef(definition.$ref, this.schema);
            }

            ["allOf", "anyOf", "oneOf"].forEach((key) => {
                if (definition[key]) {
                    // FIXME: Correct type for `definition`.
                    _definition[key] = (definition[key] as any[]).map((def) =>
                        def.$ref ? resolveRef(def.$ref, this.schema) : def
                    );
                }
            });

            // Naive computation of combined type, properties and required
            const combinedPartials: any[] = []
                .concat(_definition.allOf, _definition.anyOf, _definition.oneOf)
                .filter(Boolean);

            if (combinedPartials.length) {
                _definition.properties = definition.properties ?? {};
                _definition.required = definition.required ?? [];

                combinedPartials.forEach((combinedPartial) => {
                    const { properties, required } = combinedPartial;
                    if (properties) {
                        Object.assign(_definition.properties, properties);
                    }
                    if (required) {
                        _definition.required.push(...required);
                    }

                    for (const key in combinedPartial) {
                        if (combinedPartial[key] && !_definition[key]) {
                            _definition[key] = combinedPartial[key];
                        }
                    }
                });
            }

            this._compiledSchema[_key] = Object.assign(_definition, { isRequired });

            return definition;
        }, this.schema);
    }

    getProps(name: string) {
        let props = super.getProps(name);
        const translation_key = name.replace(/\.\d+(.\d+)*/, "_fields");
        props.label = I18n.t(`forms.fields.${translation_key}`);
        props.description = I18n.t(`forms.fields.${translation_key}_info`, { defaultValue: "" });
        props.id = `input-${name}`;

        if (props.const) {
            props.disabled = true;
            props.default = props.const;
            delete props["const"];
        }

        if (props.initialCount === undefined) {
            props.initialCount = props.minCount;
        }

        return props;
    }

    getInitialValue(name: string, props: any = {}): any {
        const { default: _default, const: _const, type: _type } = this.getField(name);
        let {
            default: defaultValue = _default !== undefined ? _default : get(this.schema.default, name),
            const: constValue = _const,
            type = _type,
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

        if (type === "array" && !props.lookUpParent && !name.endsWith("$")) {
            const item = this.getInitialValue(joinName(name, "0"));
            const items = props.initialCount || 0;
            return Array(items).fill(item);
        }

        if (type === "object") return {};

        return undefined;
    }
}

function fillPreselection(form: JSONSchema6, query: string) {
    const queryParams = getQueryParameters(query);

    if (form && form.properties) {
        Object.keys(queryParams).forEach((param) => {
            if (form && form.properties && form.properties[param]) {
                const organisatieInput = form.properties[param] as JSONSchemaFormProperty;
                if (!organisatieInput.uniforms) {
                    organisatieInput.uniforms = {};
                }
                organisatieInput.uniforms.disabled = true;
                organisatieInput.default = queryParams[param];
            }
        });

        // ipvany preselect
        if (queryParams.prefix && queryParams.prefixlen) {
            if (form && form.properties.ip_prefix) {
                const ipPrefixInput = form.properties.ip_prefix as JSONSchemaFormProperty;
                if (!ipPrefixInput.uniforms) {
                    ipPrefixInput.uniforms = {};
                }
                ipPrefixInput.default = `${queryParams.prefix}/${queryParams.prefixlen}`;
                ipPrefixInput.uniforms.prefixMin = parseInt(
                    (queryParams.prefix_min as string) ?? (queryParams.prefixlen as string),
                    10
                );
            }
        }
    }
    return form;
}

class UserInputForm extends React.Component<IProps, IState> {
    context!: React.ContextType<typeof ApplicationContext>;
    state: IState = {
        confirmationDialogOpen: false,
        processing: false,
        nrOfValidationErrors: 0,
    };

    public static defaultProps = {
        previous: () => {},
        hasPrev: false,
        hasNext: false,
    };

    cancel = (e: React.FormEvent) => {
        stop(e);
        this.setState({ confirmationDialogOpen: true });
    };

    submit = async (userInput: any = {}) => {
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
                    let json = error.response.data;

                    this.setState({ nrOfValidationErrors: json.validation_errors.length });

                    // eslint-disable-next-line no-throw-literal
                    throw {
                        details: json.validation_errors.map((e: ValidationError) => ({
                            message: e.msg,
                            params: e.ctx || {},
                            dataPath: "." + e.loc.join("."),
                        })),
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
            <EuiButton id="button-prev-form-submit" fill onClick={this.props.previous}>
                {I18n.t("process.previous")}
            </EuiButton>
        ) : (
            <EuiFlexItem>
                <EuiButton id="button-cancel-form-submit" color="warning" onClick={this.cancel}>
                    {I18n.t("process.cancel")}
                </EuiButton>
            </EuiFlexItem>
        );

        const nextButton = hasNext ? (
            <EuiButton
                id="button-next-form-submit"
                tabIndex={0}
                fill
                color="primary"
                isLoading={this.state.processing}
                type="submit"
            >
                {I18n.t("process.next")}
            </EuiButton>
        ) : (
            <EuiButton
                id="button-submit-form-submit"
                tabIndex={0}
                fill
                color="primary"
                isLoading={this.state.processing}
                type="submit"
            >
                {I18n.t("process.submit")}
            </EuiButton>
        );

        return (
            <EuiFlexGroup className="buttons">
                <EuiFlexItem>{prevButton}</EuiFlexItem>
                <EuiFlexItem>{nextButton}</EuiFlexItem>
            </EuiFlexGroup>
        );
    };

    render() {
        const { confirmationDialogOpen, nrOfValidationErrors } = this.state;
        const { cancel, stepUserInput, userInput, location } = this.props;
        const prefilledForm = fillPreselection(stepUserInput, location.search);
        const bridge = new CustomTitleJSONSchemaBridge(prefilledForm, () => {});

        return (
            <div className="user-input-form">
                <ConfirmationDialog
                    isOpen={confirmationDialogOpen}
                    cancel={cancel}
                    confirm={() => this.setState({ confirmationDialogOpen: false })}
                    leavePage={true}
                />
                <section className="form-fieldset">
                    {stepUserInput.title && stepUserInput.title !== "unknown" && <h3>{stepUserInput.title}</h3>}
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
                                            nrOfValidationErrors: nrOfValidationErrors,
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

export default withRouter(UserInputForm);
