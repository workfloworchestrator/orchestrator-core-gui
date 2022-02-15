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

import { ApiClient } from "api";
import SubscriptionDetails from "components/subscriptionDetail/SubscriptionDetails";
import { CustomApiClient } from "custom/api";
import { ENV } from "env";
import { isEmpty } from "lodash";
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useQuery } from "react-query";
import ApplicationContext from "utils/ApplicationContext";
import { enrichSubscription, ipamStates, organisationNameByUuid } from "utils/Lookups";
import { IMSEndpoint, IMSNode, IMSService, SubscriptionModel, prop } from "utils/types";
import { applyIdNamingConvention } from "utils/Utils";

interface IPAMAddress {
    id: number;
    state: number;
    address: string;
    fqdn: string;
    tags: string[];
}
interface IPAMPrefix {
    id: number;
    description: string;
    afi: number;
    asn: number;
    prefix: string;
    addresses: IPAMAddress[];
    tags: string[];
    state: number;
}

function DataTable({ children }: React.PropsWithChildren<{}>) {
    return (
        <table className="detail-block related-subscription">
            <thead />
            <tbody>{children}</tbody>
        </table>
    );
}

function DataRow({
    type,
    label,
    value,
    rawLabel,
}: {
    type: string;
    label: string;
    value: React.ReactNode;
    rawLabel?: React.ReactNode;
}) {
    return (
        <tr>
            <td className={`${applyIdNamingConvention(`${type}-${label}`)}-k`}>
                {rawLabel ?? <FormattedMessage id={`subscription.${type}.${label}`} />}
            </td>
            <td className={`${applyIdNamingConvention(`${type}-${label}`)}-v`}>{value}</td>
        </tr>
    );
}

function SubscriptionInstanceValueRow({
    label,
    value,
    isSubscriptionValue,
    isDeleted,
    isExternalLinkValue,
    toggleCollapsed,
    type,
    children,
}: React.PropsWithChildren<{
    label: string;
    value: string;
    isSubscriptionValue: boolean;
    isDeleted: boolean;
    isExternalLinkValue: boolean;
    toggleCollapsed: () => void;
    type: string;
}>) {
    const icon = children ? "minus" : "plus";
    const { apiClient } = useContext(ApplicationContext);

    var imsLink = "";
    if (isExternalLinkValue) {
        if (label === "ims_circuit_id") {
            imsLink = ENV.IMS_URL.concat("circuit", "/", value);
        } else if (label === "ims_node_id") {
            imsLink = ENV.IMS_URL.concat("node", "/", value);
        }
    }
    const { isLoading: subscriptionIsLoading, error: subscriptionError, data: subscriptionData } = useQuery(
        ["subscription", { id: isSubscriptionValue ? value : "disabled" }],
        () => apiClient.subscriptionsDetailWithModel(value),
        {
            enabled: isSubscriptionValue,
        }
    );

    const subscriptionLink =
        isSubscriptionValue && !subscriptionIsLoading && !subscriptionError
            ? `${subscriptionData?.description} (${value})`
            : value;

    return (
        <tbody>
            <tr>
                <td>{label.toUpperCase()}</td>
                <td colSpan={isDeleted ? 1 : 2}>
                    <div className="resource-type">
                        {isExternalLinkValue && !isDeleted && (
                            <i className={`fa fa-${icon}-circle`} onClick={toggleCollapsed} />
                        )}
                        {isSubscriptionValue && (
                            <a target="_blank" rel="noopener noreferrer" href={`/subscriptions/${value}`}>
                                {subscriptionLink}
                            </a>
                        )}
                        {imsLink && (
                            <a target="_blank" rel="noopener noreferrer" href={imsLink}>
                                {value}
                            </a>
                        )}
                        {!(isSubscriptionValue || imsLink) && <span>{value.toString()}</span>}
                    </div>
                </td>
                {isDeleted && (
                    <td>
                        <em className="error">
                            <FormattedMessage id={`subscription.${type}.removed`} />
                        </em>
                    </td>
                )}
            </tr>
            {children && isExternalLinkValue && !isDeleted && (
                <tr className="related-subscription">
                    <td className="whitespace" />
                    <td className="related-subscription-values" colSpan={2}>
                        {children}
                    </td>
                </tr>
            )}
        </tbody>
    );
}

function EndpointDetail({ endpoint }: { endpoint: IMSEndpoint }) {
    if (endpoint.endpointType === "service") {
        return <ImsServiceDetail service={(endpoint as unknown) as IMSService} />;
    }

    const keys =
        endpoint.endpointType === "port"
            ? [
                  "connector_type",
                  "fiber_type",
                  "iface_type",
                  "line_name",
                  "location",
                  "node",
                  "patchposition",
                  "port",
                  "status",
              ]
            : endpoint.endpointType === "internal_port"
            ? ["line_name", "location", "node", "port"]
            : ["name", "product", "speed", "status"];
    const i18n_base = ["port", "internal_port"].includes(endpoint.endpointType) ? "ims_port" : "ims_service";

    return (
        <DataTable>
            {keys.map((attr) => (
                <DataRow key={attr} type={i18n_base} label={attr} value={prop(endpoint, attr as keyof IMSEndpoint)} />
            ))}
        </DataTable>
    );
}

