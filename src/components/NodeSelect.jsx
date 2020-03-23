/*
 * Copyright 2019 SURF.
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

import I18n from "i18n-js";
import PropTypes from "prop-types";
import React from "react";
import Select from "react-select";

import { getNodesByLocationAndStatus } from "../api";

export default class NodeSelect extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            nodes: [],
            loading: true
        };
    }

    componentWillMount() {
        const status = this.props.status ? this.props.status : "PL";
        getNodesByLocationAndStatus(this.props.locationCode, status).then(result =>
            this.setState({ nodes: result, loading: false })
        );
    }

    render() {
        const { nodes, loading } = this.state;
        const { onChange, node, locationCode, disabled } = this.props;

        const noNodesAvailable = !loading && nodes.length === 0;
        const placeholder = loading
            ? I18n.t("node_select.nodes_loading")
            : noNodesAvailable
            ? I18n.t("node_select.no_nodes_placeholder")
            : I18n.t("node_select.select_node");

        const options = nodes.map(x => {
            return { value: x.id, label: x.name };
        });
        const value = options.find(option => option.value === node);

        return (
            <div className="node-select">
                <Select
                    className="select-node"
                    onChange={onChange}
                    options={options}
                    value={value}
                    isSearchable={true}
                    isDisabled={disabled || nodes.length === 0}
                    placeholder={placeholder}
                />
                {noNodesAvailable && (
                    <em className="msg warn">{I18n.t("node_select.no_nodes_message", { location: locationCode })}</em>
                )}
            </div>
        );
    }
}

NodeSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    node: PropTypes.number,
    locationCode: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    status: PropTypes.string
};
