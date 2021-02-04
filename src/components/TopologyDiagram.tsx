import { EuiCodeBlock, EuiFlexGroup, EuiFlexItem, EuiLink, EuiPanel } from "@elastic/eui";
import {
    internalPortByImsPortId,
    portByImsPortId,
    portByImsServiceId,
    prefixById,
    serviceByImsServiceId,
    subscriptionsDetailWithModel,
} from "api";
import React from "react";
import { TrafficMap } from "react-network-diagrams";
import { IMSEndpoint, IMSService, Subscription, SubscriptionModel } from "utils/types";
import { isEmpty } from "utils/Utils";

import { stylesMap } from "./DiagramStyles";

interface IProps {
    subscription: SubscriptionModel;
}

interface IState {
    mapMode: number;
    imsServices: any[];
    imsEndpoints: any[];
    isLoading: boolean;
    nodesLoaded: boolean;
    nodes: Subscription[];
    portSubscriptions: SubscriptionModel[];
    portsLoaded: boolean;
    ipss?: Subscription;
    selectionType: string | null;
    selection: any;
    panelText: string | JSX.Element | null;
    prefix?: any;
    prefixesLoaded: string[];
}

// Mapping of node type to size of shape
const nodeSizeMap = {
    hub: 5.5,
    cloud: 7,
};

// Mapping of node name to shape (default is circle, other
// options are cloud or square currently)
const nodeShapeMap: any = {
    L2VPNWOLK: "cloud",
    WOLK: "cloud",
};

// Maps link capacity to line thickness
const edgeThicknessMap = {
    "100G": 9,
    "10G": 3,
    "1G": 1.5,
    subG: 1,
};

// The color map maps an edge value (within the range) to a color
const edgeColorMap = [
    { color: "#4da7c0", label: ">=50 Gbps", range: [50, 100] },
    { color: "#4da7c0", label: "20 - 50", range: [20, 50] },
    { color: "#4da7c0", label: "10 - 20", range: [10, 20] },
    { color: "#4da7c0", label: "5 - 10", range: [5, 10] },
    { color: "#238b45", label: "2 - 5", range: [2, 5] },
    { color: "#3690c0", label: "1 - 2", range: [1, 2] },
    { color: "#74a9cf", label: "0 - 1", range: [0, 1] },
];

let pathColorMap: any = {};
const pathWidthMap: any = {};

interface IpamPrefix {
    prefix: string;
    asn: number;
    description: string;
    tags: string[];
}

interface TopologyName {
    capacity: string;
    label_dx: number | null;
    label_dy: number | null;
    label_position: string;
    name: string;
    site: number | null;
    site_link?: string;
    site_type?: string;
    type: string;
    x: number;
    y: number;
    id: string;
    text: JSX.Element;
}

interface TopologyInterface {
    device_source: string;
    device_target: string;
    iface_source: string;
    iface_target: string;
    loc_source: string;
    loc_target: string;
}

interface TopologyEdge {
    capacity: string;
    ifaces: TopologyInterface[];
    site: number | null;
    source: string;
    target: string;
    total_capacity: number;
}

interface TopologyPath {
    ends: string[];
    steps: string[];
    name: string;
}

interface Topology {
    names: TopologyName[];
    nodes: TopologyName[];
    edges: TopologyEdge[];
    paths: TopologyPath[];
}

interface Point {
    x: number;
    y: number;
}

let topology: Topology;
const radius = 50;

export default class TopologyDiagram extends React.Component<IProps, IState> {
    state: IState = {
        mapMode: 0,
        imsServices: [],
        imsEndpoints: [],
        isLoading: false,
        nodesLoaded: false,
        nodes: [],
        portSubscriptions: [],
        portsLoaded: false,
        selectionType: null,
        selection: null,
        panelText: null,
        prefix: {},
        prefixesLoaded: [],
    };

    prefixesLoaded: string[] = [];

    componentDidMount = async () => {
        const { subscription } = this.props;
        const { imsServices, imsEndpoints, isLoading, portsLoaded } = this.state;

        if (!portsLoaded) {
            try {
                await this.getPortSubscriptions();
            } catch (e) {
                console.log("failed to get a subscription", e.config.url);
            }
            this.setState({ portsLoaded: true });
        }

        const vcs = subscription.vcs ? subscription.vcs : [subscription.vc];
        if (!isLoading && vcs.length > 0 && isEmpty(imsServices)) {
            this.setState({ isLoading: true });
            vcs.forEach((vc: any, vcIndex: number) => {
                serviceByImsServiceId(vc.ims_circuit_id).then((result) => {
                    imsServices[vcIndex] = result;
                    this.setState({ imsServices: imsServices });
                    if (isEmpty(imsEndpoints[vcIndex])) {
                        this.populateEndpoints({ service: result, recursive: true, vc: vcIndex });
                    }
                });
            });
        }
    };

