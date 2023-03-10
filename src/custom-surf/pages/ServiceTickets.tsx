/*
 * Copyright 2019-2020 SURF.
 *
 */

import {
    EuiButton,
    EuiButtonIcon,
    EuiFacetButton,
    EuiFlexGroup,
    EuiFlexItem,
    EuiIconTip,
    EuiLoadingSpinner,
    EuiPage,
    EuiPanel,
    EuiSpacer,
} from "@elastic/eui";
import ServiceTicketFilter from "custom/components/ServiceTicketFilter";
import { tableTickets } from "custom/pages/ServiceTicketsStyling";
import { ServiceTicket, ServiceTicketProcessState, ServiceTicketTransition } from "custom/types";
import { renderIsoDatetime } from "custom/Utils";
import { intl } from "locale/i18n";
import debounce from "lodash/debounce";
import React from "react";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";
import { Link } from "react-router-dom";
import ScrollUpButton from "react-scroll-up-button";
import ApplicationContext from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";
import { Filter, SortOption } from "utils/types";
import { isEmpty, stop } from "utils/Utils";

type Column =
    | "jira_ticket_id"
    | "title_nl"
    | "process_state"
    | "opened_by"
    | "start_date"
    | "create_date"
    | "last_update_time";

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
    ipPrefixProductId: string;
    activeBackgroundJobs: number;
}

class ServiceTickets extends React.PureComponent<IProps, IState> {
    context!: React.ContextType<typeof ApplicationContext>;
    state: IState = {
        serviceTickets: [],
        query: "",
        searchResults: [],
        sortOrder: { name: "last_update_time", descending: true },
        filterAttributes: {
            state: Object.values(ServiceTicketProcessState)
                .filter((s) => s)
                .map((state) => ({
                    name: state ?? "",
                    selected: ![ServiceTicketProcessState.ABORTED, ServiceTicketProcessState.CLOSED].includes(state),
                    count: 0,
                })),
        },
        ipPrefixProductId: "",
        activeBackgroundJobs: 0,
    };
    private interval: any;

    componentDidMount() {
        this.refreshData();
        this.interval = setInterval(this.checkAndRefresh, 5000);
    }

    componentWillUnmount() {
        this.interval = clearInterval(this.interval);
    }

    checkAndRefresh = () => {
        this.context.customApiClient.cimBackgroundJobCount().then((res) =>
            this.setState({
                activeBackgroundJobs: res.number_of_active_jobs,
            })
        );
        if (this.state.activeBackgroundJobs) {
            this.refreshData();
        }
    };

    refreshData() {
        console.log("Fetching tickets");
        this.context.customApiClient
            .cimTickets()
            .then((res) => {
                this.setState({
                    serviceTickets: res,
                    activeBackgroundJobs: res.filter((ticket) => ticket.transition_action).length,
                });
            })
            .catch((err) => {
                throw err;
            });
    }

    setFilter = (filterName: "state") => (item: Filter) => {
        const currentFilterAttributes = this.state.filterAttributes;
        let modifiedAttributes: Partial<FilterAttributes> = {};
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
        let modifiedAttributes: Partial<FilterAttributes> = {};
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
        let modifiedAttributes: Partial<FilterAttributes> = {};
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
        return typeof aSafe === "string" || typeof bSafe === "string"
            ? (aSafe as string).toLowerCase().localeCompare(bSafe.toString().toLowerCase())
            : aSafe - bSafe;
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
                (serviceTickets.title_nl !== null && serviceTickets.title_nl.toLowerCase().includes(queryToLower))
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

    deleteTicket = async (ticket_id: string) => {
        try {
            await this.context.customApiClient.cimDeleteTicket(ticket_id);
        } catch (error: any) {
            if (error.response.status === 400) {
                setFlash(error.response.data.detail, "error");
            } else {
                throw error;
            }
        }
        this.refreshData();
    };

    render() {
        const columns: Column[] = [
            "jira_ticket_id",
            "title_nl",
            "process_state",
            "opened_by",
            "start_date",
            "create_date",
            "last_update_time",
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
        const { activeBackgroundJobs, serviceTickets, query, searchResults, filterAttributes } = this.state;
        const filteredTickets = isEmpty(query) ? this.filter(serviceTickets) : this.filter(searchResults);

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
                                <EuiFlexItem grow={false} style={{ minWidth: 300 }}>
                                    <EuiFlexGroup justifyContent="spaceBetween">
                                        <EuiFlexItem grow={false} style={{ minWidth: 100 }}>
                                            <EuiFacetButton quantity={activeBackgroundJobs}>
                                                active background job(s)
                                            </EuiFacetButton>
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
                                <tr key={ticket._id} className={`${theme} ${ticket.process_state}`}>
                                    <td
                                        data-label={intl.formatMessage({ id: "tickets.table.jira_ticket_id" })}
                                        className="jira_ticket_id"
                                    >
                                        {ticket.process_state === ServiceTicketProcessState.NEW &&
                                            !ticket.transition_action && (
                                                <EuiIconTip
                                                    aria-label="Warning"
                                                    size="l"
                                                    type="alert"
                                                    color="warning"
                                                    content={intl.formatMessage({
                                                        id: "tickets.table.background_job_warning",
                                                    })}
                                                />
                                            )}
                                        {ticket.process_state === ServiceTicketProcessState.NEW &&
                                            ticket.transition_action === ServiceTicketTransition.RELATING && (
                                                <EuiLoadingSpinner size="s" style={{ marginRight: "9px" }} />
                                            )}
                                        <Link to={`/tickets/${ticket._id}`}>{ticket.jira_ticket_id}</Link>
                                    </td>
                                    <td
                                        data-label={intl.formatMessage({ id: "tickets.table.title" })}
                                        className="title"
                                    >
                                        {ticket.title_nl}
                                    </td>
                                    <td
                                        data-label={intl.formatMessage({ id: "tickets.table.process_state" })}
                                        className="process_state"
                                    >
                                        {ticket.process_state}
                                    </td>
                                    <td
                                        data-label={intl.formatMessage({ id: "tickets.table.opened_by" })}
                                        className="opened_by"
                                    >
                                        {ticket.opened_by}
                                    </td>
                                    <td
                                        data-label={intl.formatMessage({ id: "tickets.table.start_date" })}
                                        className="start_date"
                                    >
                                        {renderIsoDatetime(ticket.start_date, true)}
                                    </td>
                                    <td
                                        data-label={intl.formatMessage({ id: "tickets.table.create_date" })}
                                        className="create_date"
                                    >
                                        {renderIsoDatetime(ticket.create_date, true)}
                                    </td>
                                    <td
                                        data-label={intl.formatMessage({ id: "tickets.table.last_update_time" })}
                                        className="updated_on"
                                    >
                                        {renderIsoDatetime(ticket.last_update_time, true)}
                                    </td>
                                    <td>
                                        {ticket.process_state === ServiceTicketProcessState.NEW &&
                                            !ticket.transition_action && (
                                                <EuiButtonIcon
                                                    id={`tickets.table.${ticket._id}.delete`}
                                                    iconType="trash"
                                                    aria-label={intl.formatMessage({ id: "tickets.table.delete" })}
                                                    onClick={() => this.deleteTicket(ticket._id)}
                                                />
                                            )}
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
