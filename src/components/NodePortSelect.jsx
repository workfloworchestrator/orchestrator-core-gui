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

import "./NodePortSelect.scss";

import I18n from "i18n-js";
import PropTypes from "prop-types";
import React from "react";
import Select from "react-select";

import { freeCorelinkPortsForNodeIdAndInterfaceType } from "../api";

export default class NodePortSelect extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            ports: [],
            loading: true,
            node: undefined
        };
    }

    nodeLabel = node => {
        const description = node.description || "<No description>";
        return `${node.subscription_id.substring(0, 8)} ${description.trim()}`;
    };

    onChangeInternal = name => e => {
        const { interfaceType } = this.props;
        let value;
        if (name === "subscription_id") {
            value = e ? e.value : null;
            if (e !== null) {
                this.setState({ node: value, loading: true, ports: [] });
                freeCorelinkPortsForNodeIdAndInterfaceType(value, interfaceType).then(result =>
                    this.setState({ ports: result, loading: false })
                );
            } else {
                this.clearErrors();
            }
        } else {
            value = e.target ? e.target.value : null;
        }
    };

    clearErrors = () => {
        this.setState({ node: undefined, ports: [] });
    };

    render() {
        const { node, ports } = this.state;
        const { onChange, port, nodes, disabled } = this.props;
        const portPlaceholder = node ? I18n.t("node_port.select_port") : I18n.t("node_port.select_node_first");

        const node_options = nodes
            .map(aNode => ({
                value: aNode.subscription_id,
                label: this.nodeLabel(aNode),
                tag: aNode.tag
            }))
            .sort((x, y) => x.label.localeCompare(y.label));
        const node_value = node_options.find(option => option.value === node);

        const port_options = ports
            .map(aPort => ({
                value: aPort.id,
                label: `${aPort.port} (${aPort.status}) (${aPort.iface_type})`
            }))
            .sort((x, y) => x.label.localeCompare(y.label));
        const port_value = port_options.find(option => option.value === port);

        return (
            <section className="node-port">
                <div className="node-select">
                    <label>Node</label>
                    <Select
                        onChange={this.onChangeInternal("subscription_id")}
                        options={node_options}
                        value={node_value}
                        isSearchable={true}
                        isDisabled={disabled || nodes.length === 0}
                    />
                </div>
                <div className="port-select">
                    <label>Port</label>
                    <Select
                        onChange={onChange}
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

NodePortSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    nodes: PropTypes.array.isRequired,
    interfaceType: PropTypes.string,
    nodePort: PropTypes.string,
    disabled: PropTypes.bool,
    port: PropTypes.number
};
