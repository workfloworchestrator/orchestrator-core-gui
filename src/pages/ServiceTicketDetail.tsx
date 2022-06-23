/*
 * Copyright 2019-2022 SURF.
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

import {
    EuiButton,
    EuiFlexGroup,
    EuiFlexItem,
    EuiHorizontalRule,
    EuiPage,
    EuiPageBody,
    EuiPanel,
    EuiSpacer,
    EuiTitle,
} from "@elastic/eui";
import { TabbedSection } from "components/subscriptionDetail/TabbedSection";
import React from "react";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";
import { RouteComponentProps } from "react-router";
import { DecodedValueMap, NumberParam, QueryParamConfigMap, SetQuery, withQueryParams } from "use-query-params";
import ApplicationContext from "utils/ApplicationContext";
import { CommaSeparatedNumericArrayParam } from "utils/QueryParameters";
import { ServiceTicketLog, ServiceTicketProcessState, ServiceTicketWithDetails, TabView } from "utils/types";

import ServiceTicketDetailImpactedObjects from "./ServiceTicketDetailImpactedObjects";
import { ticketDetail } from "./ServiceTicketDetailStyling";

const queryConfig: QueryParamConfigMap = { collapsed: CommaSeparatedNumericArrayParam, scrollToStep: NumberParam };

interface MatchParams {
    id: string;
}
interface IProps extends RouteComponentProps<MatchParams>, WrappedComponentProps {
    query: DecodedValueMap<typeof queryConfig>;
    setQuery: SetQuery<typeof queryConfig>;
}

interface IState {
    ticket?: ServiceTicketWithDetails;
    notFound: boolean;
    loaded: boolean;
}

class ServiceTicketDetail extends React.PureComponent<IProps, IState> {
    context!: React.ContextType<typeof ApplicationContext>;

    constructor(props: IProps) {
        super(props);
        this.state = {
            ticket: undefined,
            notFound: false,
            loaded: false,
        };
    }

    componentDidMount = () => {
        this.context.customApiClient
            .cimTicketById(this.props.match.params.id)
            .then((res) => {
                this.setState({ ticket: res, loaded: true });
            })
            .catch((err) => {
                if (err.response && err.response.status === 404) {
                    this.setState({ notFound: true, loaded: true });
                } else {
                    throw err;
                }
            });
    };

    renderButtons = () => {
        if (!this.state.ticket) return null;

        const { ticket } = this.state;

        return (
            <EuiFlexGroup gutterSize="s" className="buttons">
                <EuiFlexItem>
                    <EuiButton
                        id="button-action-open"
                        // onClick={this.props.previous}
                        isDisabled={ticket.process_state !== ServiceTicketProcessState.open_accepted}
                    >
                        <FormattedMessage id="tickets.action.opening" />
                    </EuiButton>
                </EuiFlexItem>
                <EuiFlexItem>
                    <EuiButton
                        id="button-action-update"
                        // onClick={this.props.previous}
                        isDisabled={
                            ![ServiceTicketProcessState.open, ServiceTicketProcessState.updated].includes(
                                ticket.process_state
                            )
                        }
                    >
                        <FormattedMessage id="tickets.action.updating" />
                    </EuiButton>
                </EuiFlexItem>
                <EuiFlexItem>
                    <EuiButton
                        id="button-action-close"
                        // onClick={this.props.previous}
                        isDisabled={
                            ![ServiceTicketProcessState.open, ServiceTicketProcessState.updated].includes(
                                ticket.process_state
                            )
                        }
                    >
                        <FormattedMessage id="tickets.action.closing" />
                    </EuiButton>
                </EuiFlexItem>
                <EuiFlexItem>
                    <EuiButton
                        id="button-action-abort"
                        // onClick={this.props.previous}
                        isDisabled={
                            ![ServiceTicketProcessState.open_accepted, ServiceTicketProcessState.open_related].includes(
                                ticket.process_state
                            )
                        }
                    >
                        <FormattedMessage id="tickets.action.aborting" />
                    </EuiButton>
                </EuiFlexItem>
                <EuiFlexItem>
                    <EuiButton
                        id="button-action-show"
                        // onClick={this.props.previous}
                        isDisabled={
                            ![
                                ServiceTicketProcessState.open,
                                ServiceTicketProcessState.updated,
                                ServiceTicketProcessState.closed,
                            ].includes(ticket.process_state)
                        }
                    >
                        <FormattedMessage id="tickets.action.show" />
                    </EuiButton>
                </EuiFlexItem>
            </EuiFlexGroup>
        );
    };

    render() {
        if (!this.state.ticket) return null;

        const { ticket } = this.state;

        const { theme } = this.context;

        // TODO entry time should be a number, currently a datetime string
        ticket.logs.sort((a: ServiceTicketLog, b: ServiceTicketLog) => a.entry_time - b.entry_time);

        const logitem_tabs: TabView[] = ticket.logs.map((logitem: ServiceTicketLog, index: number) => ({
            id: `mod-ticket-logitem-${index}`,
            name: logitem.logtype,
            disabled: false,
            content: (
                <EuiPanel hasBorder={false} hasShadow={false}>
                    {logitem.update_nl}
                    <EuiHorizontalRule margin="xs"></EuiHorizontalRule>
                    {logitem.update_en}
                    <EuiHorizontalRule margin="xs"></EuiHorizontalRule>
                    Logged by {logitem.logged_by}, {logitem.entry_time}
                </EuiPanel>
            ),
        }));

        return (
            <EuiPage css={ticketDetail}>
                <EuiPageBody component="div">
                    <EuiPanel>
                        <EuiFlexGroup>
                            <EuiFlexItem grow={true}>
                                <EuiTitle size="m">
                                    <h1>Service ticket</h1>
                                </EuiTitle>
                            </EuiFlexItem>
                        </EuiFlexGroup>
                        <div className="mod-ticket-detail">
                            <div className="ticket-details">
                                <table className={`detail-block`}>
                                    <thead />
                                    <tbody>
                                        <tr className={theme}>
                                            <td id="ticket-title-k">
                                                <FormattedMessage id="tickets.table.title" />
                                            </td>
                                            <td id="ticket-title-v">{ticket.title}</td>
                                        </tr>
                                        <tr className={theme}>
                                            <td id="ticket-jira_ticket_id-k">
                                                <FormattedMessage id="tickets.table.jira_ticket_id" />
                                            </td>
                                            <td id="ticket-jira_ticket_id-v">{ticket.jira_ticket_id}</td>
                                        </tr>
                                        <tr className={theme}>
                                            <td id="ticket-type-k">
                                                <FormattedMessage id="tickets.table.type" />
                                            </td>
                                            <td id="ticket-type-v">{ticket.type}</td>
                                        </tr>
                                        <tr className={theme}>
                                            <td id="ticket-start_date-k">
                                                <FormattedMessage id="tickets.table.start_date" />
                                            </td>
                                            <td id="ticket-start_date-v">{ticket.start_date}</td>
                                        </tr>
                                        <tr className={theme}>
                                            <td id="ticket-end_date-k">
                                                <FormattedMessage id="tickets.table.end_date" />
                                            </td>
                                            <td id="ticket-end_date-v">{ticket.end_date}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <EuiSpacer />
                        <EuiFlexGroup>
                            <EuiFlexItem grow={true}>
                                <EuiTitle size="m">
                                    <h1>Log items</h1>
                                </EuiTitle>
                            </EuiFlexItem>
                        </EuiFlexGroup>
                        <div className="mod-ticket-logitems">
                            <div className="ticket-logitems">
                                <TabbedSection
                                    id="ticket-logitems-tabs"
                                    tabs={logitem_tabs}
                                    className="tabbed-logitems-parent"
                                    name={<FormattedMessage id="tickets.logitems" />}
                                ></TabbedSection>
                            </div>
                        </div>

                        <EuiSpacer />

                        {this.renderButtons()}

                        <EuiSpacer />
                        <EuiFlexGroup>
                            <EuiFlexItem grow={true}>
                                <EuiTitle size="m">
                                    <h1>Impacted services</h1>
                                </EuiTitle>
                            </EuiFlexItem>
                        </EuiFlexGroup>

                        <ServiceTicketDetailImpactedObjects ticket={ticket} />
                    </EuiPanel>
                </EuiPageBody>
            </EuiPage>
        );
    }
}

ServiceTicketDetail.contextType = ApplicationContext;

export default injectIntl(withQueryParams(queryConfig, ServiceTicketDetail));
