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

import "components/Product.scss";

import "./Product.scss";

import { EuiButton } from "@elastic/eui";
import { deleteProduct, fixedInputConfiguration, productStatuses, productTags, productTypes } from "api";
import { allWorkflows, productBlocks, productById, products, saveProduct } from "api/index";
import ConfirmationDialog from "components/modals/ConfirmationDialog";
import { isDate } from "date-fns";
import { formDate, formInput, formSelect } from "forms/Builder";
import I18n from "i18n-js";
import React from "react";
import { RouteComponentProps } from "react-router";
import { ValueType } from "react-select";
import ApplicationContext from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";
import { getParameterByName } from "utils/QueryParameters";
import { FixedInputConfiguration, Option, ProductBlock, Workflow, Product as iProduct } from "utils/types";
import { isEmpty, stop } from "utils/Utils";

const TAG_LIGHTPATH = "LightPath";

interface MatchParams {
    id: string;
}

interface IProps extends Partial<RouteComponentProps<MatchParams>> {
    subscriptionId?: string;
}

interface FixedInputConf {
    name: string;
    description: string;
    values: string[];
    required?: boolean;
}

interface IState {
    confirmationDialogOpen: boolean;
    confirmationDialogAction: () => void;
    cancelDialogAction: () => void;
    confirmationDialogQuestion: string;
    leavePage: boolean;
    errors: Partial<Record<keyof iProduct, boolean>>;
    required: (keyof iProduct)[];
    initial: boolean;
    readOnly: boolean;
    product?: iProduct;
    processing: boolean;
    productBlocks: ProductBlock[];
    products: iProduct[];
    workflows: Workflow[];
    tags: string[];
    types: string[];
    statuses: string[];
    duplicateName: boolean;
    allowedFixedInputs: FixedInputConf[];
    fixedInputConf?: FixedInputConfiguration;
}

export default class Product extends React.Component<IProps, IState> {
    state: IState = {
        confirmationDialogOpen: false,
        confirmationDialogAction: () => this.setState({ confirmationDialogOpen: false }),
        cancelDialogAction: () => this.context.redirect("/metadata/products"),
        confirmationDialogQuestion: "",
        leavePage: true,
        errors: {},
        required: ["name", "description", "status", "product_type", "tag"],
        initial: true,
        readOnly: false,
        processing: false,
        productBlocks: [],
        products: [],
        workflows: [],
        tags: [],
        types: [],
        statuses: [],
        duplicateName: false,
        allowedFixedInputs: [],
    };

    componentDidMount() {
        const id = this.props.match?.params.id;
        const isExistingProduct = id !== "new";
        if (isExistingProduct) {
            const readOnly = getParameterByName("readOnly", window.location.search) === "true";
            const clone = id === "clone";
            productById(clone ? getParameterByName("productId", window.location.search) : id!).then((product) => {
                if (clone) {
                    delete product.name;
                    delete product.product_id;
                    delete product.created_at;
                    (product.fixed_inputs || []).forEach((fixedInput) => {
                        delete fixedInput.created_at;
                        delete fixedInput.fixed_input_id;
                        delete fixedInput.product_id;
                    });
                }
                this.setState({ product: product, readOnly: readOnly });
                this.fetchAllConstants(product.tag);
            });
        } else {
            this.fetchAllConstants(TAG_LIGHTPATH);
        }
    }

    fetchAllConstants = (productTag: string) =>
        Promise.all([
            productBlocks(),
            allWorkflows(),
            products(),
            productTags(),
            productTypes(),
            productStatuses(),
            fixedInputConfiguration(),
        ]).then((res) =>
            this.setState({
                productBlocks: res[0],
                workflows: res[1],
                products: res[2],
                tags: res[3],
                types: res[4],
                statuses: res[5],
                fixedInputConf: res[6],
                allowedFixedInputs: this.determineAllowedFixedInputs(productTag, res[6]),
            })
        );

    determineAllowedFixedInputs = (productTag: string, fixedInputConf: FixedInputConfiguration) => {
        const ourTag = Object.keys(fixedInputConf.by_tag).find((tag) => tag === productTag);
        if (!ourTag) {
            return this.state.allowedFixedInputs;
        }
        const inputs = fixedInputConf.by_tag[ourTag].map((fi) => {
            const name = Object.keys(fi)[0];
            const required = fi[name];
            const cfi: FixedInputConf = fixedInputConf.fixed_inputs.find((f) => f.name === name)!;
            cfi.required = required;
            return cfi;
        });
        return inputs;
    };

    cancel = (e: React.MouseEvent<HTMLElement>) => {
        stop(e);
        this.setState({
            confirmationDialogOpen: true,
            leavePage: true,
            confirmationDialogAction: () => this.setState({ confirmationDialogOpen: false }),
            cancelDialogAction: () => this.context.redirect("/metadata/products"),
        });
    };

    handleDeleteProduct = (e: React.MouseEvent<HTMLElement>) => {
        stop(e);
        const { product } = this.state;

        const question = I18n.t("metadata.deleteConfirmation", {
            type: "Product",
            name: product!.name,
        });
        const action = () =>
            deleteProduct(product!.product_id)
                .then(() => {
                    this.context.redirect("/metadata/products");
                    setFlash(
                        I18n.t("metadata.flash.delete", {
                            name: product!.name,
                            type: "Product",
                        })
                    );
                })
                .catch((err) => {
                    if (err.response && err.response.status === 400) {
                        this.setState({ confirmationDialogOpen: false });
                        if (err.response.data) {
                            setFlash(err.response.data.error);
                        }
                    } else {
                        throw err;
                    }
                });
        this.setState({
            confirmationDialogOpen: true,
            confirmationDialogQuestion: question,
            leavePage: false,
            confirmationDialogAction: action,
            cancelDialogAction: () => this.setState({ confirmationDialogOpen: false }),
        });
    };

