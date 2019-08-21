export interface Product {
    name: string;
    tag: string;
    product_id: string;
}

export interface ServicePortSubscription {
    subscription_id: string;
    description: string;
    product: Product;
    port_mode: string;
    customer_id?: string;
    crm_port_id?: string;
}

export interface ServicePort {
    subscription_id: string | null;
    vlan: string;
    tag?: string;
    port_mode?: string;
    bandwidth?: number;
    nonremovable?: boolean;
    modifiable?: boolean;
    [index: string]: any; // To allow indexing
}

export interface Organization {
    uuid: string;
    name: string;
}
