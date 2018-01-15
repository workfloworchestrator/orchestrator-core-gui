import spinner from "../lib/Spin";
import {isEmpty} from "../utils/Utils";
import {
    absent,
    ims_circuit_id,
    ims_port_id,
    parent_subscriptions,
    port_subscription_id
} from "../validations/Subscriptions";


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
            spinner.stop();
        }
        if (!res.ok) {
            started = ended = 0;
            spinner.stop();

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
    const access_token = localStorage.getItem('access_token');
    const contentHeaders = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `bearer ${access_token}`,
        ...headers
    };
    const fetchOptions = Object.assign({}, {headers: contentHeaders}, options, {
        credentials: "same-origin",
        redirect: "manual",
    });
    spinner.start();
    ++started;

    const targetUrl = apiUrl(path);
    return fetch(targetUrl, fetchOptions).then(validateResponse(showErrorDialog))
}

function fetchJson(path, options = {}, headers = {}, showErrorDialog = true, result = true) {
    return validFetch(path, options, headers, showErrorDialog)
        .then(res => result ? res.json() : {});
}

function fetchJsonWithCustomErrorHandling(path) {
    return fetchJson(path, {}, {}, false, true);
}

function postPutJson(path, body, method, result = true) {
    return fetchJson(path, {method: method, body: JSON.stringify(body)}, {}, true, result);
}

//API metadata
export function products() {
    return fetchJson("products")
}

export function productTags() {
    return fetchJson("products/tags/all")
}

export function productTypes() {
    return fetchJson("products/types/all")
}

export function productStatuses() {
    return fetchJson("products/statuses/all")
}

export function productById(productId) {
    return fetchJson(`products/${productId}`)
}

export function saveProduct(product) {
    return postPutJson("products", product, isEmpty(product.product_id) ? "post" : "put", false)
}

export function deleteProduct(id) {
    return fetchJson(`products/${id}`, {method: "DELETE"}, {}, false, false);
}

export function productBlocks() {
    return fetchJson("product_blocks")
}

export function productBlockById(id) {
    return fetchJson(`product_blocks/${id}`)
}

export function saveProductBlock(productBlock) {
    return postPutJson("product_blocks", productBlock, isEmpty(productBlock.product_block_id) ? "post" : "put", false)
}

export function deleteProductBlock(id) {
    return fetchJson(`product_blocks/${id}`, {method: "DELETE"}, {}, false, false);
}

export function resourceTypes() {
    return fetchJson("resource_types")
}

export function resourceType(id) {
    return fetchJson(`resource_types/${id}`)
}

export function saveResourceType(resourceType) {
    return postPutJson("resource_types", resourceType, isEmpty(resourceType.resource_type_id) ? "post" : "put", false)
}

export function deleteResourceType(id) {
    return fetchJson(`resource_types/${id}`, {method: "DELETE"}, {}, false, false);
}

//API
export function subscriptions() {
    return fetchJson("subscriptions");
}

export function subscriptionsDetail(subscription_id) {
    return fetchJsonWithCustomErrorHandling(`subscriptions/${subscription_id}`);
}

export function subscriptionsByTag(tag) {
    return fetchJson(`subscriptions/tag/${tag}`);
}

export function subscriptionsByProductId(productId) {
    return fetchJson(`subscriptions/product/${productId}`);
}


export function organisations() {
    return fetchJson("crm/organisations");
}

export function ieeeInterfaceTypesForProductId(id) {
    return fetchJson(`products/ieee_interface_types/${id}`)
}

export function freePortsForLocationCodeAndInterfaceType(locationCode, interfaceType) {
    return fetchJson(`ims/free_ports/${locationCode}/${interfaceType}`)
}

export function usedVlans(subscriptionId) {
    return fetchJson(`ims/vlans/${subscriptionId}`)
}

export function subscriptions_by_subscription_port_id(subscription_id) {
    return fetchJson(`subscriptions/port_subscriptions/${subscription_id}`).then(json => {
        return {type: parent_subscriptions, json: json}
    });
}

export function imsService(type, identifier) {
    let promise;
    switch (type) {
        case ims_port_id:
            promise = fetchJsonWithCustomErrorHandling(`ims/service_by_ims_port/${identifier}`);
            break;
        case ims_circuit_id:
            promise = fetchJsonWithCustomErrorHandling(`ims/service_by_ims_service_id/${identifier}`);
            break;
        case port_subscription_id:
            promise = subscriptionsDetail(identifier);
            break;
        default:
            promise = Promise.resolve({})
    }
    return promise
        // IMS service is recorded in subscription_instance_value but removed from IMS - prevent error
        .then(json => ({type: type, json: json}))
        .catch(err => Promise.resolve({type: absent, requestedType: type, identifier: identifier}));
}

