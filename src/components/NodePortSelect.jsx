import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import "react-select/dist/react-select.css";

import {portsForNodeSubscriptionId} from "../api";


export default class NodePortSelect extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            ports: [],
            loading: true,
            node: undefined
        }
    }

    nodeLabel = (node) => {
        const description = node.description || "<No description>";
        return `${node.subscription_id.substring(0,8)} ${description.trim()}`
    };

    onChangeInternal = (name) => e => {
        let value;
        if (name === "subscription_id") {
            value = e ? e.value : null;
            if (e !== null) {

                this.setState({node: value, loading: true, ports: []})
                portsForNodeSubscriptionId(value).then(result =>
                    this.setState({ports: result, loading: false})
                );
            } else {
                this.clearErrors();
            }
        } else {
            value = e.target ? e.target.value : null
        }

    };

    clearErrors = () => {
        this.setState({node: undefined, ports: []});
    };

    render() {
        const {node, ports} = this.state;
        const {onChange, port, nodes, disabled} = this.props;
        return (
            <section className="node-port">
                <div className="wrapper node-select">
                    <Select onChange={this.onChangeInternal("subscription_id")}
                       options={nodes
                           .map(aNode => ({
                               value: aNode.subscription_id,
                               label: this.nodeLabel(aNode),
                               tag: aNode.tag,
                           }))
                           .sort((x, y) => x.label.localeCompare(y.label))
                       }
                       value={node}
                       searchable={true}
                            disabled={disabled || nodes.length === 0}/>
                </div>
                <div className="wrapper port-select">
                    <Select onChange={onChange}
                            options={ports
                                .map(aPort => ({
                                    value: aPort.id,
                                    label: aPort.port,
                                }))
                                .sort((x, y) => x.label.localeCompare(y.label))
                            }
                            value={port}
                            searchable={true}
                            disabled={disabled || ports.length === 0}/>
                </div>
            </section>
        )
    }
}

NodePortSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    nodes: PropTypes.array.isRequired,
    nodePort: PropTypes.string,
    disabled: PropTypes.bool,
    port: PropTypes.string
};
