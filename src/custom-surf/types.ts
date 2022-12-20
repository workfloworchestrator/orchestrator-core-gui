/** Common */

export interface Filter {
    name: string;
    count: number;
    selected: boolean;
}

/** CIM */

export interface CreateServiceTicketPayload {
    ims_pw_id: string;
    jira_ticket_id: string;
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
    ims_pw_id: string;
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
    RESILIENCE_LOSS = "resilience_loss",
}

export interface ServiceTicketImpactedIMSCircuit {
    ims_circuit_id: number;
    ims_circuit_name: string;
    impact: ServiceTicketImpactedObjectImpact;
    extra_information?: string;
}

export interface ServiceTicketCustomer {
    customer_id: string;
    customer_name: string;
    customer_abbrev: string;
}
export interface ServiceTicketBackgroundJobCount {
    number_of_active_jobs: number;
}

export interface ServiceTicketContact {
    name: string;
    email: string;
    // Todo: add phone?
}

export interface ServiceTicketRelatedCustomer {
    customer: ServiceTicketCustomer;
    customer_subscription_description?: string;
    contacts: ServiceTicketContact[];
}

export interface ServiceTicketImpactedObject {
    impact_override: ServiceTicketImpactedObjectImpact;
    subscription_id: string | null;
    product_type: string;
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

export interface BackgroundJobLog {
    message: string;
    customer_id?: string;
    subscription_id?: string;
    entry_time: string;
    process_state: string;
}

export interface Email {
    customer: ServiceTicketCustomer;
    message: string;
    to: ServiceTicketContact[];
    cc: ServiceTicketContact[];
    bcc: ServiceTicketContact[];
    language: string;
}

export interface EmailLog {
    entry_time: string;
    log_type: string;
    emails: any;
}

export interface ServiceTicketWithDetails extends ServiceTicket {
    transitioning_state: any;
    end_date: string;
    last_update_time: string;
    type: ServiceTicketType;
    logs: ServiceTicketLog[];
    impacted_objects: ServiceTicketImpactedObject[];
    background_logs: BackgroundJobLog[];
    email_logs: EmailLog[];
}

export interface ImsInfo {
    impact: ServiceTicketImpactedObjectImpact;
    ims_circuit_id: number;
    ims_circuit_name: string;
    extra_information?: string;
}

export interface ImpactedObject {
    id: string;
    customer: string;
    impact: ServiceTicketImpactedObjectImpact;
    type: string;
    subscription: string;
    impact_override?: ServiceTicketImpactedObjectImpact;
    subscription_id: string | null;
    ims_info: ImsInfo[];
    owner_customer_contacts: ServiceTicketContact[];
    related_customers: ServiceTicketRelatedCustomer[];
}
