import spinner from "../lib/Spin";
import {isEmpty} from "../utils/Utils";

const apiPath = "/api/";

let configuration = {};

function apiUrl(path) {
    return apiPath + path;
}

function validateResponse(showErrorDialog) {
    return res => {
        spinner.stop();

        if (!res.ok) {
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

    const targetUrl = apiUrl(path);
    return fetch(targetUrl, fetchOptions)
        .catch(err => {
            spinner.stop();
            throw err;
        })
        .then(validateResponse(showErrorDialog));
}

function fetchJson(path, options = {}, headers = {}, showErrorDialog = true, result = true) {
    return validFetch(path, options, headers, showErrorDialog)
        .then(res => result ? res.json() : {});
}

function postPutJson(path, body, method, result = true) {
    return fetchJson(path, {method: method, body: JSON.stringify(body)}, {}, true, result);
}

//API
export function subscriptions() {
    return fetchJson("subscriptions");
}

export function subscriptions_detail(subscription_id) {
    return fetchJson(`subscriptions/${subscription_id}`);
}

export function subscriptions_for_type(type) {
    return fetchJson(`subscriptions/product_type/${type}`);
}

export function organisations() {
    return fetchJson("crm/organisations");
}

export function products() {
    return fetchJson("products")
}

export function ieeeInterfaceTypes() {
    return fetchJson("ims/ieee_interface_types")
}

export function ieeeInterfaceTypesForProductTag(tag) {
    return fetchJson(`ims/ieee_interface_types/${tag}`)
}

export function freePortsForLocationCodeAndInterfaceType(locationCode, interfaceType) {
    return fetchJson(`ims/free_ports/${locationCode}/${interfaceType}`)
}


export function locationCodes() {
    return fetchJson("crm/location_codes");
}

export function initialWorkflowInput(workflowKey) {
    return fetchJson(`workflows/${workflowKey}`)
}

export function processes() {
    return fetchJson("processes");
}

export function deleteProcess(processId) {
    return fetchJson(`processes/${processId}`, {method: "DELETE"}, {}, true, false);
}

export function abortProcess(processId) {
    return fetchJson(`processes/${processId}/abort`, {method: "PUT"}, {}, true, false);
}

export function process(processId) {
    return fetchJson("processes/" + processId);
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

export function validations() {
    return fetchJson("products/validations");
}

export function validation(productId) {
    return fetchJson(`products/${productId}/validate`);
}

export function reportError(error) {
    return postPutJson("user/error", error, "post");
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
