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
import { ENV } from "env";
import I18n from "i18n-js";
import { User } from "oidc-client";

import mySpinner from "../lib/Spin";
import { setFlash } from "../utils/Flash";
import {
    CodedWorkflow,
    ContactPerson,
    EngineStatus,
    FixedInputConfiguration,
    FixedInputValidation,
    IMSNode,
    IMSPort,
    IMSService,
    IpBlock,
    IpPrefix,
    IpPrefixSubscription,
    Organization,
    Process,
    ProcessSubscription,
    Product,
    ProductBlock,
    ProductValidation,
    ResourceType,
    ServicePortSubscription,
    Subscription,
    SubscriptionModel,
    Workflow,
    WorkflowReasons,
    WorkflowWithProductTags
} from "../utils/types";
import { isEmpty } from "../utils/Utils";
import { absent, child_subscriptions, ims_port_id } from "../validations/Subscriptions";

const apiPath = ENV.BACKEND_URL + "/api/";

let user: User | null;

function apiUrl(path: string) {
    return apiPath + path;
}

let started = 0;
let ended = 0;

class ResponseError extends Error {
    response: Response;

    constructor(response: Response) {
        super(response.statusText);
        this.response = response;
    }
}

function validateResponse(showErrorDialog: boolean) {
    return (res: Response) => {
        ++ended;
        if (started <= ended) {
            mySpinner.stop();
        }
        if (!res.ok) {
            started = ended = 0;
            mySpinner.stop();

            if (res.type === "opaqueredirect") {
                setTimeout(() => window.location.reload(true), 100);
                return res;
            }
            const error = new ResponseError(res);

            if (showErrorDialog) {
                setTimeout(() => {
                    throw error;
                }, 250);
            }
            throw error;
        }
        return res;
    };
}

function validFetch(path: string, options: {}, headers = {}, showErrorDialog = true) {
    const contentHeaders = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: getAuthorizationHeaderValue(),
        ...headers
    };
    const fetchOptions: RequestInit = Object.assign({}, { headers: contentHeaders }, options, {
        credentials: "same-origin" as "include" | "omit" | "same-origin",
        redirect: "manual" as "manual" | "error" | "follow"
    });
    mySpinner.start();
    ++started;

    const targetUrl = apiUrl(path);
    return fetch(targetUrl, fetchOptions).then(validateResponse(showErrorDialog));
}

export function catchErrorStatus<T>(promise: Promise<any>, status: number, callback: (json: T) => void) {
    return promise.catch(err => {
        if (err.response && err.response.status === status) {
            err.response.json().then((json: T) => {
                callback(json);
            });
        } else {
            throw err;
        }
    });
}

function fetchJson<R = {}>(
    path: string,
    options = {},
    headers = {},
    showErrorDialog = true,
    result = true
): Promise<R> {
    return validFetch(path, options, headers, showErrorDialog).then(res => (result ? res.json() : null));
}

function fetchJsonWithCustomErrorHandling<R = {}>(path: string): Promise<R> {
    return fetchJson<R>(path, {}, {}, false, true);
}

function postPutJson<R = {}>(
    path: string,
    body: {},
    method: string,
    showErrorDialog = true,
    result = true
): Promise<R> {
    return fetchJson<R>(path, { method: method, body: JSON.stringify(body) }, {}, showErrorDialog, result);
}

//API metadata
export function products(): Promise<Product[]> {
    return fetchJson("products");
}

export function productTags(): Promise<string[]> {
    return fetchJson("products/tags/all");
}

export function productTypes(): Promise<string[]> {
    return fetchJson("products/types/all");
}

export function productStatuses(): Promise<string[]> {
    return fetchJson("products/statuses/all");
}

export function productById(productId: string): Promise<Product> {
    return fetchJson(`products/${productId}`);
}

export function saveProduct(product: Product) {
    return postPutJson("products", product, isEmpty(product.product_id) ? "post" : "put", true, false);
}

export function deleteProduct(id: string): Promise<null> {
    return fetchJson(`products/${id}`, { method: "DELETE" }, {}, false, false);
}

export function productBlocks(): Promise<ProductBlock[]> {
    return fetchJson("product_blocks");
}

export function productBlockById(id: string): Promise<ProductBlock> {
    return fetchJson(`product_blocks/${id}`);
}

export function saveProductBlock(productBlock: ProductBlock) {
    return postPutJson(
        "product_blocks",
        productBlock,
        isEmpty(productBlock.product_block_id) ? "post" : "put",
        true,
        false
    );
}

export function deleteProductBlock(id: string) {
    return fetchJson(`product_blocks/${id}`, { method: "DELETE" }, {}, false, false);
}

export function resourceTypes(): Promise<ResourceType[]> {
    return fetchJson("resource_types");
}

