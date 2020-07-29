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

import "./ProductBlock.scss";

import { isDate } from "date-fns";
import I18n from "i18n-js";
import React from "react";
import { RouteComponentProps } from "react-router";
import Select, { ValueType } from "react-select";
import { Option, ResourceType, ProductBlock as iProductBlock } from "utils/types";

import { deleteProductBlock } from "../api";
import { productBlockById, productBlocks, resourceTypes, saveProductBlock } from "../api/index";
import { formDate, formInput, formSelect } from "../forms/Builder";
import ApplicationContext from "../utils/ApplicationContext";
import { setFlash } from "../utils/Flash";
import { getParameterByName } from "../utils/QueryParameters";
import { isEmpty, stop } from "../utils/Utils";
import ConfirmationDialog from "./ConfirmationDialog";

type Column = "name" | "description";

interface MatchParams {
    id: string;
}

interface IProps extends Partial<RouteComponentProps<MatchParams>> {
    subscriptionId?: string;
}

interface IState {
    confirmationDialogOpen: boolean;
    confirmationDialogAction: () => void;
    cancelDialogAction: () => void;
    confirmationDialogQuestion: string;
    leavePage: boolean;
    errors: Partial<Record<keyof iProductBlock, boolean>>;
    required: Column[];
    duplicateName: boolean;
    initial: boolean;
    isNew: boolean;
    readOnly: boolean;
    productBlock?: iProductBlock;
    processing: boolean;
    resourceTypes: ResourceType[];
    productBlocks: iProductBlock[];
}

export default class ProductBlock extends React.Component<IProps, IState> {
    state: IState = {
        confirmationDialogOpen: false,
        confirmationDialogAction: () => this.setState({ confirmationDialogOpen: false }),
        cancelDialogAction: () => this.context.redirect("/metadata/product_blocks"),
        confirmationDialogQuestion: "",
        leavePage: true,
        errors: {},
        required: ["name", "description"],
        duplicateName: false,
        initial: true,
        isNew: true,
        readOnly: false,
        processing: false,
        resourceTypes: [],
        productBlocks: []
    };

    componentDidMount() {
        const id = this.props.match?.params.id;
        if (id !== "new") {
            const readOnly = getParameterByName("readOnly", window.location.search) === "true";
            productBlockById(id!).then(res => this.setState({ productBlock: res, isNew: false, readOnly: readOnly }));
        }
        Promise.all([resourceTypes(), productBlocks()]).then(res =>
            this.setState({ resourceTypes: res[0], productBlocks: res[1] })
        );
    }

    cancel = (e: React.MouseEvent<HTMLElement>) => {
        stop(e);
        this.setState({
            confirmationDialogOpen: true,
            leavePage: true,
            confirmationDialogAction: () => this.setState({ confirmationDialogOpen: false }),
            cancelDialogAction: () => this.context.redirect("/metadata/product_blocks")
        });
    };

    handleDeleteProductBlock = (e: React.MouseEvent<HTMLElement>) => {
        stop(e);
        const { productBlock } = this.state;
        const question = I18n.t("metadata.deleteConfirmation", {
            type: "Product Block",
            name: productBlock!.name
        });
        const action = () =>
            deleteProductBlock(productBlock!.product_block_id)
                .then(() => {
                    this.context.redirect("/metadata/product_blocks");
                    setFlash(
                        I18n.t("metadata.flash.delete", {
                            type: "Product Block",
                            name: productBlock!.name
                        })
                    );
                })
                .catch(err => {
                    if (err.response && err.response.status === 400) {
                        this.setState({ confirmationDialogOpen: false });
                        err.response.json().then((json: { error: string }) => setFlash(json["error"], "error"));
                    } else {
                        throw err;
                    }
                });
        this.setState({
            confirmationDialogOpen: true,
            confirmationDialogQuestion: question,
            leavePage: false,
            confirmationDialogAction: action,
            cancelDialogAction: () => this.setState({ confirmationDialogOpen: false })
        });
    };

