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

import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import "./NodePortSelect.scss";

import { getNodesByLocationAndStatus, getFreePortsByNodeIdAndInterfaceType } from "../api";
import I18n from "i18n-js";
import { imsStates } from "../utils/Lookups";

export default class NodeIdPortSelect extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            nodes: [],
            ports: [],
            loading: true,
            node: undefined
        };
        this.getNodesOnLocation(props.locationCode);
    }

    nodeLabel = node => {
        const description = node.name || "<No description>";
        return `${description.trim()}`;
    };

    getNodesOnLocation = location => {
        getNodesByLocationAndStatus(location, "IS").then(result => this.setState({ nodes: result, loading: false }));
    };

    onChangeNodes = name => e => {
        const { interfaceType } = this.props;
        let value;
        if (name === "subscription_id") {
            value = e ? e.value : null;
            if (e !== null) {
                this.setState({ node: value, loading: true, ports: [] });
                getFreePortsByNodeIdAndInterfaceType(value, interfaceType, "free", "patched").then(result =>
                    this.setState({ ports: result, loading: false })
                );
            } else {
                this.clearErrors();
            }
        } else {
            value = e.target ? e.target.value : null;
        }
    };

    onChangePort = e => {
        let value;
        value = e ? e.value : null;
        this.props.onChange(e);
        this.setState({ port: value });
    };

    clearErrors = () => {
        this.setState({ node: undefined, ports: [] });
    };

    render() {
        const { port, ports, nodes, node } = this.state;
        const { locationCode, disabled } = this.props;
        const portPlaceholder = locationCode ? I18n.t("node_port.select_port") : I18n.t("node_port.select_node_first");

        const node_options = nodes
            .map(aNode => ({
                value: aNode.id,
                label: this.nodeLabel(aNode),
                tag: aNode.status
            }))
            .sort((x, y) => x.label.localeCompare(y.label));
        const node_value = node_options.find(option => option.value === node);

        const port_options = ports
            .map(aPort => ({
                value: aPort.id,
                label: `${aPort.port} (${imsStates[aPort.status]})`
            }))
            .sort((x, y) => x.label.localeCompare(y.label));
        const port_value = port_options.find(option => option.value === port);

        return (
            <section className="node-port">
                <div className="node-select">
                    <label>Node</label>
                    <Select
                        onChange={this.onChangeNodes("subscription_id")}
                        options={node_options}
                        value={node_value}
                        isSearchable={true}
                        isDisabled={disabled || nodes.length === 0}
                    />
                </div>
                <div className="port-select">
                    <label>Port</label>
                    <Select
                        onChange={this.onChangePort}
                        options={port_options}
                        placeholder={portPlaceholder}
                        value={port_value}
                        isSearchable={true}
                        isDisabled={disabled || ports.length === 0}
                    />
                </div>
            </section>
        );
    }
}

NodeIdPortSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    interfaceType: PropTypes.string.isRequired,
    locationCode: PropTypes.string.isRequired,
    disabled: PropTypes.bool
};
