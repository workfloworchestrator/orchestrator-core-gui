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
import { Fragment, useState } from "react";
import React from "react";

import { deleteProduct, fixedInputConfiguration, productStatuses, productTags, productTypes } from "../api";
import { products } from "../api/index";
import { renderDateTime } from "../utils/Lookups";
import { getParameterByName } from "../utils/QueryParameters";

const data = products;
const TAG_LIGHTPATH = "LightPath";

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

interface IProps {
    incremental: boolean;
    filters: boolean;
    products: Product[];
    productsLoaded: boolean;
    multiAction: boolean;
}

export default class MetaDataPage extends React.Component {
    state: IProps = {
        products: [],
        filters: false,
        incremental: false,
        productsLoaded: true,
        multiAction: false
    };

    // Data inladen met =
    componentDidMount() {
        data().then(res => {
            const products = res.map(product => {
                return product;
            });
            this.setState({ products: products, productsLoaded: false });
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
                truncateText: true,
                render: (product_blocks: any) => {
                    const renderPB = product_blocks.map((item: any) => (
                        <EuiBadge color="primary" isDisabled={false}>
                            {item.name}
                        </EuiBadge>
                    ));
                    return <div>{renderPB}</div>;
                },
                width: "12.5%"
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
                width: "7.5%"
            }
        ];

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
                                    loading={productsLoaded}
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