    submit = (e: React.MouseEvent<HTMLElement>) => {
        stop(e);
        const { productBlock, processing } = this.state;
        const invalid = this.isInvalid(true) || processing;
        if (!invalid) {
            this.setState({ processing: true });
            saveProductBlock(productBlock!).then(() => {
                this.context.redirect("/metadata/product_blocks");
                setFlash(
                    I18n.t(productBlock!.product_block_id ? "metadata.flash.updated" : "metadata.flash.created", {
                        type: "Product Block",
                        name: productBlock!.name
                    })
                );
            });
        } else {
            this.setState({ initial: false });
        }
    };

    renderButtons = (readOnly: boolean, initial: boolean, productBlock: iProductBlock) => {
        if (readOnly) {
            return (
                <section className="buttons">
                    <button className="button" onClick={() => this.context.redirect("/metadata/product_blocks")}>
                        {I18n.t("metadata.productBlocks.back")}
                    </button>
                </section>
            );
        }
        const invalid = !initial && (this.isInvalid() || this.state.processing);
        return (
            <section className="buttons">
                <button className="button" onClick={this.cancel}>
                    {I18n.t("process.cancel")}
                </button>
                <button tabIndex={0} className={`button ${invalid ? "grey disabled" : "blue"}`} onClick={this.submit}>
                    {I18n.t("process.submit")}
                </button>
                {productBlock.product_block_id && (
                    <button className="button red" onClick={this.handleDeleteProductBlock}>
                        {I18n.t("processes.delete")}
                    </button>
                )}
            </section>
        );
    };

    isInvalid = (markErrors: boolean = false) => {
        const { errors, required, productBlock, duplicateName } = this.state;
        const hasErrors = (Object.keys(errors) as (keyof iProductBlock)[]).some(key => errors[key]);
        const requiredInputMissing = required.some(attr => isEmpty(productBlock![attr]));
        if (markErrors) {
            const missing = required.filter(attr => isEmpty(productBlock![attr]));
            const newErrors = { ...errors };
            missing.forEach(attr => (newErrors[attr] = true));
            this.setState({ errors: newErrors });
        }

        return hasErrors || requiredInputMissing || duplicateName;
    };

    validateProperty = (name: keyof iProductBlock) => (e: React.FocusEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const errors = { ...this.state.errors };
        const { productBlock } = this.state;
        if (name === "name") {
            const nbr = this.state.productBlocks.filter(p => p.name === value).length;
            const duplicate = productBlock!.product_block_id ? nbr === 2 : nbr === 1;
            errors[name] = duplicate;
            this.setState({ duplicateName: duplicate });
        }
        errors[name] = isEmpty(value);
        this.setState({ errors: errors });
    };

    changeProperty = (name: keyof iProductBlock) => (
        e:
            | Date
            | React.MouseEvent<HTMLSpanElement | HTMLButtonElement>
            | null
            | React.ChangeEvent<HTMLInputElement>
            | ValueType<Option>
    ) => {
        const { productBlock } = this.state;
        let value;
        if (isEmpty(e) || isDate(e)) {
            value = e;
        } else {
            // @ts-ignore
            value = e.target ? e.target.value : e.value;
        }
        // @ts-ignore
        productBlock![name] = value;
        this.setState({ productBlock: productBlock });
    };

    addResourceType = (option: ValueType<Option>) => {
        const { productBlock, resourceTypes } = this.state;
        const newResourceType = resourceTypes.find(rt => rt.resource_type_id === (option as Option).value)!;
        productBlock!.resource_types.push(newResourceType);
        this.setState({ productBlock: productBlock });
    };

    removeResourceType = (resource_type_id: string) => (e: React.MouseEvent<HTMLElement>) => {
        stop(e);
        const { productBlock } = this.state;
        productBlock!.resource_types = productBlock!.resource_types.filter(
            rt => rt.resource_type_id !== resource_type_id
        );
        this.setState({ productBlock: productBlock });
    };

