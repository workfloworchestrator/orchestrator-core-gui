import {
    EuiBadge,
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
import DropDownActions from "../components/DropDownActions";
import { setFlash } from "../utils/Flash";
import { renderDateTime } from "../utils/Lookups";
import { getParameterByName } from "../utils/QueryParameters";

const data = products;

type Column = "name" | "description" | "tag" | "product_type" | "status" | "product_blocks_string" | "created_at";

interface Workflow {
    product_string: string;
}
interface FixedInput {
    product_string: string;
}
interface ProductBlock {
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

interface Action {
    show: boolean;
    id: string;
}

interface IProps {
    incremental: boolean;
    filters: boolean;
    products: Product[];
    productsLoaded: boolean;
    actions: Action;
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
        actions: { show: false, id: "" },
        // Sorteer the table automatisch op Alfabetisch name;
        // sorted: { name: "name", descending: true },

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

    // cancel = (e: React.MouseEvent<HTMLElement>) => {
    //     stop(e);
    //     this.setState({
    //         confirmationDialogOpen: true,
    //         leavePage: true,
    //         confirmationDialogAction: () => this.setState({ confirmationDialogOpen: false }),
    //         cancelDialogAction: () => this.context.redirect("/metadatapage")
    //     });
    // };

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

    // handleDeleteProduct = (products: Product) => (e: React.MouseEvent<HTMLElement>) => {
    //     stop(e);
    //     const { products } = this.state;

    //     const question = I18n.t("metadata.deleteConfirmation", {
    //         type: "Product",
    //         name: products.name
    //     });
    //     const action = () =>
    //         deleteProduct(products.product_id)
    //             .then(() => {
    //                 this.context.redirect("/metadata/products");
    //                 setFlash(
    //                     I18n.t("metadata.flash.delete", {
    //                         name: products,
    //                         type: "Product"
    //                     })
    //                 );
    //             })
    //             .catch(err => {
    //                 if (err.response && err.response.status === 400) {
    //                     this.setState({ confirmationDialogOpen: false });
    //                     err.response.json().then((json: { error: string }) => setFlash(json["error"], "error"));
    //                 } else {
    //                     throw err;
    //                 }
    //             });
    //     this.setState({
    //         confirmationDialogOpen: true,
    //         confirmationDialogQuestion: question,
    //         leavePage: false,
    //         confirmationDialogAction: action,
    //         cancelDialogAction: () => this.setState({ confirmationDialogOpen: false })
    //     });
    // };

    renderActions = (products: Product, actions: Action) => {
        const actionId = products.product_id;
        if (actions.id !== actionId || (actions.id === actionId && !actions.show)) {
            return null;
        }
        const view = {
            icon: "fa fa-search-plus",
            label: "view",
            action: this.editProduct(products, true, false)
        };
        const edit = {
            icon: "fa fa-edit",
            label: "edit",
            action: this.editProduct(products, false, false)
        };
        // const _delete = {
        //     icon: "fas fa-trash-alt",
        //     label: "delete",
        //     action: this.handleDeleteProduct(product),
        //     danger: true
        // };
        const options = [view, edit];
        return <DropDownActions options={options} i18nPrefix="metadata.products" />;
    };

    render() {
        const { actions, products, productsLoaded, filters, incremental } = this.state;

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
                width: "12.5%"
            },
            {
                field: "description",
                name: "DESCRIPTION",
                sortable: true,
                truncateText: false,
                width: "15%"
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
                width: "7.5%"
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
                width: "17%"
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
                name: "ACTIONS",
                width: "5.5%",
                render: () => {
                    const { products } = this.state;
                    const renderAC = this.renderActions(products, actions);
                    return (
                        <div>
                            <i className="fa fa-ellipsis-h" />
                            {renderAC}
                        </div>
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
                                columns={columns}
                                search={search}
                                pagination={true}
                                sorting={true}
                                loading={productsLoaded}
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
