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

import "react-datepicker/dist/react-datepicker.css";
import "components/Product.scss";

import "./Product.scss";

import { EuiButton, EuiFieldText } from "@elastic/eui";
import { deleteProduct, fixedInputConfiguration, productStatuses, productTags, productTypes } from "api";
import { allWorkflows, productBlocks, productById, products, saveProduct } from "api/index";
import ConfirmationDialog from "components/modals/ConfirmationDialog";
import { isDate } from "date-fns";
import { formDate, formInput, formSelect } from "forms/Builder";
import I18n from "i18n-js";
import React from "react";
import { RouteComponentProps } from "react-router";
import Select, { ValueType } from "react-select";
import ApplicationContext from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";
import { getParameterByName } from "utils/QueryParameters";
import { FixedInput, FixedInputConfiguration, Option, ProductBlock, Workflow, Product as iProduct } from "utils/types";
import { isEmpty, stop } from "utils/Utils";
import { TARGET_CREATE, TARGET_MODIFY, TARGET_TERMINATE } from "validations/Products";

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

    changeWorkflow = (target: string, multi: boolean = false) => (option: ValueType<Option>) => {
        const { product, workflows } = this.state;

        const otherWorkflows = product!.workflows.filter((wf) => wf.target !== target);
        if (!option) {
            product!.workflows = [...otherWorkflows];
        } else if (multi) {
            const names = (option as Option[]).map((opt) => opt.value);
            product!.workflows = workflows.filter((wf) => names.indexOf(wf.name) > -1).concat(otherWorkflows);
        } else {
            product!.workflows = [workflows.find((wf) => wf.name === (option as Option).value)!].concat(otherWorkflows);
        }
        this.setState({ product: product });
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

    addProductBlock = (option: ValueType<Option>) => {
        const { product, productBlocks } = this.state;

        const newProductBlock = productBlocks.find((pb) => pb.product_block_id === (option as Option).value)!;
        product!.product_blocks.push(newProductBlock);
        this.setState({ product: product });
    };

    removeProductBlock = (product_block_id: string) => (e: React.MouseEvent<HTMLElement>) => {
        stop(e);
        const { product } = this.state;

        product!.product_blocks = product!.product_blocks.filter((pb) => pb.product_block_id !== product_block_id);
        this.setState({ product: product });
    };

    addFixedInput = (allowedFixedInputs: FixedInputConf[]) => (option: ValueType<Option>) => {
        const { product } = this.state;

        const fi = allowedFixedInputs.find((fi) => fi.name === (option as Option).value)!;
        product!.fixed_inputs.push({ name: fi.name, value: fi.values[0] } as FixedInput);
        this.setState({ product: product });
    };

    fixedInputValueChanged = (index: number) => (option: ValueType<Option>) => {
        const { product } = this.state;

        const newValue = (option as Option).value;
        const fixedInput = product!.fixed_inputs[index];
        fixedInput.value = newValue;
        this.setState({ product: product });
    };

    removeFixedInput = (index: number) => (e: React.MouseEvent<HTMLElement>) => {
        stop(e);
        const { product } = this.state;

        product!.fixed_inputs.splice(index, 1);
        this.setState({ product: product });
    };

    workFlowKeys = (type: string, workflows: Workflow[]) =>
        workflows.filter((wf) => wf.target === type).map((wf) => ({ label: wf.description, value: wf.name }));

    workFlowByTarget = (product: iProduct, target: string, multiValues: boolean = false) => {
        const workflows = product.workflows.filter((wf) => wf.target === target).map((wf) => wf.name);
        return multiValues ? workflows : isEmpty(workflows) ? undefined : workflows[0];
    };

    renderSingleFixedInput = (
        fixedInput: FixedInput,
        index: number,
        allowedFixedInputs: FixedInputConf[],
        readOnly: boolean
    ) => {
        const fixedInputConf = allowedFixedInputs.find((fi) => fi.name === fixedInput.name);
        const values = fixedInputConf ? fixedInputConf.values : [];
        const required = fixedInputConf ? fixedInputConf.required : true;

        const options = values.map((val) => ({ value: val, label: val }));
        const value = options.find((option) => option.value === fixedInput.value);

        return (
            <div key={index} className="fixed-input">
                <div className="wrapper">
                    {index === 0 && <label>{I18n.t("metadata.products.fixed_inputs_name")}</label>}
                    <EuiFieldText fullWidth={true} type="text" value={fixedInput.name} disabled={true} />
                </div>
                <div className="wrapper">
                    {index === 0 && <label>{I18n.t("metadata.products.fixed_inputs_value")}</label>}
                    <Select
                        className="select-fixed-input-value"
                        onChange={this.fixedInputValueChanged(index)}
                        options={options}
                        isSearchable={false}
                        value={value}
                        isClearable={false}
                        isDisabled={readOnly}
                    />
                </div>
                {!required && <i className="fa fa-minus first" onClick={this.removeFixedInput(index)} />}
            </div>
        );
    };

    renderFixedInputs = (product: iProduct, readOnly: boolean) => {
        const fixedInputs = product.fixed_inputs;
        const { allowedFixedInputs } = this.state;
        const availableFixedInputs = allowedFixedInputs.filter(
            (afi) => !fixedInputs.some((fi) => afi.name === fi.name)
        );
        return (
            <section className="form-divider">
                <label>{I18n.t("metadata.products.fixed_inputs")}</label>
                <em>{I18n.t("metadata.products.fixed_inputs_info")}</em>
                <div className="child-form">
                    {fixedInputs.map((fv, index) =>
                        this.renderSingleFixedInput(fv, index, allowedFixedInputs, readOnly)
                    )}

                    {!readOnly && (
                        <Select
                            className="select-fixed-input"
                            onChange={this.addFixedInput(allowedFixedInputs)}
                            options={availableFixedInputs.map((fi) => ({
                                value: fi.name,
                                label: fi.name,
                            }))}
                            isSearchable={false}
                            isClearable={false}
                            placeholder={
                                availableFixedInputs.length > 0
                                    ? I18n.t("metadata.products.select_add_fixed_input")
                                    : I18n.t("metadata.products.select_no_more_fixed_inputs")
                            }
                            isDisabled={readOnly || availableFixedInputs.length === 0}
                        />
                    )}
                </div>
            </section>
        );
    };

    renderProductBlocks = (product: iProduct, productBlocks: ProductBlock[], readOnly: boolean) => {
        const availableProductBlocks = productBlocks.filter(
            (pb) => !product.product_blocks.some((pPb) => pb.product_block_id === pPb.product_block_id)
        );
        return (
            <section className="form-divider">
                <label htmlFor="name">{I18n.t("metadata.products.product_blocks")}</label>
                <em>{I18n.t("metadata.products.product_blocks_info")}</em>
                <div className="child-form">
                    {product.product_blocks.map((pb) => (
                        <div key={pb.product_block_id} className="product-block">
                            <EuiFieldText
                                fullWidth={true}
                                type="text"
                                id={pb.product_block_id}
                                name={pb.product_block_id}
                                value={`${pb.name.toUpperCase()} - ${pb.description}`}
                                disabled={true}
                            />
                            <i className="fa fa-minus" onClick={this.removeProductBlock(pb.product_block_id)} />
                        </div>
                    ))}
                    {!readOnly && (
                        <Select
                            className="select-product-block"
                            onChange={this.addProductBlock}
                            options={availableProductBlocks.map((pb) => ({
                                value: pb.product_block_id,
                                label: `${pb.name.toUpperCase()} - ${pb.description}`,
                            }))}
                            isSearchable={true}
                            isClearable={false}
                            placeholder={
                                availableProductBlocks.length > 0
                                    ? I18n.t("metadata.products.select_add_product_block")
                                    : I18n.t("metadata.products.select_no_more_product_blocks")
                            }
                            isDisabled={readOnly || availableProductBlocks.length === 0}
                        />
                    )}
                </div>
            </section>
        );
    };

    render() {
        const {
            confirmationDialogOpen,
            confirmationDialogAction,
            cancelDialogAction,
            product,
            leavePage,
            readOnly,
            productBlocks,
            workflows,
            duplicateName,
            initial,
            confirmationDialogQuestion,
            tags,
            types,
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
                        "metadata.products.tag",
                        this.changeProperty("tag"),
                        tags,
                        readOnly,
                        product.tag || TAG_LIGHTPATH
                    )}
                    {formSelect(
                        "metadata.products.product_type",
                        this.changeProperty("product_type"),
                        types,
                        readOnly,
                        product.product_type || "Port"
                    )}
                    {formSelect(
                        "metadata.products.status",
                        this.changeProperty("status"),
                        statuses,
                        readOnly,
                        product.status || "active"
                    )}
                    {formSelect(
                        "metadata.products.create_subscription_workflow_key",
                        this.changeWorkflow(TARGET_CREATE),
                        this.workFlowKeys(TARGET_CREATE, workflows),
                        readOnly,
                        this.workFlowByTarget(product, TARGET_CREATE),
                        true
                    )}
                    {formSelect(
                        "metadata.products.modify_subscription_workflow_key",
                        this.changeWorkflow(TARGET_MODIFY, true),
                        this.workFlowKeys(TARGET_MODIFY, workflows),
                        readOnly,
                        this.workFlowByTarget(product, TARGET_MODIFY, true),
                        true,
                        true
                    )}
                    {formSelect(
                        "metadata.products.terminate_subscription_workflow_key",
                        this.changeWorkflow(TARGET_TERMINATE),
                        this.workFlowKeys(TARGET_TERMINATE, workflows),
                        readOnly,
                        this.workFlowByTarget(product, TARGET_TERMINATE),
                        true
                    )}
                    {this.renderProductBlocks(product, productBlocks, readOnly)}
                    {this.renderFixedInputs(product, readOnly)}
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
