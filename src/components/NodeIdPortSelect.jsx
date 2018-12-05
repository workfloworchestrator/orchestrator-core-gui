import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import "react-select/dist/react-select.css";
import "./NodePortSelect.css";

import {getNodeByLocationAndStatus, getFreePortsByNodeIdAndInterfaceType} from "../api";
import I18n from "i18n-js";


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

    nodeLabel = (node) => {
        const description = node.name || "<No description>";
        return `${description.trim()}`
    };

    getNodesOnLocation = (location) => {
      getNodeByLocationAndStatus(location, "IS").then(result =>
        this.setState({nodes: result, loading: false})
      );
    };


    onChangeNodes = (name) => e => {
        const {interfaceType} = this.props;
        let value;
        if (name === "subscription_id") {
            value = e ? e.value : null;
            if (e !== null) {
                this.setState({node: value, loading: true, ports: []})
                getFreePortsByNodeIdAndInterfaceType(value, interfaceType, 'free', 'patched').then(result =>
                    this.setState({ports: result, loading: false})
                );
            } else {
                this.clearErrors();
            }
        } else {
            value = e.target ? e.target.value : null
        }

    };


    onChangePort = e => {
        let value;
        value = e ? e.value : null;
        this.props.onChange(e);
        this.setState({port: value})
    };


    clearErrors = () => {
        this.setState({node: undefined, ports: []});
    };

    render() {
        const {port, ports, nodes, node} = this.state;
        const {locationCode, disabled} = this.props;
        const portPlaceholder = locationCode ? I18n.t("node_port.select_port") : I18n.t("node_port.select_node_first");

        return (
            <section className="node-port">
                <div className="node-select">
                    <label>Node</label>
                    <Select onChange={this.onChangeNodes("subscription_id")}
                            options={nodes
                                .map(aNode => ({
                                    value: aNode.id,
                                    label: this.nodeLabel(aNode),
                                    tag: aNode.status,
                                }))
                                .sort((x, y) => x.label.localeCompare(y.label))
                            }
                            value={node}
                            searchable={true}
                            disabled={disabled || nodes.length === 0}/>
                </div>
                <div className="port-select">
                    <label>Port</label>
                    <Select onChange={this.onChangePort}
                            options={ports
                                .map(aPort => ({
                                    value: aPort.id,
                                    label: aPort.port,
                                }))
                                .sort((x, y) => x.label.localeCompare(y.label))
                            }
                            placeholder={portPlaceholder}
                            value={port}
                            searchable={true}
                            disabled={disabled || ports.length === 0}/>
                </div>
            </section>
        )
    }
}

NodeIdPortSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    interfaceType: PropTypes.string.isRequired,
    locationCode: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
};
