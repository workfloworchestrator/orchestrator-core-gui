import { BaseApiClient } from "api";
import { intl } from "locale/i18n";
import { setFlash } from "utils/Flash";
import {
    ContactPerson,
    Dienstafname,
    IMSNode,
    IMSPort,
    IMSService,
    IpBlock,
    IpPrefix,
    IpPrefixSubscription,
    Organization,
    ServicePortFilterItem,
    ServicePortSubscription,
} from "utils/types";

abstract class CustomApiClientInterface extends BaseApiClient {
    abstract portSubscriptions: (
        tagList?: string[],
        statusList?: string[],
        productList?: string[]
    ) => Promise<ServicePortSubscription[]>;
    abstract organisations: () => Promise<Organization[] | undefined>;
    abstract getPortSubscriptionsForNode: (id: string) => Promise<ServicePortFilterItem[]>;
    abstract getNodesByLocationAndStatus: (
        locationCode: string,
        status: string,
        unsubscribedOnly: boolean
    ) => Promise<IMSNode[]>;
    abstract getFreePortsByNodeSubscriptionIdAndSpeed: (
        nodeSubscriptionId: string,
        interfaceSpeed: number,
        mode: string
    ) => Promise<IMSPort[]>;
    abstract usedVlans: (subscriptionId: string) => Promise<number[][]>;
    abstract portByImsPortId: (portId: number) => Promise<any>;
    abstract internalPortByImsPortId: (portId: number) => Promise<any>;
    abstract portByImsServiceId: (serviceId: number) => Promise<IMSPort>;
    abstract serviceByImsServiceId: (serviceId: number) => Promise<IMSService>;
    abstract locationCodes: () => Promise<string[] | undefined>;
    abstract ip_blocks: (parentPrefix: number) => Promise<IpBlock[]>;
    abstract prefix_filters: () => Promise<IpPrefix[]>;
    abstract prefixSubscriptionsByRootPrefix: (parentId: number) => Promise<IpPrefixSubscription[]>;
    abstract prefixSubscriptions: () => Promise<IpPrefixSubscription[]>;
    abstract prefixById: (prefixId: number) => Promise<IpPrefix>;
    abstract addressById: (addressId: number) => Promise<any>;
    abstract freeSubnets: (supernet: string) => Promise<string[]>;
    abstract subnets: (subnet: string, netmask: number, prefixlen: number) => Promise<any>;
    abstract free_subnets: (subnet: string, netmask: number, prefixlen: number) => Promise<string[]>;
    abstract contacts: (organisationId: string) => Promise<ContactPerson[]>;
    abstract dienstafnameBySubscription: (subscriptionId: string) => Promise<Dienstafname | undefined>;
}

export class CustomApiClient extends CustomApiClientInterface {
    portSubscriptions = (
        tagList: string[] = [],
        statusList: string[] = [],
        productList: string[] = []
    ): Promise<ServicePortSubscription[]> => {
        const statusFilter = `statuses,${encodeURIComponent(statusList.join("-"))}`;
        const tagsFilter = `tags,${encodeURIComponent(tagList.join("-"))}`;
        const productsFilter = `products,${encodeURIComponent(productList.join("-"))}`;

        const params = new URLSearchParams();
        const filters = [];
        if (tagList.length) filters.push(tagsFilter);
        if (statusList.length) filters.push(statusFilter);
        if (productList.length) filters.push(productsFilter);

        if (filters.length) params.set("filter", filters.join(","));

        return this.fetchJson(`surf/subscriptions/ports${filters.length ? "?" : ""}${params.toString()}`);
    };

    organisations = (): Promise<Organization[] | undefined> => {
        //@ts-ignore
        return this.fetchJson("surf/crm/organisations", {}, {}, false).catch(() => {
            setTimeout(() => {
                setFlash(
                    intl.formatMessage({ id: "external.errors.crm_unavailable" }, { type: "Organisations" }),
                    "error"
                );
            });
            return undefined;
        });
    };

    getPortSubscriptionsForNode = (id: string): Promise<ServicePortFilterItem[]> => {
        return this.fetchJson(`surf/subscriptions/port-services-by-node/${id}`);
    };

