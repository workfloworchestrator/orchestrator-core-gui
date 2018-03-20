import React from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";

import "./MetaData.css";
import {stop} from "../utils/Utils";
import ProductBlocks from "../components/ProductBlocks";
import ResourceTypes from "../components/ResourceTypes";
import Products from "../components/Products";
import FixedInputConfiguration from "../components/FixedInputConfiguration";

export default class MetaData extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            tabs: ["products", "product_blocks", "resource_types", "fixed_inputs"],
            selectedTab: "product_blocks"
        };
    }

    componentDidMount() {
        const type = this.props.match.params.type;
        this.setState({selectedTab: type});
    }

    switchTab = tab => e => {
        stop(e);
        this.setState({selectedTab: tab});
    };

    renderTab = (tab, selectedTab) =>
        <span key={tab} className={tab === selectedTab ? "active" : ""}
              onClick={this.switchTab(tab)}>
            {I18n.t(`metadata.tabs.${tab}`)}
        </span>;

    renderTabContent = (selectedTab) => {
        switch (selectedTab) {
            case "products":
                return <Products history={this.props.history}/>
            case "product_blocks":
                return <ProductBlocks history={this.props.history}/>
            case "resource_types":
                return <ResourceTypes history={this.props.history}/>
            case "fixed_inputs":
                return <FixedInputConfiguration/>
            default:
                throw new Error(`Unknown tab ${selectedTab}`)
        }
    };

    render() {
        const {tabs, selectedTab} = this.state;
        return (
            <div className="mod-metadata">
                <section className="tabs">
                    {tabs.map(tab => this.renderTab(tab, selectedTab))}
                </section>
                {this.renderTabContent(selectedTab)}
            </div>
        );
    }
}

MetaData.propTypes = {
    history: PropTypes.object.isRequired
};

