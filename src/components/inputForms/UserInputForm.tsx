/*
 * Copyright 2019-2022 SURF.
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
import { SubscriptionsContextProvider } from "components/subscriptionContext";
import ConfirmationDialogContext, {
    ConfirmDialogActions,
    ShowConfirmDialogType,
} from "contextProviders/ConfirmationDialogProvider";
import { autoFieldFunction } from "custom/uniforms/AutoFieldLoader";
import invariant from "invariant";
import { JSONSchema6 } from "json-schema";
import { AutoFields } from "lib/uniforms-surfnet/src";
import { intl } from "locale/i18n";
import cloneDeep from "lodash/cloneDeep";
import get from "lodash/get";
import React from "react";
import { FormattedMessage } from "react-intl";
import { RouteComponentProps, withRouter } from "react-router";
import { filterDOMProps, joinName } from "uniforms";
import { JSONSchemaBridge } from "uniforms-bridge-json-schema";
import { AutoField, AutoForm } from "uniforms-unstyled";
import ApplicationContext from "utils/ApplicationContext";
import { getQueryParameters } from "utils/QueryParameters";
import { ValidationError } from "utils/types";
import { stop } from "utils/Utils";

type JSONSchemaFormProperty = JSONSchema6 & { uniforms: any; defaultValue: any };

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
    nrOfValidationErrors: number;
    processing: boolean;
    rootErrors: string[];
    showConfirmDialog: ShowConfirmDialogType;
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
    // This a copy of the super class function to provide a fix for https://github.com/vazco/uniforms/issues/863
    getField(name: string) {
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
                const localProperties = definition.properties ? { ...definition.properties } : {};
                const localRequired = definition.required ? definition.required.slice() : [];

                combinedPartials.forEach((combinedPartial) => {
                    const { properties, required } = combinedPartial;
                    if (properties) {
                        Object.assign(localProperties, properties);
                    }
                    if (required) {
                        localRequired.push(...required);
                    }

                    // Copy all properties instead of only type
                    for (const key in combinedPartial) {
                        if (combinedPartial[key] && !_definition[key]) {
                            _definition[key] = combinedPartial[key];
                            definition[key] = combinedPartial[key];
                        }
                    }
                });

                if (Object.keys(localProperties).length > 0) {
                    _definition.properties = localProperties;
                }
                if (localRequired.length > 0) {
                    _definition.required = localRequired;
                }
            }

            this._compiledSchema[_key] = Object.assign(_definition, { isRequired });

            return definition;
        }, this.schema);
    }

    getProps(name: string) {
        let props = super.getProps(name);
        const translation_key = name.replace(/\.\d+(.\d+)*/, "_fields");
        let label = props.label === undefined ? intl.formatMessage({ id: `forms.fields.${translation_key}` }) : props.label

        // Mark required inputs. Might be delegated to the form components itself in the future.
        if (props.required && !props.readOnly && !props.isDisabled && !name.includes(".")) {
            label = `${label} *`;
        }

        props.label = label;
        props.description = intl.formatMessage({ id: `forms.fields.${translation_key}_info`, defaultMessage: " " }); // Default must contain a space as not to be Falsy
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

    getInitialValue(name: string, props: Record<string, any> = {}): any {
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

        if (type === "object") {
            return {};
        }
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
        processing: false,
        nrOfValidationErrors: 0,
        rootErrors: [],
        showConfirmDialog: () => { },
    };

    public static defaultProps = {
        previous: () => { },
        hasPrev: false,
        hasNext: false,
    };

    openDialog = (e: React.FormEvent) => {
        stop(e);
        this.state.showConfirmDialog({
            question: "",
            confirmAction: () => { },
            cancelAction: this.props.cancel,
            leavePage: true,
        });
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

                    this.setState({
                        nrOfValidationErrors: json.validation_errors.length,
                        rootErrors: json.validation_errors
                            .filter((e: ValidationError) => e.loc[0] === "__root__")
                            .map((e: ValidationError) => e.msg),
                    });

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
                this.setState({ nrOfValidationErrors: 0, rootErrors: [] });

                // The error we got contains no validation errors so don't send it to uniforms
                return null;
            }
        }
    };

    renderButtons = () => {
        const { hasNext, hasPrev } = this.props;

        const prevButton = hasPrev ? (
            <EuiButton id="button-prev-form-submit" fill onClick={this.props.previous}>
                <FormattedMessage id="process.previous" />
            </EuiButton>
        ) : (
            <EuiFlexItem>
                <EuiButton id="button-cancel-form-submit" color="warning" onClick={this.openDialog}>
                    <FormattedMessage id="process.cancel" />
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
                <FormattedMessage id="process.next" />
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
                <FormattedMessage id="process.submit" />
            </EuiButton>
        );

        return (
            <EuiFlexGroup className="buttons">
                <EuiFlexItem>{prevButton}</EuiFlexItem>
                <EuiFlexItem>{nextButton}</EuiFlexItem>
            </EuiFlexGroup>
        );
    };

    addConfirmDialogActions = ({ showConfirmDialog }: ConfirmDialogActions) => {
        if (this.state.showConfirmDialog !== showConfirmDialog) {
            this.setState({ showConfirmDialog });
        }
        return <></>;
    };

    render() {
        const { nrOfValidationErrors, rootErrors } = this.state;
        const { stepUserInput, userInput, location } = this.props;
        const prefilledForm = fillPreselection(stepUserInput, location.search);
        const bridge = new CustomTitleJSONSchemaBridge(prefilledForm, () => { });

        const AutoFieldProvider = AutoField.componentDetectorContext.Provider;

        return (
            <div className="user-input-form">
                <ConfirmationDialogContext.Consumer>
                    {(cdc) => this.addConfirmDialogActions(cdc)}
                </ConfirmationDialogContext.Consumer>
                <section className="form-fieldset">
                    {stepUserInput.title && stepUserInput.title !== "unknown" && <h3>{stepUserInput.title}</h3>}
                    <SubscriptionsContextProvider>
                        {/*
                        // @ts-ignore */}
                        <AutoFieldProvider value={autoFieldFunction}>
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
                                            <FormattedMessage
                                                id="process.input_fields_have_validation_errors"
                                                values={{ nrOfValidationErrors: nrOfValidationErrors }}
                                            />
                                        </em>
                                    </section>
                                )}
                                {rootErrors.length > 0 && (
                                    <section className="form-errors">
                                        <em className="error backend-validation-metadata">
                                            {rootErrors.map((error) => (
                                                <div className="euiFormErrorText euiFormRow__text">{error}</div>
                                            ))}
                                        </em>
                                    </section>
                                )}

                                {this.renderButtons()}
                            </AutoForm>
                        </AutoFieldProvider>
                    </SubscriptionsContextProvider>
                </section>
            </div>
        );
    }
}

UserInputForm.contextType = ApplicationContext;

export default withRouter(UserInputForm);
