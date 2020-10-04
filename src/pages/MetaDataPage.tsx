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

import { products } from "../api/index";

const data = products;

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
        field: "productBlocks",
        name: "PRODUCT BLOCKS",
        sortable: true,
        truncateText: true
    },
    {
        field: "creationDate",
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
    // componentDidMount = () => {
    //     client.get(`${apiUrl}/metadata`)
    //     .then((result) => {
    //         const  = result.data.map(() => {
    //             return ;
    //         });
    //         this.setState({});
    //     });
    // }
    componentDidMount() {
        fetch(`${data}`)
            .then(res => res.json())
            .then(result => {
                const products = result.data.map(product => {
                    product = product;
                    return product;
                });
                this.setState({ products: products, productsLoaded: true });
            });
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
                            <EuiTabbedContent tabs={tabs} initialSelectedTab={tabs[1]} autoFocus="selected" />
                        </EuiPageHeaderSection>
                    </EuiPageHeader>
                </EuiPageBody>
            </EuiPage>
        );
    }
}
