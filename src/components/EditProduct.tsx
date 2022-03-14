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

//TODO: func based comp
//TODO: remove css , use EUI instead
import { EuiButton } from "@elastic/eui";
import ConfirmationDialog from "components/modals/ConfirmationDialog";
import { isDate } from "date-fns";
import { formDate, formInput, formSelect } from "forms/Builder";
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";
import { RouteComponentProps } from "react-router";
import { ValueType } from "react-select";
import ApplicationContext from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";
import { Option, Product, ProductBlock, Product as ProductData, Workflow } from "utils/types";
import { isEmpty, stop } from "utils/Utils";

import { intl } from "../locale/i18n";

interface MatchParams {
    id: string;
    action: string;
}

interface IProps extends Partial<RouteComponentProps<MatchParams>>, WrappedComponentProps {}

interface IState {
    confirmationDialogOpen: boolean;
    confirmationDialogAction: () => void;
    cancelDialogAction: () => void;
    confirmationDialogQuestion: string;
    leavePage: boolean;
    errors: Partial<Record<keyof ProductData, boolean>>;
    required: (keyof ProductData)[];
    initial: boolean;
    readOnly: boolean;
    product?: ProductData;
    processing: boolean;
    productBlocks: ProductBlock[];
    products: ProductData[];
    workflows: Workflow[];
    tags: string[];
    types: string[];
    statuses: string[];
    duplicateName: boolean;
}

function EditProduct({ match }: IProps) {
    const { allowed, apiClient, redirect } = useContext(ApplicationContext);
    const [productLoaded, setProductLoaded] = useState(false);
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [confirmationDialogAction, setConfirmationDialogAction] = useState<() => void>(() => null);
    const [cancelDialogAction, setCancelDialogAction] = useState<() => void>(() => null);
    const [confirmationDialogQuestion, setConfirmationDialogQuestion] = useState("");
    const [leavePage, setLeavePage] = useState(true);
    const [errors, setErrors] = useState<Partial<Record<keyof ProductData, boolean>>>({});
    const [required, setRequired] = useState<(keyof ProductData)[]>([
        "name",
        "description",
        "status",
        "product_type",
        "tag",
    ]);
    const [initial, setInitial] = useState(true);
    // const [readOnly, setReadOnly] = useState(false)
    const [processing, setProcessing] = useState(false);
    const [duplicateName, setDuplicateName] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [statuses, setStatuses] = useState<string[]>([]);

    const [product, setProduct] = useState<Product>({
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

    // class EditProduct extends React.Component<IProps, IState> {
    //     state: IState = {
    //         confirmationDialogOpen: false,
    //         confirmationDialogAction: () => this.setState({ confirmationDialogOpen: false }),
    //         cancelDialogAction: () => this.context.redirect("/metadata/products"),
    //         confirmationDialogQuestion: "",
    //         leavePage: true,
    //         errors: {},
    //         required: ["name", "description", "status", "product_type", "tag"],
    //         initial: true,
    //         readOnly: false,
    //         processing: false,
    //         productBlocks: [],
    //         products: [],
    //         workflows: [],
    //         tags: [],
    //         types: [],
    //         statuses: [],
    //         duplicateName: false,
    //     };
    debugger;
    useEffect(() => {
        const product_id = match?.params.id;
        if (product_id) {
            apiClient.productById(product_id).then((res: Product) => {
                console.log("if products");
                setProduct(res);
                setProductLoaded(true);
            });
            apiClient.products().then((res: Product[]) => {
                console.log("if products");
                setProducts(res);
            });
        }
    }, [allowed, redirect, apiClient, match?.params.id]);

    // componentDidMount() {
    //     this.fetchAllConstants(this.props.match?.params.id);
    // }
    //
    // fetchAllConstants = (product_id?: string) =>
    //     this.context.apiClient.productById(product_id).then((res: ProductData) => {
    //         this.setState({
    //             product: res,
    //         });
    //     });

    const cancel = (e: React.MouseEvent<HTMLElement>) => {
        stop(e);
        setConfirmationDialogOpen(true);
        setLeavePage(true);
        setConfirmationDialogAction(() => setConfirmationDialogOpen(false));
        setCancelDialogAction(() => redirect("/metadata/products"));
    };

    const handleDeleteProduct = (e: React.MouseEvent<HTMLElement>) => {
        stop(e);
        // const {product} = this.state;
        // const {intl} = this.props;

        const question = intl.formatMessage(
            { id: "metadata.deleteConfirmation" },
            { type: "Product", name: product!.name }
        );
        const action = () =>
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
                        setConfirmationDialogOpen(false);
                        if (err.response.data) {
                            setFlash(err.response.data.error);
                        }
                    } else {
                        throw err;
                    }
                });
        setConfirmationDialogOpen(true);
        setConfirmationDialogQuestion(question);
        setLeavePage(false);
        setConfirmationDialogAction(action);
        setConfirmationDialogOpen(false);
        setCancelDialogAction(() => setConfirmationDialogOpen(false));
    };

    const submit = (e: React.MouseEvent<HTMLElement>) => {
        stop(e);
        // const {product, processing} = this.state;
        // const {intl} = this.props;

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
            <section className="buttons">
                <EuiButton className="button" onClick={cancel}>
                    <FormattedMessage id="metadata.products.back" />
                </EuiButton>
                {allowed("/orchestrator/metadata/product/edit/" + product.product_id) && (
                    <EuiButton tabIndex={0} className={`button ${invalid ? "grey disabled" : "blue"}`} onClick={submit}>
                        <FormattedMessage id="metadata.products.submit" />
                    </EuiButton>
                )}
                {allowed("/orchestrator/metadata/product/edit/" + product.product_id) && product.product_id && (
                    <EuiButton className="button red" onClick={handleDeleteProduct}>
                        <FormattedMessage id="metadata.products.delete" />
                    </EuiButton>
                )}
            </section>
        );
    };

    const isInvalid = (markErrors: boolean = false) => {
        // const {errors, required, product, duplicateName} = this.state;
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

    const validateProperty = (name: keyof ProductData) => (e: React.FocusEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (name === "name") {
            const nbr = products.filter((p) => p.name === value).length;
            const duplicate = product!.product_id ? nbr === 2 : nbr === 1;
            errors[name] = duplicate;
            setDuplicateName(duplicate);
        }
        errors[name] = isEmpty(value);
        setErrors(errors);
    };

    const changeProperty = (name: keyof ProductData) => (
        e:
            | Date
            | React.MouseEvent<HTMLSpanElement | HTMLButtonElement>
            | null
            | React.ChangeEvent<HTMLInputElement>
            | ValueType<Option, false>
    ) => {
        let value: any;
        if (isEmpty(e) || isDate(e)) {
            value = e;
        } else {
            // @ts-ignore
            value = e.target ? e.target.value : e.value;
        }
        // @ts-ignore
        product![name] = value;
        setProduct(product);
    };

    // render() {

    if (!product) {
        return null;
    }

    const readOnly = !allowed("/orchestrator/metadata/product/edit/" + product.product_id + "/");

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
    );
    // }
}

export default injectIntl(EditProduct);
