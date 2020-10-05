import {
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
import { Fragment, useState } from "react";
import React from "react";

import { deleteProduct, fixedInputConfiguration, productStatuses, productTags, productTypes } from "../api";
import { allWorkflows, productBlocks, productById, products, saveProduct } from "../api/index";
import { getParameterByName } from "../utils/QueryParameters";

const data = products;
const TAG_LIGHTPATH = "LightPath";

const columns = [
    {
        field: "name",
        name: "NAME",
        sortable: true,
        truncateText: true
    },
    {
        field: "description",
        name: "DESCRIPTION",
        sortable: true,
        truncateText: true
    },
    {
        field: "tag",
        name: "TAG",
        sortable: true,
        truncateText: true
    },
    {
        field: "type",
        name: "TYPE",
        sortable: true,
        truncateText: true
    },
    {
        field: "status",
        name: "STATUS",
        sortable: true,
        truncateText: true
    },
    {
        field: "product_blocks",
        name: "PRODUCT BLOCKS",
        sortable: true,
        truncateText: true
    },
    {
        field: "creatie_Date",
        name: "CREATE DATE",
        sortable: true,
        truncateText: true
    },
    {
        field: "actions",
        name: ""
    }
];

interface ProductWithExtra {
    product_blocks_string: string;
}

interface IProps {
    incremental: boolean;
    filters: boolean;
    multiAction: boolean;
    products: ProductWithExtra[];
    error: null;
    productsLoaded: boolean;
    product: ProductWithExtra[];
}

export default class MetaDataPage extends React.Component {
    state: IProps = {
        products: [],
        filters: false,
        incremental: false,
        multiAction: false,
        error: null,
        productsLoaded: false,
        product: []
    };

    // Data inladen met =
    // componentDidMount() {
    //     const id = this.props.match?.params.id;
    //     fetch(`${data}`)
    //         .then(res => res.json())
    //         .then(result => {
    //             const products = result.data.map(product => {
    //                 product = product;
    //                 return product;
    //             });
    //             this.setState({ products: products, productsLoaded: true });
    //         });
    // }

    componentDidMount() {
        const id = this.props.match?.params.id;
        const isExistingProduct = id !== "new";

        if (isExistingProduct) {
            const clone = id === "clone";
            productById(clone ? getParameterByName("productId", window.location.search) : id!).then(product => {
                if (clone) {
                    products().then(res => {
                        this.setState({ products: res, productsLoaded: true });
                    });
                }
                this.setState({ products: products, productsLoaded: true });
                this.fetchAllConstants(products);
            });
        } else {
            this.fetchAllConstants(TAG_LIGHTPATH);
        }
    }

    render() {
        const { products, productsLoaded, multiAction, filters, incremental } = this.state;

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

        const tabs = [
            {
                id: "products-id",
                name: "Products",
                content: (
                    <Fragment>
                        <EuiSpacer />
                        <EuiPageContent>
                            <EuiPageContentHeader>
                                <EuiSpacer size="l" />
                                <EuiInMemoryTable
                                    items={products}
                                    columns={columns}
                                    search={search}
                                    pagination={true}
                                    sorting={true}
                                    // loading={productsLoaded}
                                />
                            </EuiPageContentHeader>
                        </EuiPageContent>
                    </Fragment>
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