    shouldComponentUpdate = (newProps: IProps, newState: IState) => {
        const { portSubscriptions, imsEndpoints } = newState;
        return portSubscriptions.length > 0 && imsEndpoints.length > 0;
    };

    getPortSubscriptions = async () => {
        const { subscription } = this.props;
        const promises: Promise<SubscriptionModel>[] = [];
        const backlog = subscription.product.product_type === "IP" ? [subscription.vc] : subscription.vc.esis;
        (backlog || []).forEach((esi: any) => {
            (esi.saps || []).forEach((sap: any) => {
                promises.push(
                    subscriptionsDetailWithModel(sap.port_subscription_id).then((result: SubscriptionModel) => {
                        if (result.product.tag === "AGGSP") {
                            return subscriptionsDetailWithModel(
                                result.aggsp.port_subscription_id[0]
                            ).then((port: SubscriptionModel) => Object.assign(result, { sp: port.sp }));
                        }
                        return result;
                    })
                );
            });
        });
        return Promise.all(promises).then((result: any) => this.setState({ portSubscriptions: result.flat() }));
    };

    populateEndpoints = ({
        service,
        recursive = false,
        vc = 0,
    }: {
        service: IMSService;
        recursive?: boolean;
        vc: number;
    }) => {
        if (isEmpty(service) || !recursive) {
            return;
        }

        const uniquePortPromises = (service.endpoints || []).map(async (endpoint) => {
            if (endpoint.type === "port") {
                return portByImsPortId(endpoint.id).then((result) =>
                    Object.assign(result, {
                        serviceId: endpoint.id,
                        endpointType: endpoint.type,
                    })
                );
            } else if (endpoint.type === "internal_port") {
                return internalPortByImsPortId(endpoint.id).then((result) =>
                    Object.assign(result, {
                        serviceId: endpoint.id,
                        endpointType: endpoint.type,
                    })
                );
            } else {
                return serviceByImsServiceId(endpoint.id).then((result) => {
                    if (["SP", "MSP", "SSP"].includes(result.product)) {
                        // In case of port product we just resolve the underlying port
                        return portByImsServiceId(endpoint.id).then((result) =>
                            Object.assign(result, {
                                serviceId: endpoint.id,
                                endpointType: "port",
                            })
                        );
                    } else if (result.product === "AGGSP") {
                        const internalPortId = result.endpoints.find((e) => e.type === "service");
                        if (internalPortId) {
                            console.log("discard", result);
                            return portByImsServiceId(internalPortId.id).then((port: any) =>
                                Object.assign(port, {
                                    serviceId: endpoint.id,
                                })
                            );
                        } else {
                            return result;
                        }
                    }
                    // Return all services that are not actually port services
                    return (Object.assign(result, {
                        serviceId: endpoint.id,
                        endpointType: endpoint.type,
                    }) as unknown) as IMSEndpoint;
                });
            }
        });
        //@ts-ignore
        Promise.all(uniquePortPromises).then((result) => {
            const { imsEndpoints } = this.state;
            imsEndpoints[vc] = result.flat();
            this.setState({ imsEndpoints: imsEndpoints });
            // forceUpdate is a bit rough, but this.setState() does not
            // trigger a re-render, so we have to.
            console.log(`all done.`);
            // this.forceUpdate();
        });
    };

    handleSelectionChanged(selectionType: string, selection: string) {
        this.setState({ selectionType, selection });
        let n;

        if (selectionType === "edge") {
            // const [from, to] = selection.split("--");
        } else {
            n = topology.names.find((e: TopologyName) => e.id === selection);
        }
        this.setState({ panelText: n ? n.text : "" });
    }

    _makeNode(id: string, label: string, x: number, y: number, type?: string): TopologyName {
        return {
            capacity: "1G",
            label_dx: null,
            label_dy: null,
            label_position: "bottom",
            name: label,
            site: null,
            type: type || "hub",
            x: x,
            y: y,
            id: id,
            text: <div></div>,
        };
    }

    _getNode(id: string): Subscription | undefined {
        return this.state.nodes.find((node) => node.subscription_id === id);
    }

