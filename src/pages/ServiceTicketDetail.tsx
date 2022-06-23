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
import { useContext, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import ApplicationContext from "utils/ApplicationContext";
import { ServiceTicketLog, ServiceTicketProcessState, ServiceTicketWithDetails, TabView } from "utils/types";

import ServiceTicketDetailImpactedObjects from "./ServiceTicketDetailImpactedObjects";
import { ticketDetail } from "./ServiceTicketDetailStyling";

interface IProps {
    ticketId: string;
}

function ServiceTicketDetail({ ticketId }: IProps) {
    const [ticket, setTicket] = useState<ServiceTicketWithDetails>();
    const [notFound, setNotFound] = useState(false);

    const { theme, customApiClient } = useContext(ApplicationContext);

    useEffect(() => {
        customApiClient
            .cimTicketById(ticketId)
            .then((res) => {
                setTicket(res);
            })
            .catch((err) => {
                if (err.response && err.response.status === 404) {
                    setNotFound(true);
                } else {
                    throw err;
                }
            });
    }, [ticketId, customApiClient]);

    if (notFound) {
        return (
            <h2>
                <FormattedMessage id="tickets.notFound" />
            </h2>
        );
    } else if (!ticket) {
        return null;
    }

    function renderButtons(_ticket: ServiceTicketWithDetails) {
        return (
            <EuiFlexGroup gutterSize="s" className="buttons">
                <EuiFlexItem>
                    <EuiButton
                        id="button-action-open"
                        // onClick={this.props.previous}
                        isDisabled={_ticket.process_state !== ServiceTicketProcessState.open_accepted}
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
                                _ticket.process_state
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
                                _ticket.process_state
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
                                _ticket.process_state
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
                            ].includes(_ticket.process_state)
                        }
                    >
                        <FormattedMessage id="tickets.action.show" />
                    </EuiButton>
                </EuiFlexItem>
            </EuiFlexGroup>
        );
    }

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

                    {renderButtons(ticket)}

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

export default ServiceTicketDetail;
