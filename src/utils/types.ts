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

export interface Product {
    name: string;
    tag: string;
    product_id: string;
}

export interface Subscription {
    subscription_id: string;
    description: string;
    product: Product;
    status: string;
    insync: boolean;
    customer_id: string;
    start_date: number;
    end_date: number;
}

export interface ServicePortSubscription extends Subscription {
    port_mode?: string;
    crm_port_id?: string;
}

export interface ServicePort {
    subscription_id: string | null;
    vlan: string;
    tag?: string;
    port_mode: string;
    bandwidth?: number;
    nonremovable?: boolean;
    modifiable?: boolean;
    [index: string]: any; // To allow indexing
}

export interface Organization {
    uuid: string;
    name: string;
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
    form: InputField[];
    hasNext?: boolean;
}

export interface Process {
    id: string;
    workflow_name: string;
    product?: string;
    customer?: string;
    assignee: string;
    status: string;
    failed_reason: string;
    traceback: string;
    step: string;
    created_by: string;
    started: number;
    last_modified: number;
    [index: string]: any;
}

export interface Task {
    id: string;
    workflow: string;
    product?: string;
    customer?: string;
    assignee: string;
    last_status: string;
    failed_reason: string;
    traceback: string;
    last_step: string;
    created_by: string;
    started: number;
    last_modified_at: number;
    [index: string]: any;
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

export interface InputField {
    [index: string]: any;
}

export interface Step {
    name: string;
    executed: number;
    status: string;
    state: { [index: string]: any };
    commit_hash: string;
    form?: InputField[];
}

export interface FilterAttribute {
    name: string;
    selected: boolean;
    count: number;
}

export interface State {
    [index: string]: any;
}

export interface ShowActions {
    show: boolean;
    id: string;
}

export interface ShowTaskActions {
    show: boolean;
    tid: string;
}

export interface SortSettings {
    name: string;
    descending: boolean;
}

export interface Option {
    value: string;
    label: string;
}

export interface Workflow {
    name: string;
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
}

export interface User {
    user_name: string;
    displayName: string;
    sub: string;
    [index: string]: any;
}
