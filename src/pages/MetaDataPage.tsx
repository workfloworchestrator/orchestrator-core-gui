import "../components/Products.scss";

import { stringify } from "querystring";

import {
    EuiBadge,
    EuiBasicTable,
    EuiButton,
    EuiButtonIcon,
    EuiFlexGroup,
    EuiFlexItem,
    EuiIcon,
    EuiInMemoryTable,
    EuiLink,
    EuiPage,
    EuiPageBody,
    EuiPageContent,
    EuiPageContentBody,
    EuiPageContentHeader,
    EuiPageContentHeaderSection,
    EuiPageHeader,
    EuiPageHeaderSection,
    EuiPanel,
    EuiSpacer,
    EuiSwitch,
    EuiTab,
    EuiTabbedContent,
    EuiTable,
    EuiTabs,
    EuiText,
    EuiTitle
} from "@elastic/eui";
import I18n from "i18n-js";
import { useState } from "react";
import React from "react";

import { deleteProduct, products } from "../api/index";
import { setFlash } from "../utils/Flash";
import { renderDateTime } from "../utils/Lookups";

const data = products;

interface Workflow {
    product_string: string;
}
interface FixedInput {
    product_string: string;
}
interface ProductBlock {
    product_string: string;
}
interface TheActions {
    product_string: string;
}

export interface Product {
    name: string;
    tag: string;
    description: string;
    product_id: string;
    created_at: number;
    product_type: string;
    end_date: number;
    status: string;
    fixed_inputs: FixedInput[];
    workflows: Workflow[];
    product_blocks: ProductBlock[];
    create_subscription_workflow_key: string;
    modify_subscription_workflow_key: string;
    terminate_subscription_workflow_key: string;
}

interface IProps {
    incremental: boolean;
    filters: boolean;
    products: Product[];
    productsLoaded: boolean;
    multiAction: boolean;
    theActions: TheActions[];
    // sorted: SortOption<Product>;

    confirmationDialogOpen: boolean;
    confirmationDialogAction: () => void;
    cancelDialogAction: () => void;
    confirmationDialogQuestion: string;
    leavePage: boolean;
}

export default class MetaDataPage extends React.Component {
    state: IProps = {
        products: [],
        filters: false,
        incremental: false,
        productsLoaded: true,
        multiAction: true,
        theActions: [],
        // Sorteer the table automatisch op Alfabetisch name;
        // sorted: { name: "name", ascending: true },

        confirmationDialogOpen: false,
        confirmationDialogAction: () => this.setState({ confirmationDialogOpen: false }),
        cancelDialogAction: () => this.context.redirect("/metadata/products"),
        confirmationDialogQuestion: "",
        leavePage: true
    };

    // Data inladen met =
    componentDidMount() {
        data().then(res => {
            const products = res.map(product => {
                product.name = product.name;
                product.product_id = product.product_id;
                return product;
            });
            this.setState({ products: products, productsLoaded: false });
        });
    }

    onSelectionChange = (selected: any) => {
        this.setState({ selected: selected });
    };

    editProduct = (
        products: Partial<Product>,
        readOnly: boolean = true,
        newProduct: boolean = false,
        clone: boolean = false
    ) => () => {
        const productId = clone ? "clone" : newProduct ? "new" : products.product_id;
        const cloneId = clone ? `&productId=${products.product_id}` : "";
        this.context.redirect(`/product/${productId}?readOnly=${readOnly}${cloneId}`);
    };

    handleDeleteProduct = (products: any) => (e: React.MouseEvent<HTMLElement>) => {
        // stop(e);
        const question = I18n.t("metadata.deleteConfirmation", {
            type: "Product",
            name: products.name
        });
        const action = () =>
            deleteProduct(products.product_id)
                .then(() => {
                    this.context.redirect("/metadatapage");
                    setFlash(
                        I18n.t("metadata.flash.delete", {
                            name: products,
                            type: "Product"
                        })
                    );
                })
                .catch(err => {
                    if (err.response && err.response.status === 400) {
                        this.setState({ confirmationDialogOpen: false });
                        err.response.json().then((json: { error: string }) => setFlash(json["error"], "error"));
                    } else {
                        throw err;
                    }
                });
        this.setState({
            confirmationDialogOpen: true,
            confirmationDialogQuestion: question,
            leavePage: false,
            confirmationDialogAction: action,
            cancelDialogAction: () => this.setState({ confirmationDialogOpen: false })
        });
    };