    renderResourceTypes = (productBlock: iProductBlock, resourceTypes: ResourceType[], readOnly: boolean) => {
        const availableResourceTypes = resourceTypes.filter(
            rt => !productBlock.resource_types.some(pbRt => rt.resource_type_id === pbRt.resource_type_id)
        );
        return (
            <section className="form-divider">
                <label htmlFor="name">{I18n.t("metadata.productBlocks.resourceTypes")}</label>
                <em>{I18n.t("metadata.productBlocks.resourceTypes_info")}</em>
                <div className="child-form">
                    {productBlock.resource_types.map(rt => (
                        <div key={rt.resource_type_id} className="resource-type">
                            <input
                                type="text"
                                id={rt.resource_type_id}
                                name={rt.resource_type_id}
                                value={`${rt.resource_type.toUpperCase()} - ${rt.description}`}
                                disabled={true}
                            />
                            <i className="fa fa-minus" onClick={this.removeResourceType(rt.resource_type_id)} />
                        </div>
                    ))}
                    {!readOnly && (
                        <Select
                            className="select-resource-type"
                            onChange={this.addResourceType}
                            options={availableResourceTypes.map(rt => ({
                                value: rt.resource_type_id,
                                label: `${rt.resource_type.toUpperCase()} - ${rt.description}`
                            }))}
                            isSearchable={true}
                            isClearable={false}
                            placeholder={
                                availableResourceTypes.length > 0
                                    ? I18n.t("metadata.productBlocks.select_add_resource_type")
                                    : I18n.t("metadata.productBlocks.select_no_more_resource_types")
                            }
                            isDisabled={readOnly || availableResourceTypes.length === 0}
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
            productBlock,
            leavePage,
            readOnly,
            resourceTypes,
            duplicateName,
            initial,
            confirmationDialogQuestion
        } = this.state;

        if (!productBlock) {
            return null;
        }

        const endDate = isEmpty(productBlock.end_date)
            ? null
            : isDate(productBlock.end_date)
            ? ((productBlock.end_date as unknown) as Date)
            : new Date(productBlock.end_date * 1000);
        return (
            <div className="mod-product-block">
                <ConfirmationDialog
                    isOpen={confirmationDialogOpen}
                    cancel={cancelDialogAction}
                    confirm={confirmationDialogAction}
                    leavePage={leavePage}
                    question={confirmationDialogQuestion}
                />
                <section className="card">
                    {formInput(
                        "metadata.productBlocks.name",
                        "name",
                        productBlock.name || "",
                        readOnly,
                        this.state.errors,
                        this.changeProperty("name"),
                        this.validateProperty("name"),
                        duplicateName ? I18n.t("metadata.productBlocks.duplicate_name") : undefined
                    )}
                    {formInput(
                        "metadata.productBlocks.description",
                        "description",
                        productBlock.description || "",
                        readOnly,
                        this.state.errors,
                        this.changeProperty("description"),
                        this.validateProperty("description")
                    )}
                    {formInput(
                        "metadata.productBlocks.tag",
                        "tag",
                        productBlock.tag || "",
                        readOnly,
                        this.state.errors,
                        this.changeProperty("tag"),
                        () => true
                    )}
                    {formSelect(
                        "metadata.productBlocks.status",
                        this.changeProperty("status"),
                        ["active", "phase out", "pre production", "end of life"],
                        readOnly,
                        productBlock.status || "active"
                    )}
                    {this.renderResourceTypes(productBlock, resourceTypes, readOnly)}
                    {formDate(
                        "metadata.productBlocks.created_at",
                        () => false,
                        true,
                        productBlock.created_at ? new Date(productBlock.created_at * 1000) : new Date()
                    )}
                    {formDate("metadata.productBlocks.end_date", this.changeProperty("end_date"), readOnly, endDate)}
                    {this.renderButtons(readOnly, initial, productBlock)}
                </section>
            </div>
        );
    }
}

ProductBlock.contextType = ApplicationContext;
