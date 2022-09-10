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
    EuiFacetButton,
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
import ServiceTicketDetailImpactedObjects from "custom/components/cim/ServiceTicketDetailImpactedObjects";
import { ticketDetail } from "custom/pages/ServiceTicketDetailStyling";
import {
    ServiceTicketLog,
    ServiceTicketLogType,
    ServiceTicketProcessState,
    ServiceTicketWithDetails,
} from "custom/types";
import useInterval from "hooks/useInterval";
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useParams } from "react-router";
import ApplicationContext from "utils/ApplicationContext";
import { renderStringAsDateTime } from "utils/Lookups";
import { TabView } from "utils/types";

interface IProps {
    id: string;
}

interface Action {
    translation: string;
    onClick: () => void;
    requiredState: ServiceTicketProcessState[];
}

const renderLogItemActions = (ticket: ServiceTicketWithDetails, actions: Action[]) => {
    return (
        <EuiFlexGroup gutterSize="s" className="buttons">
            {actions.map((action: Action, index: number) => (
                <EuiFlexItem key={index}>
                    <EuiButton
                        onClick={action.onClick}
                        isDisabled={!action.requiredState.includes(ticket.process_state)}
                    >
                        <FormattedMessage id={action.translation} />
                    </EuiButton>
                </EuiFlexItem>
            ))}
        </EuiFlexGroup>
    );
};

