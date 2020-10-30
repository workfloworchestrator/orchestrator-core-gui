import { EuiCodeBlock, EuiFlexGroup, EuiFlexItem, EuiLink, EuiPanel } from "@elastic/eui";
import { internalPortByImsPortId, portByImsPortId, portByImsServiceId, serviceByImsServiceId } from "api";
import React from "react";
import { ConcatenatedCircuit } from "react-network-diagrams";
import { Link } from "react-router-dom";
import {
    IMSEndpoint,
    IMSService,
    SubscriptionInstance,
    SubscriptionInstanceParentRelation,
    SubscriptionModel,
    SubscriptionWithDetails
} from "utils/types";
import { isEmpty } from "utils/Utils";

import { lineShapeMap, stylesMap } from "./DiagramStyles";

interface IProps {
    type: "patchpanel" | "combined";
    subscription: SubscriptionModel;
    childSubscriptions?: SubscriptionWithDetails[];
}

interface IState {
    _selectedCircuit: any;
    isTableOn: boolean;
    imsServices: any[];
    imsEndpoints: any[];
    isLoading: boolean;
}

export interface SubscriptionInstanceExtended extends SubscriptionInstance {
    subscription_id: string;
    parent_relations: SubscriptionInstanceParentRelation[];
    children_relations: SubscriptionInstanceParentRelation[];
}

export interface IMSVlanRange {
    start: number;
    end: number;
    sub_circuit_id?: string;
}

export interface IMSEndpointValues {
    id: number;
    type: string;
    vlanranges: IMSVlanRange[];
}

interface GraphMember {
    explanation: string | JSX.Element;
    styleProperties: object;
    endpointStyle: object;
    endpointLabelA: string;
    endpointLabelZ?: string;
    circuitLabel: string;
    navTo: string | number;
}

interface Graph {
    members: GraphMember[];
    title: string;
}

const circuitTypeProperties = {
    optical: {
        style: stylesMap.optical,
        lineShape: lineShapeMap.optical
    },
    leased: {
        style: stylesMap.leased,
        lineShape: lineShapeMap.leased
    },
    darkFiber: {
        style: stylesMap.darkFiber,
        lineShape: lineShapeMap.darkFiber
    },
    equipmentToEquipment: {
        style: stylesMap.equipmentToEquipment,
        lineShape: lineShapeMap.equipmentToEquipment
    },
    crossConnect: {
        style: stylesMap.crossConnect,
        lineShape: lineShapeMap.crossConnect
    },
    panelCoupler: {
        style: stylesMap.panelCoupler,
        lineShape: lineShapeMap.coupler,
        size: 30,
        squareWidth: 40,
        centerLine: true
    }
};

const graphList: Graph[] = [];

