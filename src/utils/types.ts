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

export interface ServicePortSubscription {
    subscription_id: string;
    description: string;
    product: Product;
    port_mode?: string;
    customer_id?: string;
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
    loc: (string|number)[];
    msg: string;
    type: string;
    ctx?: ValidationErrorContext;
}

export interface ValidationErrorContext {
    [index: string]: string;
}
