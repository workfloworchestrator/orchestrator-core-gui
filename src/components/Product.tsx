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
import ConfirmationDialog from "components/modals/ConfirmationDialog";
import { isDate } from "date-fns";
import { formDate, formInput, formSelect } from "forms/Builder";
import React from "react";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";
import { RouteComponentProps } from "react-router";
import { ValueType } from "react-select";
import ApplicationContext from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";
import { FixedInputConfiguration, Option, ProductBlock, Workflow, Product as iProduct } from "utils/types";
import { isEmpty, stop } from "utils/Utils";

interface MatchParams {
    id: string;
}

interface IProps extends Partial<RouteComponentProps<MatchParams>>, WrappedComponentProps {
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

class Product extends React.Component<IProps, IState> {
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
        this.fetchAllConstants(this.props.match?.params.id);
    }

    fetchAllConstants = (product_id?: string) =>
        Promise.all([
            this.context.apiClient.productBlocks(),
            this.context.apiClient.allWorkflows(),
            this.context.apiClient.products(),
            this.context.apiClient.productTags(),
            this.context.apiClient.productTypes(),
            this.context.apiClient.productStatuses(),
            this.context.apiClient.fixedInputConfiguration(),
        ]).then((res) => {
            const product = res[2].find((value) => value.product_id === product_id);

            this.setState({
                productBlocks: res[0],
                workflows: res[1],
                products: res[2],
                product: product,
                tags: res[3],
                types: res[4],
                statuses: res[5],
                fixedInputConf: res[6],
                allowedFixedInputs: this.determineAllowedFixedInputs(res[6], product?.tag),
            });
        });

    determineAllowedFixedInputs = (fixedInputConf: FixedInputConfiguration, productTag?: string) => {
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
        const { intl } = this.props;

        const question = intl.formatMessage(
            { id: "metadata.deleteConfirmation" },
            { type: "Product", name: product!.name }
        );
        const action = () =>
            this.context.apiClient
                .deleteProduct(product!.product_id)
                .then(() => {
                    this.context.redirect("/metadata/products");
                    setFlash(
                        intl.formatMessage({ id: "metadata.flash.delete" }, { name: product!.name, type: "Product" })
                    );
                })
                .catch((err: any) => {
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
        const { intl } = this.props;

        const invalid = this.isInvalid(true) || processing;
        if (!invalid) {
            this.setState({ processing: true });
            this.context.apiClient.saveProduct(product!).then(() => {
                this.context.redirect("/metadata/products");
                setFlash(
                    intl.formatMessage(
                        { id: product!.product_id ? "metadata.flash.updated" : "metadata.flash.created" },
                        { type: "Product", name: product!.name }
                    )
                );
            });
        } else {
            this.setState({ initial: false });
        }
    };

    renderButtons = (initial: boolean, product: iProduct) => {
        const invalid = !initial && (this.isInvalid() || this.state.processing);
        return (
            <section className="buttons">
                <EuiButton className="button" onClick={this.cancel}>
                    <FormattedMessage id="metadata.products.back" />
                </EuiButton>
                {this.context.allowed("/orchestrator/metadata/product/edit/" + product.product_id) && (
                    <EuiButton
                        tabIndex={0}
                        className={`button ${invalid ? "grey disabled" : "blue"}`}
                        onClick={this.submit}
                    >
                        <FormattedMessage id="metadata.products.submit" />
                    </EuiButton>
                )}
                {this.context.allowed("/orchestrator/metadata/product/edit/" + product.product_id) &&
                    product.product_id && (
                        <EuiButton className="button red" onClick={this.handleDeleteProduct}>
                            <FormattedMessage id="metadata.products.delete" />
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
            | ValueType<Option, false>
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
            this.determineAllowedFixedInputs(fixedInputConf!, value);
        }
    };

    render() {
        const {
            confirmationDialogOpen,
            confirmationDialogAction,
            cancelDialogAction,
            product,
            leavePage,
            duplicateName,
            initial,
            confirmationDialogQuestion,
            statuses,
        } = this.state;
        const { intl } = this.props;

        if (!product) {
            return null;
        }

        const readOnly = !this.context.allowed("/orchestrator/metadata/product/edit/" + product.product_id + "/");

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
                        duplicateName ? intl.formatMessage({ id: "metadata.products.duplicate_name" }) : undefined
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
                        product.status ?? "active"
                    )}
                    {formDate(
                        "metadata.products.created_at",
                        () => false,
                        true,
                        product.created_at ? new Date(product.created_at * 1000) : new Date()
                    )}
                    {formDate("metadata.products.end_date", this.changeProperty("end_date"), readOnly, endDate)}
                    {this.renderButtons(initial, product)}
                </section>
            </div>
        );
    }
}

Product.contextType = ApplicationContext;

export default injectIntl(Product);
