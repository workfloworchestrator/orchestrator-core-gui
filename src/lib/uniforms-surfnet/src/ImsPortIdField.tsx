/*
 * Copyright 2019-2020 SURF.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import "lib/uniforms-surfnet/src/ImsPortIdField.scss";

import {
    getFreePortsByImsNodeIdAndInterfaceType,
    getFreePortsByNodeSubscriptionIdAndSpeed,
    getNodesByLocationAndStatus,
    nodeSubscriptions
} from "api";
import I18n from "i18n-js";
import { FieldProps } from "lib/uniforms-surfnet/src/types";
import React, { useCallback, useEffect, useState } from "react";
import Select, { ValueType } from "react-select";
import { connectField, filterDOMProps } from "uniforms";
import { IMSNode, IMSPort, Option, Subscription } from "utils/types";

export type ImsPortFieldProps = FieldProps<
    number,
    {
        locationCode?: string;
        nodeSubscriptionId?: string;
        interfaceSpeed: number | string;
        imsPortMode?: "patched" | "unpatched" | "all";
        nodeStatuses?: ("active" | "provisioning")[];
    }
>;

function nodeToOptionPort(node: IMSNode): Option {
    return {
        value: node.id.toString(),
        label: `${node.name.trim() || "<No description>"}`
    };
}

function nodeToOptionCorelink(node: Subscription): Option {
    return {
        value: node.subscription_id,
        label: `${node.subscription_id.substring(0, 8)} ${node.description.trim() || "<No description>"}`
    };
}
filterDOMProps.register("locationCode", "nodeSubscriptionId", "interfaceSpeed", "nodeStatuses");

function ImsPortId({
    id,
    name,
    label,
    description,
    onChange,
    value,
    disabled,
    placeholder,
    error,
    showInlineError,
    errorMessage,
    locationCode,
    nodeSubscriptionId,
    interfaceSpeed,
    imsPortMode = "all",
    nodeStatuses,
    ...props
}: ImsPortFieldProps) {
    const [nodes, setNodes] = useState<IMSNode[] | Subscription[]>([]);
    const [nodeId, setNodeId] = useState<number | string | undefined>(nodeSubscriptionId);
    const [ports, setPorts] = useState<IMSPort[]>([]);
    const [loading, setLoading] = useState(true);

    const isServicePortLegacyBehavior = !!locationCode;

    const onChangeNodes = useCallback(
        (option: ValueType<Option>) => {
            let value;
            if (isServicePortLegacyBehavior) {
                value = option ? parseInt((option as Option).value) : null;
            } else {
                value = option ? (option as Option).value : null;
            }

            if (value === null) {
                return;
            }

            setLoading(true);
            setNodeId(value);
            setPorts([]);
            if (isServicePortLegacyBehavior) {
                getFreePortsByImsNodeIdAndInterfaceType(value as number, interfaceSpeed as string, "patched").then(
                    result => {
                        setPorts(result);
                        setLoading(false);
                    }
                );
            } else {
                getFreePortsByNodeSubscriptionIdAndSpeed(value as string, interfaceSpeed as number, imsPortMode).then(
                    result => {
                        setPorts(result);
                        setLoading(false);
                    }
                );
            }
        },
        [interfaceSpeed, isServicePortLegacyBehavior, imsPortMode]
    );

    useEffect(() => {
        setLoading(true);
        if (isServicePortLegacyBehavior) {
            getNodesByLocationAndStatus(locationCode!, "IS").then(result => {
                setNodes(result);
                setLoading(false);
            });
        } else {
            const nodesPromise = nodeSubscriptions(nodeStatuses ?? ["active"]);
            if (nodeSubscriptionId) {
                nodesPromise.then(result => {
                    setNodes(result.filter(subscription => subscription.subscription_id === nodeSubscriptionId));
                    setLoading(false);
                    onChangeNodes({ value: nodeSubscriptionId } as Option);
                });
            } else {
                nodesPromise.then(result => {
                    setNodes(result);
                    setLoading(false);
                });
            }
        }
    }, [onChangeNodes, isServicePortLegacyBehavior, nodeStatuses, locationCode, nodeSubscriptionId]);

    const nodesPlaceholder = loading
        ? I18n.t("forms.widgets.nodePort.loading")
        : I18n.t("forms.widgets.nodePort.selectNode");

    const portPlaceholder = loading
        ? I18n.t("forms.widgets.nodePort.loading")
        : nodeId
        ? I18n.t("forms.widgets.nodePort.selectPort")
        : I18n.t("forms.widgets.nodePort.selectNodeFirst");

    let node_options: Option[] = [];
    if (isServicePortLegacyBehavior) {
        node_options = (nodes as IMSNode[]).map(nodeToOptionPort);
    } else {
        node_options = (nodes as Subscription[]).map(nodeToOptionCorelink);
    }

    node_options.sort((x, y) => x.label.localeCompare(y.label));
    const node_value = node_options.find(option => option.value === nodeId?.toString());

    const port_options: Option<number>[] = ports
        .map(aPort => ({
            value: aPort.id,
            label: `${aPort.port} (${aPort.status}) (${aPort.iface_type})`
        }))
        .sort((x, y) => x.label.localeCompare(y.label));
    const port_value = port_options.find(option => option.value === value);

    return (
        <section {...filterDOMProps(props)}>
            {label && (
                <label>
                    {label}
                    <em>{description}</em>
                </label>
            )}
            <section className="node-port">
                <div className="node-select">
                    <label>Node</label>
                    <Select
                        id={`${id}.node`}
                        inputId={`${id}.node.search`}
                        name={`${name}.node`}
                        onChange={onChangeNodes}
                        options={node_options}
                        placeholder={nodesPlaceholder}
                        value={node_value}
                        isSearchable={true}
                        isDisabled={disabled || !!nodeSubscriptionId || nodes.length === 0}
                    />
                </div>
                <div className="port-select">
                    <label>Port</label>
                    <Select
                        id={id}
                        inputId={`${id}.search`}
                        name={name}
                        onChange={(selected: ValueType<Option<number>>) => {
                            const value = (selected as Option<number> | null)?.value;
                            onChange(value ? value : undefined);
                        }}
                        options={port_options}
                        placeholder={portPlaceholder}
                        value={port_value}
                        isSearchable={true}
                        isDisabled={disabled || ports.length === 0}
                    />
                </div>
            </section>
            {error && showInlineError && (
                <em className="error">
                    <div className="backend-validation">{errorMessage}</div>
                </em>
            )}
        </section>
    );
}

export default connectField(ImsPortId, { kind: "leaf" });
