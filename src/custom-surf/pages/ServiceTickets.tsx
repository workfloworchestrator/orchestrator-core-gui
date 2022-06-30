/*
 * Copyright 2019-2020 SURF.
 *
 */

import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiPage, EuiPanel, EuiSpacer } from "@elastic/eui";
import ServiceTicketFilter from "custom/components/ServiceTicketFilter";
import { tableTickets } from "custom/pages/ServiceTicketsStyling";
import { ServiceTicket, ServiceTicketProcessState } from "custom/types";
import { intl } from "locale/i18n";
import debounce from "lodash/debounce";
import React from "react";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";
import ScrollUpButton from "react-scroll-up-button";
import ApplicationContext from "utils/ApplicationContext";
import { renderStringAsDateTime } from "utils/Lookups";
import { Filter, SortOption } from "utils/types";
import { isEmpty, stop } from "utils/Utils";

type Column = "jira_ticket_id" | "title" | "ticket_state" | "process_state" | "opened_by" | "start_date";

interface IProps extends WrappedComponentProps {}

interface FilterAttributes {
    state: Filter[];
}

interface IState {
    serviceTickets: ServiceTicket[];
    query: string;
    searchResults: ServiceTicket[];
    sortOrder: SortOption<Column>;
    filterAttributes: FilterAttributes;
    availablePrefixId: number;
    ipPrefixProductId: string;
}

class ServiceTickets extends React.PureComponent<IProps, IState> {
    context!: React.ContextType<typeof ApplicationContext>;
    state: IState = {
        serviceTickets: [],
        query: "",
        searchResults: [],
        sortOrder: { name: "jira_ticket_id", descending: false },
        filterAttributes: {
            state: Object.values(ServiceTicketProcessState)
                .filter((s) => s)
                .map((state) => ({
                    name: state ?? "",
                    selected: state === ServiceTicketProcessState.OPEN,
                    count: 0,
                })),
        },
        availablePrefixId: 10000,
        ipPrefixProductId: "",
    };

    componentDidMount() {
        this.setState({});

        this.context.customApiClient
            .cimTickets()
            .then((res) => {
                this.setState({ serviceTickets: res });
            })
            .catch((err) => {
                throw err;
            });
    }

    setFilter = (filterName: "state") => (item: Filter) => {
        const currentFilterAttributes = this.state.filterAttributes;
        var modifiedAttributes: Partial<FilterAttributes> = {};
        modifiedAttributes[filterName] = currentFilterAttributes[filterName].map((attr) => {
            if (attr.name === item.name) {
                attr.selected = !attr.selected;
            }
            return attr;
        });
        this.setState({
            filterAttributes: { ...currentFilterAttributes, ...modifiedAttributes },
        });
    };

    setFilterList = (filterName: "state") => (item: Filter[]) => {
        const currentFilterAttributes = this.state.filterAttributes;
        const incomingFilterNames = item.map((f) => f.name);
        let modifiedAttributes: Partial<FilterAttributes> = {};
        modifiedAttributes[filterName] = currentFilterAttributes[filterName].map((attr) => {
            attr.selected = incomingFilterNames.includes(attr.name);

            return attr;
        });
        this.setState({
            filterAttributes: { ...currentFilterAttributes, ...modifiedAttributes },
        });
    };

    singleSelectFilter = (filterName: "state") => (e: React.MouseEvent<HTMLElement>, item: Filter) => {
        stop(e);
        const currentFilterAttributes = this.state.filterAttributes;
        var modifiedAttributes: Partial<FilterAttributes> = {};
        modifiedAttributes[filterName] = currentFilterAttributes[filterName].map((attr) => {
            if (attr.name !== item.name && attr.selected) {
                attr.selected = false;
            } else if (attr.name === item.name && !attr.selected) {
                attr.selected = true;
            }
            return attr;
        });
        this.setState({
            filterAttributes: { ...currentFilterAttributes, ...modifiedAttributes },
        });
    };

    selectAll = (filterName: "state") => (e: React.MouseEvent<HTMLElement>) => {
        stop(e);
        const currentFilterAttributes = this.state.filterAttributes;
        var modifiedAttributes: Partial<FilterAttributes> = {};
        modifiedAttributes[filterName] = currentFilterAttributes[filterName].map((attr) => {
            if (!attr.selected) {
                attr.selected = true;
            }
            return attr;
        });
        this.setState({
            filterAttributes: { ...currentFilterAttributes, ...modifiedAttributes },
        });
    };

    filter = (unfiltered: ServiceTicket[]) => {
        const { state } = this.state.filterAttributes;
        if (!state.some((attr) => attr.selected)) {
            // If no filter selected, show all tickets
            return unfiltered;
        }
        return unfiltered.filter((ticket) => {
            const stateFilter = state.find((attr) => attr.name === ticket.process_state);
            return stateFilter ? stateFilter.selected : true;
        });
    };

    sortBy = (name: Column) => (a: ServiceTicket, b: ServiceTicket) => {
        const aSafe = a[name] === undefined ? "" : a[name];
        const bSafe = b[name] === undefined ? "" : b[name];
        if (name === "ticket_state") {
            return (a[name] ?? "").localeCompare(b[name] ?? "");
        } else {
            return typeof aSafe === "string" || typeof bSafe === "string"
                ? (aSafe as string).toLowerCase().localeCompare(bSafe.toString().toLowerCase())
                : aSafe - bSafe;
        }
    };

