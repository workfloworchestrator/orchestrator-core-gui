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

import {
    EuiBadge,
    EuiButtonIcon,
    EuiInMemoryTable,
    EuiPageContent,
    EuiPageContentHeader,
    EuiSpacer,
} from "@elastic/eui";
import ConfirmationDialogContext, {
    ConfirmDialogActions,
    ShowConfirmDialogType,
} from "contextProviders/ConfirmationDialogProvider";
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import { getStatusBadgeColor } from "stylesheets/emotion/utils";
import ApplicationContext from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";
import { renderDateTime } from "utils/Lookups";
import { ProductBlock, ResourceType } from "utils/types";
import { stop } from "utils/Utils";

interface IState {
    productBlocks: ProductBlock[];
    productBlocksLoaded: boolean;
    isLoading: boolean;
    showConfirmDialog: ShowConfirmDialogType;
}

class ProductBlocks extends React.Component<WrappedComponentProps, IState> {
    context!: React.ContextType<typeof ApplicationContext>;

    state: IState = {
        productBlocks: [],
        productBlocksLoaded: true,
        isLoading: false,
        showConfirmDialog: () => {},
    };

    componentDidMount() {
        this.context.apiClient.productBlocks().then((productBlocks: ProductBlock[]) => {
            this.setState({ productBlocks: productBlocks, productBlocksLoaded: false });
        });
    }

    handleDeleteProductBlock = (productBlock: ProductBlock) => (e: React.MouseEvent<HTMLButtonElement>) => {
        stop(e);
        const { intl } = this.props;

        this.confirmation(
            intl.formatMessage(
                { id: "metadata.deleteConfirmation" },
                { type: "Product Block", name: productBlock.name }
            ),
            () =>
                this.context.apiClient
                    .deleteProductBlock(productBlock.product_block_id)
                    .then(() => {
                        this.componentDidMount();
                        setFlash(
                            intl.formatMessage(
                                { id: "metadata.flash.delete" },
                                { name: productBlock.name, type: "Product Block" }
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
                    })
        );
    };

    confirmation = (question: string, confirmAction: () => void) =>
        this.state.showConfirmDialog({
            question,
            confirmAction,
        });

    addConfirmDialogActions = ({ showConfirmDialog }: ConfirmDialogActions) => {
        if (this.state.showConfirmDialog !== showConfirmDialog) {
            this.setState({ showConfirmDialog });
        }
        return <></>;
    };

    render() {
        const { productBlocks, productBlocksLoaded } = this.state;

        const search = {
            box: {
                incremental: true,
                schema: true,
                placeholder: "Search for product blocks..",
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
                    const Edit = this.context.allowed(
                        "/orchestrator/metadata/product-block/edit/" + product_block_id + "/"
                    ) ? (
                        <EuiButtonIcon
                            href={`/metadata/product-block/${product_block_id}`}
                            iconType="pencil"
                            aria-label="Edit"
                        />
                    ) : this.context.allowed("/orchestrator/metadata/product-block/view/" + product_block_id) + "/" ? (
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
                    const Delete = this.context.allowed(
                        "/orchestrator/metadata/product-block/delete/" + product_block_id + "/"
                    ) ? (
                        <EuiButtonIcon
                            onClick={this.handleDeleteProductBlock(record)}
                            iconType="trash"
                            aria-label="Delete"
                        />
                    ) : null;
                    return <div>{Delete}</div>;
                },
            },
        ];

        return (
            <EuiPageContent>
                <ConfirmationDialogContext.Consumer>
                    {(cdc) => this.addConfirmDialogActions(cdc)}
                </ConfirmationDialogContext.Consumer>
                <EuiPageContentHeader>
                    <EuiSpacer size="l" />
                    <EuiInMemoryTable
                        items={productBlocks}
                        columns={columns}
                        search={search}
                        pagination={true}
                        sorting={true}
                        loading={productBlocksLoaded}
                        hasActions={true}
                    />
                </EuiPageContentHeader>
            </EuiPageContent>
        );
    }
}
ProductBlocks.contextType = ApplicationContext;

export default injectIntl(ProductBlocks);
