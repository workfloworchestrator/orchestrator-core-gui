import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import "react-select/dist/react-select.css";
import {nodesForLocationCodeAndStatus} from "../api";
import I18n from "i18n-js";

export default class NodeSelect extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            nodes: [],
            loading: true
        }
    }

    componentWillMount() {
        nodesForLocationCodeAndStatus(this.props.locationCode, this.props.status).then(result =>
            this.setState({nodes: result, loading: false})
        );
    };

    render() {
        const {nodes, loading} = this.state;
        const {onChange, node, locationCode, status, disabled} = this.props;

        const noNodesAvailable = !loading && nodes.length === 0;
        const placeholder = loading ? I18n.t("NodeSelect.nodesLoading", {status, location: locationCode})
            : noNodesAvailable ? I18n.t("NodeSelect.noNodesPlaceholder") :
                I18n.t("NodeSelect.selectNode");

        return (
            <div className="node-select">
                <Select className="select-node"
                        onChange={onChange}
                        options={nodes.map(x => { return {value: x.id, label: x.name}; })}
                        value={node}
                        searchable={true}
                        disabled={disabled || nodes.length === 0}
                        placeholder={placeholder}/>
                {noNodesAvailable &&
                <em className="msg warn">
                    {I18n.t("NodeSelect.noNodesAvailable", {status, location: locationCode})}
                </em>}
            </div>
        )
    };
}

NodeSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    node: PropTypes.number,
    locationCode: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    disabled: PropTypes.bool
};
