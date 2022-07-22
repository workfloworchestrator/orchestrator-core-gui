import {
    EuiBadge,
    EuiButton,
    EuiButtonIcon,
    EuiCallOut,
    EuiFlexGroup,
    EuiFlexItem,
    EuiForm,
    EuiFormRow,
    EuiSpacer,
    EuiSuggest,
    EuiSuggestionProps,
    EuiSuperSelect,
    EuiSwitch,
    EuiText,
} from "@elastic/eui";
import { FAVORITE_STORAGE_KEY } from "components/modals/components/FavoritePortSelector";
import React, { MouseEvent } from "react";
import ApplicationContext from "utils/ApplicationContext";
import { FavoriteSubscriptionStorage, ServicePortFilterItem, Subscription } from "utils/types";
import { capitalizeFirstLetter, timeStampToDate } from "utils/Utils";

interface IProps {
    subscriptions: Subscription[];
    handleSelect: Function;
}

interface IState {
    errors: boolean;
    message?: string;
    messageHelp?: string;
    // nodes
    nodesLoading: boolean;
    nodes: Subscription[];
    nodeSuggestions: EuiSuggestionProps[];
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
    static contextType = ApplicationContext;
    context!: React.ContextType<typeof ApplicationContext>;

    constructor(props: IProps) {
        super(props);

        this.state = {
            errors: true,
            message: undefined,
            messageHelp: undefined,
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
            selectedPort: undefined,
        };
    }

    componentDidMount() {
        // Fetch Node subscriptions and prepare it for usage as EuiSuggestItems
        this.context.apiClient.subscriptions(["Node"], ["provisioning", "active"]).then((result: Subscription[]) => {
            this.setState({ nodesLoading: false, nodes: result });
            // Preselect first one and fetch Ports (debug stuff)
            // this.setState({ nodesLoading: false, nodes: result, selectedNode: result[0] });
            // this.fetchPortData(result[0]);
        });
    }

