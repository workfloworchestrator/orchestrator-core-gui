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

interface IProps {
    selectedTabId: string;
    handleSelect: any;
    loading: false;
    incremental: false;
    filters: false;
    multiAction: false;
}

interface IState {
    selectedTabId: string;
    loading: false;
    incremental: false;
    filters: false;
    multiAction: true;
}

var date = new Date();

const data = [
    {
        name: "Deprecated MSP 100G",
        description: "Multi Service Port 100GE",
        tag: "MSP",
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
        tag: "MSP",
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
    }
    // {
    //     name: 'Actions',
    //     actions,
    //  },
];

const search = {
    box: {
        incremental: false,
        schema: true
    }
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

export default class MetaDataPage extends React.Component {
    constructor(props: IProps) {
        super(props);

        this.state = {
            filters: false,
            multiAction: true
        };
    }

    render() {
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
