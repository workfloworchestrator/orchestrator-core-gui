import {
    EuiBadge,
    EuiButton,
    EuiButtonIcon,
    EuiFlexGroup,
    EuiFlexItem,
    EuiForm,
    EuiFormRow,
    EuiSpacer,
    EuiSuggest,
    EuiSuggestItemProps,
    EuiSuperSelect,
    EuiSwitch,
    EuiText
} from "@elastic/eui";
import React, { MouseEvent } from "react";

import { getPortSubscriptionsForNode, subscriptions } from "../../../api";
import { ServicePortFilterItem, Subscription } from "../../../utils/types";
import { capitalizeFirstLetter, timeStampToDate } from "../../../utils/Utils";

interface IProps {
    subscriptions: Subscription[];
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
    subscriptionFilterEnabled: boolean;
    portsLoading: boolean;
    ports: ServicePortFilterItem[];
    portOptions: any[];
    selectedPort?: ServicePortFilterItem;
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
            subscriptionFilterEnabled: true,
            portsLoading: false,
            ports: [],
            portOptions: [],
            selectedPort: undefined
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
            // Todo: move to render
            const portOptions = result.map(port => ({
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
            this.setState({ portsLoading: false, portOptions: portOptions, ports: result });
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
        this.setState({ nodeSuggestions: nodeSuggestions.slice(0, 8), nodeQuery: nodeQuery });
    };

    onSubscriptionFilterChange = () => {
        const { subscriptionFilterEnabled } = this.state;
        this.setState({ subscriptionFilterEnabled: !subscriptionFilterEnabled });
    };

    onPortClick = (subscription_id: String) => {
        const { ports } = this.state;
        const selectedPort = ports.find(port => port.subscription_id === subscription_id);
        this.setState({ selectedPort: selectedPort });
    };

    onSubmitClick = () => {
        if (this.state.selectedPort) {
            this.props.handleSelect(this.state.selectedPort.subscription_id);
        }
    };

    onAddFavoriteClick = (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        event.preventDefault();
        const { selectedPort } = this.state;
        if (selectedPort) {
            const storageKey = "favoritePortsArray-v3";
            let oldPorts: string[] = JSON.parse(localStorage.getItem(storageKey) as string) || [];
            let newPort: string = selectedPort.subscription_id;
            oldPorts.push(newPort);
            localStorage.setItem(storageKey, JSON.stringify(oldPorts));
        }
    };

    resetNodeState = () => {
        this.setState({ nodeQuery: "", selectedNode: undefined, ports: [], selectedPort: undefined });
    };

    render() {
        const {
            nodesLoading,
            nodeSuggestions,
            selectedNode,
            portsLoading,
            portOptions,
            selectedPort,
            subscriptionFilterEnabled
        } = this.state;

        const { subscriptions } = this.props;

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
                    <EuiFormRow id="modalNodeSelector" label="Node" helpText="Start typing to select a node." fullWidth>
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
                        options={
                            subscriptionFilterEnabled
                                ? portOptions.filter(item =>
                                      subscriptions.find(subscription => subscription.subscription_id === item.value)
                                  )
                                : portOptions
                        }
                        valueOfSelected={selectedPort ? selectedPort.subscription_id : undefined}
                        onChange={value => this.onPortClick(value)}
                        itemLayoutAlign="top"
                        hasDividers
                    />
                </EuiFormRow>
                <EuiFormRow label="Settings" fullWidth>
                    <EuiSwitch
                        label="Filter port subscriptions on allowed speed"
                        checked={subscriptionFilterEnabled}
                        onChange={this.onSubscriptionFilterChange}
                    />
                </EuiFormRow>

                <EuiSpacer />
                <EuiFlexGroup style={{ marginLeft: "300px" }}>
                    <EuiFlexItem>
                        <EuiButton
                            type="submit"
                            fill
                            disabled={!selectedNode && !selectedPort}
                            onClick={this.onAddFavoriteClick}
                        >
                            Add to favorites
                        </EuiButton>
                    </EuiFlexItem>
                    <EuiFlexItem>
                        <EuiButton
                            type="submit"
                            fill
                            disabled={!selectedNode && !selectedPort}
                            onClick={this.onSubmitClick}
                        >
                            Select service port
                        </EuiButton>
                    </EuiFlexItem>
                </EuiFlexGroup>
            </EuiForm>
        );
    }
}
