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
import { getStatusBadgeColor } from "stylesheets/emotion/utils";
import ApplicationContext from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";
import { renderDateTime } from "utils/Lookups";
import { ProductBlock, ResourceType } from "utils/types";
import { stop } from "utils/Utils";

function ProductBlocks() {
    const { apiClient, allowed } = useContext(ApplicationContext);
    const { showConfirmDialog } = useContext(ConfirmationDialogContext);
    const [productBlocks, setProductBlocks] = useState<ProductBlock[]>([]);
    const [productBlocksLoaded, setProductBlocksLoaded] = useState(false);

    const loadProductBlocks = useCallback(() => {
        apiClient.productBlocks().then((productBlocks: ProductBlock[]) => {
            setProductBlocks(productBlocks);
            setProductBlocksLoaded(true);
        });
    }, [apiClient]);

    useEffect(() => {
        loadProductBlocks();
    }, [apiClient, loadProductBlocks]);

    const handleDeleteProductBlock = (productBlock: ProductBlock) => (e: React.MouseEvent<HTMLElement>) => {
        stop(e);
        const question = intl.formatMessage(
            { id: "metadata.deleteConfirmation" },
            { type: "Product Block", name: productBlock!.name }
        );

        const confirmAction = () =>
            apiClient
                .deleteProductBlock(productBlock!.product_block_id)
                .then(() => {
                    loadProductBlocks();
                    setFlash(
                        intl.formatMessage(
                            { id: "metadata.flash.delete" },
                            { type: "Product Block", name: productBlock!.name }
                        )
                    );
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

        showConfirmDialog({ question, confirmAction });
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
            width: "20%",
        },
        {
            field: "status",
            name: "STATUS",
            sortable: true,
            truncateText: false,
            width: "8%",
            render: (status: string) => (
                <EuiBadge color={getStatusBadgeColor(status)} isDisabled={false}>
                    {status}
                </EuiBadge>
            ),
        },
        {
            field: "tag",
            name: "TAG",
            sortable: true,
            truncateText: false,
            width: "8%",
        },
        {
            field: "resource_types",
            name: "RESOURCE TYPES",
            sortable: true,
            truncateText: false,
            render: (resource_types: ResourceType[]) => {
                const renderPB = resource_types.map((item, index) => (
                    <EuiBadge key={`${item.resource_type}-${index}`} color="primary" isDisabled={false}>
                        {item.resource_type}
                    </EuiBadge>
                ));
                return <div>{renderPB}</div>;
            },
            width: "15%",
        },
        {
            field: "created_at",
            name: "CREATED ",
            sortable: true,
            truncateText: false,
            render: (created_at: number) => {
                const renderCA = renderDateTime(created_at);
                return <div>{renderCA}</div>;
            },
            width: "15%",
        },
        {
            field: "product_block_id",
            name: "",
            width: "2.5%",
            render: (product_block_id: string) => {
                const Edit = allowed("/orchestrator/metadata/product-block/edit/" + product_block_id + "/") ? (
                    <EuiButtonIcon
                        href={`/metadata/product-block/${product_block_id}`}
                        iconType="pencil"
                        aria-label="Edit"
                    />
                ) : allowed("/orchestrator/metadata/product-block/view/" + product_block_id) + "/" ? (
                    <EuiButtonIcon
                        href={`/metadata/product-block/${product_block_id}`}
                        iconType="eye"
                        aria-label="View"
                    />
                ) : null;
                return <div>{Edit}</div>;
            },
        },
        {
            field: "product_block_id",
            name: "",
            width: "2%",
            render: (product_block_id: string, record: ProductBlock) => {
                const Delete = allowed("/orchestrator/metadata/product-block/delete/" + product_block_id + "/") ? (
                    <EuiButtonIcon onClick={handleDeleteProductBlock(record)} iconType="trash" aria-label="Delete" />
                ) : null;
                return <div>{Delete}</div>;
            },
        },
    ];

    const search = {
        box: {
            incremental: true,
            schema: true,
            placeholder: "Search for product blocks..",
        },
    };

    return (
        <EuiPageContent>
            <EuiPageContentHeader>
                <EuiSpacer size="l" />
                <EuiInMemoryTable
                    items={productBlocks}
                    columns={columns}
                    search={search}
                    pagination={true}
                    sorting={true}
                    loading={!productBlocksLoaded}
                    hasActions={true}
                />
            </EuiPageContentHeader>
        </EuiPageContent>
    );
}
ProductBlocks.contextType = ApplicationContext;

export default injectIntl(ProductBlocks);
