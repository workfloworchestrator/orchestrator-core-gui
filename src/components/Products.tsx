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

import {
    EuiBadge,
    EuiButtonIcon,
    EuiInMemoryTable,
    EuiLink,
    EuiPageContent,
    EuiPageContentHeader,
    EuiSpacer,
} from "@elastic/eui";
import ConfirmationDialog from "components/modals/ConfirmationDialog";
import { intl } from "locale/i18n";
import React from "react";

import { deleteProduct, products } from "../api/index";
import { setFlash } from "../utils/Flash";
import { renderDateTime } from "../utils/Lookups";
import { Product } from "../utils/types";

const data = products;

interface IState {
    products: Product[];
    productsLoaded: boolean;
    isLoading: boolean;
    confirmationDialogOpen: boolean;
    confirmationDialogAction: () => void;
    confirm: () => void;
    confirmationDialogQuestion: string;
    leavePage: boolean;
}

export default class Products extends React.Component {
    state: IState = {
        products: [],
        productsLoaded: true,
        isLoading: false,
        confirmationDialogOpen: false,
        confirmationDialogAction: () => this,
        confirm: () => this,
        confirmationDialogQuestion: "",
        leavePage: true,
    };

    componentDidMount() {
        data().then((products) => {
            this.setState({ products: products, productsLoaded: false });
        });
    }

    cancelConfirmation = () => this.setState({ confirmationDialogOpen: false });

    handleDeleteProduct = (product: Product) => (e: React.MouseEvent<HTMLButtonElement>) => {
        this.confirmation(
            intl.formatMessage({ id: "metadata.deleteConfirmation" }, { type: "Product", name: product.name }),
            () =>
                deleteProduct(product.product_id)
                    .then(() => {
                        this.componentDidMount();
                        setFlash(
                            intl.formatMessage({ id: "metadata.flash.delete" }, { name: product.name, type: "Product" })
                        );
                    })
                    .catch((err) => {
                        if (err.response && err.response.status === 400) {
                            if (err.response.data) {
                                setFlash(err.response.data.error);
                            }
                        } else {
                            throw err;
                        }
                    })
        );
    };

    confirmation = (question: string, action: () => void) =>
        this.setState({
            confirmationDialogOpen: true,
            confirmationDialogQuestion: question,
            confirmationDialogAction: () => {
                this.cancelConfirmation();
                action();
            },
        });

    render() {
        const {
            products,
            productsLoaded,
            confirmationDialogOpen,
            confirmationDialogAction,
            confirmationDialogQuestion,
        } = this.state;

        const search = {
            box: {
                incremental: true,
                schema: true,
                placeholder: "Search for products..",
            },
        };

        const columns = [
            {
                field: "name",
                name: "NAME",
                sortable: true,
                truncateText: false,
                width: "15%",
            },
            {
                field: "description",
                name: "DESCRIPTION",
                sortable: true,
                truncateText: false,
                width: "15%",
            },
            {
                field: "tag",
                name: "TAG",
                sortable: true,
                truncateText: false,
                width: "6%",
            },
            {
                field: "product_type",
                name: "TYPE",
                sortable: true,
                truncateText: false,
                width: "6%",
            },
            {
                field: "status",
                name: "STATUS",
                sortable: true,
                truncateText: false,
                width: "5%",
                render: (status: any) => {
                    switch (status) {
                        case "end of life":
                            return (
                                <EuiBadge color="#FF4136" isDisabled={false}>
                                    {status}
                                </EuiBadge>
                            );
                        case "active":
                            return (
                                <EuiBadge color="secondary" isDisabled={false}>
                                    {status}
                                </EuiBadge>
                            );
                        case "phase out":
                            return (
                                <EuiBadge color="danger" isDisabled={false}>
                                    {status}
                                </EuiBadge>
                            );
                        case "pre production":
                            return (
                                <EuiBadge color="warning" isDisabled={false}>
                                    {status}
                                </EuiBadge>
                            );
                        default:
                            return (
                                <EuiBadge color="default" isDisabled={false}>
                                    {status}
                                </EuiBadge>
                            );
                    }
                },
            },
            {
                field: "product_blocks",
                name: "PRODUCT BLOCKS",
                sortable: true,
                truncateText: false,
                render: (product_blocks: any) => {
                    const renderPB = product_blocks.map((item: any) => (
                        <EuiBadge color="primary" isDisabled={false}>
                            <EuiLink color="text" href={`/product-block/${item.product_block_id}?readOnly=false`}>
                                {item.name}
                            </EuiLink>
                        </EuiBadge>
                    ));
                    return <div>{renderPB}</div>;
                },
                width: "16%",
            },
            {
                field: "created_at",
                name: "CREATE DATE",
                sortable: true,
                truncateText: false,
                render: (created_at: any) => {
                    const renderCA = renderDateTime(created_at);
                    return <div>{renderCA}</div>;
                },
                width: "20%",
            },
            {
                field: "product_id",
                name: "",
                width: "2.5%",
                render: (product_id: any) => {
                    const Edit = (
                        <EuiButtonIcon
                            href={`/product/${product_id}?readOnly=false`}
                            iconType="pencil"
                            aria-label="Edit"
                        />
                    );
                    return <div>{Edit}</div>;
                },
            },
            {
                field: "product_id",
                name: "",
                width: "2%",
                render: (product_id: any, record: any) => {
                    const Delete = (
                        <EuiButtonIcon
                            onClick={this.handleDeleteProduct(record)}
                            iconType="trash"
                            aria-label="Delete"
                        />
                    );
                    return <div>{Delete}</div>;
                },
            },
        ];

        return (
            <EuiPageContent>
                <EuiPageContentHeader>
                    <ConfirmationDialog
                        isOpen={confirmationDialogOpen}
                        cancel={this.cancelConfirmation}
                        confirm={confirmationDialogAction}
                        question={confirmationDialogQuestion}
                    />
                    <EuiSpacer size="l" />
                    <EuiInMemoryTable
                        items={products}
                        columns={columns}
                        search={search}
                        pagination={true}
                        sorting={true}
                        loading={productsLoaded}
                        hasActions={true}
                    />
                </EuiPageContentHeader>
            </EuiPageContent>
        );
    }
}
