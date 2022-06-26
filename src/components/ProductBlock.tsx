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

import { EuiButton, EuiPanel } from "@elastic/eui";
import ConfirmationDialogContext, {
    ConfirmDialogActions,
    ShowConfirmDialogType,
} from "contextProviders/ConfirmationDialogProvider";
import { isDate } from "date-fns";
import { formDate, formInput, formSelect } from "forms/Builder";
import React from "react";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";
import { RouteComponentProps } from "react-router";
import { ValueType } from "react-select";
import ApplicationContext from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";
import { Option, ResourceType, ProductBlock as iProductBlock } from "utils/types";
import { isEmpty, stop } from "utils/Utils";

import { productBlockStyling } from "./ProductBlockStyling";

type Column = "name" | "description";

interface MatchParams {
    id: string;
}

interface IProps extends Partial<RouteComponentProps<MatchParams>>, WrappedComponentProps {
    subscriptionId?: string;
}

interface IState {
    errors: Partial<Record<keyof iProductBlock, boolean>>;
    required: Column[];
    duplicateName: boolean;
    initial: boolean;
    isNew: boolean;
    productBlock?: iProductBlock;
    processing: boolean;
    resourceTypes: ResourceType[];
    productBlocks: iProductBlock[];
    showConfirmDialog: ShowConfirmDialogType;
    closeConfirmDialog: () => void;
}

class ProductBlock extends React.Component<IProps, IState> {
    state: IState = {
        errors: {},
        required: ["name", "description"],
        duplicateName: false,
        initial: true,
        isNew: true,
        processing: false,
        resourceTypes: [],
        productBlocks: [],
        showConfirmDialog: () => {},
        closeConfirmDialog: () => {},
    };

    componentDidMount() {
        const id = this.props.match?.params.id;
        if (id !== "new") {
            this.context.apiClient
                .productBlockById(id!)
                .then((res: iProductBlock) => this.setState({ productBlock: res, isNew: false }));
        }
        Promise.all([this.context.apiClient.resourceTypes(), this.context.apiClient.productBlocks()]).then((res) =>
            this.setState({ resourceTypes: res[0], productBlocks: res[1] })
        );
    }

    cancel = (e: React.MouseEvent<HTMLElement>) => {
        stop(e);
        this.state.showConfirmDialog({
            question: "",
            confirmAction: () => {},
            cancelAction: () => this.context.redirect("/metadata/product_blocks"),
            leavePage: true,
        });
    };

    handleDeleteProductBlock = (e: React.MouseEvent<HTMLElement>) => {
        stop(e);
        const { productBlock } = this.state;
        const { intl } = this.props;
        const question = intl.formatMessage(
            { id: "metadata.deleteConfirmation" },
            { type: "Product Block", name: productBlock!.name }
        );
        const confirmAction = () =>
            this.context.apiClient
                .deleteProductBlock(productBlock!.product_block_id)
                .then(() => {
                    this.context.redirect("/metadata/product_blocks");
                    setFlash(
                        intl.formatMessage(
                            { id: "metadata.flash.delete" },
                            { type: "Product Block", name: productBlock!.name }
                        )
                    );
                })
                .catch((err: any) => {
                    if (err.response && err.response.status === 400) {
                        this.state.closeConfirmDialog();
                        if (err.response.data) {
                            setFlash(err.response.data.error);
                        }
                    } else {
                        throw err;
                    }
                });
        this.state.showConfirmDialog({ question, confirmAction });
    };

    submit = (e: React.MouseEvent<HTMLElement>) => {
        stop(e);
        const { productBlock, processing } = this.state;
        const { intl } = this.props;
        const invalid = this.isInvalid(true) || processing;
        if (!invalid) {
            this.setState({ processing: true });
            this.context.apiClient.saveProductBlock(productBlock!).then(() => {
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

    renderButtons = (initial: boolean, productBlock: iProductBlock) => {
        const invalid = !initial && (this.isInvalid() || this.state.processing);
        return (
            <section className="buttons">
                <EuiButton className="button" onClick={this.cancel}>
                    <FormattedMessage id="metadata.productBlocks.back" />
                </EuiButton>
                {this.context.allowed(
                    "/orchestrator/metadata/product-block/edit/" + productBlock.product_block_id + "/"
                ) && (
                    <EuiButton
                        tabIndex={0}
                        className={`button ${invalid ? "grey disabled" : "blue"}`}
                        onClick={this.submit}
                    >
                        <FormattedMessage id="metadata.productBlocks.submit" />
                    </EuiButton>
                )}
                {this.context.allowed(
                    "/orchestrator/metadata/product-block/delete/" + productBlock.product_block_id + "/"
                ) &&
                    productBlock.product_block_id && (
                        <EuiButton className="button red" onClick={this.handleDeleteProductBlock}>
                            <FormattedMessage id="metadata.productBlocks.delete" />
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
            | ValueType<Option, false>
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

    addConfirmDialogActions = ({ showConfirmDialog, closeConfirmDialog }: ConfirmDialogActions) => {
        if (this.state.showConfirmDialog !== showConfirmDialog) {
            this.setState({ showConfirmDialog, closeConfirmDialog });
        }
        return <></>;
    };

    render() {
        const { productBlock, duplicateName, initial } = this.state;
        const { intl } = this.props;

        if (!productBlock) {
            return null;
        }

        const endDate = isEmpty(productBlock.end_date)
            ? null
            : isDate(productBlock.end_date)
            ? ((productBlock.end_date as unknown) as Date)
            : new Date(productBlock.end_date * 1000);

        const readOnly = !this.context.allowed(
            "/orchestrator/metadata/product-block/edit/" + productBlock.product_block_id + "/"
        );

        return (
            <EuiPanel css={productBlockStyling}>
                <div className="mod-product-block">
                    <ConfirmationDialogContext.Consumer>
                        {(cdc) => this.addConfirmDialogActions(cdc)}
                    </ConfirmationDialogContext.Consumer>
                    <section className="card">
                        {formInput(
                            "metadata.productBlocks.name",
                            "name",
                            productBlock.name || "",
                            readOnly,
                            this.state.errors,
                            this.changeProperty("name"),
                            this.validateProperty("name"),
                            duplicateName
                                ? intl.formatMessage({ id: "metadata.productBlocks.duplicate_name" })
                                : undefined
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
                        {formDate(
                            "metadata.productBlocks.end_date",
                            this.changeProperty("end_date"),
                            readOnly,
                            endDate
                        )}
                        {this.renderButtons(initial, productBlock)}
                    </section>
                </div>
            </EuiPanel>
        );
    }
}

ProductBlock.contextType = ApplicationContext;

export default injectIntl(ProductBlock);
