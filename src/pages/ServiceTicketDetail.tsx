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
    EuiButtonEmpty,
    EuiFieldText,
    EuiFlexGroup,
    EuiFlexItem,
    EuiForm,
    EuiFormRow,
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
    useGeneratedHtmlId,
} from "@elastic/eui";
import { TabbedSection } from "components/subscriptionDetail/TabbedSection";
import { isDate } from "date-fns";
import { formSelect } from "forms/Builder";
import { MouseEvent, useContext, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { ValueType } from "react-select";
import ApplicationContext from "utils/ApplicationContext";
import { renderStringAsDateTime } from "utils/Lookups";
import {
    Option,
    ServiceTicketImpactedIMSCircuit,
    ServiceTicketImpactedObjectImpact,
    ServiceTicketLog,
    ServiceTicketLogType,
    ServiceTicketProcessState,
    ServiceTicketWithDetails,
    TabView,
} from "utils/types";
import { isEmpty, stop } from "utils/Utils";

import ServiceTicketDetailImpactedServices, { ImpactedService } from "./ServiceTicketDetailImpactedServices";
import { ticketDetail } from "./ServiceTicketDetailStyling";

interface IProps {
    ticketId: string;
}

function ServiceTicketDetail({ ticketId }: IProps) {
    const [ticket, setTicket] = useState<ServiceTicketWithDetails>();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [notFound, setNotFound] = useState(false);

    const [openedImpactedService, setOpenedImpactedService] = useState<ImpactedService>();
    const { theme, customApiClient } = useContext(ApplicationContext);

    const onCloseModal = () => {
        setIsModalVisible(false);
    };
    const onSubmitModal = (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        stop(event);
        if (!openedImpactedService || !ticket) {
            // TODO this is just to make typescript happy, but how to prevent this?
            return;
        }

        const impactedCircuit: ServiceTicketImpactedIMSCircuit = {
            ims_circuit_id: openedImpactedService?.ims_circuit_id,
            impact: openedImpactedService.impact,
            ims_circuit_name: openedImpactedService?.ims_circuit_name,
            extra_information: openedImpactedService?.extra_information,
            impact_override: impactOverrideValue,
        };

        customApiClient
            .cimPatchImpactedService(
                ticket?._id,
                openedImpactedService?.subscription_id,
                openedImpactedService?.ims_circuit_id,
                impactedCircuit
            )
            .then((res) => {
                // Successfully patched the impacted circuit in the serviceticket
                console.log("setTicket from onSubmitModal");
                setTicket(res);
                onCloseModal();
            })
            .catch((err) => {
                // Patch failed.. what now?
                throw err;
            });
    };

    const showModal = (circuit: ImpactedService) => {
        setOpenedImpactedService(circuit);
        setImpactOverrideValue(circuit.impact_override);
        setIsModalVisible(true);
    };

    const modalFormId = useGeneratedHtmlId({ prefix: "modalForm" });

    // Impact-override Dropdown in the modal
    const [impactOverrideValue, setImpactOverrideValue] = useState(openedImpactedService?.impact_override);
    const onImpactOverrideChange = (
        e:
            | Date
            | React.MouseEvent<HTMLSpanElement | HTMLButtonElement>
            | null
            | React.ChangeEvent<HTMLInputElement>
            | ValueType<Option, false>
    ) => {
        let value: any;
        if (isEmpty(e) || isDate(e)) {
            value = e;
        } else {
            // @ts-ignore
            value = e.target ? e.target.value : e.value;
        }
        setImpactOverrideValue(value);
    };

    useEffect(() => {
        console.log("useEffect");
        customApiClient
            .cimTicketById(ticketId)
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

    function renderLogItemButtons(_ticket: ServiceTicketWithDetails) {
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

    ticket.logs.sort((a: ServiceTicketLog, b: ServiceTicketLog) =>
        (a.entry_time as string).toLowerCase().localeCompare(b.entry_time.toString().toLowerCase())
    );

    let num_updates = 0;
    const format_logtype = (logtype: ServiceTicketLogType): string => {
        if (logtype === ServiceTicketLogType.update) {
            return `${logtype} #${++num_updates}`;
        }
        return logtype.toString();
    };

    const logitem_tabs: TabView[] = ticket.logs.map((logitem: ServiceTicketLog, index: number) => ({
        id: `mod-ticket-logitem-${index}`,
        name: format_logtype(logitem.logtype),
        disabled: false,
        content: (
            <EuiPanel hasBorder={false} hasShadow={false}>
                {logitem.update_nl}
                <EuiHorizontalRule margin="xs"></EuiHorizontalRule>
                {logitem.update_en}
                <EuiHorizontalRule margin="xs"></EuiHorizontalRule>
                Logged by {logitem.logged_by}, {renderStringAsDateTime(logitem.entry_time)}
            </EuiPanel>
        ),
    }));

    function renderModal(_ticket: ServiceTicketWithDetails) {
        console.log(_ticket.process_state);
        return (
            <EuiModal onClose={onCloseModal} initialFocus="[name=popswitch]">
                <EuiModalHeader>
                    <EuiModalHeaderTitle>
                        <h1>Edit service impact</h1>
                    </EuiModalHeaderTitle>
                </EuiModalHeader>

                <EuiModalBody>
                    <EuiForm id={modalFormId} component="form">
                        <EuiFormRow label="Customer">
                            <EuiFieldText readOnly name="customer" value={openedImpactedService?.customer} />
                        </EuiFormRow>
                        <EuiFormRow label="Impact">
                            <EuiFieldText readOnly name="impact" value={openedImpactedService?.impact} />
                        </EuiFormRow>
                        <EuiFormRow label="Type">
                            <EuiFieldText readOnly name="type" value={openedImpactedService?.type} />
                        </EuiFormRow>
                        <EuiFormRow label="Subscription">
                            <EuiFieldText readOnly name="subscription" value={openedImpactedService?.subscription} />
                        </EuiFormRow>
                        {formSelect(
                            "tickets.impactedservice.impact_override",
                            onImpactOverrideChange,
                            Object.values(ServiceTicketImpactedObjectImpact),
                            // Make dropdown readonly if ticket is not in one these 2 states
                            ![ServiceTicketProcessState.open_accepted, ServiceTicketProcessState.open_related].includes(
                                _ticket.process_state
                            ),
                            openedImpactedService?.impact_override,
                            true
                        )}
                    </EuiForm>
                </EuiModalBody>

                <EuiModalFooter>
                    <EuiButtonEmpty onClick={onCloseModal}>Cancel</EuiButtonEmpty>
                    <EuiButton type="submit" form={modalFormId} onClick={onSubmitModal} fill>
                        Save
                    </EuiButton>
                </EuiModalFooter>
            </EuiModal>
        );
    }

    console.log("Rendering the ServiceTicketDetail page with ticket;");
    console.log(ticket);
    return (
        <div>
            {isModalVisible && renderModal(ticket)}

            <EuiPage css={ticketDetail}>
                <EuiPageBody component="div">
                    <EuiFlexGroup>
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
                                                <td id="ticket-start_date-v">
                                                    {renderStringAsDateTime(ticket.start_date)}
                                                </td>
                                            </tr>
                                            <tr className={theme}>
                                                <td id="ticket-end_date-k">
                                                    <FormattedMessage id="tickets.table.end_date" />
                                                </td>
                                                <td id="ticket-end_date-v">
                                                    {renderStringAsDateTime(ticket.end_date)}
                                                </td>
                                            </tr>
                                            <EuiSpacer />
                                            <tr className={theme}>
                                                <td id="ticket-opened_by-k">
                                                    <FormattedMessage id="tickets.table.opened_by" />
                                                </td>
                                                <td id="ticket-opened_by-v">{ticket.opened_by}</td>
                                            </tr>
                                            <tr className={theme}>
                                                <td id="ticket-last_update_time-k">
                                                    <FormattedMessage id="tickets.table.last_update_time" />
                                                </td>
                                                <td id="ticket-last_update_time-v">
                                                    {renderStringAsDateTime(ticket.last_update_time)}
                                                </td>
                                            </tr>
                                            <tr className={theme}>
                                                <td id="ticket-process_state-k">
                                                    <FormattedMessage id="tickets.table.process_state" />
                                                </td>
                                                <td id="ticket-process_state-v">{ticket.process_state}</td>
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

                            {renderLogItemButtons(ticket)}

                            <EuiSpacer />
                            <EuiFlexGroup>
                                <EuiFlexItem grow={true}>
                                    <EuiTitle size="m">
                                        <h1>Impacted services</h1>
                                    </EuiTitle>
                                </EuiFlexItem>
                            </EuiFlexGroup>

                            <ServiceTicketDetailImpactedServices ticket={ticket} modalFunc={showModal} />
                        </EuiPanel>
                    </EuiFlexGroup>
                </EuiPageBody>
            </EuiPage>
        </div>
    );
}

export default ServiceTicketDetail;