    getNodesByLocationAndStatus = (
        locationCode: string,
        status: string,
        unsubscribedOnly: boolean = true
    ): Promise<IMSNode[]> => {
        return this.fetchJson(`surf/ims/nodes/${locationCode}/${status}?unsubscribed_only=${unsubscribedOnly}`);
    };

    getFreePortsByNodeSubscriptionIdAndSpeed = (
        nodeSubscriptionId: string,
        interfaceSpeed: number,
        mode: string
    ): Promise<IMSPort[]> => {
        return this.fetchJson(`surf/ims/free_ports/${nodeSubscriptionId}/${interfaceSpeed}/${mode}`);
    };

    usedVlans = (subscriptionId: string, nsiVlansOnly: boolean = false): Promise<number[][]> => {
        return this.fetchJsonWithCustomErrorHandling(
            `surf/subscriptions/vlans-by-service-port/${subscriptionId}?nsi_vlans_only=${nsiVlansOnly}`
        );
    };

    portByImsPortId = (portId: number) => {
        return this.fetchJson(`surf/ims/port_by_ims_port/${portId}`);
    };

    internalPortByImsPortId = (portId: number) => {
        return this.fetchJson(`surf/ims/internal_port_by_ims_port/${portId}`);
    };

    portByImsServiceId = (serviceId: number): Promise<IMSPort> => {
        return this.fetchJson(`surf/ims/port_by_ims_service/${serviceId}`);
    };

    serviceByImsServiceId = (serviceId: number): Promise<IMSService> => {
        return this.fetchJson<IMSService>(`surf/ims/service_by_ims_service_id/${serviceId}`);
    };

    nodeByImsNodeId = (nodeId: number): Promise<IMSNode> => {
        return this.fetchJson<IMSNode>(`surf/ims/node_by_id/${nodeId}`);
    };

    locationCodes = (): Promise<string[] | undefined> => {
        // @ts-ignore
        return this.fetchJson("surf/crm/location_codes", {}, {}, false).catch(() => {
            setTimeout(() => {
                setFlash(intl.formatMessage({ id: "external.errors.crm_unavailable" }, { type: "Locations" }), "error");
            });
            return undefined;
        });
    };

    ip_blocks = (parentPrefix: number): Promise<IpBlock[]> => {
        return this.fetchJson("surf/ipam/ip_blocks/" + parentPrefix);
    };

    prefix_filters = (): Promise<IpPrefix[]> => {
        return this.fetchJson("surf/ipam/prefix_filters");
    };

    prefixSubscriptionsByRootPrefix = (parentId: number): Promise<IpPrefixSubscription[]> => {
        return this.fetchJson(`surf/ipam/prefix_subscriptions/${parentId}`);
    };

    prefixSubscriptions = (): Promise<IpPrefixSubscription[]> => {
        return this.fetchJson(`surf/ipam/prefix_subscriptions/`);
    };

    prefixById = (prefixId: number): Promise<IpPrefix> => {
        return this.fetchJsonWithCustomErrorHandling(`surf/ipam/prefix_by_id/${prefixId}`);
    };

    addressById = (addressId: number) => {
        return this.fetchJsonWithCustomErrorHandling(`surf/ipam/address_by_id/${addressId}`);
    };

    freeSubnets = (supernet: string): Promise<string[]> => {
        return this.fetchJson(`surf/ipam/free_subnets/${supernet}`);
    };

    subnets = (subnet: string, netmask: number, prefixlen: number) => {
        return this.fetchJson("surf/ipam/subnets/" + subnet + "/" + netmask + "/" + prefixlen);
    };

    free_subnets = (subnet: string, netmask: number, prefixlen: number): Promise<string[]> => {
        return this.fetchJson("surf/ipam/free_subnets/" + subnet + "/" + netmask + "/" + prefixlen);
    };

    contacts = (organisationId: string): Promise<ContactPerson[]> => {
        return this.fetchJson<ContactPerson[]>(
            `surf/crm/contacts/${organisationId}`,
            {},
            {},
            false,
            true
        ).catch((err) => Promise.resolve([]));
    };

    dienstafnameBySubscription = (subscriptionId: string): Promise<Dienstafname | undefined> => {
        return this.fetchJson<Dienstafname>(`surf/crm/dienstafname/${subscriptionId}`, {}, {}, false).catch((err) =>
            Promise.resolve(undefined)
        );
    };
}