    _makeConnectionExplanation = (endpoint: IMSEndpoint, sap: any, sub: SubscriptionModel): JSX.Element => {
        const block = sub.sp ?? sub.aggsp ?? sub.irb;
        const portmode = block.port_mode ? block.port_mode : "N/A";
        const vlanRange = sap.vlanrange;
        return (
            <EuiCodeBlock>
                <strong>interface :</strong> {endpoint.iface_type}
                <br />
                <strong>physical port:</strong> {endpoint.port}
                <br />
                <strong>connector :</strong> {endpoint.connector_type}
                <br />
                <strong>fiber type :</strong> {endpoint.fiber_type}
                <br />
                <strong>IMS service :</strong> {endpoint.serviceId}
                <br />
                <strong>patch :</strong> {endpoint.patchposition}
                <br />
                <strong>port mode :</strong> {portmode}
                <br />
                <strong>vlan :</strong> {vlanRange}
                <br />
                <EuiLink
                    external
                    target="_blank"
                    href={`https://netwerkdashboard.surf.net/subscription/${sub.subscription_id}`}
                    aria-label="Link to netwerkdashboard"
                >
                    Netwerkdashboard
                </EuiLink>
            </EuiCodeBlock>
        );
    };

    _makePrefixExplanation = (endpoint: IMSEndpoint, sub: SubscriptionModel, sap: any): JSX.Element => {
        if (isEmpty(sap.ip_prefix_subscription_id)) {
            return <EuiCodeBlock />;
        }
        const { prefix } = this.state;
        const subscriptionId = sap.ip_prefix_subscription_id[0];
        const prefixInstance = prefix[subscriptionId];

        if (!prefixInstance) {
            return <EuiCodeBlock>Not found</EuiCodeBlock>;
        }

        return (
            <div>
                {endpoint && this._makeConnectionExplanation(endpoint, sap, sub)}
                <EuiCodeBlock>
                    <strong>asn :</strong> {prefixInstance.asn__label}
                    <br />
                    <strong>prefix :</strong> {prefixInstance.prefix}
                    <br />
                    <strong>state :</strong> {prefixInstance.state__label}
                    <br />
                    <strong>tags :</strong> {prefixInstance.tags?.join(",")}
                    <br />
                </EuiCodeBlock>
            </div>
        );
    };

    _calculatePositionFor(radius: number, index: number, n: number): Point {
        return {
            x: radius * Math.cos((index * 2 * Math.PI) / n),
            y: radius * Math.sin((index * 2 * Math.PI) / n),
        };
    }

    _updatePrefixInformation(sap: any) {
        if (isEmpty(sap.ip_prefix_subscription_id) || this.prefixesLoaded.includes(sap.ip_prefix_subscription_id[0])) {
            return;
        }

        const prefixSubscriptionId = sap.ip_prefix_subscription_id[0];

        this.prefixesLoaded.push(prefixSubscriptionId);
        subscriptionsDetailWithModel(prefixSubscriptionId).then((result: SubscriptionModel) => {
            prefixById(result.ip_prefix.ipam_prefix_id).then((prefixData: any) => {
                const { prefix } = this.state;
                prefix[prefixSubscriptionId] = prefixData;
                this.setState({ prefix: prefix });
            });
        });
    }

    _buildIP(): Topology {
        const topology: Topology = { names: [], nodes: [], edges: [], paths: [] };
        const { imsEndpoints, portSubscriptions } = this.state;
        const { subscription } = this.props;

        pathColorMap = {};
        if (imsEndpoints.length === 0) {
            return topology;
        }

        const wolk: TopologyName = this._makeNode("wolk", "WOLK", 120, 60, "cloud");
        topology.names.push(wolk);
        topology.nodes.push(wolk);

        subscription.vc.saps.forEach((sap: any, index: number) => {
            const portSubscription = portSubscriptions.find((s) => s.subscription_id === sap.port_subscription_id);
            this._updatePrefixInformation(sap);

            if (!portSubscription) {
                return;
            }

            const block = portSubscription.sp ?? portSubscription.aggsp ?? portSubscription.irb;
            const endpoint = imsEndpoints[0].find((e: IMSEndpoint) => e.serviceId === block.ims_circuit_id);
            const label = endpoint?.port ? `${endpoint?.node}__${endpoint?.port.replace(/\//g, "_")}` : endpoint?.name;
            const point = this._calculatePositionFor(radius, index, subscription.vc.saps.length);
            const node = this._makeNode(
                sap.port_subscription_id,
                `${portSubscription.product.tag}_${label}`,
                120 + point.x,
                60 + point.y,
                "hub"
            );
            node.text = this._makePrefixExplanation(endpoint!, portSubscription, sap!);
            topology.names.push(node);
            topology.nodes.push(node);
        });

        return topology;
    }