    submit = (e: React.MouseEvent<HTMLElement>) => {
        stop(e);
        const { product, processing } = this.state;

        const invalid = this.isInvalid(true) || processing;
        if (!invalid) {
            this.setState({ processing: true });
            saveProduct(product!).then(() => {
                this.context.redirect("/metadata/products");
                setFlash(
                    I18n.t(product!.product_id ? "metadata.flash.updated" : "metadata.flash.created", {
                        type: "Product",
                        name: product!.name,
                    })
                );
            });
        } else {
            this.setState({ initial: false });
        }
    };

    renderButtons = (readOnly: boolean, initial: boolean, product: iProduct) => {
        if (readOnly) {
            return (
                <section className="buttons">
                    <EuiButton className="button" onClick={() => this.context.redirect("/metadata/products")}>
                        {I18n.t("metadata.products.back")}
                    </EuiButton>
                </section>
            );
        }
        const invalid = !initial && (this.isInvalid() || this.state.processing);
        return (
            <section className="buttons">
                <EuiButton className="button" onClick={this.cancel}>
                    {I18n.t("process.cancel")}
                </EuiButton>
                <EuiButton
                    tabIndex={0}
                    className={`button ${invalid ? "grey disabled" : "blue"}`}
                    onClick={this.submit}
                >
                    {I18n.t("process.submit")}
                </EuiButton>
                {product.product_id && (
                    <EuiButton className="button red" onClick={this.handleDeleteProduct}>
                        {I18n.t("processes.delete")}
                    </EuiButton>
                )}
            </section>
        );
    };

    isInvalid = (markErrors: boolean = false) => {
        const { errors, required, product, duplicateName } = this.state;
        const hasErrors = (Object.keys(errors) as (keyof iProduct)[]).some((key) => errors[key]);
        const requiredInputMissing = required.some((attr) => isEmpty(product![attr]));
        if (markErrors) {
            const missing = required.filter((attr) => isEmpty(product![attr]));
            const newErrors = { ...errors };
            missing.forEach((attr) => (newErrors[attr] = true));
            this.setState({ errors: newErrors });
        }
        return hasErrors || requiredInputMissing || duplicateName;
    };

    validateProperty = (name: keyof iProduct) => (e: React.FocusEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const errors = { ...this.state.errors };
        const { product } = this.state;
        if (name === "name") {
            const nbr = this.state.products.filter((p) => p.name === value).length;
            const duplicate = product!.product_id ? nbr === 2 : nbr === 1;
            errors[name] = duplicate;
            this.setState({ duplicateName: duplicate });
        }
        errors[name] = isEmpty(value);
        this.setState({ errors: errors });
    };

    changeProperty = (name: keyof iProduct) => (
        e:
            | Date
            | React.MouseEvent<HTMLSpanElement | HTMLButtonElement>
            | null
            | React.ChangeEvent<HTMLInputElement>
            | ValueType<Option>
    ) => {
        const { product, fixedInputConf } = this.state;
        let value: any;
        if (isEmpty(e) || isDate(e)) {
            value = e;
        } else {
            // @ts-ignore
            value = e.target ? e.target.value : e.value;
        }
        // @ts-ignore
        product![name] = value;
        this.setState({ product: product });
        if (name === "tag") {
            this.determineAllowedFixedInputs(value, fixedInputConf!);
        }
    };

    render() {
        const {
            confirmationDialogOpen,
            confirmationDialogAction,
            cancelDialogAction,
            product,
            leavePage,
            readOnly,
            duplicateName,
            initial,
            confirmationDialogQuestion,
            statuses,
        } = this.state;

        if (!product) {
            return null;
        }

        const endDate = !product.end_date
            ? null
            : isDate(product.end_date)
            ? ((product.end_date as unknown) as Date)
            : new Date(product.end_date * 1000);

        return (
            <div className="mod-product">
                <ConfirmationDialog
                    isOpen={confirmationDialogOpen}
                    cancel={cancelDialogAction}
                    confirm={confirmationDialogAction}
                    leavePage={leavePage}
                    question={confirmationDialogQuestion}
                />
                <section className="card">
                    {formInput(
                        "metadata.products.name",
                        "name",
                        product.name || "",
                        readOnly,
                        this.state.errors,
                        this.changeProperty("name"),
                        this.validateProperty("name"),
                        duplicateName ? I18n.t("metadata.products.duplicate_name") : undefined
                    )}
                    {formInput(
                        "metadata.products.description",
                        "description",
                        product.description || "",
                        readOnly,
                        this.state.errors,
                        this.changeProperty("description"),
                        this.validateProperty("description")
                    )}
                    {formSelect(
                        "metadata.products.status",
                        this.changeProperty("status"),
                        statuses,
                        readOnly,
                        product.status || "active"
                    )}
                    {formDate(
                        "metadata.products.created_at",
                        () => false,
                        true,
                        product.created_at ? new Date(product.created_at * 1000) : new Date()
                    )}
                    {formDate("metadata.products.end_date", this.changeProperty("end_date"), readOnly, endDate)}
                    {this.renderButtons(readOnly, initial, product)}
                </section>
            </div>
        );
    }
}

Product.contextType = ApplicationContext;
