/*
 * Copyright 2019-2022 SURF.
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
import {
    EngineStatus,
    FixedInputConfiguration,
    ProcessStatusCounts,
    ProcessSubscription,
    ProcessWithDetails,
    Product,
    ProductBlock,
    ResourceType,
    Subscription,
    SubscriptionModel,
    SubscriptionProcesses,
    Workflow,
    WorkflowReasons,
    WorkflowWithProductTags,
} from "utils/types";
import { isEmpty } from "utils/Utils";

import axiosInstance from "./axios";

export class BaseApiClient {
    axiosFetch = <R = {}>(
        path: string,
        options = {},
        headers = {},
        showErrorDialog = true,
        result = true
    ): Promise<R> => {
        // preset the config with the relative URL and a GET type.
        // presets can be overridden with `options`.
        return axiosInstance({ url: path, method: "GET", ...options })
            .then((res) => res.data)
            .catch((err) => {
                if (showErrorDialog) {
                    setTimeout(() => {
                        throw err;
                    }, 250);
                }
                throw err;
            });
    };

    catchErrorStatus = <T>(promise: Promise<any>, status: number, callback: (json: T) => void) => {
        return promise.catch((err) => {
            if (err.response && err.response.status === status) {
                callback(err.response.data);
            } else {
                throw err;
            }
        });
    };

    fetchJson = <R = {}>(
        path: string,
        options = {},
        headers = {},
        showErrorDialog = true,
        result = true
    ): Promise<R> => {
        return this.axiosFetch(path, options, headers, showErrorDialog, result);
    };

    fetchJsonWithCustomErrorHandling = <R = {}>(path: string): Promise<R> => {
        return this.fetchJson(path, {}, {}, false, true);
    };

    postPutJson = <R = {}>(
        path: string,
        body: {},
        method: string,
        showErrorDialog = true,
        result = true
    ): Promise<R> => {
        return this.axiosFetch(path, { method: method, data: body }, {}, showErrorDialog, result);
    };
}

abstract class ApiClientInterface extends BaseApiClient {
    abstract products: () => Promise<Product[]>;
    abstract productTags: () => Promise<string[]>;
    abstract productTypes: () => Promise<string[]>;
    abstract productStatuses: () => Promise<string[]>;
    abstract productById: (productId: string) => Promise<Product>;
    abstract saveProduct: (product: Product) => Promise<any>;
    abstract deleteProduct: (id: string) => Promise<null>;
    abstract productBlocks: () => Promise<ProductBlock[]>;
    abstract productBlockById: (id: string) => Promise<ProductBlock>;
    abstract saveProductBlock: (productBlock: ProductBlock) => Promise<any>;
    abstract deleteProductBlock: (id: string) => Promise<null>;
    abstract resourceTypes: () => Promise<ResourceType[]>;
    abstract resourceType: (id: string) => Promise<ResourceType>;
    abstract subscriptionsDetailWithModel: (subscription_id: string) => Promise<SubscriptionModel>;
    abstract nodeSubscriptions: (statusList?: string[]) => Promise<Subscription[]>;
    abstract subscriptions: (
        tagList?: string[],
        statusList?: string[],
        productList?: string[]
    ) => Promise<Subscription[]>;
    abstract subscriptionWorkflows: (subscription_id: string) => Promise<WorkflowReasons>;
    abstract inUseBySubscriptions: (subscriptionId: string) => Promise<Subscription[]>;
    abstract subscriptionsByInUsedByIds: (subscriptionInstanceIds: string[]) => Promise<any>;
    abstract processSubscriptionsBySubscriptionId: (subscriptionId: string) => Promise<SubscriptionProcesses[]>;
    abstract processSubscriptionsByProcessId: (processId: string) => Promise<ProcessSubscription[]>;
    abstract assignees: () => Promise<string[]>;
    abstract processStatuses: () => Promise<string[]>;
    abstract allWorkflows: () => Promise<Workflow[]>;
    abstract allWorkflowsWithProductTags: () => Promise<WorkflowWithProductTags[]>;
    abstract workflowsByTarget: (target: string) => Promise<Workflow[]>;
    abstract deleteSubscription: (subscriptionId: string) => Promise<null>;
    abstract setInSyncSubscription: (subscriptionId: string) => Promise<any>;
    abstract deleteProcess: (processId: string) => Promise<null>;
    abstract abortProcess: (processId: string) => Promise<any>;
    abstract process: (processId: string) => Promise<ProcessWithDetails>;
    abstract startProcess: (workflow_name: string, process: {}[]) => Promise<{ id: string }>;
    abstract resumeProcess: (processId: string, userInput: {}[]) => Promise<any>;
    abstract retryProcess: (processId: string) => Promise<any>;
    abstract fixedInputConfiguration: () => Promise<FixedInputConfiguration>;
    abstract reportError: (error: {}) => Promise<any>;
    abstract clearCache: (name: string) => Promise<any>;
    abstract getGlobalStatus: () => Promise<EngineStatus>;
    abstract setGlobalStatus: (new_global_lock: boolean) => Promise<any>;
    abstract logUserInfo: (username: string, message: string) => Promise<any>;
    abstract translations: (locale: string) => Promise<Record<string, any>>;
}

export class ApiClient extends ApiClientInterface {
    // Todo GPL: add a constructor that handles user

    products = (): Promise<Product[]> => {
        return this.fetchJson<Product[]>("products/");
    };

    productTags = (): Promise<string[]> => {
        return this.fetchJson("products/tags/all");
    };

    productTypes = (): Promise<string[]> => {
        return this.fetchJson("products/types/all");
    };

    productStatuses = (): Promise<string[]> => {
        return this.fetchJson("products/statuses/all");
    };

    productById = (productId: string): Promise<Product> => {
        return this.fetchJson(`products/${productId}`);
    };

    saveProduct = (product: Product) => {
        return this.postPutJson("products", product, isEmpty(product.product_id) ? "post" : "put", true, false);
    };

    deleteProduct = (id: string): Promise<null> => {
        return this.fetchJson(`products/${id}`, { method: "DELETE" }, {}, false, false);
    };

    productBlocks = (): Promise<ProductBlock[]> => {
        return this.fetchJson("product_blocks/");
    };

    productBlockById = (id: string): Promise<ProductBlock> => {
        return this.fetchJson(`product_blocks/${id}`);
    };

    saveProductBlock = (productBlock: ProductBlock) => {
        return this.postPutJson(
            "product_blocks",
            productBlock,
            isEmpty(productBlock.product_block_id) ? "post" : "put",
            true,
            false
        );
    };

    // @ts-ignore
    deleteProductBlock = (id: string) => {
        return this.fetchJson(`product_blocks/${id}`, { method: "DELETE" }, {}, false, false);
    };

    resourceTypes = (): Promise<ResourceType[]> => {
        return this.fetchJson("resource_types/");
    };

    // @ts-ignore
    resourceType = (id: string) => {
        return this.fetchJson(`resource_types/${id}`);
    };

    //API
    subscriptionsDetailWithModel = (subscription_id: string): Promise<SubscriptionModel> => {
        return this.fetchJsonWithCustomErrorHandling<SubscriptionModel>(
            `subscriptions/domain-model/${subscription_id}`
        );
    };

    nodeSubscriptions = (statusList: string[] = []): Promise<Subscription[]> => {
        return this.subscriptions(["Node"], statusList);
    };

    subscriptions = (
        tagList: string[] = [],
        statusList: string[] = [],
        productList: string[] = []
    ): Promise<Subscription[]> => {
        const statusFilter = `statuses,${encodeURIComponent(statusList.join("-"))}`;
        const tagsFilter = `tags,${encodeURIComponent(tagList.join("-"))}`;
        const productsFilter = `products,${encodeURIComponent(productList.join("-"))}`;

        const params = new URLSearchParams();
        const filters = [];
        if (tagList.length) filters.push(tagsFilter);
        if (statusList.length) filters.push(statusFilter);
        if (productList.length) filters.push(productsFilter);

        if (filters.length) params.set("filter", filters.join(","));

        return this.fetchJson(`subscriptions/${filters.length ? "?" : ""}${params.toString()}`);
    };

    subscriptionWorkflows = (subscription_id: string): Promise<WorkflowReasons> => {
        return this.fetchJson(`subscriptions/workflows/${subscription_id}`);
    };

    inUseBySubscriptions = (subscriptionId: string): Promise<Subscription[]> => {
        return this.fetchJson(`subscriptions/in_use_by/${subscriptionId}`);
    };

    subscriptionsByInUsedByIds = (subscriptionInstanceIds: string[]) => {
        return this.postPutJson(
            "subscriptions/subscriptions_for_in_used_by_ids",
            subscriptionInstanceIds,
            "post",
            true,
            false
        );
    };

    processSubscriptionsBySubscriptionId = (subscriptionId: string): Promise<SubscriptionProcesses[]> => {
        return this.fetchJsonWithCustomErrorHandling<SubscriptionProcesses[]>(
            `processes/process-subscriptions-by-subscription-id/${subscriptionId}`
        ).catch((err) => Promise.resolve([])); // Ignore non existing subscriptions
    };

    processSubscriptionsByProcessId = (processId: string): Promise<ProcessSubscription[]> => {
        return this.fetchJsonWithCustomErrorHandling<ProcessSubscription[]>(
            `processes/process-subscriptions-by-pid/${processId}`
        ).catch((err) => []);
    };

    assignees = (): Promise<string[]> => {
        return this.fetchJson("processes/assignees");
    };

    processStatuses = (): Promise<string[]> => {
        // Todo: Test status (refactored from axios fetch)
        return this.fetchJson("processes/statuses");
    };

    processStatusCounts = (): Promise<ProcessStatusCounts> => {
        return this.fetchJson("processes/status-counts");
    };

    allWorkflows = (): Promise<Workflow[]> => {
        return this.fetchJson("workflows");
    };

    allWorkflowsWithProductTags = (): Promise<WorkflowWithProductTags[]> => {
        return this.fetchJson("workflows/with_product_tags");
    };

    workflowsByTarget = (target: string): Promise<Workflow[]> => {
        return this.fetchJson(`workflows/?target=${target}`);
    };

    // @ts-ignore
    deleteSubscription = (subscriptionId: string) => {
        return this.fetchJson(`subscriptions/${subscriptionId}`, { method: "DELETE" }, {}, true, false);
    };

    setInSyncSubscription = (subscriptionId: string) => {
        return this.postPutJson(`subscriptions/${subscriptionId}/set_in_sync`, {}, "put", false, true);
    };

    // @ts-ignore
    deleteProcess = (processId: string) => {
        return this.fetchJson(`processes/${processId}`, { method: "DELETE" }, {}, true, false);
    };

    abortProcess = (processId: string) => {
        return this.fetchJson(`processes/${processId}/abort`, { method: "PUT" }, {}, true, false);
    };

    process = (processId: string): Promise<ProcessWithDetails> => {
        return this.fetchJsonWithCustomErrorHandling("processes/" + processId);
    };

    startProcess = (workflow_name: string, process: {}[]): Promise<{ id: string }> => {
        return this.postPutJson("processes/" + workflow_name, process, "post", false, true);
    };

    resumeProcess = (processId: string, userInput: {}[]) => {
        return this.postPutJson(`processes/${processId}/resume`, userInput, "put", false, false);
    };

    resumeAllProcesses = (): Promise<{ count: number }> => {
        return this.postPutJson(`processes/resume-all`, {}, "put", false);
    };

    retryProcess = (processId: string) => {
        return this.postPutJson(`processes/${processId}/resume`, {}, "put", true, false);
    };

    fixedInputConfiguration = (): Promise<FixedInputConfiguration> => {
        return this.fetchJson("fixed_inputs/configuration");
    };

    reportError = (error: {}) => {
        return this.postPutJson("user/error", error, "post", false);
    };

    clearCache = (name: string) => {
        return this.postPutJson(`settings/cache/${name}`, {}, "delete", true, false);
    };

    getGlobalStatus = (): Promise<EngineStatus> => {
        return this.fetchJson("settings/status", {}, {}, false, true);
    };

    setGlobalStatus = (new_global_lock: boolean) => {
        return this.postPutJson("settings/status", { global_lock: new_global_lock }, "put");
    };

    logUserInfo = (username: string, message: string) => {
        return this.postPutJson(`user/log/${username}`, { message: message }, "post", true, false);
    };

    translations = (locale: string): Promise<Record<string, any>> => {
        return this.fetchJson<Record<string, any>>(`translations/${locale}`, {}, {}, true, true);
    };
}
