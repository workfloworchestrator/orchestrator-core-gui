import { EuiCodeBlock, EuiFlexGroup, EuiFlexItem, EuiPanel } from "@elastic/eui";
import React from "react";
import { ConcatenatedCircuit } from "react-network-diagrams";
import {
    IMSEndpoint,
    IMSService,
    InstanceValue,
    SubscriptionInstance,
    SubscriptionInstanceParentRelation,
    SubscriptionWithDetails
} from "utils/types";

import { lineShapeMap, stylesMap } from "./DiagramStyles";

interface IProps {
    type: "patchpanel" | "combined";
    subscription?: SubscriptionWithDetails;
    imsServices?: IMSService[];
    imsEndpoints?: IMSEndpoint[];
    childSubscriptions?: SubscriptionWithDetails[];
}

interface IState {
    _selectedCircuit: any;
    isTableOn: boolean;
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

export default class NetworkDiagram extends React.PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            _selectedCircuit: {},
            isTableOn: false
        };
    }

    _findImsEndpoint = (id: number) => {
        return this.props.imsEndpoints?.find(e => e.serviceId === id);
    };

    _makeConnectionExplanation = (endpoint: IMSEndpoint) => {
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
            </EuiCodeBlock>
        );
    };

    _makeCircuitExplanation = (values: InstanceValue[]) => {
        return (
            <EuiCodeBlock>
                <strong>speed :</strong> {this._findValue(values, "service_speed")?.value || ""}
                <br />
                <strong>remote shutdown:</strong> {this._findValue(values, "remote_port_shutdown")?.value || ""}
                <br />
                <strong>speed policer :</strong> {this._findValue(values, "speed_policer")?.value || ""}
            </EuiCodeBlock>
        );
    };

    _findValue = (values: InstanceValue[], key: string) => {
        return values.find(v => v.resource_type.resource_type === key);
    };

    _findImsServiceEndpoint = (id: number): IMSEndpointValues | null => {
        let r = null;
        this.props.imsServices?.forEach((service: IMSService) => {
            const e = service.endpoints.find(endpoint => endpoint.id === id);
            if (e !== undefined) r = e;
        });
        return r;
    };

    _buildTreeFromEndpoints() {
        // empty the graphList
        graphList.splice(0, graphList.length);
        if (this.props.childSubscriptions?.length === 0 || this.props.imsEndpoints?.length === 0) {
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

        this.props.imsServices?.forEach((imsService: IMSService, graphIndex: number) => {
            const imsServiceId = imsService.id;
            const memberList: GraphMember[] = [];
            const circuitSubscription = this.props.subscription?.instances.find((instance: SubscriptionInstance) => {
                return instance.values.find(
                    v => v.resource_type.resource_type === "ims_circuit_id" && parseInt(v.value) === imsServiceId
                );
            });
            const graphTitle = circuitSubscription!.label !== null ? ` - ${circuitSubscription!.label}` : "";
            imsService.endpoints.forEach((_endpoint: IMSEndpointValues) => {
                const endpoint = this._findImsEndpoint(_endpoint.id);
                if (!endpoint || endpoint.endpointType === "trunk") {
                    return;
                }
                const serviceSpeed = this._findValue(circuitSubscription!.values, "service_speed");
                let connectionAdded = false;
                let vlanRange = `${_endpoint.vlanranges[0].start}-${_endpoint.vlanranges[0].end}`;

                // left-most connection.
                const connection = makeObject(
                    this._makeConnectionExplanation(endpoint),
                    circuitTypeProperties.optical,
                    "",
                    memberList.length === 0 ? vlanRange : "",
                    `${serviceSpeed?.value} @ ${endpoint.port}`,
                    `${graphIndex},${memberList.length}`
                );
                // only add this immediately if it's the first connection.
                // otherwise, add the circuit first, and connection after that.
                if (memberList.length === 0) {
                    memberList.push(connection);
                    connectionAdded = true;
                }

                if (circuitSubscription) {
                    const circuit = makeObject(
                        this._makeCircuitExplanation(circuitSubscription.values),
                        circuitTypeProperties.panelCoupler,
                        "",
                        !connectionAdded ? vlanRange : "",
                        endpoint.node,
                        `${graphIndex},${memberList.length}`
                    );
                    memberList.push(circuit);
                    if (connectionAdded) {
                        memberList.push(
                            makeObject(
                                this._makeCircuitExplanation(circuitSubscription.values),
                                circuitTypeProperties.optical,
                                "",
                                "",
                                serviceSpeed!.value,
                                `${graphIndex},${memberList.length}`
                            )
                        );
                    }
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

    _onMouseDown = (e: any) => {
        console.log(e);
    };

    _closePopover = () => {};

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
