/*
 * Copyright 2019 SURF.
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
import I18n from "i18n-js";

import mySpinner from "../lib/Spin";
import { isEmpty } from "../utils/Utils";
import { absent, child_subscriptions, ims_port_id, port_subscription_id } from "../validations/Subscriptions";
import {
    ProductBlock,
    ResourceType,
    AppConfig,
    IMSService,
    IMSPort,
    Subscription,
    ServicePortSubscription,
    Organization,
    User,
    Workflow,
    Process,
    ProcessSubscription,
    ProcessWithDetails,
    Product,
    WorkflowReasons,
    ProductValidation
} from "../utils/types";
import { setFlash } from "../utils/Flash";

// const apiPath = "https://orchestrator.dev.automation.surf.net/api/";
const apiPath = "/api/";

let configuration: AppConfig | null = null;

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
    const access_token = localStorage.getItem("access_token");
    const contentHeaders = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `bearer ${access_token}`,
        ...headers
    };
    const fetchOptions = Object.assign({}, { headers: contentHeaders }, options, {
        credentials: "same-origin",
        redirect: "manual"
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

export function productTags() {
    return fetchJson("products/tags/all");
}

export function productTypes() {
    return fetchJson("products/types/all");
}

export function productStatuses() {
    return fetchJson("products/statuses/all");
}

export function productById(productId: string): Promise<Product> {
    return fetchJson(`products/${productId}`);
}

export function saveProduct(product: Product) {
    return postPutJson("products", product, isEmpty(product.product_id) ? "post" : "put", true, false);
}

export function deleteProduct(id: string) {
    return fetchJson(`products/${id}`, { method: "DELETE" }, {}, false, false);
}

export function productBlocks() {
    return fetchJson("product_blocks");
}

export function productBlockById(id: string) {
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

export function resourceTypes() {
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

export function subscriptionsByTags(tagList: string[], statusList: string[] = []) {
    return fetchJson(
        `subscriptions/tag/${encodeURIComponent(tagList.join(","))}/${encodeURIComponent(statusList.join(","))}`
    );
}

export function nodeSubscriptions(statusList: string[] = []): Promise<Subscription[]> {
    const optionalStatusFilter = `&filter=statuses,${encodeURIComponent(statusList.join("-"))}`;
    return fetchJson(`v2/subscriptions?filter=tags,Node${statusList.length ? optionalStatusFilter : ""}`);
}

export function portSubscriptions(
    tagList: string[],
    statusList: string[] = [],
    node = null
): Promise<ServicePortSubscription[]> {
    const optionalStatusFilter = `&filter=statuses,${encodeURIComponent(statusList.join("-"))}`;
    return fetchJson(
        `v2/subscriptions/ports?filter=tags,${encodeURIComponent(tagList.join("-"))}${
            statusList.length ? optionalStatusFilter : ""
        }`
    );
}

export function subscriptionsByProductType(type: string) {
    return fetchJson(`subscriptions/product_type/${type}`);
}

export function subscriptionWorkflows(subscription_id: string): Promise<WorkflowReasons> {
    return fetchJson(`v2/subscriptions/workflows/${subscription_id}`);
}

export function subscriptionsByProductId(productId: string) {
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

export function ieeeInterfaceTypesForProductId(id: string) {
    return fetchJson(`products/ieee_interface_types/${id}`);
}

export function corelinkIEEEInterfaceTypes() {
    return fetchJson("products/corelink_ieee_interface_types");
}

export function getNodesByLocationAndStatus(locationCode: string, status: string) {
    return fetchJson(`ims/nodes/${locationCode}/${status}`);
}

export function getFreePortsByNodeIdAndInterfaceType(
    nodeId: number,
    interfaceType: string,
    status: string,
    mode: string
) {
    return fetchJson(`ims/free_ports/${nodeId}/${interfaceType}/${status}/${mode}`);
}

export function freePortsForLocationCodeAndInterfaceType(locationCode: string, interfaceType: string) {
    return fetchJson(`ims/free_ports/${locationCode}/${interfaceType}`);
}

export function freeCorelinkPortsForNodeIdAndInterfaceType(nodeId: number, interfaceType: string) {
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
        case "ip_prefix_subscription_id":
        case "internetpinnen_prefix_subscription_id":
        case "parent_ip_prefix_subscription_id":
        case port_subscription_id:
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

export function allWorkflows() {
    return fetchJson("workflows");
}

export function allWorkflowCodeImplementations() {
    return fetchJson("workflows/coded_workflows");
}

export function allWorkflowsWithProductTags() {
    return fetchJson("workflows/with_product_tags");
}

export function workflowsByTarget(target: string): Promise<Workflow[]> {
    return fetchJson(`workflows?target=${target}`);
}

export function invalidSubscriptions(workflowKey: string) {
    return fetchJson(`subscriptions/invalid_subscriptions/${workflowKey}`);
}

export function processes(showTasks = false): Promise<ProcessWithDetails[]> {
    return fetchJson(`processes?showTasks=${showTasks}`);
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
export function ip_blocks(parentPrefix: string) {
    return fetchJson("ipam/ip_blocks/" + parentPrefix);
}

//IPAM the user-defined filters as configured in the database for the IP PREFIX product
export function prefix_filters() {
    return fetchJson("ipam/prefix_filters");
}

export function prefixSubscriptionsByRootPrefix(parentId: string) {
    return fetchJson(`ipam/prefix_subscriptions/${parentId}`);
}

export function prefixSubscriptions() {
    return fetchJson(`ipam/prefix_subscriptions/`);
}

export function prefixById(prefixId: number) {
    return fetchJsonWithCustomErrorHandling(`ipam/prefix_by_id/${prefixId}`);
}

export function freeSubnets(supernet: string) {
    return fetchJson(`ipam/free_subnets/${supernet}`);
}

export function subnets(subnet: string, netmask: number, prefixlen: number) {
    return fetchJson("ipam/subnets/" + subnet + "/" + netmask + "/" + prefixlen);
}

export function free_subnets(subnet: string, netmask: number, prefixlen: number) {
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

export function fixedInputConfiguration() {
    return fetchJson("fixed_inputs/configuration");
}

export function validations() {
    return fetchJson("products/validations");
}

export function fixedInputValidations() {
    return fetchJson("fixed_inputs/validations");
}

export function validation(productId: string): Promise<ProductValidation> {
    return fetchJson(`products/${productId}/validate`);
}

export function transitions(subscriptionId: string, transitionType: string) {
    return fetchJson(`products/transitions/${subscriptionId}/${transitionType}`);
}

export function contacts(organisationId: string) {
    return fetchJson(`crm/contacts/${organisationId}`, {}, {}, false, true).catch(err => Promise.resolve([]));
}

export function reportError(error: {}) {
    return postPutJson("user/error", error, "post", false);
}

export function clearCache(name: string) {
    return postPutJson("user/clearCache", { name: name }, "put", true, false);
}

export function logUserInfo(username: string, message: string) {
    return postPutJson(`user/log/${username}`, { message: message }, "post", true, false);
}

export function ping() {
    return fetchJson("user/ping");
}

export function me(): Promise<User> {
    return fetchJson("user/me", {}, {}, false);
}

export function config(): Promise<AppConfig> {
    return !configuration
        ? fetchJson<AppConfig>("user/config").then((conf: AppConfig) => {
              configuration = conf;
              return conf;
          })
        : Promise.resolve(configuration);
}

export function redirectToAuthorizationServer() {
    const re = /http[s]?:\/\/?[^/\s]+\/(.*)/;
    const res = re.exec(window.location.href);
    const state = res ? "/" + res[1] : "/";
    config().then((conf: AppConfig) => {
        window.location.replace(
            `${conf.oauthAuthorizeUrl}?response_type=token&client_id=${conf.clientId}` +
                `&scope=${conf.scope.join("+")}&redirect_uri=${conf.redirectUri}&state=${btoa(state)}`
        );
    });
}

export function dienstafnameBySubscription(subscriptionId: string) {
    return fetchJson(`v2/crm/dienstafname/${subscriptionId}`, {}, {}, false).catch(err => Promise.resolve(undefined));
}