    fetchPortData = (selectedNode: Subscription) => {
        this.setState({ portsLoading: true });
        this.context.customApiClient
            .getPortSubscriptionsForNode(selectedNode.subscription_id)
            .then((result: ServicePortFilterItem[]) => {
                const portOptions = result.map((port) => ({
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
                    ),
                }));
                this.setState({ portsLoading: false, portOptions: portOptions, ports: result });
            });
    };

    onNodeClick = (item: EuiSuggestionProps) => {
        const { nodes } = this.state;
        const selectedNode = nodes.find((node) => node.description.replace("Node Planned", "") === item.label);
        this.setState({ selectedNode: selectedNode });
        if (selectedNode) {
            this.fetchPortData(selectedNode);
        }
    };

    onNodeInputChange = (e: EventTarget) => {
        const { nodes } = this.state;
        let nodeQuery = (e as unknown) as string;
        nodeQuery = nodeQuery.toLocaleUpperCase();

        // update Suggestions
        const nodeSuggestions = nodes
            .filter(
                (node) =>
                    node.description.toLocaleUpperCase().includes(nodeQuery) ||
                    node.status.toLocaleUpperCase().includes(nodeQuery) ||
                    node.subscription_id.toLocaleUpperCase().includes(nodeQuery)
            )
            .map((node, index) => ({
                key: index,
                label: node.description.includes("Node Planned") // Make long node names readable
                    ? node.description.replace("Node Planned", "")
                    : node.description,
                description: `Status: ${node.status}${
                    node.status === "active" ? " Start date: " + timeStampToDate(node.start_date) : ""
                }`,
                type: { iconType: "tableDensityNormal", color: node.status === "active" ? "tint5" : "tint1" },
            }));
        this.setState({ nodeSuggestions: nodeSuggestions.slice(0, 8), nodeQuery: nodeQuery });
    };

    onSubscriptionFilterChange = () => {
        const { subscriptionFilterEnabled } = this.state;
        this.setState({ subscriptionFilterEnabled: !subscriptionFilterEnabled });
    };

    onPortClick = (subscription_id: String) => {
        const { ports } = this.state;
        const selectedPort = ports.find((port) => port.subscription_id === subscription_id);
        this.setState({ selectedPort: selectedPort });
    };

    onSubmitClick = (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        event.preventDefault();
        const { selectedPort } = this.state;
        const { subscriptions } = this.props;
        if (subscriptions.find((subscription) => subscription.subscription_id === selectedPort?.subscription_id)) {
            this.props.handleSelect(selectedPort?.subscription_id);
        } else {
            this.setState({
                message: `The selected subscription is not in the allowed list.`,
                messageHelp: `Check the speed in the worfklow form or don't override the speed setting in this form.`,
                errors: true,
            });
            setTimeout(() => {
                this.setState({ message: undefined, errors: false });
            }, 3000);
        }
    };

    onAddFavoriteClick = (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        event.preventDefault();
        const { selectedPort } = this.state;
        if (selectedPort) {
            let oldPorts: FavoriteSubscriptionStorage[] =
                JSON.parse(localStorage.getItem(FAVORITE_STORAGE_KEY) as string) || [];
            if (oldPorts.length === 10) {
                this.setState({
                    message: `Max 10 favorites allowed. Please delete some if you want to add this port.`,
                    errors: true,
                });
                setTimeout(() => {
                    this.setState({ message: undefined, messageHelp: undefined, errors: false });
                }, 3000);
            } else if (oldPorts.find((subscription) => subscription.subscription_id === selectedPort.subscription_id)) {
                this.setState({
                    message: `This subscription is already in your favorites. Only unique subscriptions allowed.`,
                    errors: true,
                });
                setTimeout(() => {
                    this.setState({ message: undefined, messageHelp: undefined, errors: false });
                }, 3000);
            } else {
                let newPort: FavoriteSubscriptionStorage = {
                    subscription_id: selectedPort.subscription_id,
                    customName: "",
                };
                oldPorts.push(newPort);
                localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(oldPorts));
                this.setState({
                    message: `Service port: ${selectedPort.description} added to Favorites`,
                    errors: false,
                });
                setTimeout(() => {
                    this.setState({ message: undefined, messageHelp: undefined, errors: false });
                }, 1500);
            }
        }
    };

    resetNodeState = () => {
        this.setState({ nodeQuery: "", selectedNode: undefined, ports: [], selectedPort: undefined });
    };

    render() {
        const {
            errors,
            message,
            messageHelp,
            nodesLoading,
            nodeSuggestions,
            selectedNode,
            portsLoading,
            portOptions,
            selectedPort,
            subscriptionFilterEnabled,
        } = this.state;

        const { subscriptions } = this.props;

        return (
            <EuiForm component="form">
                {message && (
                    <>
                        <EuiCallOut
                            title={message}
                            color={errors ? "danger" : "primary"}
                            iconType={errors ? "alert" : "notebookApp"}
                        >
                            {messageHelp && <p>{messageHelp}</p>}
                        </EuiCallOut>
                        <EuiSpacer />
                    </>
                )}

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
                    <EuiFormRow
                        id="service-port-selector-modal-node-select"
                        label="Node"
                        helpText="Start typing to select a node."
                        fullWidth
                    >
                        <EuiSuggest
                            aria-labelledby="Search and select a node"
                            status={nodesLoading ? "loading" : "unchanged"}
                            // @ts-ignore
                            onChange={this.onNodeInputChange}
                            onItemClick={this.onNodeClick}
                            suggestions={nodeSuggestions}
                        />
                    </EuiFormRow>
                )}

                <EuiFormRow label="Port" helpText="Select a physical port." fullWidth>
                    <EuiSuperSelect
                        id="service-port-selector-modal-port-select"
                        isLoading={portsLoading}
                        fullWidth
                        options={
                            subscriptionFilterEnabled
                                ? portOptions.filter((item) =>
                                      subscriptions.find((subscription) => subscription.subscription_id === item.value)
                                  )
                                : portOptions
                        }
                        valueOfSelected={selectedPort ? selectedPort.subscription_id : undefined}
                        onChange={(value) => this.onPortClick(value)}
                        itemLayoutAlign="top"
                        hasDividers
                    />
                </EuiFormRow>
                <EuiFormRow label="Settings" fullWidth>
                    <EuiSwitch
                        id="service-port-selector-modal-settings-switch"
                        label="Filter port subscriptions on allowed speed"
                        checked={subscriptionFilterEnabled}
                        onChange={this.onSubscriptionFilterChange}
                    />
                </EuiFormRow>
                <EuiSpacer />

                <EuiFlexGroup style={{ marginLeft: "300px" }}>
                    <EuiFlexItem>
                        <EuiButton
                            id="service-port-selector-modal-submit-button"
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
                            id="service-port-selector-modal-add-favorite-button"
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
