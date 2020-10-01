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
import { RouteComponentProps } from "react-router";

var date = new Date();

const data = [
    {
        name: "Deprecated MSP 100G",
        description: "Multi Service Port 100GE",
        tag: "MSPQ",
        type: "Port",
        status: "end of life",
        productBlocks: "Physical Termination Point",
        creationDate: date
    },
    {
        name: "Deprecated MSP 100G Redundant",
        description: "Multi Service Port 100GE Redundant",
        tag: "RMSP",
        type: "Port",
        status: "end of life",
        productBlocks: "Physical Termination Point (Redundant MSP)",
        creationDate: date
    },
    {
        name: "Deprecated MSP 10G",
        description: "Multi Service Port 10GE",
        tag: "MSPR",
        type: "Port",
        status: "end of life",
        productBlocks: "Physical Termination Point",
        creationDate: date
    },
    {
        name: "Deprecated MSP 10G Redundant",
        description: "Multi Service Port 10GE Redundant",
        tag: "RMSP",
        type: "Port",
        status: "end of life",
        productBlocks: "Physical Termination Point (Redundant MSP)",
        creationDate: date
    },
    {
        name: "Dead one",
        description: "Revive one",
        tag: "Dead",
        type: "Port",
        status: "end of life",
        productBlocks: "Revive one",
        creationDate: date
    }
];

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
        name: "ACTIONS"
    }
];

interface IProps {
    incremental: boolean;
    filters: boolean;
    multiAction: boolean;
}

export default class MetaDataPage extends React.Component {
    state: IProps = {
        filters: false,
        incremental: false,
        multiAction: false
    };

    // Data inladen met =
    // componentDidMount = () => {
    //     client.get(``)
    //     .then((result) => {
    //         const  = result.data.map(() => {
    //             return ;
    //         });
    //         this.setState({});
    //     });
    // }

    render() {
        const { multiAction, filters, incremental } = this.state;

        const search = {
            box: {
                incremental: incremental,
                schema: true
            },
            filters: !filters ? undefined : []
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
                                    items={data}
                                    columns={columns}
                                    search={search}
                                    pagination={true}
                                    sorting={true}
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