export function processIdFromSubscriptionId(subscriptionId) {
    return fetchJsonWithCustomErrorHandling(`processes/process-subscription-by-subscription-id/${subscriptionId}`)
        .catch(err => Promise.resolve({}));
}

export function subscriptionIdFromProcessId(processId) {
    return fetchJsonWithCustomErrorHandling(`processes/process-subscription-by-pid/${processId}`)
        .catch(err => Promise.resolve({}));
}

export function locationCodes() {
    return fetchJson("crm/location_codes");
}

export function allWorkflows() {
    return fetchJson("workflows")
}

export function workflowsByTarget(target) {
    return fetchJson(`workflows?target=${target}`)
}

export function invalidSubscriptions(workflowKey) {
    return fetchJson(`subscriptions/invalid_subscriptions/${workflowKey}`)
}

export function dienstafnameSubscriptionCrossCheck() {
    return fetchJson("subscriptions/dienstafname-subscriptions")
}

export function initialWorkflowInput(workflowKey) {
    return fetchJson(`workflows/${workflowKey}`)
}

export function processes() {
    return fetchJson("processes");
}

export function deleteSubscription(subscriptionId) {
    return fetchJson(`subscriptions/${subscriptionId}`, {method: "DELETE"}, {}, true, false);
}

export function terminateSubscription(process) {
    return postPutJson("processes/terminate-subscription", process, "post");
}

export function startModificationSubscription(subscriptionId) {
    return postPutJson("processes/modify-subscription", {subscription_id: subscriptionId}, "post");
}

export function deleteProcess(processId) {
    return fetchJson(`processes/${processId}`, {method: "DELETE"}, {}, true, false);
}

export function abortProcess(processId) {
    return fetchJson(`processes/${processId}/abort`, {method: "PUT"}, {}, true, false);
}

export function process(processId) {
    return fetchJsonWithCustomErrorHandling("processes/" + processId);
}

export function startProcess(process) {
    return postPutJson("processes", process, "post");
}

export function resumeProcess(processId, userInput) {
    return postPutJson(`processes/${processId}/resume`, {user_input: userInput}, "put", false);
}

export function retryProcess(processId) {
    return postPutJson(`processes/${processId}/resume`, {user_input: {}}, "put", false);
}

export function tasks() {
    return fetchJson("tasks");
}

export function task(taskId) {
    return fetchJsonWithCustomErrorHandling("tasks/" + taskId);
}

export function startTask(task) {
    return postPutJson("tasks", task, "post");
}

export function resumeTask(taskId, userInput) {
    return postPutJson(`tasks/${taskId}/resume`, {user_input: userInput}, "put", false);
}

export function retryTask(taskId) {
    return postPutJson(`tasks/${taskId}/resume`, {user_input: {}}, "put", false);
}

export function deleteTask(taskId) {
    return fetchJson(`tasks/${taskId}`, {method: "DELETE"}, {}, true, false);
}

export function abortTask(taskId) {
    return fetchJson(`tasks/${taskId}/abort`, {method: "PUT"}, {}, true, false);
}

export function validations() {
    return fetchJson("products/validations");
}

export function validation(productId) {
    return fetchJson(`products/${productId}/validate`);
}

export function contacts(organisationId) {
    return fetchJson(`crm/contacts/${organisationId}`, {}, {}, false, true)
        .catch(err => Promise.resolve([]));
}

export function reportError(error) {
    return postPutJson("user/error", error, "post");
}

export function clearCache(name) {
    return postPutJson("user/clearCache", {name: name}, "put", false);
}

export function ping() {
    return fetchJson("user/ping");
}

export function me() {
    return fetchJson("user/me", {}, {}, false);
}

export function config() {
    return isEmpty(configuration) ? fetchJson("user/config").then(conf => {
        configuration = conf;
        return Promise.resolve(conf);
    }) : Promise.resolve(configuration);
}

export function redirectToAuthorizationServer() {
    config().then(conf => {
        window.location.replace(
            `${conf.oauthAuthorizeUrl}?response_type=token&client_id=${conf.clientId}` +
            `&scope=${conf.scope.join("+")}&redirect_uri=${conf.redirectUri}`);

    });

}
