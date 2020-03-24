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

import { startProcess, validation, catchErrorStatus } from "../api";
import { isEmpty } from "../utils/Utils";
import { setFlash } from "../utils/Flash";
import ProductSelect from "../components/ProductSelect";
import ProductValidationComponent from "../components/ProductValidation";
import UserInputFormWizard from "../components/UserInputFormWizard";
import { TARGET_CREATE } from "../validations/Products";
import ApplicationContext from "../utils/ApplicationContext";
import { FormNotCompleteResponse, InputField, ProductValidation, Option, EngineStatus} from "../utils/types";
import { productById } from "../utils/Lookups";

import "./NewProcess.scss";

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
    stepUserInput?: InputField[];
    hasNext?: boolean;
    productValidation?: ProductValidation;
}

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
        })
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
                        setFlash(I18n.t("engine.locked"), "error");
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

                        const productInput = stepUserInput.find(x => x.name === "product");
                        if (productInput) {
                            productInput.type = "hidden";
                            productInput.value = option.value;
                        }

                        if (preselectedInput.organisation) {
                            const organisatieInput = stepUserInput.find(x => x.name === "organisation");
                            if (organisatieInput) {
                                organisatieInput.value = preselectedInput.organisation;
                                organisatieInput.readonly = true;
                            }
                        }

                        if (preselectedInput.prefix && preselectedInput.prefixlen) {
                            const prefixInput = stepUserInput.find(x => x.type === "ip_prefix");
                            if (prefixInput) {
                                prefixInput.value = `${preselectedInput.prefix}/${preselectedInput.prefixlen}`;
                                prefixInput.prefix_min = preselectedInput.prefix_min;
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
                        {showProductValidation && (
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