    _build(): Topology {
        const topology: Topology = { names: [], nodes: [], edges: [], paths: [] };
        const { imsEndpoints, portSubscriptions } = this.state;
        const { subscription } = this.props;
        pathColorMap = {};

        if (portSubscriptions.length === 0 || imsEndpoints.length === 0) {
            return topology;
        }

        const wolk: TopologyName = this._makeNode("wolk", "WOLK", 120, 60, "cloud");

        const vc = subscription.vc;
        if (vc) {
            // get ESI's
            const esiList = vc.esis;

            // for each ESI's children: draw.
            esiList.forEach((esi: any, esiIndex: number) => {
                const childCount = esi.saps.length;
                esi.saps.forEach((sap: any, index: number) => {
                    // find instance in instances
                    const portSubscriptionId = sap.port_subscription_id;
                    const portSubscription = portSubscriptions.find((s) => s.subscription_id === portSubscriptionId);
                    if (!portSubscription) {
                        console.log("failed to find subscription", portSubscriptionId);
                        return;
                    }

                    let endpointId: number;
                    endpointId = portSubscription.aggsp
                        ? portSubscription.aggsp.ims_circuit_id
                        : portSubscription.sp.ims_circuit_id;
                    //console.log(`find service ${endpointId}`, portSubscription);
                    const endpoint = imsEndpoints[0].find((e: IMSEndpoint) => e.serviceId === endpointId);
                    const portName = endpoint.port ? endpoint.port.replace(/\//g, "_") : "AGGSP";

                    let nodeName = `unknown_${index}`;
                    if (endpoint) {
                        //console.log(endpoint);
                        nodeName = endpoint.node;
                    }
                    const label = `${nodeName}__${portName}`;
                    const point = this._calculatePositionFor(radius, esiIndex, esiList.length);
                    if (childCount > 1) {
                        // space nodes with 10px;
                        point.y = point.y - 10 * index;
                        pathColorMap[`${label}__WOLK`] = "cyan";
                        pathWidthMap[`${label}__WOLK`] = 2;
                    }
                    const graphNode = this._makeNode(portSubscriptionId, label, 120 + point.x, 60 + point.y, "hub");
                    graphNode.text = this._makeConnectionExplanation(endpoint!, sap, portSubscription!);
                    if (graphNode.y < 60) {
                        graphNode.label_position = "top";
                    }
                    topology.nodes.push(graphNode);
                    topology.names.push(graphNode);
                });
            });

            topology.names.push(wolk);
            topology.nodes.push(wolk);
        }
        return topology;
    }

    _makePaths() {
        topology.nodes.forEach((node: TopologyName) => {
            const edge: TopologyEdge = {
                capacity: "100G",
                ifaces: [
                    {
                        device_source: "bost-cr5",
                        device_target: "newy-cr5",
                        iface_source: "to_newy-cr5_ip-c",
                        iface_target: "to_bost-cr1_ip-a",
                        loc_source: node.name,
                        loc_target: "WOLK",
                    },
                ],
                site: null,
                source: node.name,
                target: "WOLK",
                total_capacity: 10000000,
            };
            topology.edges.push(edge);
            topology.paths.push({
                ends: [],
                steps: [node.name, "WOLK"],
                name: `${node.name}__WOLK`,
            });
        });
    }

    render() {
        topology = this.props.subscription.product.product_type === "L2VPN" ? this._build() : this._buildIP();
        this._makePaths();
        const drawingMethod = this.state.mapMode === 0 ? "simple" : "pathBidirectionalArrow";
        const mapSelection = {
            nodes: this.state.selectionType === "node" ? [this.state.selection] : [],
            edges: this.state.selectionType === "edge" ? [this.state.selection] : [],
        };
        return (
            <EuiFlexGroup justifyContent="spaceAround">
                <EuiFlexItem grow={5}>
                    {topology.names.length > 0 && (
                        <TrafficMap
                            key="traffic-map"
                            topology={topology}
                            // traffic={traffic}
                            bounds={{ x1: -5, y1: 5, x2: 240, y2: 120 }}
                            edgeColorMap={edgeColorMap}
                            edgeDrawingMethod={drawingMethod}
                            edgeThinknessMap={edgeThicknessMap}
                            // edgeShapeMap={edgeShapeMap}
                            nodeSizeMap={nodeSizeMap}
                            nodeShapeMap={nodeShapeMap}
                            stylesMap={stylesMap}
                            pathColorMap={pathColorMap}
                            pathWidthMap={pathWidthMap}
                            showPaths={Object.keys(pathColorMap)}
                            selection={mapSelection}
                            onSelectionChange={(selectionType: string, selection: any) =>
                                this.handleSelectionChanged(selectionType, selection)
                            }
                        />
                    )}
                </EuiFlexItem>
                <EuiFlexItem grow={3} style={{ minWidth: 300 }}>
                    <EuiPanel betaBadgeLabel={"Details"}>{this.state.panelText}</EuiPanel>
                </EuiFlexItem>
                <EuiFlexItem grow={2} style={{ minWidth: 100 }}></EuiFlexItem>
            </EuiFlexGroup>
        );
    }
}