    toggleSort = (name: Column) => (e: React.MouseEvent<HTMLTableHeaderCellElement>) => {
        stop(e);
        const sortOrder = { ...this.state.sortOrder };
        sortOrder.descending = sortOrder.name === name ? !sortOrder.descending : false;
        sortOrder.name = name;
        this.setState({ sortOrder: sortOrder });
    };

    sort = (unsorted: ServiceTicket[]) => {
        const { name, descending } = this.state.sortOrder;
        const sorted = unsorted.sort(this.sortBy(name));
        if (descending) {
            sorted.reverse();
        }
        return sorted;
    };

    search = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        this.setState({ query: query });
        this.debouncedRunQuery(query);
    };

    runQuery = (query: string) => {
        const { serviceTickets } = this.state;
        const queryToLower = query.toLowerCase();
        const results = serviceTickets.filter((serviceTickets) => {
            return (
                serviceTickets.jira_ticket_id.toLowerCase().includes(queryToLower) ||
                serviceTickets.opened_by.toLowerCase().includes(queryToLower) ||
                (serviceTickets.title !== null && serviceTickets.title.toLowerCase().includes(queryToLower))
            );
        });
        this.setState({ searchResults: results });
    };
    debouncedRunQuery = debounce(this.runQuery, 800);

    sortColumnIcon = (name: string, sorted: SortOption) => {
        if (sorted.name === name) {
            return <i className={sorted.descending ? "fas fa-sort-down" : "fas fa-sort-up"} />;
        }
        return <i />;
    };

    render() {
        const columns: Column[] = [
            "jira_ticket_id",
            "title",
            "ticket_state",
            "process_state",
            "opened_by",
            "start_date",
        ];
        const { theme } = this.context;

        const th = (index: number) => {
            const name = columns[index];
            return (
                <th key={index} className={name} onClick={this.toggleSort(name)}>
                    <span>
                        <FormattedMessage id={`tickets.table.${name}`} />
                    </span>
                    {this.sortColumnIcon(name, this.state.sortOrder)}
                </th>
            );
        };
        const { serviceTickets, query, searchResults, filterAttributes } = this.state;
        const filteredTickets = isEmpty(query) ? this.filter(serviceTickets) : this.filter(searchResults);
        // @ts-ignore
        const sortedTickets = this.sort(filteredTickets);
        return (
            <EuiPage css={tableTickets}>
                <EuiPanel>
                    <div>
                        <div className="options">
                            <EuiFlexGroup justifyContent="spaceBetween">
                                <EuiFlexItem grow={false} style={{ minWidth: 200 }}>
                                    <ServiceTicketFilter
                                        items={filterAttributes.state}
                                        filterBy={this.setFilterList("state")}
                                        selectAll={this.selectAll("state")}
                                        label={intl.formatMessage({ id: "tickets.filters.state" })}
                                    />
                                </EuiFlexItem>
                                <EuiFlexItem grow={false} style={{ minWidth: 200 }}>
                                    <EuiButton
                                        color={"primary"}
                                        iconType="plusInCircle"
                                        isDisabled={false}
                                        size="m"
                                        fill
                                        onClick={() => this.context.redirect("/tickets/create")}
                                    >
                                        {intl.formatMessage({ id: "tickets.create.new_ticket" })}
                                    </EuiButton>
                                </EuiFlexItem>
                            </EuiFlexGroup>
                        </div>
                        <EuiSpacer size="m" />
                    </div>
                    <table className="tickets">
                        <thead>
                            <tr>{columns.map((column, index) => th(index))}</tr>
                        </thead>
                        <tbody>
                            {sortedTickets.map((ticket) => (
                                <tr key={ticket._id} className={theme}>
                                    <td
                                        data-label={intl.formatMessage({ id: "tickets.table.jira_ticket_id" })}
                                        className="subscription"
                                        onClick={() => this.context.redirect(`/tickets/${ticket._id}`)}
                                    >
                                        {ticket.jira_ticket_id}
                                    </td>
                                    <td
                                        data-label={intl.formatMessage({ id: "tickets.table.title" })}
                                        className="customer"
                                    >
                                        {ticket.title}
                                    </td>
                                    <td
                                        data-label={intl.formatMessage({ id: "tickets.table.ticket_state" })}
                                        className="ticket_state"
                                    >
                                        {ticket.ticket_state}
                                    </td>
                                    <td
                                        data-label={intl.formatMessage({ id: "tickets.table.process_state" })}
                                        className="process_state"
                                    >
                                        {ticket.process_state}
                                    </td>
                                    <td
                                        data-label={intl.formatMessage({ id: "tickets.table.opened_by" })}
                                        className="description"
                                    >
                                        {ticket.opened_by}
                                    </td>
                                    <td
                                        data-label={intl.formatMessage({ id: "tickets.table.start_date" })}
                                        className="start_date"
                                    >
                                        {renderStringAsDateTime(ticket.start_date)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <ScrollUpButton />
                </EuiPanel>
            </EuiPage>
        );
    }
}
ServiceTickets.contextType = ApplicationContext;

export default injectIntl(ServiceTickets);
