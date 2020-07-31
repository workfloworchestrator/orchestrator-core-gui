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

import { JSONSchema6 } from "json-schema";

export interface FilterArgument {
    id: string;
    values: string[];
}

export interface Product {
    name: string;
    tag: string;
    description: string;
    product_id: string;
    created_at: number;
    product_type: string;
    end_date: number;
    status: string;
    fixed_inputs: FixedInput[];
    workflows: Workflow[];
    product_blocks: ProductBlock[];
}

export interface FixedInput {
    name: string;
    value: string;
}

export interface SubscriptionProcesses {
    pid: string;
    subscription_id: string;
    workflow_target: string;
    process: Process;
}

export interface SubscriptionInstance {
    subscription_instance_id: string;
    product_block: ProductBlock;
    label: string;
    values: InstanceValue[];
}

export interface InstanceValue {
    resource_type: ResourceType;
    value: string;
}

export interface ResourceType {
    resource_type_id: string;
    resource_type: string;
}

export interface ProductBlock {
    product_block_id: string;
    name: string;
    tag: string;
}

export interface Subscription {
    name: string;
    subscription_id: string;
    description: string;
    product: Product;
    product_id: string;
    status: string;
    insync: boolean;
    customer_id: string;
    start_date: number;
    end_date: number;
    note: string;
}

export interface CustomerDescription {
    description: string;
    customer_id: string;
}

export interface SubscriptionWithDetails extends Subscription {
    customer_name: string;
    instances: SubscriptionInstance[];
    end_date_epoch: number;
    start_date_epoch: number;
    customer_descriptions: CustomerDescription[];
}

export interface SubscriptionModel {
    name: string;
    subscription_id: string;
    description: string;
    product: Product;
    product_id: string;
    status: string;
    insync: boolean;
    customer_id: string;
    start_date: number;
    end_date: number;
    note: string;
    vc?: any;
}

export interface ServicePortSubscription extends Subscription {
    port_mode?: string;
    crm_port_id?: string;
}

export interface ServicePort {
    subscription_id?: string;
    vlan?: string;
    bandwidth?: number;
    nonremovable?: boolean;
    modifiable?: boolean;
}

export interface Organization {
    uuid: string;
    name: string;
    abbr: string;
}

export interface ValidationError {
    input_type: string;
    loc: (string | number)[];
    msg: string;
    type: string;
    ctx?: ValidationErrorContext;
}

export interface ValidationErrorContext {
    [index: string]: string;
}

export interface FormNotCompleteResponse {
    form: InputForm;
    hasNext?: boolean;
}

export interface Process {
    pid: string;
    workflow: string;
    assignee: string;
    last_status: string;
    failed_reason: string;
    traceback: string;
    step: string;
    created_by: string;
    started_at: number;
    last_modified_at: number;
    is_task: boolean;
}

export interface ProcessWithDetails {
    id: string;
    workflow_name: string;
    product: string;
    customer: string;
    assignee: "NOC" | "CHANGES" | "SYSTEM" | "KLANT_SUPPORT";
    status: string;
    failed_reason: string;
    traceback: string;
    step: string;
    created_by: string;
    started: number;
    last_modified: number;
    is_task: boolean;
}

export interface ProcessWithDetails extends Process {
    steps: Step[];
}

export interface ProcessSubscription {
    id: string;
    pid: string;
    subscription_id: string;
    created_at: number;
    workflow_target: string;
}

export interface ProcessV2 {
    assignee: string;
    created_by: string;
    failed_reason: string;
    last_modified_at: string;
    pid: string;
    started_at: string;
    last_status: string;
    last_step: string;
    subscriptions: Array<Subscription>;
    workflow: string;
    workflow_target: string;
    is_task: boolean;
}

export interface InputField {
    name: string;
    type: string;
    [index: string]: any;
}

export interface Step {
    name: string;
    executed: number;
    status: string;
    state: State;
    commit_hash: string;
    form?: InputForm;
}

export interface State {
    [index: string]: any;
}

export interface Option<Value = string> {
    value: Value;
    label: string;
}

export interface OptionBool {
    value: boolean;
    label: string;
}

export interface Workflow {
    name: string;
    target: string;
}

export interface AppError extends Error {
    response?: Response;
}

export interface AppConfig {
    oauthEnabled: string;
    oauthAuthorizeUrl: string;
    clientId: string;
    scope: string[];
    redirectUri: string;
    NOC: string;
    CHANGES: string;
    KLANT_SUPPORT: string;
    SYSTEM: string;
}

export interface User {
    preferred_user_name: string;
    displayName: string;
    sub: string;
    email: string;
    memberships: string[];
}

export function typedKeys<T>(o: T): (keyof T)[] {
    // type cast should be safe because that's what really Object.keys() does
    return Object.keys(o) as (keyof T)[];
}

export function prop<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

export function setProp<T, K extends keyof T>(obj: T, key: K, value: T[K]) {
    obj[key] = value;
}

export interface IMSEndpoint {
    id: number;
    type: string;
    endpointType: string;
    serviceId: number;
    vlanranges: { start: number; end: number }[];
    connector_type: string;
    fiber_type: string;
    iface_type: string;
    line_name: string;
    location: string;
    node: string;
    patchposition: string;
    port: string;
    status: string;
}
export interface IMSService {
    id: number;
    customer_id: string;
    extra_info: string;
    name: string;
    product: string;
    speed: string;
    status: string;
    order_id: string;
    aliases: string[];
    endpoints: IMSEndpoint[];
}

export interface IMSPort {
    id: number;
    line_name: string;
    node: string;
    port: string;
    iface_type: string;
    patchposition: string;
    status: string;
}

export interface IMSNode {
    id: number;
    name: string;
    status: string;
}

export interface WorkflowReason {
    name: string;
    reason: string;
}

export interface WorkflowReasons {
    modify: WorkflowReason[];
    terminate: WorkflowReason[];
    system: WorkflowReason[];
    create: WorkflowReason[];
    reason?: string;
}

export interface ProductValidation {
    errors: string[];
    mapping: {};
    product: { description: string; name: string; workflow: string };
    valid: boolean;
}

export type GlobalStatus = "RUNNING" | "PAUSED" | "PAUSING";

export interface EngineStatus {
    global_lock: boolean;
    running_processes: number;
    global_status: GlobalStatus;
}

export type InputForm = InputField[] | JSONSchema6;

export interface ContactPerson {
    name: string;
    email: string;
    phone: string;
}

export interface IpPrefix {
    id: number;
    prefix: string;
    version: number;
}

export interface IpBlock {
    id: number;
    prefix: string;
    ip_network: string;
    description: string;
    state: number;
    parent: number;
    version: number;
    parent_ipam_id: number;
    is_subnet: boolean;
    state_repr: string;
}

export interface SortOption<nameStrings = string> {
    name: nameStrings;
    descending: boolean;
}
