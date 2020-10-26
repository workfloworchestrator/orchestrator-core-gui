import { EuiCodeBlock, EuiFlexGroup, EuiFlexItem, EuiLink, EuiPanel } from "@elastic/eui";
import { prefixById, subscriptionsDetail } from "api";
import React from "react";
import { TrafficMap } from "react-network-diagrams";
import {
    IMSEndpoint,
    IMSService,
    InstanceValue,
    Subscription,
    SubscriptionInstance,
    SubscriptionWithDetails
} from "utils/types";

import { stylesMap } from "./DiagramStyles";

interface IProps {
    subscription: SubscriptionWithDetails;
    imsServices: IMSService[];
    imsEndpoints: IMSEndpoint[];
    childSubscriptions: SubscriptionWithDetails[];
}

interface IState {
    mapMode: number;
    nodesLoaded: boolean;
    nodes: Subscription[];
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
    cloud: 7
};

// Mapping of node name to shape (default is circle, other
// options are cloud or square currently)
const nodeShapeMap: any = {
    L2VPNWOLK: "cloud",
    WOLK: "cloud"
};

// Maps link capacity to line thickness
const edgeThicknessMap = {
    "100G": 9,
    "10G": 3,
    "1G": 1.5,
    subG: 1
};

// The color map maps an edge value (within the range) to a color
const edgeColorMap = [
    { color: "#4da7c0", label: ">=50 Gbps", range: [50, 100] },
    { color: "#4da7c0", label: "20 - 50", range: [20, 50] },
    { color: "#4da7c0", label: "10 - 20", range: [10, 20] },
    { color: "#4da7c0", label: "5 - 10", range: [5, 10] },
    { color: "#238b45", label: "2 - 5", range: [2, 5] },
    { color: "#3690c0", label: "1 - 2", range: [1, 2] },
    { color: "#74a9cf", label: "0 - 1", range: [0, 1] }
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

export default class TopologyDiagram extends React.PureComponent<IProps, IState> {
    state: IState = {
        mapMode: 0,
        nodesLoaded: false,
        nodes: [],
        selectionType: null,
        selection: null,
        panelText: null,
        prefix: {},
        prefixesLoaded: []
    };

    prefixesLoaded: string[] = [];

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
            text: <div></div>
        };
    }

    _findEndpoint(imsServiceId: number): IMSEndpoint | undefined {
        return this.props.imsEndpoints?.find(e => e.serviceId === imsServiceId);
    }

    _findValueForKey(sub: SubscriptionWithDetails, key: string) {
        return this._findValue(sub.instances[0].values, key);
    }

    _findIMSServiceEndpoint(id: number) {
        return this.props.imsServices![0].endpoints.find(e => e.id === id);
    }

    _findValue = (values: InstanceValue[], key: string) => {
        return values.find(v => v.resource_type.resource_type === key);
    };

    _findIpamId(inst: SubscriptionInstance) {
        const test = this._findValue(inst.values, "ip_prefix_subscription_id");
        if (!test) {
            return;
        }
        const prefixService = this.props.childSubscriptions.find(s => s.subscription_id === test!.value);
        if (!prefixService) {
            return;
        }
        return this._findValue(prefixService.instances[0].values, "ipam_prefix_id");
    }

    _getNode(id: string): Subscription | undefined {
        return this.state.nodes.find(node => node.subscription_id === id);
    }

    async _loadNodes() {
        let nodes = [];
        for (let sub of this.props.childSubscriptions!) {
            const nodeIdValue = this._findValueForKey(sub, "node_subscription_id");
            const f = this.state.nodes.find((node: Subscription) => node.subscription_id === nodeIdValue!.value);
            if (!f && nodeIdValue) {
                try {
                    const node = await subscriptionsDetail(nodeIdValue!.value);
                    nodes.push(node);
                } catch (e) {
                    console.error(e);
                    // supply a node object that indicates
                    // we couldn't load this particular
                    // node.
                    nodes.push({
                        subscription_id: nodeIdValue!.value,
                        description: "node did-not-load",
                        product: sub.product,
                        name: "",
                        insync: false,
                        product_id: sub.product.product_id,
                        customer_id: "none",
                        status: "IS",
                        start_date: 0,
                        end_date: 0,
                        note: "dnf"
                    });
                }
            }
        }
        return Promise.resolve(nodes);
    }

    _makeConnectionExplanation = (endpoint: IMSEndpoint, sub: SubscriptionWithDetails): JSX.Element => {
        const portmode = this._findValueForKey(sub, "port_mode");
        const imsServiceEndpoint = this._findIMSServiceEndpoint(endpoint.serviceId);
        const vlanRange = `${imsServiceEndpoint?.vlanranges[0].start}-${imsServiceEndpoint?.vlanranges[0].end}`;
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
                <strong>port mode :</strong> {portmode?.value}
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

    _makePrefixExplanation = (
        endpoint: IMSEndpoint,
        sub: SubscriptionWithDetails,
        inst: SubscriptionInstance
    ): JSX.Element => {
        const ipamId = this._findIpamId(inst);
        const prefix = this.state.prefix[ipamId!.value];
        if (!ipamId || !this.prefixesLoaded.includes(ipamId.value) || !prefix) {
            return <EuiCodeBlock></EuiCodeBlock>;
        }

        return (
            <div>
                {endpoint && this._makeConnectionExplanation(endpoint!, sub!)}
                <EuiCodeBlock>
                    <strong>asn :</strong> {prefix.asn__label}
                    <br />
                    <strong>prefix :</strong> {prefix.prefix}
                    <br />
                    <strong>state :</strong> {prefix.state__label}
                    <br />
                    <strong>tags :</strong> {prefix.tags?.join(",")}
                    <br />
                </EuiCodeBlock>
            </div>
        );
    };

    _calculatePositionFor(radius: number, index: number, n: number): Point {
        return {
            x: radius * Math.cos((index * 2 * Math.PI) / n),
            y: radius * Math.sin((index * 2 * Math.PI) / n)
        };
    }

    _condenseValues(values: InstanceValue[]): any {
        const rv: any = {};
        values.forEach((v: InstanceValue) => {
            rv[v.resource_type.resource_type] = v.value;
        });
        return rv;
    }

    _updatePrefixInformation(inst: SubscriptionInstance) {
        const ipamId = this._findIpamId(inst);
        if (!ipamId || this.prefixesLoaded.includes(ipamId.value)) {
            return;
        }
        this.prefixesLoaded.push(ipamId.value);

        prefixById(parseInt(ipamId.value)).then(prefixData => {
            const oldState = this.state.prefix;
            oldState[ipamId.value] = prefixData;
            this.setState({ prefix: { ...oldState } });
        });
    }

    _buildIP(): Topology {
        const topology: Topology = { names: [], nodes: [], edges: [], paths: [] };
        pathColorMap = {};
        if (this.props.childSubscriptions?.length === 0 || this.props.imsEndpoints?.length === 0) {
            return topology;
        }
        const vc = this.props.subscription.instances.find(i => i.product_block.tag === "VC");
        const wolk: TopologyName = this._makeNode("wolk", "WOLK", 120, 60, "cloud");
        topology.names.push(wolk);
        topology.nodes.push(wolk);

        if (!vc!.children_relations) {
            // nothing to do here.
            return topology;
        }
        vc!.children_relations.forEach((child, index: number) => {
            const sap = this.props.subscription.instances.find(i => i.subscription_instance_id === child.child_id);
            if (sap!.product_block.tag === "IPSS") {
                return;
            }
            this._updatePrefixInformation(sap!);

            const values = this._condenseValues(sap!.values);
            const port = this.props.childSubscriptions.find(sub => sub.subscription_id === values.port_subscription_id);
            const portValues = this._condenseValues(port!.instances[0].values);
            const endpoint = this._findEndpoint(parseInt(portValues.ims_circuit_id));
            const label = `${endpoint?.node}__${endpoint?.port.replaceAll("/", "_")}`;
            const point = this._calculatePositionFor(radius, index, vc!.children_relations.length);
            const node = this._makeNode(
                child.child_id,
                `${sap?.product_block.tag}_${label}`,
                120 + point.x,
                60 + point.y,
                "hub"
            );
            node.text = this._makePrefixExplanation(endpoint!, port!, sap!);
            topology.names.push(node);
            topology.nodes.push(node);
        });

        return topology;
    }

    _build(): Topology {
        const topology: Topology = { names: [], nodes: [], edges: [], paths: [] };
        pathColorMap = {};
        if (this.props.childSubscriptions?.length === 0 || this.props.imsEndpoints?.length === 0) {
            return topology;
        }

        if (!this.state.nodesLoaded) {
            this._loadNodes().then(res => {
                this.setState({ nodesLoaded: true, nodes: res });
            });
        } else {
            const wolk: TopologyName = this._makeNode("wolk", "WOLK", 120, 60, "cloud");

            const vc = this.props.subscription.instances.find(i => i.product_block.tag === "VC");
            if (vc) {
                // get ESI's
                const esiList = this.props.subscription.instances.filter(i => i.product_block.tag === "ESI");

                // for each ESI's children: draw.
                esiList.forEach((esi: SubscriptionInstance, esiIndex: number) => {
                    const childCount = esi.children_relations.length;
                    esi.children_relations.forEach((child, index: number) => {
                        // find instance in instances
                        const sap = this.props.subscription.instances.find(
                            i => i.subscription_instance_id === child.child_id
                        );
                        const portSubscriptionId = this._findValue(sap!.values, "port_subscription_id");
                        const portSubscription = this.props.childSubscriptions.find(
                            s => s.subscription_id === portSubscriptionId?.value
                        );
                        const nodeIdValue = this._findValueForKey(portSubscription!, "node_subscription_id");
                        const endpointValue = this._findValueForKey(portSubscription!, "ims_circuit_id");
                        const endpoint = this._findEndpoint(parseInt(endpointValue!.value));

                        let nodeName = `unknown_${index}`;
                        if (nodeIdValue) {
                            const imsNode = this._getNode(nodeIdValue!.value);
                            nodeName = imsNode!.description.substr(
                                imsNode!.description.lastIndexOf(" ") + 1,
                                imsNode!.description.length
                            );
                        }
                        const label = `${nodeName}__${endpoint?.port.replaceAll("/", "_")}`;
                        const point = this._calculatePositionFor(radius, esiIndex, esiList.length);
                        if (childCount > 1) {
                            // space nodes with 10px;
                            point.y = point.y - 10 * index;
                            pathColorMap[`${label}__WOLK`] = "cyan";
                            pathWidthMap[`${label}__WOLK`] = 2;
                        }
                        const graphNode = this._makeNode(
                            portSubscriptionId!.value,
                            label,
                            120 + point.x,
                            60 + point.y,
                            "hub"
                        );
                        graphNode.text = this._makeConnectionExplanation(endpoint!, portSubscription!);
                        if (graphNode.y < 60) {
                            graphNode.label_position = "top";
                        }
                        topology.nodes.push(graphNode);
                        topology.names.push(graphNode);
                    });
                });
            }
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
                        loc_target: "WOLK"
                    }
                ],
                site: null,
                source: node.name,
                target: "WOLK",
                total_capacity: 10000000
            };
            topology.edges.push(edge);
            topology.paths.push({
                ends: [],
                steps: [node.name, "WOLK"],
                name: `${node.name}__WOLK`
            });
        });
    }

    _toggleMapMode = () => {
        this.setState({ mapMode: 1 - this.state.mapMode });
    };

    render() {
        topology = this.props.subscription.product.product_type === "L2VPN" ? this._build() : this._buildIP();
        this._makePaths();
        const drawingMethod = this.state.mapMode === 0 ? "simple" : "pathBidirectionalArrow";
        const mapSelection = {
            nodes: this.state.selectionType === "node" ? [this.state.selection] : [],
            edges: this.state.selectionType === "edge" ? [this.state.selection] : []
        };
        return (
            <EuiFlexGroup>
                <EuiFlexItem grow={7}>
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
                <EuiFlexItem grow={3}>
                    <EuiPanel betaBadgeLabel={"Details"}>{this.state.panelText}</EuiPanel>
                </EuiFlexItem>
            </EuiFlexGroup>
        );
    }
}