export default class NetworkDiagram extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            _selectedCircuit: {},
            isTableOn: false,
            imsEndpoints: [],
            imsServices: [],
            isLoading: false
        };
    }

    componentDidMount = () => {
        const { subscription } = this.props;
        const { imsServices, imsEndpoints, isLoading } = this.state;

        const vcs = subscription.vcs ? subscription.vcs : [subscription.vc];
        if (!isLoading && vcs.length > 0 && isEmpty(imsServices)) {
            this.setState({ isLoading: true });
            vcs.forEach((vc: any, vcIndex: number) => {
                serviceByImsServiceId(vc.ims_circuit_id).then(result => {
                    imsServices[vcIndex] = result;
                    this.setState({ imsServices: imsServices });
                    if (isEmpty(imsEndpoints[vcIndex])) {
                        this.populateEndpoints({ service: result, recursive: true, vc: vcIndex });
                    }
                });
            });
        }
    };

    populateEndpoints = ({
        service,
        recursive = false,
        vc = 0
    }: {
        service: IMSService;
        recursive?: boolean;
        vc: number;
    }) => {
        if (isEmpty(service) || !recursive) {
            return;
        }

        const uniquePortPromises = (service.endpoints || []).map(async endpoint => {
            if (endpoint.type === "port") {
                return portByImsPortId(endpoint.id).then(result =>
                    Object.assign(result, {
                        serviceId: endpoint.id,
                        endpointType: endpoint.type
                    })
                );
            } else if (endpoint.type === "internal_port") {
                return internalPortByImsPortId(endpoint.id).then(result =>
                    Object.assign(result, {
                        serviceId: endpoint.id,
                        endpointType: endpoint.type
                    })
                );
            } else {
                return serviceByImsServiceId(endpoint.id).then(result => {
                    if (["SP", "MSP", "SSP"].includes(result.product)) {
                        // In case of port product we just resolve the underlying port
                        return portByImsServiceId(endpoint.id).then(result =>
                            Object.assign(result, {
                                serviceId: endpoint.id,
                                endpointType: "port"
                            })
                        );
                    }
                    // Return all services that are not actually port services
                    return (Object.assign(result, {
                        serviceId: endpoint.id,
                        endpointType: endpoint.type
                    }) as unknown) as IMSEndpoint;
                });
            }
        });
        //@ts-ignore
        Promise.all(uniquePortPromises).then(result => {
            const { imsEndpoints } = this.state;
            imsEndpoints[vc] = result.flat();
            this.setState({ imsEndpoints: imsEndpoints });
            // forceUpdate is a bit rough, but this.setState() does not
            // trigger a re-render, so we have to.
            // console.log(`all done.`);
            // this.forceUpdate();
        });
    };

    shouldComponentUpdate(nextProps: IProps, nextState: IState): boolean {
        // console.log(`should we really update?`);
        return true;
    }

    _findImsEndpoint = (imsIndex: number, id: number) => {
        return this.state.imsServices[imsIndex].endpoints.find((e: any) => e.id === id);
    };

    _makeConnectionExplanation = (endpoint: IMSEndpoint, subscription?: SubscriptionModel) => {
        return (
            <EuiCodeBlock>
                {subscription && (
                    <>
                        <strong>subscription id:</strong>{" "}
                        <Link to={`/subscriptions/${subscription.subscription_id}`}>
                            {subscription.subscription_id}
                        </Link>
                        <br />
                    </>
                )}
                <strong>interface:</strong> {endpoint.iface_type}
                <br />
                <strong>physical port:</strong> {endpoint.port}
                <br />
                <strong>connector:</strong> {endpoint.connector_type}
                <br />
                <strong>fiber type:</strong> {endpoint.fiber_type}
                <br />
                <strong>patch position:</strong> {endpoint.patchposition}
                <br />
                {subscription && (
                    <>
                        <strong>customer:</strong>
                        {subscription.customer_name}
                        <br />
                    </>
                )}
                {subscription && subscription.customer_descriptions.length > 0 && (
                    <>
                        <strong>customer descriptions:</strong>
                        {subscription.customer_descriptions.map(item => (
                            <div>{item.description}</div>
                        ))}
                        <br />
                    </>
                )}
                {subscription && (
                    <EuiLink
                        external
                        target="_blank"
                        href={`https://netwerkdashboard.surf.net/subscription/${subscription.subscription_id}`}
                        aria-label="Link to netwerkdashboard"
                    >
                        Netwerkdashboard
                    </EuiLink>
                )}
            </EuiCodeBlock>
        );
    };

    _makeCircuitExplanation = (circuit: any, subscription?: SubscriptionModel) => {
        return (
            <EuiCodeBlock>
                <strong>speed:</strong> {circuit.service_speed}
                <br />
                <strong>remote shutdown:</strong> {circuit.remote_port_shutdown ? "yes" : "no"}
                <br />
                <strong>speed policer:</strong> {circuit.speed_policer ? "yes" : "no"}
                <br />
                <strong>NSO service ID:</strong> {circuit.nso_service_id}
                <br />
                {subscription && (
                    <>
                        <strong>customer:</strong>
                        {subscription.customer_name}
                        <br />
                    </>
                )}
                {subscription && subscription.customer_descriptions.length > 0 && (
                    <>
                        <strong>customer descriptions:</strong>
                        {subscription.customer_descriptions.map(item => (
                            <div>{item.description}</div>
                        ))}
                        <br />
                    </>
                )}
            </EuiCodeBlock>
        );
    };

    _buildTreeFromEndpoints() {
        // empty the graphList
        graphList.splice(0, graphList.length);
        const { subscription } = this.props;
        const { imsEndpoints } = this.state;
        const vcs = subscription.vcs ? subscription.vcs : [subscription.vc];

        if (imsEndpoints.length === 0 || imsEndpoints.length < vcs.length || !subscription) {
            return;
        }

        const makeObject = (
            expl: string | JSX.Element,
            style: any,
            labelA: string,
            labelZ: string,
            label: string,
            index: string
        ): GraphMember => {
            return {
                explanation: expl,
                styleProperties: style,
                endpointStyle: stylesMap.endpoint,
                endpointLabelA: labelA,
                endpointLabelZ: labelZ,
                circuitLabel: label,
                navTo: index
            };
        };

        vcs.forEach((circuit: any, graphIndex: number) => {
            const memberList: GraphMember[] = [];
            const graphTitle = circuit.label !== null ? ` - ${circuit.label}` : "";
            let { subscription } = this.props;
            if (!imsEndpoints[graphIndex]) {
                return;
            }
            imsEndpoints[graphIndex].forEach((imsEndpoint: IMSEndpoint) => {
                const endpointFromService = this._findImsEndpoint(graphIndex, imsEndpoint.serviceId);
                if (!endpointFromService || endpointFromService.endpointType === "trunk") {
                    return;
                }
                const serviceSpeed = circuit.service_speed;
                let connectionAdded = false;
                let vlanRange = endpointFromService.vlanranges.map((v: any) => `${v.start}-${v.end}`).join(", ");
                // left-most connection
                const connection = makeObject(
                    this._makeConnectionExplanation(imsEndpoint, subscription),
                    circuitTypeProperties.optical,
                    "",
                    memberList.length === 0 ? vlanRange : "",
                    `${serviceSpeed} @ ${imsEndpoint.port}`,
                    `${graphIndex},${memberList.length}`
                );

                // only add this immediately if it's the first connection.
                // otherwise, add the circuit first, and connection after that.
                if (memberList.length === 0) {
                    memberList.push(connection);
                    connectionAdded = true;
                }

                const circuitMember = makeObject(
                    this._makeCircuitExplanation(circuit),
                    circuitTypeProperties.panelCoupler,
                    "",
                    !connectionAdded ? vlanRange : "",
                    imsEndpoint.node,
                    `${graphIndex},${memberList.length}`
                );
                memberList.push(circuitMember);

                if (connectionAdded) {
                    memberList.push(
                        makeObject(
                            this._makeCircuitExplanation(circuit, subscription),
                            circuitTypeProperties.optical,
                            "",
                            "",
                            serviceSpeed,
                            `${graphIndex},${memberList.length}`
                        )
                    );
                }

                if (!connectionAdded) {
                    connection.navTo = `${graphIndex},${memberList.length}`;
                    memberList.push(connection);
                }
            });
            graphList.push({ title: `Network diagram${graphTitle}`, members: memberList });
        });
    }

    _onSelectionChange = (e: any, value: any) => {
        // clicked a circuit.
        const [graphId, memberId] = value.split(",");
        this.setState({ _selectedCircuit: graphList[graphId].members[memberId] || {} });
        this.setState({ isTableOn: this.state._selectedCircuit !== {} });
    };

    render() {
        this._buildTreeFromEndpoints();

        return (
            <EuiFlexGroup>
                <EuiFlexItem grow={7}>
                    {graphList.length > 0 &&
                        graphList.map((elem: Graph, index: number) => (
                            <ConcatenatedCircuit
                                key={index}
                                memberList={elem.members}
                                endpointLabelPosition="bottomleftangled"
                                yOffset={7}
                                title={elem.title}
                                onSelectionChange={this._onSelectionChange}
                                endpointLabelOffset={30}
                            />
                        ))}
                </EuiFlexItem>
                <EuiFlexItem grow={3}>
                    {this.state.isTableOn && (
                        <EuiPanel betaBadgeLabel={"Details"}>{this.state._selectedCircuit.explanation}</EuiPanel>
                    )}
                </EuiFlexItem>
            </EuiFlexGroup>
        );
    }
}
