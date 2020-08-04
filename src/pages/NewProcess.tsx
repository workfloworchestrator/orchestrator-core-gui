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

import "./NewProcess.scss";

import I18n from "i18n-js";
import { JSONSchema6 } from "json-schema";
import React from "react";

import { catchErrorStatus, startProcess, validation } from "../api";
import UserInputFormWizard from "../components/inputForms/UserInputFormWizard";
import ProductSelect from "../components/ProductSelect";
import ProductValidationComponent from "../components/ProductValidation";
import { HiddenField } from "../lib/uniforms-surfnet/src";
import ApplicationContext from "../utils/ApplicationContext";
import { setFlash } from "../utils/Flash";
import { productById } from "../utils/Lookups";
import { EngineStatus, FormNotCompleteResponse, InputForm, Option, ProductValidation } from "../utils/types";
import { isEmpty } from "../utils/Utils";
import { TARGET_CREATE } from "../validations/Products";

interface PreselectedInput {
    product?: string;
    organisation?: string;
    prefix?: string;
    prefixlen?: string;
    prefix_min?: string;
}

interface IProps {
    preselectedInput: PreselectedInput;
}

interface IState {
    productId?: string;
    workflow?: string;
    stepUserInput?: InputForm;
    hasNext?: boolean;
    productValidation?: ProductValidation;
}

type JSONSchemaFormProperty = JSONSchema6 & { uniforms: any };

export default class NewProcess extends React.Component<IProps, IState> {
    context!: React.ContextType<typeof ApplicationContext>;

    state: IState = {};

    componentDidMount = () => {
        const { preselectedInput } = this.props;
        if (preselectedInput.product) {
            this.changeProduct({ label: "", value: preselectedInput.product });
        }
    };

    validSubmit = (processInput: {}[]) => {
        const { products } = this.context;
        const { productId, workflow } = this.state;

        if (!productId || !workflow) {
            return Promise.reject();
        }

        const product = productById(productId, products);
        return startProcess(workflow, [{ product: productId }, ...processInput]).then(process => {
            this.context.redirect(`/processes?highlight=${process.id}`);
            setFlash(I18n.t("process.flash.create_create", { name: product.name, pid: process.id }));
        });
    };

    changeProduct = (option: Option) => {
        const { products } = this.context;
        const product = productById(option.value, products);
        const createWorkflow = product.workflows.find(wf => wf.target === TARGET_CREATE)!.name;

        this.setState(
            {
                stepUserInput: undefined,
                productValidation: undefined,
                productId: option.value,
                workflow: createWorkflow
            },
            () => {
                let promise = startProcess(createWorkflow, [{ product: option.value }]);

                let promise2 = catchErrorStatus<EngineStatus>(promise, 503, json => {
                    setFlash(I18n.t("settings.status.engine.paused"), "error");
                    this.context.redirect("/processes");
                });

                Promise.all([
                    validation(option.value).then(productValidation =>
                        this.setState({
                            productValidation: productValidation
                        })
                    ),

                    catchErrorStatus<FormNotCompleteResponse>(promise2, 510, json => {
                        let stepUserInput = json.form;

                        const { preselectedInput } = this.props;

                        if (stepUserInput && stepUserInput.properties) {
                            if (stepUserInput.properties.product) {
                                const productInput = stepUserInput.properties.product as JSONSchemaFormProperty;
                                if (!productInput.uniforms) {
                                    productInput.uniforms = {};
                                }
                                productInput.uniforms.component = HiddenField;
                                productInput.uniforms.value = product;
                            }

                            if (preselectedInput.organisation) {
                                if (stepUserInput && stepUserInput.properties.organisation) {
                                    const organisatieInput = stepUserInput.properties
                                        .organisation as JSONSchemaFormProperty;
                                    if (!organisatieInput.uniforms) {
                                        organisatieInput.uniforms = {};
                                    }
                                    organisatieInput.uniforms.disabled = true;
                                    organisatieInput.uniforms.value = preselectedInput.organisation;
                                }
                            }

                            if (preselectedInput.prefix && preselectedInput.prefixlen) {
                                if (stepUserInput && stepUserInput.properties.ip_prefix) {
                                    const ipPrefixInput = stepUserInput.properties.ip_prefix as JSONSchemaFormProperty;
                                    if (!ipPrefixInput.uniforms) {
                                        ipPrefixInput.uniforms = {};
                                    }
                                    ipPrefixInput.uniforms.value = `${preselectedInput.prefix}/${preselectedInput.prefixlen}`;
                                    ipPrefixInput.uniforms.prefixMin = parseInt(
                                        preselectedInput.prefix_min ?? preselectedInput.prefixlen,
                                        10
                                    );
                                }
                            }
                        }

                        this.setState({ stepUserInput: json.form, hasNext: json.hasNext });
                    })
                ]);
            }
        );
    };

    render() {
        const { productId, stepUserInput, hasNext, productValidation } = this.state;
        const { preselectedInput } = this.props;
        const showProductValidation = !!productValidation && !productValidation.valid && !!productValidation.product;
        return (
            <div className="mod-new-process">
                <section className="card">
                    <section className="form-step">
                        <h3>{I18n.t("process.new_process")}</h3>
                        <section className="form-divider">
                            <label htmlFor="product">{I18n.t("process.product")}</label>
                            <ProductSelect
                                id="select-product"
                                products={this.context.products
                                    .filter(prod => !isEmpty(prod.workflows.find(wf => wf.target === TARGET_CREATE)))
                                    .filter(prod => prod.status === "active")}
                                onChange={this.changeProduct}
                                product={productId}
                                disabled={!!preselectedInput.product}
                            />
                        </section>
                        {!!(showProductValidation && productValidation) && (
                            <section>
                                <label htmlFor="none">{I18n.t("process.product_validation")}</label>
                                <ProductValidationComponent validation={productValidation} />
                            </section>
                        )}
                        {stepUserInput && (
                            <UserInputFormWizard
                                stepUserInput={stepUserInput}
                                validSubmit={this.validSubmit}
                                hasNext={hasNext || false}
                                cancel={() => this.context.redirect("/processes")}
                            />
                        )}
                    </section>
                </section>
            </div>
        );
    }
}

NewProcess.contextType = ApplicationContext;
