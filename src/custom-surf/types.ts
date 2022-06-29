export interface Filter {
    name: string;
    count: number;
    selected: boolean;
}

export enum TicketType {
    PLANNED_WORK = "created",
    INCIDENT = "running",
}

export interface CreateTicketPayload {
    start_date: string;
    end_date?: string;
    jira_ticket_id: string;
    ims_pw_id: string;
    type: TicketType;
    title: string;
}