    actions = null;
    setMultiAction() {
        const { multiAction } = this.state;
        if (multiAction) {
            const actions = [
                {
                    name: <span>Clone</span>,
                    description: "Clone this user",
                    icon: "copy",
                    onClick: () => {},
                    "data-test-subj": "action-clone"
                },
                {
                    name: (products: any) => (products.product_id ? "Delete" : "Remove"),
                    description: "Delete this user",
                    icon: "trash",
                    color: "danger",
                    type: "icon",
                    onClick: this.handleDeleteProduct,
                    isPrimary: true,
                    "data-test-subj": "action-delete"
                },
                {
                    name: "Edit",
                    isPrimary: true,
                    description: "Edit this user",
                    icon: "pencil",
                    type: "icon",
                    onClick: () => {},
                    "data-test-subj": "action-edit"
                }
            ];
            return actions;
        }
        this.setState({ theActions: this.actions });
    }

    // toggleActions = (products: any, actions: Action) => (e: React.MouseEvent<HTMLTableDataCellElement>) => {
    //     //  stop(e);

    //     const newShow = actions.id === products.product_id ? !actions.show : true;
    //     this.setState({ actions: { show: newShow, id: products.product_id } });
    // };

    render() {
        const { multiAction, products, productsLoaded, filters, incremental } = this.state;

        const search = {
            box: {
                incremental: incremental,
                schema: true
            }
            // filters aanmaken =
            // filters: !filters ? undefined :
            // [

            // ]
        };

        const columns = [
            {
                field: "name",
                name: "NAME",
                sortable: true,
                truncateText: false,
                width: "20.5%"
            },
            {
                field: "description",
                name: "DESCRIPTION",
                sortable: true,
                truncateText: false,
                width: "17%"
            },
            {
                field: "tag",
                name: "TAG",
                sortable: true,
                truncateText: false,
                width: "7.5%"
            },
            {
                field: "product_type",
                name: "TYPE",
                sortable: true,
                truncateText: false,
                width: "7.5%"
            },
            {
                field: "status",
                name: "STATUS",
                sortable: true,
                truncateText: false,
                width: "7.5%",
                render: (status: any) => {
                    switch (status) {
                        case "end of life":
                            return (
                                <EuiBadge color="danger" isDisabled={false}>
                                    {status}
                                </EuiBadge>
                            );
                        case "active":
                            return (
                                <EuiBadge color="secondary" isDisabled={false}>
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
                }
            },
            {
                field: "product_blocks",
                name: "PRODUCT BLOCKS",
                sortable: true,
                truncateText: false,
                render: (product_blocks: any) => {
                    const renderPB = product_blocks.map((item: any) => (
                        <EuiBadge color="primary" isDisabled={false}>
                            {item.name}
                        </EuiBadge>
                    ));
                    return <div>{renderPB}</div>;
                },
                width: "20%"
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
                width: "15%"
            },
            {
                field: "actions",
                name: "",
                width: "10%",
                theActions: this.actions,
                render: (theActions: any) => {
                    const renderMA = theActions;
                    return (
                        <EuiButtonIcon size="s" onClick={() => window.alert("Button clicked")} iconType="boxesVertical">
                            {renderMA}
                        </EuiButtonIcon>
                    );
                }
            }
        ];

        const tabs = [
            {
                id: "products-id",
                name: "Products",
                content: (
                    <EuiPageContent>
                        <EuiPageContentHeader>
                            <EuiSpacer size="l" />
                            <EuiInMemoryTable
                                items={products}
                                itemId={(products: any) => {
                                    const id = products.product_id;
                                    return id;
                                }}
                                columns={columns}
                                search={search}
                                pagination={true}
                                sorting={true}
                                loading={productsLoaded}
                                hasActions={true}
                            />
                        </EuiPageContentHeader>
                    </EuiPageContent>
                )
            }
        ];

        return (
            <EuiPage>
                <EuiPageBody component="div">
                    <EuiPageHeader>
                        <EuiPageHeaderSection>
                            <EuiTabbedContent tabs={tabs} initialSelectedTab={tabs[0]} autoFocus="selected" />
                        </EuiPageHeaderSection>
                    </EuiPageHeader>
                </EuiPageBody>
            </EuiPage>
        );
    }
}
