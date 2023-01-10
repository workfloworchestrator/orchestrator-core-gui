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
import { Option, Product as ProductData } from "utils/types";
import { isEmpty, stop } from "utils/Utils";

import { editProductStyling } from "./EditProductStyling";

interface MatchParams {
    id: string;
    action: string;
}

interface IProps extends Partial<RouteComponentProps<MatchParams>>, WrappedComponentProps {}

function EditProduct({ match }: IProps) {
    const { apiClient, redirect, allowed } = useContext(ApplicationContext);
    const { showConfirmDialog, closeConfirmDialog } = useContext(ConfirmationDialogContext);
    const [errors, setErrors] = useState<Partial<Record<keyof ProductData, boolean>>>({});
    const [required] = useState<(keyof ProductData)[]>(["name", "description", "status", "product_type", "tag"]);
    const [initial, setInitial] = useState<boolean>(true);
    const [readOnly, setReadOnly] = useState<boolean>(false);
    const [productLoaded, setProductLoaded] = useState(false);
    const [product, setProduct] = useState<ProductData>({
        create_subscription_workflow_key: "",
        created_at: 0,
        description: "",
        end_date: 0,
        fixed_inputs: [],
        modify_subscription_workflow_key: "",
        name: "",
        product_blocks: [],
        product_id: "",
        product_type: "",
        status: "",
        tag: "",
        terminate_subscription_workflow_key: "",
        workflows: [],
    });
    const [processing, setProcessing] = useState<boolean>(false);
    const [products, setProducts] = useState<ProductData[]>([]);
    const [statuses] = useState<string[]>([]);
    const [duplicateName, setDuplicateName] = useState<boolean>(false);

    useEffect(() => {
        let product_id = match?.params.id;
        apiClient.products().then((res: ProductData[]) => {
            const product = res.find((value: ProductData) => value.product_id === product_id);
            setProducts(res);
            if (product) {
                setProduct(product);
                setProductLoaded(true);
                setReadOnly(!allowed("/orchestrator/metadata/product/edit/" + product.product_id + "/"));
            }
        });
    }, [apiClient, match?.params.id, allowed]);

    const cancel = (e: React.MouseEvent<HTMLElement>) => {
        stop(e);
        showConfirmDialog({
            question: "",
            confirmAction: () => {},
            cancelAction: () => redirect("/metadata/products"),
            leavePage: true,
        });
    };

    const isInvalid = (markErrors: boolean = false) => {
        const hasErrors = (Object.keys(errors) as (keyof ProductData)[]).some((key) => errors[key]);
        const requiredInputMissing = required.some((attr) => isEmpty(product![attr]));
        if (markErrors) {
            const missing = required.filter((attr) => isEmpty(product![attr]));
            const newErrors = { ...errors };
            missing.forEach((attr) => (newErrors[attr] = true));
            setErrors(newErrors);
        }
        return hasErrors || requiredInputMissing || duplicateName;
    };

    const handleDeleteProduct = (e: React.MouseEvent<HTMLElement>) => {
        stop(e);
        const question = intl.formatMessage(
            { id: "metadata.deleteConfirmation" },
            { type: "Product", name: product!.name }
        );
        const confirmAction = () =>
            apiClient
                .deleteProduct(product!.product_id)
                .then(() => {
                    redirect("/metadata/products");
                    setFlash(
                        intl.formatMessage({ id: "metadata.flash.delete" }, { name: product!.name, type: "Product" })
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
            apiClient.saveProduct(product!).then(() => {
                redirect("/metadata/products");
                setFlash(
                    intl.formatMessage(
                        { id: product!.product_id ? "metadata.flash.updated" : "metadata.flash.created" },
                        { type: "Product", name: product!.name }
                    )
                );
            });
        } else {
            setInitial(false);
        }
    };

    const renderButtons = (initial: boolean, product: ProductData) => {
        const invalid = !initial && (isInvalid() || processing);
        return (
            <EuiFlexGroup className="buttons">
                <EuiFlexItem grow={false}>
                    <EuiButton className="button" onClick={cancel}>
                        <FormattedMessage id="metadata.products.back" />
                    </EuiButton>
                </EuiFlexItem>
                {allowed("/orchestrator/metadata/product/edit/" + product.product_id) && (
                    <EuiFlexItem grow={false}>
                        <EuiButton
                            tabIndex={0}
                            className={`button ${invalid ? "grey disabled" : "blue"}`}
                            fill={true}
                            onClick={submit}
                        >
                            <FormattedMessage id="metadata.products.submit" />
                        </EuiButton>
                    </EuiFlexItem>
                )}
                {allowed("/orchestrator/metadata/product/edit/" + product.product_id) && product.product_id && (
                    <EuiFlexItem grow={false}>
                        <EuiButton color="danger" fill={true} onClick={handleDeleteProduct}>
                            <FormattedMessage id="metadata.products.delete" />
                        </EuiButton>
                    </EuiFlexItem>
                )}
            </EuiFlexGroup>
        );
    };

    const validateProperty = (name: keyof ProductData) => (e: React.FocusEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const oldProduct = products.find((p) => p.product_id === product.product_id);
        if (name === "name") {
            const nbr = products.filter((p) => p.name === value).length;
            let duplicate = product!.product_id ? nbr === 1 && product.name !== oldProduct!.name : nbr === 0;
            setErrors({ ...errors, [name]: duplicate });
            setDuplicateName(duplicate);
        }
        setErrors({ ...errors, [name]: isEmpty(value) });
    };

    const changeProperty = (name: keyof ProductData) => (
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
        setProduct({ ...product, [name]: value });
    };

    const endDate = !product.end_date
        ? null
        : isDate(product.end_date)
        ? ((product.end_date as unknown) as Date)
        : new Date(product.end_date * 1000);

    return (
        <EuiPanel css={editProductStyling}>
            {productLoaded && (
                <div className="mod-product">
                    <section className="card">
                        {formInput(
                            "metadata.products.name",
                            "name",
                            product!.name || "",
                            readOnly,
                            errors,
                            changeProperty("name"),
                            validateProperty("name"),
                            duplicateName ? intl.formatMessage({ id: "metadata.products.duplicate_name" }) : undefined
                        )}
                        {formInput(
                            "metadata.products.description",
                            "description",
                            product.description || "",
                            readOnly,
                            errors,
                            changeProperty("description"),
                            validateProperty("description")
                        )}
                        {formSelect(
                            "metadata.products.status",
                            changeProperty("status"),
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
                        {formDate("metadata.products.end_date", changeProperty("end_date"), readOnly, endDate)}
                        {renderButtons(initial, product)}
                    </section>
                </div>
            )}
        </EuiPanel>
    );
}

export default injectIntl(EditProduct);
