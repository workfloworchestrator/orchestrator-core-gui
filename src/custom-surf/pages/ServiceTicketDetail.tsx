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
import ServiceTicketDetailImpactedObjects, {
    ImpactedObject,
} from "custom/components/cim/ServiceTicketDetailImpactedObjects";
import { ticketDetail } from "custom/pages/ServiceTicketDetailStyling";
import {
    ServiceTicketImpactedIMSCircuit,
    ServiceTicketImpactedObjectImpact,
    ServiceTicketLog,
    ServiceTicketLogType,
    ServiceTicketProcessState,
    ServiceTicketWithDetails,
} from "custom/types";
import { isDate } from "date-fns";
import { formSelect } from "forms/Builder";
import { MouseEvent, useContext, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useParams } from "react-router";
import { ValueType } from "react-select";
import ApplicationContext from "utils/ApplicationContext";
import { renderStringAsDateTime } from "utils/Lookups";
import { Option, TabView } from "utils/types";
import { isEmpty, stop } from "utils/Utils";

interface IProps {
    id: string;
}

function ServiceTicketDetail() {
    const { id } = useParams<IProps>();
    const [ticket, setTicket] = useState<ServiceTicketWithDetails>();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [notFound, setNotFound] = useState(false);

    const [openedImpactedObject, setOpenedImpactedObject] = useState<ImpactedObject>();
    const { theme, customApiClient, redirect } = useContext(ApplicationContext);

    const onCloseModal = () => {
        setIsModalVisible(false);
    };
    const onSubmitModal = (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        stop(event);

        if (!openedImpactedObject || !ticket) {
            return;
        }

        const impactedCircuit: ServiceTicketImpactedIMSCircuit = {
            ims_circuit_id: openedImpactedObject?.ims_circuit_id,
            impact: openedImpactedObject.impact,
            ims_circuit_name: openedImpactedObject?.ims_circuit_name,
            extra_information: openedImpactedObject?.extra_information,
            impact_override: impactOverrideValue,
        };

        customApiClient
            .cimPatchImpactedObject(
                ticket?._id,
                openedImpactedObject?.subscription_id,
                openedImpactedObject?.ims_circuit_id,
                impactedCircuit
            )
            .then((res) => {
                // Successfully patched the impacted circuit in the serviceticket
                setTicket(res);
                onCloseModal();
            })
            .catch((err) => {
                // Patch failed.. what now?
                throw err;
            });
    };

    const showModal = (circuit: ImpactedObject) => {
        setOpenedImpactedObject(circuit);
        setImpactOverrideValue(circuit.impact_override);
        setIsModalVisible(true);
    };

    const modalFormId = useGeneratedHtmlId({ prefix: "modalForm" });

    // Impact-override Dropdown in the modal
    const [impactOverrideValue, setImpactOverrideValue] = useState(openedImpactedObject?.impact_override);
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

    function renderLogItemButtons(_ticket: ServiceTicketWithDetails) {
        return (
            <EuiFlexGroup gutterSize="s" className="buttons">
                <EuiFlexItem>
                    <EuiButton
                        id="button-action-open"
                        onClick={() => redirect(`/tickets/${_ticket._id}/open`)}
                        isDisabled={_ticket.process_state !== ServiceTicketProcessState.OPEN_ACCEPTED}
                    >
                        <FormattedMessage id="tickets.action.opening" />
                    </EuiButton>
                </EuiFlexItem>
                <EuiFlexItem>
                    <EuiButton
                        id="button-action-update"
                        // onClick={this.props.previous}
                        isDisabled={
                            ![ServiceTicketProcessState.OPEN, ServiceTicketProcessState.UPDATED].includes(
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
                            ![ServiceTicketProcessState.OPEN, ServiceTicketProcessState.UPDATED].includes(
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
                            ![ServiceTicketProcessState.OPEN_ACCEPTED, ServiceTicketProcessState.OPEN_RELATED].includes(
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
                                ServiceTicketProcessState.OPEN,
                                ServiceTicketProcessState.UPDATED,
                                ServiceTicketProcessState.CLOSED,
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

    function renderModal(_ticket: ServiceTicketWithDetails) {
        console.log(_ticket.process_state);
        return (
            <EuiModal onClose={onCloseModal} initialFocus="[name=popswitch]">
                <EuiModalHeader>
                    <EuiModalHeaderTitle>
                        <h1>Impacted object</h1>
                    </EuiModalHeaderTitle>
                </EuiModalHeader>

                <EuiModalBody>
                    <EuiForm id={modalFormId} component="form">
                        <EuiSpacer size="s" />
                        {formSelect(
                            "tickets.impactedobject.impact_override",
                            onImpactOverrideChange,
                            Object.values(ServiceTicketImpactedObjectImpact),
                            // Make dropdown readonly if ticket is not in one these 2 states
                            ![ServiceTicketProcessState.OPEN_ACCEPTED, ServiceTicketProcessState.OPEN_RELATED].includes(
                                _ticket.process_state
                            ),
                            impactOverrideValue,
                            true
                        )}
                        <EuiFormRow label="Customer">
                            <EuiFieldText readOnly name="customer" value={openedImpactedObject?.customer} />
                        </EuiFormRow>
                        <EuiFormRow label="Impact">
                            <EuiFieldText readOnly name="impact" value={openedImpactedObject?.impact} />
                        </EuiFormRow>
                        <EuiFormRow label="Type">
                            <EuiFieldText readOnly name="type" value={openedImpactedObject?.type} />
                        </EuiFormRow>
                        <EuiFormRow label="Subscription">
                            <EuiFieldText readOnly name="subscription" value={openedImpactedObject?.subscription} />
                        </EuiFormRow>
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
                    <EuiPanel>
                        <div className="mod-ticket">
                            <EuiFlexGroup>
                                <EuiFlexItem grow={true}>
                                    <EuiTitle size="m">
                                        <h1>Service ticket</h1>
                                    </EuiTitle>
                                </EuiFlexItem>
                            </EuiFlexGroup>
                            <div className="mod-ticket-detail">
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
                                            <td id="ticket-end_date-v">{renderStringAsDateTime(ticket.end_date)}</td>
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

                            {renderLogItemButtons(ticket)}

                            <EuiSpacer />

                            <EuiFlexGroup>
                                <EuiFlexItem grow={true}>
                                    <EuiTitle size="m">
                                        <h1>Impacted objects</h1>
                                    </EuiTitle>
                                </EuiFlexItem>
                            </EuiFlexGroup>
                            <ServiceTicketDetailImpactedObjects ticket={ticket} modalFunc={showModal} />
                        </div>
                    </EuiPanel>
                </EuiPageBody>
            </EuiPage>
        </div>
    );
}

export default ServiceTicketDetail;
