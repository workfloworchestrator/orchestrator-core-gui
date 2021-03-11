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
    EuiPageContent,
    EuiPageContentHeader,
    EuiSpacer,
} from "@elastic/eui";
import ConfirmationDialog from "components/modals/ConfirmationDialog";
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";

import { deleteProductBlock, productBlocks } from "../api/index";
import { setFlash } from "../utils/Flash";
import { renderDateTime } from "../utils/Lookups";
import { ProductBlock } from "../utils/types";
import { stop } from "../utils/Utils";

const data = productBlocks;

interface IState {
    productBlocks: ProductBlock[];
    productBlocksLoaded: boolean;
    isLoading: boolean;
    confirmationDialogOpen: boolean;
    confirmationDialogAction: () => void;
    confirm: () => void;
    confirmationDialogQuestion: string;
    leavePage: boolean;
}

class ProductBlocks extends React.Component<WrappedComponentProps, IState> {
    state: IState = {
        productBlocks: [],
        productBlocksLoaded: true,
        isLoading: false,
        confirmationDialogOpen: false,
        confirmationDialogAction: () => this,
        confirm: () => this,
        confirmationDialogQuestion: "",
        leavePage: true,
    };

    componentDidMount() {
        data().then((productBlocks) => {
            this.setState({ productBlocks: productBlocks, productBlocksLoaded: false });
        });
    }

    cancelConfirmation = () => this.setState({ confirmationDialogOpen: false });

    handleDeleteProductBlock = (productBlock: ProductBlock) => (e: React.MouseEvent<HTMLButtonElement>) => {
        stop(e);
        const { intl } = this.props;

        this.confirmation(
            intl.formatMessage(
                { id: "metadata.deleteConfirmation" },
                { type: "Product Block", name: productBlock.name }
            ),
            () =>
                deleteProductBlock(productBlock.product_block_id)
                    .then(() => {
                        this.componentDidMount();
                        setFlash(
                            intl.formatMessage(
                                { id: "metadata.flash.delete" },
                                { name: productBlock.name, type: "Product Block" }
                            )
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
            productBlocks,
            productBlocksLoaded,
            confirmationDialogOpen,
            confirmationDialogAction,
            confirmationDialogQuestion,
        } = this.state;

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
                render: (resource_types: any) => {
                    const renderPB = resource_types.map((item: any) => (
                        <EuiBadge color="primary" isDisabled={false}>
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
                render: (created_at: any) => {
                    const renderCA = renderDateTime(created_at);
                    return <div>{renderCA}</div>;
                },
                width: "15%",
            },
            {
                field: "product_block_id",
                name: "",
                width: "2.5%",
                render: (product_block_id: any) => {
                    const Edit = (
                        <EuiButtonIcon
                            href={`/product-block/${product_block_id}?readOnly=false`}
                            iconType="pencil"
                            aria-label="Edit"
                        />
                    );
                    return <div>{Edit}</div>;
                },
            },
            {
                field: "product_block_id",
                name: "",
                width: "2%",
                render: (product_block_id: any, record: any) => {
                    const Delete = (
                        <EuiButtonIcon
                            onClick={this.handleDeleteProductBlock(record)}
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

export default injectIntl(ProductBlocks);
