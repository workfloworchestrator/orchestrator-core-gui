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
    EuiButtonIcon,
    EuiFacetButton,
    EuiFlexGroup,
    EuiFlexItem,
    EuiHorizontalRule,
    EuiModal,
    EuiModalBody,
    EuiModalFooter,
    EuiModalHeader,
    EuiModalHeaderTitle,
    EuiPage,
    EuiPageBody,
    EuiPanel,
    EuiSpacer,
    EuiTitle,
} from "@elastic/eui";
import { TabbedSection } from "components/subscriptionDetail/TabbedSection";
import BackgroundJobLogs from "custom/components/cim/BackgroundJobLogs";
import ImpactedObjects from "custom/components/cim/ImpactedObjects";
import { ticketDetail } from "custom/pages/ServiceTicketDetailStyling";
import {
    ServiceTicketLog,
    ServiceTicketLogType,
    ServiceTicketProcessState,
    ServiceTicketWithDetails,
} from "custom/types";
import { renderStringAsDateTime } from "custom/Utils";
import useInterval from "hooks/useInterval";
import { intl } from "locale/i18n";
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useParams } from "react-router";
import ApplicationContext from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";
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
                        onClick={() => action.onClick()}
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
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { theme, customApiClient, redirect } = useContext(ApplicationContext);
    const closeModal = () => setIsModalVisible(false);
    const showModal = () => setIsModalVisible(true);

    useInterval(async () => {
        if (ticket?.transition_action) {
            console.log("Refreshing");
            const ticket = await customApiClient.cimTicketById(id);
            setTicket(ticket);
        }
    }, 5000);

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
            content: (
                <EuiPanel
                    hasBorder={true}
                    hasShadow={false}
                    borderRadius="none"
                    style={{ minHeight: "150px" }}
                ></EuiPanel>
            ),
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
    const closeTicket = () => {
        redirect(`/tickets/${ticket._id}/close`);
    };

    let actions: Action[] = [
        {
            translation: "tickets.action.opening",
            onClick: openTicket,
            requiredState: [ServiceTicketProcessState.OPEN_ACCEPTED],
        },
        {
            translation: "tickets.action.updating",
            onClick: updateTicket,
            requiredState: [ServiceTicketProcessState.OPEN, ServiceTicketProcessState.UPDATED],
        },
        {
            translation: "tickets.action.closing",
            onClick: closeTicket,
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

    actions.splice(1, 0, {
        translation: "tickets.action.open_and_close",
        onClick: () => {},
        requiredState: [
            ServiceTicketProcessState.OPEN_ACCEPTED,
            ServiceTicketProcessState.OPEN,
            ServiceTicketProcessState.UPDATED,
        ],
    });

    const isUpdateImpactActive = [
        ServiceTicketProcessState.OPEN_ACCEPTED,
        ServiceTicketProcessState.OPEN_RELATED,
    ].includes(ticket.process_state);

    console.log("Rendering the ServiceTicketDetail page with ticket;", ticket);

    const keyRowClass = "key-row";
    const valueRowClass = "value-row";
    return (
        <EuiPage css={ticketDetail}>
            <EuiPageBody component="div">
                {isModalVisible && (
                    <EuiModal style={{ minWidth: 1024 }} onClose={closeModal}>
                        <EuiModalHeader>
                            <EuiModalHeaderTitle>
                                <h1>Background job logs</h1>
                            </EuiModalHeaderTitle>
                        </EuiModalHeader>

                        <EuiModalBody>
                            <BackgroundJobLogs data={ticket.background_logs} />
                        </EuiModalBody>

                        <EuiModalFooter>
                            <EuiButton onClick={closeModal} fill>
                                Close
                            </EuiButton>
                        </EuiModalFooter>
                    </EuiModal>
                )}
                <EuiPanel>
                    <div className="mod-ticket">
                        <EuiFlexGroup>
                            <EuiFlexItem grow={true}>
                                <EuiTitle size="m">
                                    <h1>Service ticket</h1>
                                </EuiTitle>
                            </EuiFlexItem>
                            <EuiFlexItem grow={false} style={{ width: 20 }}>
                                <EuiButtonIcon
                                    style={{ marginTop: -3 }}
                                    size="m"
                                    iconType="apmTrace"
                                    onClick={showModal}
                                ></EuiButtonIcon>
                            </EuiFlexItem>
                            <EuiFlexItem grow={false} style={{ minWidth: 140 }}>
                                <EuiFacetButton quantity={ticket?.transition_action ? 1 : 0}>
                                    active background job(s)
                                </EuiFacetButton>
                            </EuiFlexItem>

                            {ticket?.transition_action === null && ticket?.process_state === "initial" && (
                                <EuiFlexItem grow={false} style={{ minWidth: 200 }}>
                                    <EuiButton
                                        color={"danger"}
                                        iconType="refresh"
                                        isDisabled={false}
                                        size="m"
                                        fill
                                        onClick={() =>
                                            customApiClient.cimRestartOpenRelate(ticket._id).then(() => {
                                                setFlash(
                                                    intl.formatMessage({
                                                        id: "tickets.action.background_job_restarted",
                                                    })
                                                );
                                                redirect("/tickets");
                                            })
                                        }
                                    >
                                        {intl.formatMessage({ id: "tickets.action.restart_open_relate" })}
                                    </EuiButton>
                                </EuiFlexItem>
                            )}
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
                                            <FormattedMessage id="tickets.table.ims_pw_id" />
                                        </td>
                                        <td className={valueRowClass}>{ticket.ims_pw_id}</td>
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
                                        <td className={valueRowClass}>{renderStringAsDateTime(ticket.start_date)}</td>
                                    </tr>
                                    <tr className={theme}>
                                        <td className={keyRowClass}>
                                            <FormattedMessage id="tickets.table.end_date" />
                                        </td>
                                        <td className={valueRowClass}>{renderStringAsDateTime(ticket.end_date)}</td>
                                    </tr>
                                    <tr className={theme}>
                                        <td className={keyRowClass}>
                                            <FormattedMessage id="tickets.table.opened_by" />
                                        </td>
                                        <td className={valueRowClass}>{ticket.opened_by}</td>
                                    </tr>
                                    <tr className={theme}>
                                        <td className={keyRowClass}>
                                            <FormattedMessage id="tickets.table.create_date" />
                                        </td>
                                        <td className={valueRowClass}>{renderStringAsDateTime(ticket.create_date)}</td>
                                    </tr>
                                    <tr className={theme}>
                                        <td className={keyRowClass}>
                                            <FormattedMessage id="tickets.table.last_update_time" />
                                        </td>
                                        <td className={valueRowClass}>
                                            {renderStringAsDateTime(ticket.last_update_time)}
                                        </td>
                                    </tr>
                                    {ticket?.transition_action && (
                                        <tr className={theme}>
                                            <td className={keyRowClass}>
                                                <FormattedMessage id="tickets.table.transition_action" />
                                            </td>
                                            <td className={valueRowClass}>{ticket.transition_action}</td>
                                        </tr>
                                    )}
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
                        <EuiSpacer size="s" />
                        <ImpactedObjects ticket={ticket} withSubscriptions={true} updateable={isUpdateImpactActive} />
                        <EuiSpacer />
                        <EuiFlexGroup gutterSize="s" className="buttons">
                            <EuiFlexItem>
                                <EuiButton onClick={acceptImpactedObjects} isDisabled={!isUpdateImpactActive}>
                                    <FormattedMessage id="tickets.action.accept_impact" />
                                </EuiButton>
                            </EuiFlexItem>
                        </EuiFlexGroup>
                        <EuiSpacer size="s" />
                        <ImpactedObjects ticket={ticket} withSubscriptions={false} updateable={isUpdateImpactActive} />
                        <EuiSpacer />
                        <EuiFlexGroup gutterSize="s" className="buttons">
                            <EuiFlexItem>
                                <EuiButton onClick={acceptImpactedObjects} isDisabled={!isUpdateImpactActive}>
                                    <FormattedMessage id="tickets.action.accept_impact" />
                                </EuiButton>
                            </EuiFlexItem>
                        </EuiFlexGroup>
                    </div>
                </EuiPanel>
            </EuiPageBody>
        </EuiPage>
    );
};

export default ServiceTicketDetail;
