/*
 * Copyright 2019-2023 SURF.
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
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiPanel } from "@elastic/eui";
import ConfirmationDialogContext from "contextProviders/ConfirmationDialogProvider";
import { isDate } from "date-fns";
import { formDate, formInput, formSelect } from "forms/Builder";
import { intl } from "locale/i18n";
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";
import { RouteComponentProps } from "react-router";
import { SingleValue } from "react-select";
import ApplicationContext from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";
import { Option, ProductBlock as iProductBlock } from "utils/types";
import { isEmpty, stop } from "utils/Utils";

import { productBlockStyling } from "./ProductBlockStyling";

type Column = "name" | "description";

interface MatchParams {
    id: string;
}

interface IProps extends Partial<RouteComponentProps<MatchParams>>, WrappedComponentProps {
    subscriptionId?: string;
}

function ProductBlock({ match }: IProps) {
    const { apiClient, redirect, allowed } = useContext(ApplicationContext);
    const { showConfirmDialog, closeConfirmDialog } = useContext(ConfirmationDialogContext);
    const [errors, setErrors] = useState<Partial<Record<keyof iProductBlock, boolean>>>({});
    const [required] = useState<Column[]>(["name", "description"]);
    const [duplicateName, setDuplicateName] = useState<boolean>(false);
    const [initial, setInitial] = useState<boolean>(true);
    const [productBlock, setProductBlock] = useState<iProductBlock>({
        created_at: 0,
        description: "",
        end_date: 0,
        name: "",
        parent_ids: [],
        product_block_id: "",
        resource_types: [],
        status: "",
        tag: "",
    });
    const [processing, setProcessing] = useState<boolean>(false);
    const [productBlocks, setProductBlocks] = useState<iProductBlock[]>([]);
    const [readOnly, setReadOnly] = useState<boolean>(false);
    const [productBlockLoaded, setProductBlockLoaded] = useState(false);

    useEffect(() => {
        const product_block_id = match?.params.id;
        if (product_block_id !== "new") {
            apiClient.productBlockById(product_block_id!).then((res: iProductBlock) => {
                setProductBlock(res);
                setReadOnly(!allowed("/orchestrator/metadata/product/edit/" + productBlock.product_block_id + "/"));
                setProductBlockLoaded(true);
            });
        }
        Promise.all([apiClient.productBlocks()]).then((res) => {
            setProductBlocks(res[0]);
        });
    }, [apiClient, match?.params.id, allowed, productBlock.product_block_id]);

    const cancel = (e: React.MouseEvent<HTMLElement>) => {
        stop(e);
        showConfirmDialog({
            question: "",
            confirmAction: () => {},
            cancelAction: () => redirect("/metadata/product_blocks"),
            leavePage: true,
        });
    };

    const isInvalid = (markErrors: boolean = false) => {
        const hasErrors = (Object.keys(errors) as (keyof iProductBlock)[]).some((key) => errors[key]);
        const requiredInputMissing = required.some((attr) => isEmpty(productBlock![attr]));
        if (markErrors) {
            const missing = required.filter((attr) => isEmpty(productBlock![attr]));
            const newErrors = { ...errors };
            missing.forEach((attr) => (newErrors[attr] = true));
            setErrors(newErrors);
        }
        return hasErrors || requiredInputMissing || duplicateName;
    };

    const handleDeleteProductBlock = (e: React.MouseEvent<HTMLElement>) => {
        stop(e);
        const question = intl.formatMessage(
            { id: "metadata.deleteConfirmation" },
            { type: "Product Block", name: productBlock!.name }
        );
        const confirmAction = () =>
            apiClient
                .deleteProductBlock(productBlock!.product_block_id)
                .then(() => {
                    redirect("/metadata/product_blocks");
                    setFlash(
                        intl.formatMessage(
                            { id: "metadata.flash.delete" },
                            { type: "Product Block", name: productBlock!.name }
                        )
                    );
                })
                .catch((err: any) => {
                    if (err.response && err.response.status === 400) {
                        closeConfirmDialog();
                        if (err.response.data) {
                            setFlash(err.response.data.error);
                        }
                    } else {
                        throw err;
                    }
                });

        showConfirmDialog({ question, confirmAction });
    };

    const submit = (e: React.MouseEvent<HTMLElement>) => {
        stop(e);
        const invalid = isInvalid(true) || processing;
        if (!invalid) {
            setProcessing(true);
            apiClient.saveProductBlock(productBlock!).then(() => {
                redirect("/metadata/product_blocks");
                setFlash(
                    intl.formatMessage(
                        { id: productBlock!.product_block_id ? "metadata.flash.updated" : "metadata.flash.created" },
                        { type: "Product Block", name: productBlock!.name }
                    )
                );
            });
        } else {
            setInitial(false);
        }
    };

    const renderButtons = (initial: boolean, productBlock: iProductBlock) => {
        const invalid = !initial && (isInvalid() || processing);
        return (
            <EuiFlexGroup className="buttons">
                <EuiFlexItem grow={false}>
                    <EuiButton className="button" onClick={cancel}>
                        <FormattedMessage id="metadata.productBlocks.back" />
                    </EuiButton>
                </EuiFlexItem>
                {allowed("/orchestrator/metadata/product-block/edit/" + productBlock.product_block_id + "/") && (
                    <EuiFlexItem grow={false}>
                        <EuiButton
                            tabIndex={0}
                            className={`button ${invalid ? "grey disabled" : "blue"}`}
                            fill={true}
                            onClick={submit}
                        >
                            <FormattedMessage id="metadata.productBlocks.submit" />
                        </EuiButton>
                    </EuiFlexItem>
                )}
                {allowed("/orchestrator/metadata/product-block/delete/" + productBlock.product_block_id + "/") &&
                    productBlock.product_block_id && (
                        <EuiFlexItem grow={false}>
                            <EuiButton color="danger" fill={true} onClick={handleDeleteProductBlock}>
                                <FormattedMessage id="metadata.productBlocks.delete" />
                            </EuiButton>
                        </EuiFlexItem>
                    )}
            </EuiFlexGroup>
        );
    };

    const validateProperty = (name: keyof iProductBlock) => (e: React.FocusEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const oldProductBlock = productBlocks.find((p) => p.product_block_id === productBlock.product_block_id);
        if (name === "name") {
            const nbr = productBlocks.filter((p) => p.name === value).length;
            let duplicate = productBlock!.product_block_id
                ? nbr === 1 && productBlock.name !== oldProductBlock!.name
                : nbr === 0;
            setErrors({ ...errors, [name]: duplicate });
            setDuplicateName(duplicate);
        }
        setErrors({ ...errors, [name]: isEmpty(value) });
    };

    const changeProperty = (name: keyof iProductBlock) => (
        e:
            | Date
            | React.MouseEvent<HTMLSpanElement | HTMLButtonElement>
            | null
            | React.ChangeEvent<HTMLInputElement>
            | SingleValue<Option>
    ) => {
        let value: any;
        if (isEmpty(e) || isDate(e)) {
            value = e;
        } else {
            // @ts-ignore
            value = e.target ? e.target.value : e.value;
        }
        setProductBlock({ ...productBlock, [name]: value });
    };

    const endDate = isEmpty(productBlock.end_date)
        ? null
        : isDate(productBlock.end_date)
        ? ((productBlock.end_date as unknown) as Date)
        : new Date(productBlock.end_date * 1000);

    return (
        <EuiPanel css={productBlockStyling}>
            {productBlockLoaded && (
                <div className="mod-product-block">
                    <section className="card">
                        {formInput(
                            "metadata.productBlocks.name",
                            "name",
                            productBlock.name || "",
                            readOnly,
                            errors,
                            changeProperty("name"),
                            validateProperty("name"),
                            duplicateName
                                ? intl.formatMessage({ id: "metadata.productBlocks.duplicate_name" })
                                : undefined
                        )}
                        {formInput(
                            "metadata.productBlocks.description",
                            "description",
                            productBlock.description || "",
                            readOnly,
                            errors,
                            changeProperty("description"),
                            validateProperty("description")
                        )}
                        {formSelect(
                            "metadata.productBlocks.status",
                            changeProperty("status"),
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
                        {formDate("metadata.productBlocks.end_date", changeProperty("end_date"), readOnly, endDate)}
                        {renderButtons(initial, productBlock)}
                    </section>
                </div>
            )}
        </EuiPanel>
    );
}

export default injectIntl(ProductBlock);
