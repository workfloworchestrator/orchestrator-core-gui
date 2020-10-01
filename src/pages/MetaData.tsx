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

import "pages/MetaData.scss";

import { EuiPage, EuiPageBody } from "@elastic/eui";
import FixedInputConfiguration from "components/FixedInputConfiguration";
import ProductBlocks from "components/ProductBlocks";
import Products from "components/Products";
import ResourceTypes from "components/ResourceTypes";
import WorkFlows from "components/WorkFlows";
import I18n from "i18n-js";
import React from "react";
import { RouteComponentProps } from "react-router";
import ScrollUpButton from "react-scroll-up-button";
import ApplicationContext from "utils/ApplicationContext";
import { applyIdNamingConvention } from "utils/Utils";

interface MatchParams {
    type: string;
}
interface IProps extends RouteComponentProps<MatchParams> {}

interface IState {
    tabs: string[];
    selectedTab: string;
}

export default class MetaData extends React.Component<IProps, IState> {
    state: IState = {
        tabs: ["products", "product_blocks", "resource_types", "fixed_inputs", "workflows"],
        selectedTab: "products"
    };

    switchTab = (tab: string) => () => {
        this.context.redirect(`/metadata/${tab}`);
    };

    renderTab = (tab: string, selectedTab: string) => (
        <span
            id={`${applyIdNamingConvention(tab)}`}
            key={tab}
            className={tab === selectedTab ? "active" : ""}
            onClick={this.switchTab(tab)}
        >
            {I18n.t(`metadata.tabs.${tab}`)}
        </span>
    );

    renderTabContent = (selectedTab: string) => {
        switch (selectedTab) {
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
                throw new Error(`Unknown tab ${selectedTab}`);
        }
    };

    render() {
        const { tabs } = this.state;
        const selectedTab = this.props.match.params.type;
        return (
            <EuiPage>
                <EuiPageBody component="div" className="mod-metadata">
                    <section className="tabs">{tabs.map(tab => this.renderTab(tab, selectedTab))}</section>
                    {this.renderTabContent(selectedTab)}
                    <ScrollUpButton />
                </EuiPageBody>
            </EuiPage>
        );
    }
}

MetaData.contextType = ApplicationContext;
