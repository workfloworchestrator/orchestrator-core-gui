export interface Filter {
    name: string;
    count: number;
    selected: boolean;
}

export type ticket_type = "planned work" | "incident";
export type ticket_state = "initial" | "active" | "closed" | "aborted";
export type process_state = "open" | "open_related" | "open_accepted" | "updated" | "aborted" | "closed";

export interface CreateTicketPayload {
    create_date: string;
    start_date: string;
    end_date?: string;
    jira_ticket_id: string;
    ims_pw_id: string;
    type: ticket_type;
    title: string;
    ticket_state: ticket_state;
    process_state: process_state;
    last_update_time: string;
    opened_by: string;
    logs: any[];
    impacted_objects: any[];
}