function ImsServiceDetail({ service, recursive = false }: { service: IMSService; recursive?: boolean }) {
    const { organisations, apiClient, customApiClient } = useContext(ApplicationContext);
    const [endpoints, setEndpoints] = useState<IMSEndpoint[]>([]);
    const intl = useIntl();

    useEffect(() => {
        if (isEmpty(service) || !recursive) {
            return;
        }

        const uniquePortPromises = (service.endpoints || []).map(async (endpoint) => {
            if (endpoint.type === "port") {
                return customApiClient.portByImsPortId(endpoint.id).then((result) =>
                    Object.assign(result, {
                        serviceId: endpoint.id,
                        endpointType: endpoint.type,
                    })
                );
            } else if (endpoint.type === "internal_port") {
                return customApiClient.internalPortByImsPortId(endpoint.id).then((result) =>
                    Object.assign(result, {
                        serviceId: endpoint.id,
                        endpointType: endpoint.type,
                    })
                );
            } else {
                return customApiClient.serviceByImsServiceId(endpoint.id).then((result) => {
                    if (["SP", "MSP", "SSP"].includes(result.product)) {
                        // In case of port product we just resolve the underlying port
                        return customApiClient.portByImsServiceId(endpoint.id).then((result) =>
                            Object.assign(result, {
                                serviceId: endpoint.id,
                                endpointType: "port",
                            })
                        );
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
        Promise.all(uniquePortPromises).then((result) => setEndpoints(result.flat()));
    }, [recursive, service, apiClient, customApiClient]);

    return (
        <DataTable>
            <DataRow type="ims_service" label="identifier" value={service.id} />
            <DataRow
                type="ims_service"
                label="customer"
                value={organisationNameByUuid(service.customer_id, organisations)}
            />
            <DataRow type="ims_service" label="extra_info" value={service.extra_info || ""} />
            <DataRow type="ims_service" label="name" value={service.name || ""} />
            <DataRow type="ims_service" label="product" value={service.product || ""} />
            <DataRow type="ims_service" label="speed" value={service.speed || ""} />
            <DataRow type="ims_service" label="status" value={service.status || ""} />
            <DataRow type="ims_service" label="order_id" value={service.order_id || ""} />
            <DataRow type="ims_service" label="aliases" value={(service.aliases || []).join(", ")} />
            <DataRow type="ims_service" label="order_id" value={service.order_id || ""} />
            <DataRow
                type="ims_service"
                label="endpoints"
                value={(service.endpoints || [])
                    .map(
                        (endpoint) =>
                            `ID: ${endpoint.id}${endpoint.vlanranges ? " - " : ""}${(endpoint.vlanranges || [])
                                .map((vlan) => `VLAN: ${vlan.start} - ${vlan.end}`)
                                .join(", ")}`
                    )
                    .join(", ")}
            />
            {endpoints
                .filter((port) => service.endpoints.map((endpoint) => endpoint.id).includes(port.serviceId))
                .map((port, index) => {
                    const type = ["port", "internal_port"].includes(port.endpointType) ? "ims_port" : "ims_service";
                    return (
                        <DataRow
                            key={index}
                            type={type}
                            label="id"
                            rawLabel={intl.formatMessage({ id: `subscription.${type}.id` }, { id: port.id })}
                            value={<EndpointDetail endpoint={port} />}
                        />
                    );
                })}
        </DataTable>
    );
}

function ImsNodeDetail({ ims_node }: { ims_node: IMSNode }) {
    return (
        <DataTable>
            <DataRow type="ims_node" label="id" value={ims_node.id} />
            <DataRow type="ims_node" label="name" value={ims_node.name} />
            <DataRow type="ims_node" label="status" value={ims_node.status} />
        </DataTable>
    );
}

function IpamAddress({ address }: { address: IPAMAddress }) {
    return (
        <DataTable>
            <DataRow type="ipam_address" label="id" value={address.id} />
            <DataRow type="ipam_address" label="state" value={ipamStates[address.state]} />
            <DataRow type="ipam_address" label="address" value={address.address} />
            <DataRow type="ipam_address" label="fqdn" value={address.fqdn} />
            <DataRow type="ipam_address" label="tags" value={address.tags.join(", ")} />
        </DataTable>
    );
}

function IpamPrefix({ prefix }: { prefix: IPAMPrefix }) {
    const intl = useIntl();

    return (
        <DataTable>
            <DataRow type="ipam_prefix" label="description" value={prefix.description} />
            <DataRow type="ipam_prefix" label="prefix" value={prefix.prefix} />
            <DataRow type="ipam_prefix" label="afi" value={prefix.afi} />
            <DataRow type="ipam_prefix" label="asn" value={prefix.asn} />
            <DataRow type="ipam_prefix" label="state" value={ipamStates[prefix.state]} />
            <DataRow type="ipam_prefix" label="tags" value={prefix.tags.join(", ")} />
            {prefix.addresses &&
                prefix.addresses.map((address, idx) => (
                    <DataRow
                        key={idx}
                        type="ipam_prefix"
                        label="address"
                        rawLabel={intl.formatMessage({ id: "subscription.ipam_prefix.address" }, { id: address.id })}
                        value={<IpamAddress address={address} />}
                    />
                ))}
        </DataTable>
    );
}

export function getExternalTypeData(
    type: string,
    apiClient: ApiClient,
    customApiClient: CustomApiClient
): { getter: (identifier: string) => Promise<any>; render?: (data: any) => React.ReactNode; i18nKey: string } {
    switch (type) {
        case "ims_port_id":
        case "ims_port_id_1":
        case "ims_port_id_2":
            return {
                getter: (identifier: string) => customApiClient.portByImsPortId(parseInt(identifier)),
                render: (data: IMSEndpoint) => {
                    data.endpointType = "port";
                    return <EndpointDetail endpoint={data} />;
                },
                i18nKey: "ims_port",
            };
        case "ims_node_id":
            return {
                getter: (identifier: string) => customApiClient.nodeByImsNodeId(parseInt(identifier)),
                render: (data: IMSNode) => <ImsNodeDetail ims_node={data} />,
                i18nKey: "ims_node",
            };
        case "ims_circuit_id":
        case "ims_corelink_trunk_id":
            return {
                getter: (identifier: string) => customApiClient.serviceByImsServiceId(parseInt(identifier)),
                render: (data: IMSService) => <ImsServiceDetail service={data} recursive={true} />,
                i18nKey: "ims_service",
            };
        case "node_subscription_id":
        case "port_subscription_id":
        case "peer_group_subscription_id":
        case "ip_prefix_subscription_id":
        case "internetpinnen_prefix_subscription_id":
        case "parent_ip_prefix_subscription_id":
            return {
                getter: (identifier: string) => apiClient.subscriptionsDetailWithModel(identifier),
                render: (data: SubscriptionModel) => (
                    <SubscriptionDetails subscription={data} className="related-subscription" />
                ),
                i18nKey: "subscription",
            };
        case "ptp_ipv4_ipam_id":
        case "ptp_ipv6_ipam_id":
        case "ipam_prefix_id":
        case "customer_ptp_ipv4_ipam_id":
        case "customer_ptp_ipv6_ipam_id":
            return {
                getter: (identifier: string) => customApiClient.prefixById(parseInt(identifier)),
                render: (data: IPAMPrefix) => <IpamPrefix prefix={data} />,
                i18nKey: "ipam_prefix",
            };
        case "ipv4_ipam_address_id":
        case "ipv6_ipam_address_id":
        case "node_ipv4_ipam_id":
        case "node_ipv6_ipam_id":
        case "corelink_ipv4_ipam_id":
        case "corelink_ipv6_ipam_id":
            return {
                getter: (identifier: string) => customApiClient.addressById(parseInt(identifier)),
                render: (data: IPAMAddress) => <IpamAddress address={data} />,
                i18nKey: "ipam_address",
            };
        case "ims_aggregate_port_id":
            return {
                getter: (identifier: string) => customApiClient.internalPortByImsPortId(parseInt(identifier)),
                render: (data: IMSEndpoint) => {
                    data.endpointType = "internal_port";
                    return <EndpointDetail endpoint={data} />;
                },
                i18nKey: "ims_port",
            };
        default:
            return {
                getter: (_: string) => Promise.resolve({}),
                render: undefined,
                i18nKey: "",
            };
    }
}

interface IProps {
    label: string;
    value: string;
}

export default function SubscriptionInstanceValue({ label, value }: IProps) {
    const [collapsed, setCollapsed] = useState(true);
    const [data, setData] = useState<any | null | undefined>(undefined);

    const { organisations, products, apiClient, customApiClient } = useContext(ApplicationContext);
    const { render, i18nKey, getter } = getExternalTypeData(label, apiClient, customApiClient);

    const isSubscriptionValue = label.endsWith("subscription_id");
    const isExternalLinkValue = !!render;
    const isDeleted = isExternalLinkValue && data === null;

    useEffect(() => {
        if (data === undefined && !collapsed && isExternalLinkValue) {
            getter(value)
                .catch((err) => Promise.resolve(null))
                .then((data) => {
                    if (data && isSubscriptionValue) {
                        data.product_id = data.product.product_id;
                        enrichSubscription(data as SubscriptionModel, organisations, products);
                    }
                    setData(data);
                });
        }
    }, [data, collapsed, isSubscriptionValue, isExternalLinkValue, getter, value, organisations, products]);

    return (
        <SubscriptionInstanceValueRow
            label={label}
            value={value}
            isSubscriptionValue={isSubscriptionValue}
            isDeleted={isDeleted}
            isExternalLinkValue={isExternalLinkValue}
            toggleCollapsed={() => setCollapsed(!collapsed)}
            type={i18nKey}
        >
            {!!data && !collapsed && !!render && render(data)}
        </SubscriptionInstanceValueRow>
    );
}
