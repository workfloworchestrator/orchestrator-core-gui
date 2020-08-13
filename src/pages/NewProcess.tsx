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
import ProductValidationComponent from "../components/ProductValidation";
import ApplicationContext from "../utils/ApplicationContext";
import { setFlash } from "../utils/Flash";
import { productById } from "../utils/Lookups";
import { EngineStatus, FormNotCompleteResponse, InputForm, ProductValidation } from "../utils/types";
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
    stepUserInput?: InputForm;
    hasNext?: boolean;
    productValidation?: ProductValidation;
}

export default class NewProcess extends React.Component<IProps, IState> {
    context!: React.ContextType<typeof ApplicationContext>;

    state: IState = {};

    componentDidMount = () => {
        const { preselectedInput } = this.props;
        if (preselectedInput.product) {
            catchErrorStatus<FormNotCompleteResponse>(
                this.submit([{ product: preselectedInput.product }]),
                510,
                json => {
                    this.setState({
                        stepUserInput: json.form,
                        hasNext: json.hasNext ?? false
                    });
                }
            );
        } else {
            this.setState({
                stepUserInput: {
                    title: I18n.t("process.choose_product"),
                    type: "object",
                    properties: {
                        product: {
                            type: "string",
                            format: "productId",
                            productIds: this.context.products
                                .filter(prod => !isEmpty(prod.workflows.find(wf => wf.target === TARGET_CREATE)))
                                .filter(prod => prod.status === "active")
                                .map(product => product.product_id)
                        }
                    }
                } as JSONSchema6,
                hasNext: true
            });
        }
    };

    submit = (processInput: {}[]) => {
        const { products } = this.context;
        const productId = (processInput as { product: string }[])[0].product;
        const product = productById(productId, products);
        const workflow = product.workflows.find(wf => wf.target === TARGET_CREATE)!.name;

        validation(productId).then(productValidation =>
            this.setState({
                productValidation: productValidation
            })
        );

        let promise = startProcess(workflow, processInput).then(
            process => {
                this.context.redirect(`/processes?highlight=${process.id}`);
                setFlash(I18n.t("process.flash.create_create", { name: product.name, pid: process.id }));
            },
            e => {
                throw e;
            }
        );

        return catchErrorStatus<EngineStatus>(promise, 503, json => {
            setFlash(I18n.t(`settings.status.engine.${json.global_status.toLowerCase()}`), "error");
            this.context.redirect("/processes");
        });
    };

    render() {
        const { stepUserInput, productValidation, hasNext } = this.state;
        return (
            <div className="mod-new-process">
                <section className="card">
                    <h1>{I18n.t("process.new_process")}</h1>
                    {!!(productValidation?.valid === false && !!productValidation.product) && (
                        <section>
                            <label htmlFor="none">{I18n.t("process.product_validation")}</label>
                            <ProductValidationComponent validation={productValidation} />
                        </section>
                    )}
                    {stepUserInput && (
                        <UserInputFormWizard
                            stepUserInput={stepUserInput}
                            validSubmit={this.submit}
                            cancel={() => this.context.redirect("/processes")}
                            hasNext={hasNext}
                        />
                    )}
                </section>
            </div>
        );
    }
}

NewProcess.contextType = ApplicationContext;