export function resourceType(id: string) {
    return fetchJson(`resource_types/${id}`);
}

export function saveResourceType(resourceType: ResourceType) {
    return postPutJson(
        "resource_types",
        resourceType,
        isEmpty(resourceType.resource_type_id) ? "post" : "put",
        true,
        false
    );
}

export function deleteResourceType(id: string) {
    return fetchJson(`resource_types/${id}`, { method: "DELETE" }, {}, false, false);
}

//API
export function allSubscriptions(): Promise<Subscription[]> {
    return fetchJson(`v2/subscriptions/all`);
}

export function paginatedSubscriptions(
    range = "0,24",
    sort = "start_date,desc",
    filter: string
): Promise<Subscription[]> {
    return fetchJson(`v2/subscriptions?range=${range}&sort=${sort}&filter=${filter}`);
}

export function subscriptionsDetail(subscription_id: string): Promise<Subscription> {
    return fetchJsonWithCustomErrorHandling<Subscription>(`subscriptions/${subscription_id}`);
}

export function subscriptionsDetailWithModel(subscription_id: string): Promise<SubscriptionModel> {
    return fetchJsonWithCustomErrorHandling<Subscription>(`subscriptions/domain-model/${subscription_id}`);
}

export function subscriptionsByTags(tagList: string[], statusList: string[] = []) {
    return fetchJson(
        `subscriptions/tag/${encodeURIComponent(tagList.join(","))}/${encodeURIComponent(statusList.join(","))}`
    );
}

export function nodeSubscriptions(statusList: string[] = []): Promise<Subscription[]> {
    return subscriptions(["Node"], statusList);
}

export function portSubscriptions(
    tagList: string[] = [],
    statusList: string[] = [],
    productList: string[] = []
): Promise<ServicePortSubscription[]> {
    const statusFilter = `statuses,${encodeURIComponent(statusList.join("-"))}`;
    const tagsFilter = `tags,${encodeURIComponent(tagList.join("-"))}`;
    const productsFilter = `products,${encodeURIComponent(productList.join("-"))}`;

    const params = new URLSearchParams();
    const filters = [];
    if (tagList.length) filters.push(tagsFilter);
    if (statusList.length) filters.push(statusFilter);
    if (productList.length) filters.push(productsFilter);

    if (filters.length) params.set("filter", filters.join(","));

    return fetchJson(`v2/subscriptions/ports${filters.length ? "?" : ""}${params.toString()}`);
}

export function subscriptions(
    tagList: string[] = [],
    statusList: string[] = [],
    productList: string[] = []
): Promise<Subscription[]> {
    const statusFilter = `statuses,${encodeURIComponent(statusList.join("-"))}`;
    const tagsFilter = `tags,${encodeURIComponent(tagList.join("-"))}`;
    const productsFilter = `products,${encodeURIComponent(productList.join("-"))}`;

    const params = new URLSearchParams();
    const filters = [];
    if (tagList.length) filters.push(tagsFilter);
    if (statusList.length) filters.push(statusFilter);
    if (productList.length) filters.push(productsFilter);

    if (filters.length) params.set("filter", filters.join(","));

    return fetchJson(`v2/subscriptions${filters.length ? "?" : ""}${params.toString()}`);
}

export function subscriptionsByProductType(type: string) {
    return fetchJson(`subscriptions/product_type/${type}`);
}

export function subscriptionWorkflows(subscription_id: string): Promise<WorkflowReasons> {
    return fetchJson(`v2/subscriptions/workflows/${subscription_id}`);
}

export function subscriptionsByProductId(productId: string): Promise<Subscription[]> {
    return fetchJson(`subscriptions/product/${productId}`);
}

export function organisations(): Promise<Organization[] | undefined> {
    //@ts-ignore
    return fetchJson("crm/organisations", {}, {}, false).catch(() => {
        setTimeout(() => {
            setFlash(
                I18n.t("external.errors.crm_unavailable", {
                    type: "Organisations"
                }),
                "error"
            );
        });
        return undefined;
    });
}

export function getNodesByLocationAndStatus(locationCode: string, status: string): Promise<IMSNode[]> {
    return fetchJson(`ims/nodes/${locationCode}/${status}`);
}

export function getFreePortsByNodeIdAndInterfaceType(
    nodeId: number,
    interfaceType: string,
    status: string,
    mode: string
): Promise<IMSPort[]> {
    return fetchJson(`ims/free_ports/${nodeId}/${interfaceType}/${status}/${mode}`);
}

export function freePortsForLocationCodeAndInterfaceType(locationCode: string, interfaceType: string) {
    return fetchJson(`ims/free_ports/${locationCode}/${interfaceType}`);
}

