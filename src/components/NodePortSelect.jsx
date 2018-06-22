import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import "react-select/dist/react-select.css";

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

    render() {
        const {node} = this.state;
        const {onChange, nodes, disabled} = this.props;
        return <Select onChange={onChange}
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
    }
}

NodePortSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    nodes: PropTypes.array.isRequired,
    nodePort: PropTypes.string,
    disabled: PropTypes.bool
};
