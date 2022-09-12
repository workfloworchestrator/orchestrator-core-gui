/** Common */

export interface Filter {
    name: string;
    count: number;
    selected: boolean;
}

/** CIM */

export interface CreateServiceTicketPayload {
    end_date?: string;
    ims_pw_id: string;
    jira_ticket_id: string;
    start_date: string;
    title_nl: string;
    type: ServiceTicketType;
}

export interface OpenServiceTicketPayload {
    cim_ticket_id: string;
    title_nl: string;
    description_nl: string;
    title_en: string;
    description_en: string;
    mail_subject: string;
}

export interface UpdateServiceTicketPayload extends OpenServiceTicketPayload {
    start_date?: string;
    end_date?: string;
}

export interface CloseServiceTicketPayload extends OpenServiceTicketPayload {
    end_date?: string;
}

export enum ServiceTicketState {
    INITIAL = "initial",
    ACTIVE = "active",
    ABORTED = "aborted",
    CLOSED = "closed",
}

export enum ServiceTicketProcessState {
    INITIAL = "initial",
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
    opened_by: string;
    transition_action?: string;
    process_state: ServiceTicketProcessState;
    start_date: string;
    create_date: string;
    last_update_time: string;
    title_nl: string;
    title_en: string;
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
