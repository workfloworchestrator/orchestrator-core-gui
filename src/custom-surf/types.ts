export interface Filter {
    name: string;
    count: number;
    selected: boolean;
}

export type ticket_type = "planned work" | "incident";
export type ticket_state = "initial" | "active" | "closed" | "aborted";
export type process_state = "open" | "open_related" | "open_accepted" | "updated" | "aborted" | "closed";

export interface CreateTicketPayload {
    start_date: string;
    end_date?: string;
    jira_ticket_id: string;
    ims_pw_id: string;
    type: ticket_type;
    title: string;
}
