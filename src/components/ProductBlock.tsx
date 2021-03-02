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

import "components/ProductBlock.scss";

import "./ProductBlock.scss";

import { EuiButton } from "@elastic/eui";
import { deleteProductBlock } from "api";
import { productBlockById, productBlocks, resourceTypes, saveProductBlock } from "api/index";
import ConfirmationDialog from "components/modals/ConfirmationDialog";
import { isDate } from "date-fns";
import { formDate, formInput, formSelect } from "forms/Builder";
import { intl } from "locale/i18n";
import React from "react";
import { RouteComponentProps } from "react-router";
import { ValueType } from "react-select";
import ApplicationContext from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";
import { getParameterByName } from "utils/QueryParameters";
import { Option, ResourceType, ProductBlock as iProductBlock } from "utils/types";
import { isEmpty, stop } from "utils/Utils";

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
        productBlocks: [],
    };

    componentDidMount() {
        const id = this.props.match?.params.id;
        if (id !== "new") {
            const readOnly = getParameterByName("readOnly", window.location.search) === "true";
            productBlockById(id!).then((res) => this.setState({ productBlock: res, isNew: false, readOnly: readOnly }));
        }
        Promise.all([resourceTypes(), productBlocks()]).then((res) =>
            this.setState({ resourceTypes: res[0], productBlocks: res[1] })
        );
    }

    cancel = (e: React.MouseEvent<HTMLElement>) => {
        stop(e);
        this.setState({
            confirmationDialogOpen: true,
            leavePage: true,
            confirmationDialogAction: () => this.setState({ confirmationDialogOpen: false }),
            cancelDialogAction: () => this.context.redirect("/metadata/product_blocks"),
        });
    };

    handleDeleteProductBlock = (e: React.MouseEvent<HTMLElement>) => {
        stop(e);
        const { productBlock } = this.state;
        const question = intl.formatMessage(
            { id: "metadata.deleteConfirmation" },
            { type: "Product Block", name: productBlock!.name }
        );
        const action = () =>
            deleteProductBlock(productBlock!.product_block_id)
                .then(() => {
                    this.context.redirect("/metadata/product_blocks");
                    setFlash(
                        intl.formatMessage(
                            { id: "metadata.flash.delete" },
                            { type: "Product Block", name: productBlock!.name }
                        )
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
        const { productBlock, processing } = this.state;
        const invalid = this.isInvalid(true) || processing;
        if (!invalid) {
            this.setState({ processing: true });
            saveProductBlock(productBlock!).then(() => {
                this.context.redirect("/metadata/product_blocks");
                setFlash(
                    intl.formatMessage(
                        { id: productBlock!.product_block_id ? "metadata.flash.updated" : "metadata.flash.created" },
                        { type: "Product Block", name: productBlock!.name }
                    )
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
                    <EuiButton className="button" onClick={() => this.context.redirect("/metadata/product_blocks")}>
                        {intl.formatMessage({ id: "metadata.productBlocks.back" })}
                    </EuiButton>
                </section>
            );
        }
        const invalid = !initial && (this.isInvalid() || this.state.processing);
        return (
            <section className="buttons">
                <EuiButton className="button" onClick={this.cancel}>
                    {intl.formatMessage({ id: "process.cancel" })}
                </EuiButton>
                <EuiButton
                    tabIndex={0}
                    className={`button ${invalid ? "grey disabled" : "blue"}`}
                    onClick={this.submit}
                >
                    {intl.formatMessage({ id: "process.submit" })}
                </EuiButton>
                {productBlock.product_block_id && (
                    <EuiButton className="button red" onClick={this.handleDeleteProductBlock}>
                        {intl.formatMessage({ id: "processes.delete" })}
                    </EuiButton>
                )}
            </section>
        );
    };

    isInvalid = (markErrors: boolean = false) => {
        const { errors, required, productBlock, duplicateName } = this.state;
        const hasErrors = (Object.keys(errors) as (keyof iProductBlock)[]).some((key) => errors[key]);
        const requiredInputMissing = required.some((attr) => isEmpty(productBlock![attr]));
        if (markErrors) {
            const missing = required.filter((attr) => isEmpty(productBlock![attr]));
            const newErrors = { ...errors };
            missing.forEach((attr) => (newErrors[attr] = true));
            this.setState({ errors: newErrors });
        }

        return hasErrors || requiredInputMissing || duplicateName;
    };

    validateProperty = (name: keyof iProductBlock) => (e: React.FocusEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const errors = { ...this.state.errors };
        const { productBlock } = this.state;
        if (name === "name") {
            const nbr = this.state.productBlocks.filter((p) => p.name === value).length;
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

    render() {
        const {
            confirmationDialogOpen,
            confirmationDialogAction,
            cancelDialogAction,
            productBlock,
            leavePage,
            readOnly,
            duplicateName,
            initial,
            confirmationDialogQuestion,
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
                        duplicateName ? intl.formatMessage({ id: "metadata.productBlocks.duplicate_name" }) : undefined
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
                    {formSelect(
                        "metadata.productBlocks.status",
                        this.changeProperty("status"),
                        ["active", "phase out", "pre production", "end of life"],
                        readOnly,
                        productBlock.status || "active"
                    )}
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
