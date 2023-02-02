/*
 * Copyright 2019-2023 SURF.
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
    EuiIcon,
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
import ConfirmationDialogContext from "contextProviders/ConfirmationDialogProvider";
import BackgroundJobLogs from "custom/components/cim/BackgroundJobLogs";
import ImpactedObjects from "custom/components/cim/ImpactedObjects";
import { ticketDetail } from "custom/pages/ServiceTicketDetailStyling";
import {
    ServiceTicketLog,
    ServiceTicketLogType,
    ServiceTicketProcessState,
    ServiceTicketTransition,
    ServiceTicketType,
    ServiceTicketWithDetails,
} from "custom/types";
import { renderIsoDatetime } from "custom/Utils";
import { intl } from "locale/i18n";
import _ from "lodash";
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useQuery } from "react-query";
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
    transition?: ServiceTicketTransition;
    requiredStates?: ServiceTicketProcessState[];
}

const getUnfinishedInformLog = (ticket: ServiceTicketWithDetails): ServiceTicketLog | undefined => {
    return _.find(ticket.logs, (log) => log.completed === false);
};

const ticketHasUnfinishedInform = (ticket: ServiceTicketWithDetails): boolean => {
    return getUnfinishedInformLog(ticket) !== undefined;
};

const renderLogItemActions = (
    ticket: ServiceTicketWithDetails,
    allowedTransitions: ServiceTicketTransition[],
    actions: Action[]
) => {
    const enabled = (action: Action) => {
        if (action.transition) {
            if (ticketHasUnfinishedInform(ticket)) return false;

            if (ticket.transition_action) {
                // There is an ongoing transition -> hide actions that would try (but fail) to start a transition
                return false;
            }
            return allowedTransitions.includes(action.transition);
        }
        if (action.requiredStates) {
            return action.requiredStates.includes(ticket.process_state);
        }
        return true;
    };

    return (
        <EuiFlexGroup gutterSize="s" className="buttons">
            {actions.map((action: Action, index: number) => (
                <EuiFlexItem key={index}>
                    <EuiButton onClick={() => action.onClick()} isDisabled={!enabled(action)}>
                        <FormattedMessage id={action.translation} />
                    </EuiButton>
                </EuiFlexItem>
            ))}
        </EuiFlexGroup>
    );
};

const ServiceTicketDetail = () => {
    const { id: ticket_id } = useParams<IProps>();
    const [ticket, setTicket] = useState<ServiceTicketWithDetails>();
    const [allowedTransitions, setAllowedTransitions] = useState<ServiceTicketTransition[]>([]);
    const [notFound, setNotFound] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { theme, customApiClient, redirect } = useContext(ApplicationContext);
    const { showConfirmDialog } = useContext(ConfirmationDialogContext);
    const closeModal = () => setIsModalVisible(false);
    const showModal = () => setIsModalVisible(true);

    useQuery(["ticket", { id: ticket_id }], () => customApiClient.cimTicketByIdNoErrorDialog(ticket_id), {
        onSuccess: (res) => {
            setTicket(res);
        },
        onError: (err: any) => {
            if (err.response && err.response.status === 404) {
                setNotFound(true);
            }
        },
        refetchInterval: 5000,
    });

    useEffect(() => {
        customApiClient.cimGetAllowedTransitions(ticket_id).then((res) => {
            setAllowedTransitions(res);
        });
    }, [ticket_id, customApiClient, ticket]);

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
    const format_log_type = (log_type: ServiceTicketLogType): string => {
        if (log_type === ServiceTicketLogType.UPDATE) {
            return `${log_type} #${++num_updates}`;
        }
        return log_type.toString();
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
            name: format_log_type(logitem.log_type),
            disabled: false,
            content: (
                <EuiPanel hasBorder={true} hasShadow={false} borderRadius="none">
                    {logitem.update_nl}
                    <EuiHorizontalRule margin="m"></EuiHorizontalRule>
                    {logitem.update_en}
                    <EuiHorizontalRule margin="m"></EuiHorizontalRule>
                    Logged by {logitem.logged_by}, {renderIsoDatetime(logitem.entry_time)}
                </EuiPanel>
            ),
        }));
    }

    const acceptImpactedObjects = () => {
        customApiClient.cimAcceptTicket(ticket_id).then((res) => setTicket(res));
    };
    const abortTicket = () => {
        customApiClient.cimAbortTicket(ticket_id).then((res) => setTicket(res));
    };
    const openTicket = () => {
        redirect(`/tickets/${ticket_id}/open`);
    };
    const updateTicket = () => {
        redirect(`/tickets/${ticket_id}/update`);
    };
    const closeTicket = () => {
        redirect(`/tickets/${ticket_id}/close`);
    };
    const openAndCloseTicket = () => {
        redirect(`/tickets/${ticket_id}/open-and-close`);
    };
    const viewLastSentMails = () => {
        redirect(`/tickets/${ticket_id}/mails`);
    };
    const restartOpenRelate = () => {
        customApiClient.cimRestartOpenRelate(ticket_id).then(() => {
            setFlash(
                intl.formatMessage({
                    id: "tickets.action.background_job_restarted",
                })
            );
            redirect(`/tickets/${ticket_id}`);
        });
    };
    const restartInformJob = () => {
        customApiClient
            .cimRestartInform(ticket_id)
            .then(() => {
                setFlash(
                    intl.formatMessage({
                        id: "tickets.action.inform_job_restarted",
                    })
                );
                redirect(`/tickets/${ticket_id}`);
            })
            .catch((err) => {
                if (err.response && err.response.status === 400) {
                    setFlash(err.response.data.detail, "error");
                }
            });
    };

    const onButtonClick = (question: string, confirm: (e: React.MouseEvent<HTMLButtonElement>) => void) => {
        showConfirmDialog({
            question: question,
            confirmAction: confirm,
            cancelAction: () => {},
            leavePage: false,
        });
    };

    let actions: Action[] = [
        {
            translation: "tickets.action.opening",
            onClick: openTicket,
            transition: ServiceTicketTransition.OPENING,
        },
        {
            translation: "tickets.action.updating",
            onClick: updateTicket,
            transition: ServiceTicketTransition.UPDATING,
        },
        {
            translation: "tickets.action.closing",
            onClick: closeTicket,
            transition: ServiceTicketTransition.CLOSING,
        },
        {
            translation: "tickets.action.aborting",
            onClick: () => onButtonClick("Aborting the ticket is irreversible. Are you sure?", abortTicket),
            transition: ServiceTicketTransition.ABORTING,
        },
        {
            translation: "tickets.action.show",
            onClick: viewLastSentMails,
            requiredStates: [
                ServiceTicketProcessState.OPEN,
                ServiceTicketProcessState.UPDATED,
                ServiceTicketProcessState.CLOSED,
            ],
        },
    ];

    if (ticket.type === ServiceTicketType.INCIDENT) {
        actions.splice(2, 0, {
            translation: "tickets.action.open_and_close",
            onClick: openAndCloseTicket,
            transition: ServiceTicketTransition.OPEN_AND_CLOSE,
        });
    }

    const isUpdateImpactActive = allowedTransitions.includes(ServiceTicketTransition.ACCEPTING);

    const keyRowClass = "key-row";
    const valueRowClass = "value-row";

    let endDate = "Not set";
    if (ticket.end_date) {
        endDate = renderIsoDatetime(ticket.end_date);
    }

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
                            <EuiFlexItem grow={false} style={{ minWidth: 100 }}>
                                <EuiFacetButton
                                    style={{ marginTop: -3 }}
                                    icon={<EuiIcon type="apmTrace" />}
                                    onClick={showModal}
                                    quantity={ticket?.background_logs.length}
                                >
                                    background job logs
                                </EuiFacetButton>
                            </EuiFlexItem>
                            <EuiFlexItem grow={false} style={{ minWidth: 140 }}>
                                <EuiFacetButton
                                    quantity={ticket?.transition_action ? 1 : 0}
                                    isSelected={ticket?.transition_action ? true : false}
                                >
                                    active background job(s)
                                </EuiFacetButton>
                            </EuiFlexItem>

                            {ticket?.transition_action === null &&
                                ticket?.process_state === ServiceTicketProcessState.NEW && (
                                    <EuiFlexItem grow={false} style={{ minWidth: 200 }}>
                                        <EuiButton
                                            color={"danger"}
                                            iconType="refresh"
                                            isDisabled={false}
                                            size="m"
                                            fill
                                            onClick={restartOpenRelate}
                                        >
                                            {intl.formatMessage({ id: "tickets.action.restart_open_relate" })}
                                        </EuiButton>
                                    </EuiFlexItem>
                                )}

                            {ticket?.transition_action === null && ticketHasUnfinishedInform(ticket) && (
                                <EuiFlexItem grow={false} style={{ minWidth: 200 }}>
                                    <EuiButton
                                        color={"danger"}
                                        iconType="refresh"
                                        isDisabled={false}
                                        size="m"
                                        fill
                                        onClick={restartInformJob}
                                    >
                                        {intl.formatMessage(
                                            { id: "tickets.action.restart_inform_job" },
                                            { inform_job: getUnfinishedInformLog(ticket)?.log_type.toUpperCase() }
                                        )}
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
                                        <td className={valueRowClass}>{renderIsoDatetime(ticket.start_date)}</td>
                                    </tr>
                                    <tr className={theme}>
                                        <td className={keyRowClass}>
                                            <FormattedMessage id="tickets.table.end_date" />
                                        </td>
                                        <td className={valueRowClass}>{endDate}</td>
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
                                        <td className={valueRowClass}>{renderIsoDatetime(ticket.create_date)}</td>
                                    </tr>
                                    <tr className={theme}>
                                        <td className={keyRowClass}>
                                            <FormattedMessage id="tickets.table.last_update_time" />
                                        </td>
                                        <td className={valueRowClass}>{renderIsoDatetime(ticket.last_update_time)}</td>
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
                        {renderLogItemActions(ticket, allowedTransitions, actions)}
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