const ServiceTicketDetail = () => {
    const { id } = useParams<IProps>();
    const [ticket, setTicket] = useState<ServiceTicketWithDetails>();
    const [notFound, setNotFound] = useState(false);

    const { theme, customApiClient, redirect } = useContext(ApplicationContext);

    useInterval(async () => {
        if (ticket?.transition_action) {
            console.log("Refreshing");
            const ticket = await customApiClient.cimTicketById(id);
            setTicket(ticket);
        }
    }, 3000);

    useEffect(() => {
        customApiClient
            .cimTicketById(id)
            .then((res) => {
                console.log("setTicket from useEffect");
                setTicket(res);
            })
            .catch((err) => {
                if (err.response && err.response.status === 404) {
                    setNotFound(true);
                } else {
                    throw err;
                }
            });
    }, [id, customApiClient]);

    if (notFound) {
        return (
            <h2>
                <FormattedMessage id="tickets.notFound" />
            </h2>
        );
    } else if (!ticket) {
        return null;
    }

    ticket.logs.sort((a: ServiceTicketLog, b: ServiceTicketLog) =>
        (a.entry_time as string).toLowerCase().localeCompare(b.entry_time.toString().toLowerCase())
    );

    let num_updates = 0;
    const format_logtype = (logtype: ServiceTicketLogType): string => {
        if (logtype === ServiceTicketLogType.UPDATE) {
            return `${logtype} #${++num_updates}`;
        }
        return logtype.toString();
    };

    let logitem_tabs: TabView[] = [
        {
            id: "mod-ticket-logitem-0",
            name: "description",
            disabled: false,
            content: <EuiPanel hasBorder={true} hasShadow={false} borderRadius="none"></EuiPanel>,
        },
    ];
    if (ticket.logs.length > 0) {
        logitem_tabs = ticket.logs.map((logitem: ServiceTicketLog, index: number) => ({
            id: `mod-ticket-logitem-${index}`,
            name: format_logtype(logitem.logtype),
            disabled: false,
            content: (
                <EuiPanel hasBorder={true} hasShadow={false} borderRadius="none">
                    {logitem.update_nl}
                    <EuiHorizontalRule margin="m"></EuiHorizontalRule>
                    {logitem.update_en}
                    <EuiHorizontalRule margin="m"></EuiHorizontalRule>
                    Logged by {logitem.logged_by}, {renderStringAsDateTime(logitem.entry_time)}
                </EuiPanel>
            ),
        }));
    }

    const changeTicketState = (state: ServiceTicketProcessState) => {
        customApiClient
            .cimChangeTicketStateById(id, state)
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
    };
    const acceptImpactedObjects = () => {
        changeTicketState(ServiceTicketProcessState.OPEN_ACCEPTED);
    };
    const abortTicket = () => {
        changeTicketState(ServiceTicketProcessState.ABORTED);
    };
    const openTicket = () => {
        redirect(`/tickets/${ticket._id}/open`);
    };
    const updateTicket = () => {
        redirect(`/tickets/${ticket._id}/update`);
    };

    const actions: Action[] = [
        {
            translation: "tickets.action.opening",
            onClick: openTicket,
            requiredState: [ServiceTicketProcessState.OPEN_ACCEPTED],
        },
        {
            translation: "tickets.action.updating",
            onClick: () => updateTicket,
            requiredState: [ServiceTicketProcessState.OPEN, ServiceTicketProcessState.UPDATED],
        },
        {
            translation: "tickets.action.closing",
            onClick: () => {},
            requiredState: [ServiceTicketProcessState.OPEN, ServiceTicketProcessState.UPDATED],
        },
        {
            translation: "tickets.action.aborting",
            onClick: abortTicket,
            requiredState: [ServiceTicketProcessState.OPEN_ACCEPTED, ServiceTicketProcessState.OPEN_RELATED],
        },
        {
            translation: "tickets.action.show",
            onClick: () => {},
            requiredState: [
                ServiceTicketProcessState.OPEN,
                ServiceTicketProcessState.UPDATED,
                ServiceTicketProcessState.CLOSED,
            ],
        },
    ];

    const isUpdateImpactActive = [
        ServiceTicketProcessState.OPEN_ACCEPTED,
        ServiceTicketProcessState.OPEN_RELATED,
    ].includes(ticket.process_state);

    console.log("Rendering the ServiceTicketDetail page with ticket;");
    console.log(ticket);

    const keyRowClass = "key-row";
    const valueRowClass = "value-row";
    return (
        <div>
            <EuiPage css={ticketDetail}>
                <EuiPageBody component="div">
                    <EuiPanel>
                        <div className="mod-ticket">
                            <EuiFlexGroup>
                                <EuiFlexItem grow={true}>
                                    <EuiTitle size="m">
                                        <h1>Service ticket</h1>
                                    </EuiTitle>
                                </EuiFlexItem>
                                <EuiFlexItem grow={false} style={{ minWidth: 90 }}>
                                    <EuiFacetButton quantity={ticket?.transition_action ? 1 : 0}>
                                        active background job(s)
                                    </EuiFacetButton>
                                </EuiFlexItem>
                            </EuiFlexGroup>
                            <div className="mod-ticket-detail">
                                <table className={`detail-block`}>
                                    <thead />
                                    <tbody>
                                        <tr className={theme}>
                                            <td className={keyRowClass}>
                                                <FormattedMessage id="tickets.table.title" />
                                            </td>
                                            <td className={valueRowClass}>{ticket.title_nl}</td>
                                        </tr>
                                        <tr className={theme}>
                                            <td className={keyRowClass}>
                                                <FormattedMessage id="tickets.table.jira_ticket_id" />
                                            </td>
                                            <td className={valueRowClass}>{ticket.jira_ticket_id}</td>
                                        </tr>
                                        <tr className={theme}>
                                            <td className={keyRowClass}>
                                                <FormattedMessage id="tickets.table.type" />
                                            </td>
                                            <td className={valueRowClass}>{ticket.type}</td>
                                        </tr>
                                        <tr className={theme}>
                                            <td className={keyRowClass}>
                                                <FormattedMessage id="tickets.table.start_date" />
                                            </td>
                                            <td className={valueRowClass}>
                                                {renderStringAsDateTime(ticket.start_date)}
                                            </td>
                                        </tr>
                                        <tr className={theme}>
                                            <td className={keyRowClass}>
                                                <FormattedMessage id="tickets.table.end_date" />
                                            </td>
                                            <td className={valueRowClass}>{renderStringAsDateTime(ticket.end_date)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table className={`detail-block`}>
                                    <thead />
                                    <tbody>
                                        <tr className={theme}>
                                            <td className={keyRowClass}>
                                                <FormattedMessage id="tickets.table.opened_by" />
                                            </td>
                                            <td className={valueRowClass}>{ticket.opened_by}</td>
                                        </tr>
                                        <tr className={theme}>
                                            <td className={keyRowClass}>
                                                <FormattedMessage id="tickets.table.last_update_time" />
                                            </td>
                                            <td className={valueRowClass}>
                                                {renderStringAsDateTime(ticket.last_update_time)}
                                            </td>
                                        </tr>
                                        <tr className={theme}>
                                            <td className={keyRowClass}>
                                                <FormattedMessage id="tickets.table.process_state" />
                                            </td>
                                            <td className={valueRowClass}>{ticket.process_state}</td>
                                        </tr>
                                    </tbody>
                                </table>
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
                                <TabbedSection
                                    id="ticket-logitems-tabs"
                                    tabs={logitem_tabs}
                                    className="tabbed-logitems-parent"
                                    name={<FormattedMessage id="tickets.logitems" />}
                                ></TabbedSection>
                            </div>

                            <EuiSpacer />

                            {renderLogItemActions(ticket, actions)}

                            <EuiSpacer />

                            <ServiceTicketDetailImpactedObjects
                                ticket={ticket}
                                updateable={isUpdateImpactActive}
                                acceptImpactedObjects={acceptImpactedObjects}
                            />
                        </div>
                    </EuiPanel>
                </EuiPageBody>
            </EuiPage>
        </div>
    );
};

export default ServiceTicketDetail;