export function freeCorelinkPortsForNodeIdAndInterfaceType(nodeId: string, interfaceType: number): Promise<IMSPort[]> {
    return fetchJson(`ims/free_corelink_ports/${nodeId}/${interfaceType}`);
}

export function nodesForLocationCode(locationCode: string) {
    return fetchJson(`ims/nodes/${locationCode}`);
}

export function usedVlans(subscriptionId: string): Promise<number[][]> {
    return fetchJsonWithCustomErrorHandling(`ims/vlans/${subscriptionId}`);
}

export function portByImsPortId(portId: number) {
    return fetchJson(`ims/port_by_ims_port/${portId}`);
}

export function internalPortByImsPortId(portId: number) {
    return fetchJson(`ims/internal_port_by_ims_port/${portId}`);
}

export function portByImsServiceId(serviceId: number): Promise<IMSPort> {
    return fetchJson(`ims/port_by_ims_service/${serviceId}`);
}

export function serviceByImsServiceId(serviceId: number): Promise<IMSService> {
    return fetchJson(`ims/service_by_ims_service_id/${serviceId}`);
}

export function parentSubscriptions(childSubscriptionId: string): Promise<Subscription[]> {
    return fetchJson(`subscriptions/parent_subscriptions/${childSubscriptionId}`);
}

export function childSubscriptions(parentSubscriptionId: string) {
    return fetchJson(`subscriptions/child_subscriptions/${parentSubscriptionId}`).then(json => {
        return { type: child_subscriptions, json: json };
    });
}

export function getResourceTypeInfo(type: string, identifier: string) {
    let promise;
    switch (type) {
        case ims_port_id:
            promise = fetchJsonWithCustomErrorHandling(`ims/service_by_ims_port/${identifier}`);
            break;
        case "ims_circuit_id":
        case "ims_corelink_trunk_id":
            promise = fetchJsonWithCustomErrorHandling(`ims/service_by_ims_service_id/${identifier}`);
            break;
        case "node_subscription_id":
        case "port_subscription_id":
        case "ip_prefix_subscription_id":
        case "internetpinnen_prefix_subscription_id":
        case "parent_ip_prefix_subscription_id":
            promise = subscriptionsDetail(identifier);
            break;
        case "ptp_ipv4_ipam_id":
        case "ptp_ipv6_ipam_id":
        case "ipam_prefix_id":
            promise = fetchJsonWithCustomErrorHandling(`ipam/prefix_by_id/${identifier}`);
            break;
        case "node_ipv4_ipam_id":
        case "node_ipv6_ipam_id":
        case "corelink_ipv4_ipam_id":
        case "corelink_ipv6_ipam_id":
            promise = fetchJsonWithCustomErrorHandling(`ipam/address_by_id/${identifier}`);
            break;
        default:
            promise = Promise.resolve({});
    }
    return (
        promise
            // IMS service is recorded in subscription_instance_value but removed from IMS - prevent error
            .then(json => ({ type: type, json: json }))
            .catch(err =>
                Promise.resolve({
                    type: absent,
                    requestedType: type,
                    identifier: identifier
                })
            )
    );
}

export function processSubscriptionsBySubscriptionId(subscriptionId: string) {
    return fetchJsonWithCustomErrorHandling(
        `processes/process-subscriptions-by-subscription-id/${subscriptionId}`
    ).catch(err => Promise.resolve({}));
}

export function processSubscriptionsByProcessId(processId: string): Promise<ProcessSubscription[]> {
    return fetchJsonWithCustomErrorHandling<ProcessSubscription[]>(
        `processes/process-subscriptions-by-pid/${processId}`
    ).catch(err => []);
}

export function locationCodes(): Promise<string[] | undefined> {
    // @ts-ignore
    return fetchJson("crm/location_codes", {}, {}, false).catch(() => {
        setTimeout(() => {
            setFlash(
                I18n.t("external.errors.crm_unavailable", {
                    type: "Locations"
                }),
                "error"
            );
        });
        return undefined;
    });
}

export function assignees(): Promise<string[]> {
    return fetchJson("v2/processes/assignees");
}

export function processStatuses(): Promise<string[]> {
    return fetchJson("v2/processes/statuses");
}

export function allWorkflows(): Promise<Workflow[]> {
    return fetchJson("workflows");
}

export function allWorkflowCodeImplementations(): Promise<CodedWorkflow[]> {
    return fetchJson("workflows/coded_workflows");
}

export function allWorkflowsWithProductTags(): Promise<WorkflowWithProductTags[]> {
    return fetchJson("workflows/with_product_tags");
}

export function workflowsByTarget(target: string): Promise<Workflow[]> {
    return fetchJson(`workflows?target=${target}`);
}

