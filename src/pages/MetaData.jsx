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

import "./MetaData.scss";

import I18n from "i18n-js";
import PropTypes from "prop-types";
import React from "react";
import ScrollUpButton from "react-scroll-up-button";

import FixedInputConfiguration from "../components/FixedInputConfiguration";
import ProductBlocks from "../components/ProductBlocks";
import Products from "../components/Products";
import ResourceTypes from "../components/ResourceTypes";
import WorkFlows from "../components/WorkFlows";
import ApplicationContext from "../utils/ApplicationContext";
import { applyIdNamingConvention } from "../utils/Utils";

export default class MetaData extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tabs: ["products", "product_blocks", "resource_types", "fixed_inputs", "workflows"],
            selectedTab: "products"
        };
    }

    switchTab = tab => () => {
        this.context.redirect(`/metadata/${tab}`);
    };

    renderTab = (tab, selectedTab) => (
        <span
            id={`${applyIdNamingConvention(tab)}`}
            key={tab}
            className={tab === selectedTab ? "active" : ""}
            onClick={this.switchTab(tab)}
        >
            {I18n.t(`metadata.tabs.${tab}`)}
        </span>
    );

    renderTabContent = selectedTab => {
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
            <div className="mod-metadata">
                <section className="tabs">{tabs.map(tab => this.renderTab(tab, selectedTab))}</section>
                {this.renderTabContent(selectedTab)}
                <ScrollUpButton />
            </div>
        );
    }
}

MetaData.propTypes = {
    match: PropTypes.object.isRequired
};

MetaData.contextType = ApplicationContext;
