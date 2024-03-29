import { EuiPage, EuiPageBody, EuiPageHeaderSection, EuiTab, EuiTabs } from "@elastic/eui";
import FixedInputConfiguration from "components/FixedInputConfiguration";
import React from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";

import ProductBlocks from "../components/ProductBlocks";
import Products from "../components/Products";
import ResourceTypes from "../components/ResourceTypes";
import WorkFlows from "../components/WorkFlows";

const tabs = [
    {
        id: "products",
        name: "PRODUCTS",
        disabled: false,
        href: "/metadata/products",
    },
    {
        id: "product_blocks",
        name: "PRODUCT BLOCKS",
        disabled: false,
        href: "/metadata/product_blocks",
    },
    {
        id: "resource_types",
        name: "RESOURCE TYPES",
        disabled: false,
        href: "/metadata/resource_types",
    },
    {
        id: "fixed_inputs",
        name: "FIXED INPUTS",
        disabled: false,
        href: "/metadata/fixed_inputs",
    },
    {
        id: "workflows",
        name: "WORKFLOWS",
        disabled: false,
        href: "/metadata/workflows",
    },
];

interface MatchParam {}

interface IProps extends RouteComponentProps<MatchParam> {
    selectedTab: string;
}

interface IState {
    selectedTabId: string;
}

export default class MetaData extends React.Component<IProps, IState> {
    state: IState = {
        selectedTabId: this.props.selectedTab,
    };

    renderTabs = () => {
        const { selectedTabId } = this.state;
        return tabs.map((tab, index) => (
            <Link to={tab.href} key={index}>
                <EuiTab
                    onClick={() => this.setState({ selectedTabId: tab.id })}
                    isSelected={tab.id === selectedTabId}
                    key={index}
                >
                    {tab.name}
                </EuiTab>
            </Link>
        ));
    };

    renderPage = (selectedTabId: string) => {
        switch (selectedTabId) {
            case "products":
                return <Products />;
            case "product_blocks":
                return <ProductBlocks />;
            case "resource_types":
                return <ResourceTypes />;
            case "fixed_inputs":
                return <FixedInputConfiguration />;
            case "workflows":
                return <WorkFlows />;
            default:
                return <Products />;
        }
    };

    render() {
        const { selectedTabId } = this.state;

        return (
            <EuiPage>
                <EuiPageBody component="div">
                    <EuiTabs>{this.renderTabs()}</EuiTabs>
                    <EuiPageBody>
                        <EuiPageHeaderSection>{this.renderPage(selectedTabId)}</EuiPageHeaderSection>
                    </EuiPageBody>
                </EuiPageBody>
            </EuiPage>
        );
    }
}