export function invalidSubscriptions(workflowKey: string): Promise<Subscription[]> {
    return fetchJson(`subscriptions/invalid_subscriptions/${workflowKey}`);
}

export function fetchPortSpeedBySubscription(subscriptionId: string): Promise<string> {
    return fetchJson(`fixed_inputs/port_speed_by_subscription_id/${subscriptionId}`);
}

export function fetchServiceSpeedByProduct(productId: string) {
    return fetchJson(`fixed_inputs/service_speed_by_product_id/${productId}`);
}

export function deleteSubscription(subscriptionId: string) {
    return fetchJson(`subscriptions/${subscriptionId}`, { method: "DELETE" }, {}, true, false);
}

//IPAM IP Prefixes
export function ip_blocks(parentPrefix: number): Promise<IpBlock[]> {
    return fetchJson("ipam/ip_blocks/" + parentPrefix);
}

//IPAM the user-defined filters as configured in the database for the IP PREFIX product
export function prefix_filters(): Promise<IpPrefix[]> {
    return fetchJson("ipam/prefix_filters");
}

export function prefixSubscriptionsByRootPrefix(parentId: number): Promise<IpPrefixSubscription[]> {
    return fetchJson(`ipam/prefix_subscriptions/${parentId}`);
}

export function prefixSubscriptions() {
    return fetchJson(`ipam/prefix_subscriptions/`);
}

export function prefixById(prefixId: number) {
    return fetchJsonWithCustomErrorHandling(`ipam/prefix_by_id/${prefixId}`);
}

export function freeSubnets(supernet: string): Promise<string[]> {
    return fetchJson(`ipam/free_subnets/${supernet}`);
}

export function subnets(subnet: string, netmask: number, prefixlen: number) {
    return fetchJson("ipam/subnets/" + subnet + "/" + netmask + "/" + prefixlen);
}

export function free_subnets(subnet: string, netmask: number, prefixlen: number): Promise<string[]> {
    return fetchJson("ipam/free_subnets/" + subnet + "/" + netmask + "/" + prefixlen);
}

export function deleteProcess(processId: string) {
    return fetchJson(`processes/${processId}`, { method: "DELETE" }, {}, true, false);
}

export function abortProcess(processId: string) {
    return fetchJson(`processes/${processId}/abort`, { method: "PUT" }, {}, true, false);
}

export function process(processId: string): Promise<Process> {
    return fetchJsonWithCustomErrorHandling("processes/" + processId);
}

export function startProcess(workflow_name: string, process: {}[]): Promise<{ id: string }> {
    return postPutJson("processes/" + workflow_name, process, "post", false, true);
}

export function resumeProcess(processId: string, userInput: {}[]) {
    return postPutJson(`processes/${processId}/resume`, userInput, "put", false, false);
}

export function retryProcess(processId: string) {
    return postPutJson(`processes/${processId}/resume`, {}, "put", true, false);
}

export function fixedInputConfiguration(): Promise<FixedInputConfiguration> {
    return fetchJson("fixed_inputs/configuration");
}

export function validations(): Promise<ProductValidation[]> {
    return fetchJson("products/validations");
}

export function fixedInputValidations(): Promise<FixedInputValidation[]> {
    return fetchJson("fixed_inputs/validations");
}

export function validation(productId: string): Promise<ProductValidation> {
    return fetchJson(`products/${productId}/validate`);
}

export function contacts(organisationId: string): Promise<ContactPerson[]> {
    return fetchJson<ContactPerson[]>(`crm/contacts/${organisationId}`, {}, {}, false, true).catch(err =>
        Promise.resolve([])
    );
}

export function reportError(error: {}) {
    return postPutJson("user/error", error, "post", false);
}

export function clearCache(name: string) {
    return postPutJson(`v2/settings/cache/${name}`, {}, "delete", true, false);
}

export function getGlobalStatus(): Promise<EngineStatus> {
    return fetchJson("v2/settings/status", {}, {}, false, true);
}

export function setGlobalStatus(new_global_lock: boolean) {
    return postPutJson("v2/settings/status", { global_lock: new_global_lock }, "put");
}

export function logUserInfo(username: string, message: string) {
    return postPutJson(`user/log/${username}`, { message: message }, "post", true, false);
}

export function ping() {
    return fetchJson("user/ping");
}

export function dienstafnameBySubscription(subscriptionId: string) {
    return fetchJson(`v2/crm/dienstafname/${subscriptionId}`, {}, {}, false).catch(err => Promise.resolve(undefined));
}

export function setUser(_user: User | null) {
    user = _user;
}

export function getAuthorizationHeaderValue(): string {
    if (!user) {
        return "";
    }

    return `${user.token_type} ${user.access_token}`;
}
