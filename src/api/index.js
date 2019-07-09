import mySpinner from "../lib/Spin";
import { isEmpty } from "../utils/Utils";
import {
    absent,
    child_subscriptions,
    ims_circuit_id,
    ims_port_id,
    parent_subscriptions,
    port_subscription_id
} from "../validations/Subscriptions";

// const apiPath = "https://orchestrator.dev.automation.surf.net/api/";
const apiPath = "/api/";

let configuration = {};

function apiUrl(path) {
    return apiPath + path;
}

let started = 0;
let ended = 0;

function validateResponse(showErrorDialog) {
    return res => {
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
            const error = new Error(res.statusText);
            error.response = res;

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

function validFetch(path, options, headers = {}, showErrorDialog = true) {
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

function fetchJson(path, options = {}, headers = {}, showErrorDialog = true, result = true) {
    return validFetch(path, options, headers, showErrorDialog).then(res => (result ? res.json() : {}));
}

function fetchJsonWithCustomErrorHandling(path) {
    return fetchJson(path, {}, {}, false, true);
}

function postPutJson(path, body, method, showErrorDialog = true, result = true) {
    return fetchJson(path, { method: method, body: JSON.stringify(body) }, {}, showErrorDialog, result);
}

//API metadata
export function products() {
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

export function productById(productId) {
    return fetchJson(`products/${productId}`);
}

export function saveProduct(product) {
    return postPutJson("products", product, isEmpty(product.product_id) ? "post" : "put", true, false);
}

export function deleteProduct(id) {
    return fetchJson(`products/${id}`, { method: "DELETE" }, {}, false, false);
}

export function productBlocks() {
    return fetchJson("product_blocks");
}

export function productBlockById(id) {
    return fetchJson(`product_blocks/${id}`);
}

export function saveProductBlock(productBlock) {
    return postPutJson(
        "product_blocks",
        productBlock,
        isEmpty(productBlock.product_block_id) ? "post" : "put",
        true,
        false
    );
}

export function deleteProductBlock(id) {
    return fetchJson(`product_blocks/${id}`, { method: "DELETE" }, {}, false, false);
}

export function resourceTypes() {
    return fetchJson("resource_types");
}

export function resourceType(id) {
    return fetchJson(`resource_types/${id}`);
}

export function saveResourceType(resourceType) {
    return postPutJson(
        "resource_types",
        resourceType,
        isEmpty(resourceType.resource_type_id) ? "post" : "put",
        true,
        false
    );
}

export function deleteResourceType(id) {
    return fetchJson(`resource_types/${id}`, { method: "DELETE" }, {}, false, false);
}

//API
export function allSubscriptions() {
    return fetchJson(`v2/subscriptions/all`);
}

export function paginatedSubscriptions(range = "0,24", sort = ["start_date", "desc"], filter) {
    return fetchJson(`v2/subscriptions?range=${range}&sort=${sort}&filter=${filter}`);
}

export function subscriptionsDetail(subscription_id) {
    return fetchJsonWithCustomErrorHandling(`subscriptions/${subscription_id}`);
}

export function subscriptionsByTags(tagList, statusList = []) {
    return fetchJson(
        `subscriptions/tag/${encodeURIComponent(tagList.join(","))}/${encodeURIComponent(statusList.join(","))}`
    );
}

export function nodeSubscriptions(statusList = []) {
    const optionalStatusFilter = `&filter=statuses,${encodeURIComponent(statusList.join("-"))}`;
    return fetchJson(`v2/subscriptions?filter=product.tag,Node${statusList.length ? optionalStatusFilter : ""}`);
}

export function portSubscriptions(tagList, statusList = []) {
    const optionalStatusFilter = `&filter=statuses,${encodeURIComponent(statusList.join("-"))}`;
    return fetchJson(
        `v2/subscriptions/ports?filter=tags,${encodeURIComponent(tagList.join("-"))}${
            statusList.length ? optionalStatusFilter : ""
        }`
    );
}

export function subscriptionsByProductType(type) {
    return fetchJson(`subscriptions/product_type/${type}`);
}

export function subscriptionWorkflows(subscription_id) {
    return fetchJson(`v2/subscriptions/workflows/${subscription_id}`);
}

export function subscriptionsByProductId(productId) {
    return fetchJson(`subscriptions/product/${productId}`);
}

export function organisations() {
    return fetchJson("crm/organisations");
}

export function ieeeInterfaceTypesForProductId(id) {
    return fetchJson(`products/ieee_interface_types/${id}`);
}

export function corelinkIEEEInterfaceTypes() {
    return fetchJson("products/corelink_ieee_interface_types");
}

export function getNodeByLocationAndStatus(locationCode, status) {
    return fetchJson(`ims/nodes/${locationCode}/${status}`);
}

export function getFreePortsByNodeIdAndInterfaceType(nodeId, interfaceType, status, mode) {
    return fetchJson(`ims/free_ports/${nodeId}/${interfaceType}/${status}/${mode}`);
}

export function freePortsForLocationCodeAndInterfaceType(locationCode, interfaceType) {
    return fetchJson(`ims/free_ports/${locationCode}/${interfaceType}`);
}

export function freeCorelinkPortsForNodeIdAndInterfaceType(nodeId, interfaceType) {
    return fetchJson(`ims/free_corelink_ports/${nodeId}/${interfaceType}`);
}

export function nodesForLocationCode(locationCode) {
    return fetchJson(`ims/nodes/${locationCode}`);
}

export function usedVlans(subscriptionId) {
    return fetchJsonWithCustomErrorHandling(`ims/vlans/${subscriptionId}`);
}

export function portByImsPortId(portId) {
    return fetchJson(`ims/port_by_ims_port/${portId}`);
}

export function internalPortByImsPortId(portId) {
    return fetchJson(`ims/internal_port_by_ims_port/${portId}`);
}

export function portByImsServiceId(serviceId) {
    return fetchJson(`ims/port_by_ims_service/${serviceId}`);
}

export function serviceByImsServiceId(serviceId) {
    return fetchJson(`ims/service_by_ims_service_id/${serviceId}`);
}

export function parentSubscriptions(childSubscriptionId) {
    return fetchJson(`subscriptions/parent_subscriptions/${childSubscriptionId}`).then(json => {
        return { type: parent_subscriptions, json: json };
    });
}

export function childSubscriptions(parentSubscriptionId) {
    return fetchJson(`subscriptions/child_subscriptions/${parentSubscriptionId}`).then(json => {
        return { type: child_subscriptions, json: json };
    });
}

export function getResourceTypeInfo(type, identifier) {
    let promise;
    switch (type) {
        case ims_port_id:
            promise = fetchJsonWithCustomErrorHandling(`ims/service_by_ims_port/${identifier}`);
            break;
        case ims_circuit_id:
            promise = fetchJsonWithCustomErrorHandling(`ims/service_by_ims_service_id/${identifier}`);
            break;
        case "ip_prefix_subscription_id":
        case "internetpinnen_prefix_subscription_id":
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

export function processSubscriptionsBySubscriptionId(subscriptionId) {
    return fetchJsonWithCustomErrorHandling(
        `processes/process-subscriptions-by-subscription-id/${subscriptionId}`
    ).catch(err => Promise.resolve({}));
}

export function processSubscriptionsByProcessId(processId) {
    return fetchJsonWithCustomErrorHandling(`processes/process-subscriptions-by-pid/${processId}`).catch(err =>
        Promise.resolve({})
    );
}

export function locationCodes() {
    return fetchJson("crm/location_codes");
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

export function workflowsByTarget(target) {
    return fetchJson(`workflows?target=${target}`);
}

export function invalidSubscriptions(workflowKey) {
    return fetchJson(`subscriptions/invalid_subscriptions/${workflowKey}`);
}

export function initialWorkflowInput(workflowKey, productId) {
    return productId ? fetchJson(`workflows/${workflowKey}/${productId}`) : fetchJson(`workflows/${workflowKey}`);
}

export function processes() {
    return fetchJson("processes");
}

export function fetchPortSpeedBySubscription(subscriptionId) {
    return fetchJson(`fixed_inputs/port_speed_by_subscription_id/${subscriptionId}`);
}

export function fetchServiceSpeedByProduct(productId) {
    return fetchJson(`fixed_inputs/service_speed_by_product_id/${productId}`);
}

export function deleteSubscription(subscriptionId) {
    return fetchJson(`subscriptions/${subscriptionId}`, { method: "DELETE" }, {}, true, false);
}

export function terminateSubscription(process) {
    return postPutJson("processes/terminate-subscription", process, "post", false, false);
}

export function startModificationSubscription(subscriptionId, workflow_name, product = null) {
    const body = { subscription_id: subscriptionId };
    if (!isEmpty(product)) {
        body.product = product;
    }
    return postPutJson(`processes/modify-subscription/${workflow_name}`, body, "post", false, false);
}

//IPAM IP Prefixes
export function ip_blocks(parentPrefix) {
    return fetchJson("ipam/ip_blocks/" + parentPrefix);
}

//IPAM the user-defined filters as configured in the database for the IP PREFIX product
export function prefix_filters() {
    return fetchJson("ipam/prefix_filters");
}

export function prefixSubscriptionsByRootPrefix(parentId) {
    return fetchJson(`ipam/prefix_subscriptions/${parentId}`);
}

export function prefixSubscriptions() {
    return fetchJson(`ipam/prefix_subscriptions/`);
}

export function prefixById(prefixId) {
    return fetchJsonWithCustomErrorHandling(`ipam/prefix_by_id/${prefixId}`);
}

export function freeSubnets(supernet) {
    return fetchJson(`ipam/free_subnets/${supernet}`);
}

export function subnets(subnet, netmask, prefixlen) {
    return fetchJson("ipam/subnets/" + subnet + "/" + netmask + "/" + prefixlen);
}

export function free_subnets(subnet, netmask, prefixlen) {
    return fetchJson("ipam/free_subnets/" + subnet + "/" + netmask + "/" + prefixlen);
}

export function deleteProcess(processId) {
    return fetchJson(`processes/${processId}`, { method: "DELETE" }, {}, true, false);
}

export function abortProcess(processId) {
    return fetchJson(`processes/${processId}/abort`, { method: "PUT" }, {}, true, false);
}

export function process(processId) {
    return fetchJsonWithCustomErrorHandling("processes/" + processId);
}

export function startProcess(process) {
    return postPutJson("processes", process, "post", false, false);
}

export function resumeProcess(processId, userInput) {
    userInput = userInput.reduce((acc, input) => {
        acc[input.name] = input.value;
        return acc;
    }, {});

    return postPutJson(`processes/${processId}/resume`, userInput, "put", false, false);
}

export function retryProcess(processId) {
    return postPutJson(`processes/${processId}/resume`, {}, "put", true, false);
}

export function tasks() {
    return fetchJson("tasks");
}

export function fixedInputConfiguration() {
    return fetchJson("fixed_inputs/configuration");
}

export function task(taskId) {
    return fetchJsonWithCustomErrorHandling("tasks/" + taskId);
}

export function resumeAll() {
    return fetchJsonWithCustomErrorHandling("tasks/resumeall");
}

export function startTask(task) {
    return postPutJson("tasks", task, "post", false, false);
}

export function resumeTask(taskId, userInput) {
    userInput = userInput.reduce((acc, input) => {
        acc[input.name] = input.value;
        return acc;
    }, {});

    return postPutJson(`tasks/${taskId}/resume`, userInput, "put", false, false);
}

export function retryTask(taskId) {
    return postPutJson(`tasks/${taskId}/resume`, {}, "put", true, false);
}

export function deleteTask(taskId) {
    return fetchJson(`tasks/${taskId}`, { method: "DELETE" }, {}, true, false);
}

export function abortTask(taskId) {
    return fetchJson(`tasks/${taskId}/abort`, { method: "PUT" }, {}, true, false);
}

export function validations() {
    return fetchJson("products/validations");
}

export function fixedInputValidations() {
    return fetchJson("fixed_inputs/validations");
}

export function validation(productId) {
    return fetchJson(`products/${productId}/validate`);
}

export function transitions(subscriptionId, transitionType) {
    return fetchJson(`products/transitions/${subscriptionId}/${transitionType}`);
}

export function contacts(organisationId) {
    return fetchJson(`crm/contacts/${organisationId}`, {}, {}, false, true).catch(err => Promise.resolve([]));
}

export function reportError(error) {
    return postPutJson("user/error", error, "post", false);
}

export function clearCache(name) {
    return postPutJson("user/clearCache", { name: name }, "put", true, false);
}

export function ping() {
    return fetchJson("user/ping");
}

export function me() {
    return fetchJson("user/me", {}, {}, false);
}

export function config() {
    return isEmpty(configuration)
        ? fetchJson("user/config").then(conf => {
              configuration = conf;
              return Promise.resolve(conf);
          })
        : Promise.resolve(configuration);
}

export function redirectToAuthorizationServer() {
    const re = /http[s]?:\/\/?[^/\s]+\/(.*)/;
    const res = re.exec(window.location.href);
    const state = res ? "/" + res[1] : "/";
    config().then(conf => {
        window.location.replace(
            `${conf.oauthAuthorizeUrl}?response_type=token&client_id=${conf.clientId}` +
                `&scope=${conf.scope.join("+")}&redirect_uri=${conf.redirectUri}&state=${btoa(state)}`
        );
    });
}
