import {
    EuiBadge,
    EuiButton,
    EuiButtonIcon,
    EuiFlexGroup,
    EuiFlexItem,
    EuiForm,
    EuiFormRow,
    EuiIcon,
    EuiSpacer,
    EuiSuggest,
    EuiSuggestItemProps,
    EuiSuperSelect,
    EuiText
} from "@elastic/eui";
import React from "react";

import { getPortSubscriptionsForNode, subscriptions } from "../../../api";
import { ServicePortFilterItem, Subscription } from "../../../utils/types";
import { capitalizeFirstLetter, timeStampToDate } from "../../../utils/Utils";

interface IProps {
    subscriptions: [];
    handleSelect: Function;
}

interface IState {
    // nodes
    nodesLoading: boolean;
    nodes: Subscription[];
    nodeSuggestions: EuiSuggestItemProps[];
    nodeQuery: string;
    selectedNode?: Subscription;
    //ports
    portsLoading: boolean;
    ports: any[];
}

export default class ServicePortSelector extends React.PureComponent<IProps, IState> {
    //Todo: we might need some default props here (depending on how we feed in the subscriptions

    constructor(props: IProps) {
        super(props);

        this.state = {
            // nodes
            nodesLoading: true,
            nodes: [],
            nodeSuggestions: [],
            nodeQuery: "",
            selectedNode: undefined,
            // ports
            portsLoading: false,
            ports: []
        };
    }

    componentDidMount() {
        // Fetch Node subscriptions and prepare it for usage as EuiSuggestItems
        subscriptions(["Node"], ["provisioning", "active"]).then(result => {
            this.setState({ nodesLoading: false, nodes: result });
            // Preselect first one and fetch Ports (debug stuff)
            // this.setState({ nodesLoading: false, nodes: result, selectedNode: result[0] });
            // this.fetchPortData(result[0]);
        });
    }

    fetchPortData = (selectedNode: Subscription) => {
        this.setState({ portsLoading: true });
        getPortSubscriptionsForNode(selectedNode.subscription_id).then(result => {
            console.log(result);
            const ports = result.map(port => ({
                value: port.subscription_id,
                inputDisplay: port.port_name,
                dropdownDisplay: (
                    <>
                        <strong>
                            {port.port_name} - {port.subscription_id.slice(0, 8)} {port.description}
                        </strong>
                        <EuiText size="s" color="subdued">
                            <p className="euiTextColor--subdued">
                                {port.product_name} <EuiBadge color="primary">{port.port_mode}</EuiBadge>
                                <EuiBadge
                                    iconType={port.status === "active" ? "check" : "questionInCircle"}
                                    color={port.status === "active" ? "default" : "danger"}
                                >
                                    {capitalizeFirstLetter(port.status)}
                                </EuiBadge>
                                <br />
                                Start date: <i>{timeStampToDate(port.start_date)}</i>
                            </p>
                        </EuiText>
                    </>
                )
            }));
            this.setState({ portsLoading: false, ports: ports });
        });
    };

    onNodeClick = (item: EuiSuggestItemProps) => {
        const { nodes } = this.state;
        const selectedNode = nodes.find(node => node.description === item.label);
        this.setState({ selectedNode: selectedNode });
        if (selectedNode) {
            this.fetchPortData(selectedNode);
        }
    };

    // Todo: find out why EventTarget doesn't have a value : fall back to : ANY for now =>
    onNodeInputChange = (e: any) => {
        const { nodes } = this.state;
        let nodeQuery = e.value;
        console.log(`Current nodeQuery: ${nodeQuery}`);

        // update Suggestions
        const nodeSuggestions = nodes
            .filter(
                node =>
                    node.description.includes(nodeQuery) ||
                    node.status.includes(nodeQuery) ||
                    node.subscription_id.includes(nodeQuery)
            )
            .map((node, index) => ({
                key: index,
                label: node.description,
                description: `Status: ${node.status}${
                    node.status === "active" ? " Start date: " + timeStampToDate(node.start_date) : ""
                }`,
                type: { iconType: "tableDensityNormal", color: node.status === "active" ? "tint5" : "tint1" }
            }));

        this.setState({ nodeSuggestions: nodeSuggestions, nodeQuery: nodeQuery });
    };

    onPortClick = (value: any) => {
        this.props.handleSelect(value);
    };

    resetNodeState = () => {
        this.setState({ nodeQuery: "", selectedNode: undefined });
    };

    render() {
        const { nodesLoading, nodeSuggestions, selectedNode, portsLoading, ports } = this.state;

        return (
            <EuiForm component="form">
                {selectedNode && (
                    <EuiFormRow label="Node" fullWidth>
                        <EuiFlexGroup>
                            <EuiFlexItem>
                                <EuiText>{selectedNode.description}</EuiText>
                            </EuiFlexItem>
                            <EuiFlexItem grow={false}>
                                <EuiButtonIcon
                                    iconType="crossInACircleFilled"
                                    color="primary"
                                    onClick={this.resetNodeState}
                                />
                            </EuiFlexItem>
                        </EuiFlexGroup>
                    </EuiFormRow>
                )}
                {!selectedNode && (
                    <EuiFormRow label="Node" helpText="Select a node." fullWidth>
                        <EuiSuggest
                            status={nodesLoading ? "loading" : "unchanged"}
                            onInputChange={e => this.onNodeInputChange(e)}
                            onItemClick={this.onNodeClick}
                            suggestions={nodeSuggestions}
                        />
                    </EuiFormRow>
                )}
                <EuiFormRow label="Port" helpText="Select a physical port." fullWidth>
                    <EuiSuperSelect
                        isLoading={portsLoading}
                        fullWidth
                        options={ports}
                        // valueOfSelected={selectedPort ? selectedPort.port_name : undefined}
                        onChange={value => this.onPortClick(value)}
                        itemLayoutAlign="top"
                        hasDividers
                    />
                </EuiFormRow>
                {/*<EuiFormRow label="Service Port" helpText="Select a service port subscription." fullWidth>*/}
                {/*    <EuiSuperSelect*/}
                {/*        fullWidth*/}
                {/*        options={[]}*/}
                {/*        valueOfSelected={selectedSubscription}*/}
                {/*        // onChange={value => this.onSubscriptionClick(value)}*/}
                {/*        itemLayoutAlign="top"*/}
                {/*        hasDividers*/}
                {/*    />*/}
                {/*</EuiFormRow>*/}
                <EuiSpacer />
                <EuiButton type="submit" fill style={{ marginLeft: "500px" }}>
                    Select service port
                </EuiButton>
            </EuiForm>
        );
    }
}
