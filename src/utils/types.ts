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

import { JSONSchema6 } from "json-schema";

export type Theme = "light" | "dark";

export enum ProcessStatus {
    "CREATED" = "created",
    "RUNNING" = "running",
    "SUSPENDED" = "suspended",
    "WAITING" = "waiting",
    "ABORTED" = "aborted",
    "FAILED" = "failed",
    "API_UNAVAILABLE" = "api_unavailable",
    "INCONSISTENT_DATA" = "inconsistent_data",
    "COMPLETED" = "completed",
}

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
    create_subscription_workflow_key: string;
    modify_subscription_workflow_key: string;
    terminate_subscription_workflow_key: string;
}

export interface FixedInput {
    name: string;
    value: string;
    created_at: number;
    fixed_input_id: string;
    product_id: string;
}

export interface SubscriptionProcesses {
    pid: string;
    subscription_id: string;
    workflow_target: string;
    process: Process;
}

export interface SubscriptionInstance {
    subscription_id: string;
    in_use_by_block_relations: SubscriptionInstanceParentRelation[];
    depends_on_block_relations: SubscriptionInstanceParentRelation[];
    in_use_by: SubscriptionInstance[];
    depends_on: SubscriptionInstance[];
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
    description: string;
}

export interface ProductBlock {
    product_block_id: string;
    name: string;
    tag: string;
    description: string;
    status: string;
    created_at: number;
    end_date: number;
    resource_types: ResourceType[];
    parent_ids: string[];
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

export interface FavoriteSubscription extends Subscription {
    customName: string;
}

export interface FavoriteSubscriptionStorage {
    subscription_id: string;
    customName: string;
}

export interface SubscriptionInstanceParentRelation {
    depends_on_id: string;
    domain_model_attr: string;
    order_id: number;
    in_use_by_id: string;
}

export interface SubscriptionWithDetails extends Subscription {
    customer_name: string;
    instances: SubscriptionInstance[];
    end_date_epoch: number;
    start_date_epoch: number;
    customer_descriptions: CustomerDescription[];
    tag: string;
}
export interface SubscriptionModel extends Subscription {
    customer_descriptions: CustomerDescription[];
    [index: string]: any;
}
export interface IpPrefixSubscription extends Subscription {
    id: number;
    prefix: string;
    description: string;
    state: number;
    parent: string;
    version: number;
    prefixlen: number;
    family: number;
    network_address_as_int: number;
}

/** Service Ticket types */

export enum ServiceTicketState {
    INITIAL = "inital",
    ACTIVE = "active",
    ABORTED = "aborted",
    CLOSED = "closed",
}

export enum ServiceTicketProcessState {
    OPEN = "open",
    OPEN_RELATED = "open_related",
    OPEN_ACCEPTED = "open_accepted",
    UPDATED = "updated",
    ABORTED = "aborted",
    CLOSED = "closed",
}

export interface ServiceTicket {
    _id: string;
    jira_ticket_id: string;
    title: string;
    ticket_state: ServiceTicketState;
    process_state: ServiceTicketProcessState;
    opened_by: string;
    start_date: string;
}

export enum ServiceTicketLogType {
    OPEN = "open",
    UPDATE = "update",
    CLOSE = "close",
}

export interface ServiceTicketLog {
    entry_time: string;
    update_nl: string;
    update_en: string;
    logtype: ServiceTicketLogType;
    logged_by: string;
}

export enum ServiceTicketImpactedObjectImpact {
    DOWN = "down",
    NO_IMPACT = "no_impact",
    REDUCED_REDUNDANCY = "reduced_redundancy",
}

export interface ServiceTicketImpactedIMSCircuit {
    ims_circuit_id: number;
    ims_circuit_name: string;
    impact: ServiceTicketImpactedObjectImpact;
    impact_override?: ServiceTicketImpactedObjectImpact;
    extra_information?: string;
}

export interface ServiceTicketCustomer {
    customer_id: string;
    customer_name: string;
    customer_abbrev: string;
}

export interface ServiceTicketContact {
    name: string;
    email: string;
}

export interface ServiceTicketRelatedCustomer {
    customer: ServiceTicketCustomer;
    customer_subscription_description?: string;
    contact: ServiceTicketContact[];
}

export interface ServiceTicketImpactedObject {
    subscription_id: string;
    logged_by: string;
    ims_circuits: ServiceTicketImpactedIMSCircuit[];
    owner_customer: ServiceTicketCustomer;
    subscription_description: string;
    owner_customer_description?: string;
    owner_customer_contacts: ServiceTicketContact[];
    related_customers: ServiceTicketRelatedCustomer[];
}

export enum ServiceTicketType {
    PLANNED_WORK = "planned work",
    INCIDENT = "incident",
}

export interface ServiceTicketWithDetails extends ServiceTicket {
    end_date: string;
    last_update_time: string;
    type: ServiceTicketType;
    logs: ServiceTicketLog[];
    impacted_objects: ServiceTicketImpactedObject[];
}

export interface ServicePortSubscription extends Subscription {
    port_mode?: string;
}

export interface ServicePort {
    subscription_id?: string;
    vlan?: string;
    bandwidth?: number;
    nonremovable?: boolean;
    modifiable?: boolean;
}

export interface ServicePortFilterItem {
    subscription_id: string;
    port_name: string;
    ims_circuit_id: number;
    description: string;
    nso_service_id: string;
    port_speed: number;
    port_mode: string;
    start_date: number;
    status: string;
    product_name: string;
    product_tag: string;
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

export type Assignee = "NOC" | "CHANGES" | "SYSTEM" | "KLANT_SUPPORT";

export interface Process {
    pid: string;
    workflow: string;
    assignee: Assignee;
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
    assignee: Assignee;
    status: string;
    failed_reason: string;
    traceback: string;
    step: string;
    created_by: string;
    started: number;
    last_modified: number;
    is_task: boolean;
    current_state: any;
    steps: Step[];
    form?: InputForm;
}

export interface ProcessSubscription {
    id: string;
    pid: string;
    subscription_id: string;
    created_at: number;
    workflow_target: string;
}

export interface ProcessV2 {
    pid: string;
    assignee: Assignee;
    created_by: string;
    failed_reason: string;
    last_modified_at: string;
    started_at: string;
    last_status: string;
    last_step: string;
    subscriptions: Array<Subscription>;
    workflow: string;
    workflow_target: string;
    is_task: boolean;
}

export interface WsProcessV2 extends ProcessV2 {
    id: string;
    status: ProcessStatus;
    form: InputForm;
    steps: Step[];
    traceback: string;
    step: string;
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
    description: string;
    target: string;
    created_at: number;
    workflow_id: string;
}

export interface WorkflowWithProductTags extends Workflow {
    product_tags: string[];
}
export interface CodedWorkflow {
    name: string;
    implementation: string;
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

export type GlobalStatus = "RUNNING" | "PAUSED" | "PAUSING";

export interface EngineStatus {
    global_lock: boolean;
    running_processes: number;
    global_status: GlobalStatus;
}

export interface Form {
    stepUserInput?: JSONSchema6;
    hasNext?: boolean;
}

export type InputForm = JSONSchema6;

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

export interface Action {
    icon: string;
    euiIcon: string;
    label: string;
    action: (e: React.MouseEvent<HTMLButtonElement>) => void;
    danger?: boolean;
}

export interface Filter {
    name: string;
    count: number;
    selected: boolean;
}

export interface FixedInputConfiguration {
    by_tag: { [index: string]: { [index: string]: boolean }[] };
    fixed_inputs: { name: string; description: string; values: string[] }[];
}

export interface Dienstafname {
    guid: string;
    code: string;
    status: string;
}

export interface ISubscriptionInstance {
    subscription_instance_id: string;
    name: string;
    label?: string;
    [index: string]: any;
}

export const SUBSCRIPTION_VIEWTYPE_SELECTOR = "subscription-viewtype";

export interface StoredViewPreferences {
    viewType: string;
    tabViewId: string;
}

export interface TabView {
    id: string;
    name: string;
    href?: string;
    content: React.ReactNode;
    append?: string;
    prepend?: string;
    disabled: boolean;
}
