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

import {
    EuiBadge,
    EuiButton,
    EuiButtonIcon,
    EuiInMemoryTable,
    EuiPageContent,
    EuiPageContentHeader,
    EuiSpacer,
} from "@elastic/eui";
import ConfirmationDialogContext from "contextProviders/ConfirmationDialogProvider";
import { intl } from "locale/i18n";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { useHistory } from "react-router";
import { getStatusBadgeColor } from "stylesheets/emotion/utils";
import ApplicationContext from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";
import { renderDateTime } from "utils/Lookups";
import { Product, ProductBlock } from "utils/types";

function Products() {
    const { apiClient, allowed } = useContext(ApplicationContext);
    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoaded, setProductsLoaded] = useState(true);
    const [reload, setReload] = useState(false);
    const { showConfirmDialog, closeConfirmDialog } = useContext(ConfirmationDialogContext);
    const history = useHistory();

    useEffect(() => {
        apiClient.products().then((products: Product[]) => {
            setProducts(products);
            setProductsLoaded(true);
        });
        setReload(false);
    }, [apiClient, reload]);

    const handleOnClick = useCallback((path: string) => history.push(path), [history]);

    const deleteProduct = (product: Product) => {
        apiClient
            .deleteProduct(product.product_id)
            .then(() => {
                setReload(true);
                setFlash(intl.formatMessage({ id: "metadata.flash.delete" }, { name: product.name, type: "Product" }));
            })
            .catch((err: any) => {
                if (err.response && err.response.status === 400) {
                    if (err.response.data) {
                        setFlash(err.response.data.error);
                    }
                } else {
                    throw err;
                }
            });
        closeConfirmDialog();
    };

    const handleDeleteProduct = (product: Product) => (e: React.MouseEvent<HTMLButtonElement>) => {
        showConfirmDialog({
            question: intl.formatMessage(
                { id: "metadata.deleteConfirmation" },
                { type: "Product", name: product.name }
            ),
            confirmAction: () => deleteProduct(product),
        });
    };

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
            render: (status: string) => (
                <EuiBadge color={getStatusBadgeColor(status)} isDisabled={false}>
                    {status}
                </EuiBadge>
            ),
        },
        {
            field: "product_blocks",
            name: "PRODUCT BLOCKS",
            sortable: true,
            truncateText: false,
            render: (product_blocks: ProductBlock[]) => {
                const renderPB = product_blocks.map((item, index) => (
                    <EuiButton
                        key={`product_block-${item.name}-${index}`}
                        size="s"
                        color="primary"
                        isDisabled={false}
                        style={{ marginRight: "5px", marginBottom: "5px" }}
                        onClick={() => handleOnClick(`/metadata/product-block/${item.product_block_id}`)}
                    >
                        {item.name}
                    </EuiButton>
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
            render: (created_at: number) => {
                const renderCA = renderDateTime(created_at);
                return <div>{renderCA}</div>;
            },
            width: "20%",
        },
        {
            field: "product_id",
            name: "",
            width: "2.5%",
            render: (product_id: string) => {
                return allowed("/orchestrator/metadata/product/view/" + product_id) + "/" ? (
                    <EuiButtonIcon
                        onClick={() => handleOnClick(`/metadata/product/view/${product_id}`)}
                        iconType="eye"
                        aria-label="View"
                    />
                ) : null;
            },
        },
        {
            field: "product_id",
            name: "",
            width: "2.5%",
            render: (product_id: string) => {
                return allowed("/orchestrator/metadata/product/edit/" + product_id) + "/" ? (
                    <EuiButtonIcon
                        onClick={() => handleOnClick(`/metadata/product/edit/${product_id}`)}
                        iconType="pencil"
                        aria-label="Edit"
                    />
                ) : null;
            },
        },
        {
            field: "product_id",
            name: "",
            width: "2%",
            render: (product_id: string, record: Product) => {
                return allowed("/orchestrator/metadata/product/delete/" + product_id) + "/" ? (
                    <EuiButtonIcon onClick={handleDeleteProduct(record)} iconType="trash" aria-label="Delete" />
                ) : null;
            },
        },
    ];

    return (
        <EuiPageContent>
            <EuiPageContentHeader>
                <EuiSpacer size="l" />
                <EuiInMemoryTable
                    items={products}
                    columns={columns}
                    search={search}
                    pagination={true}
                    sorting={true}
                    loading={!productsLoaded}
                    hasActions={true}
                />
            </EuiPageContentHeader>
        </EuiPageContent>
    );
}

export default injectIntl(Products);
