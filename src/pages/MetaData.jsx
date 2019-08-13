import React from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";

import "./MetaData.scss";
import ProductBlocks from "../components/ProductBlocks";
import ResourceTypes from "../components/ResourceTypes";
import Products from "../components/Products";
import FixedInputConfiguration from "../components/FixedInputConfiguration";
import WorkFlows from "../components/WorkFlows";
import ScrollUpButton from "react-scroll-up-button";
import ApplicationContext from "../utils/ApplicationContext";

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
        <span key={tab} className={tab === selectedTab ? "active" : ""} onClick={this.switchTab(tab)}>
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
