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
    EuiComboBox,
    EuiFieldText,
    EuiFlexGroup,
    EuiFlexItem,
    EuiFormRow,
    EuiPage,
    EuiPageContentBody,
    EuiPanel,
    EuiRadioGroup,
    EuiSpacer,
    EuiText,
    EuiTitle,
} from "@elastic/eui";
import { EuiComboBoxOptionOption } from "@elastic/eui/src/components/combo_box/types";
import { intl } from "locale/i18n";
import React, { useContext, useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import ApplicationContext from "utils/ApplicationContext";

const I18N_KEY_PREFIX = "tickets.create.";

const radioGroupItemId__1 = "radio1";
const radioGroupItemId__2 = "radio2";

interface Ticket {
    name: string;
    start_time: string;
    end_time: string;
}

interface Label {
    label: string;
}

const radios = [
    {
        id: radioGroupItemId__1,
        label: "Planned work ticket",
    },
    {
        id: radioGroupItemId__2,
        label: "Incident ticket",
    },
];

function CreateServiceTicket() {
    const { redirect } = useContext(ApplicationContext);
    const [jiraTickets] = useState<Ticket[]>([
        {
            name: "SNNP-84537 - Fiber",
            start_time: "2022-Feb-09 20:00 AMS (20 UTC)",
            end_time: "2022-Feb-09 22:00 AMS (21 UTC)",
        },
        {
            name: "SNNP-84956 SW upgrade",
            start_time: "2022-Feb-10 21:00 AMS (20 UTC)",
            end_time: "2022-Feb-10 22:00 AMS (21 UTC)",
        },
        {
            name: "SNNP-84911 OTDR meting Eurofiber",
            start_time: "2022-Feb-09 19:00 AMS (20 UTC)",
            end_time: "2022-Feb-09 22:00 AMS (22 UTC)",
        },
        {
            name: "SNNP-84910 Node insert",
            start_time: "2022-Feb-09 14:00 AMS (20 UTC)",
            end_time: "2022-Feb-09 14:00 AMS (21 UTC)",
        },
    ]);
    const [imsTickets] = useState<Ticket[]>([
        {
            name: "SNNP-84537",
            start_time: "2022-Feb-09 20:00 AMS (20 UTC)",
            end_time: "2022-Feb-09 21:00 AMS (21 UTC)",
        },
        {
            name: "SNNP-84956",
            start_time: "2022-Feb-10 21:00 AMS (20 UTC)",
            end_time: "2022-Feb-10 22:00 AMS (21 UTC)",
        },
        {
            name: "SNNP-84911",
            start_time: "2022-Feb-08 21:00 AMS (20 UTC)",
            end_time: "2022-Feb-09 22:00 AMS (22 UTC)",
        },
        {
            name: "SNNP-84910",
            start_time: "2022-Feb-09 14:00 AMS (20 UTC)",
            end_time: "2022-Feb-09 14:00 AMS (21 UTC)",
        },
    ]);
    const [jiraTicketsLabels, setJiraTicketsLabels] = useState<Label[]>([]);
    const [imsTicketsLabels, setImsTicketsLabels] = useState<Label[]>([]);
    const [radioIdSelected, setRadioIdSelected] = useState(radioGroupItemId__2);
    const [selectedOptionsJira, setSelectedJira] = useState<Label[]>([]);
    const [selectedOptionsIMS, setSelectedIMS] = useState<Label[]>([]);
    const [selectedIndexJira, setSelectedIndexJira] = useState<number>(0);
    const [selectedIndexIMS, setSelectedIndexIMS] = useState<number>(0);
    const [page, setPage] = useState(0);
    const [comboJiraInvalid, setComboJiraInvalid] = useState(false);
    const [comboIMSInvalid, setComboIMSInvalid] = useState(false);
    const [buttonSubmitEnabled, setButtonSubmitEnabled] = useState(false);

    const getLabels = (tickets: Ticket[]) => {
        return tickets.map((ticket) => ({ label: ticket.name }));
    };

    useEffect(() => {
        //get labels from ticket objects for combobox
        console.log("useEffect");
        setJiraTicketsLabels(getLabels(jiraTickets));
        setImsTicketsLabels(getLabels(imsTickets));
    }, [selectedOptionsIMS, selectedOptionsJira, imsTickets, jiraTickets]);

    const onChange = (optionId: string) => {
        setRadioIdSelected(optionId);
        setSelectedIMS([]);
        setSelectedJira([]);
    };

    const onChangeComboJira = (selectedOptions: EuiComboBoxOptionOption<unknown>[]) => {
        setComboJiraInvalid(false);
        setSelectedJira(selectedOptions);
    };

    const onChangeComboIMS = (selectedOptions: EuiComboBoxOptionOption<unknown>[]) => {
        setSelectedIMS(selectedOptions);
        setComboIMSInvalid(false);
    };

    const checkIfValidAndSelectIndex = () => {
        const validateJira = () => {
            for (let i = 0; i < jiraTicketsLabels.length; ++i) {
                if (JSON.stringify(jiraTicketsLabels[i]) === JSON.stringify(selectedOptionsJira[0])) {
                    setSelectedIndexJira(i);
                    return true;
                }
            }
            return false;
        };
        const validateIms = () => {
            for (let i = 0; i < jiraTicketsLabels.length; ++i) {
                if (JSON.stringify(imsTicketsLabels[i]) === JSON.stringify(selectedOptionsIMS[0])) {
                    setSelectedIndexIMS(i);
                    return true;
                }
            }
            return false;
        };
        validateJira() ? setComboJiraInvalid(false) : setComboJiraInvalid(true);
        validateIms() ? setComboIMSInvalid(false) : setComboIMSInvalid(true);
        setSubmitButtonStatus();

        return validateJira() && validateIms();
    };

    function setSubmitButtonStatus() {
        if (checkTimes().length > 0) {
            setButtonSubmitEnabled(false);
        } else {
            setButtonSubmitEnabled(true);
        }
    }

    const checkTimes = () => {
        let errorList = [];
        if (jiraTickets[selectedIndexJira].start_time !== imsTickets[selectedIndexIMS].start_time) {
            errorList.push("Start times don't match, please correct the start times befor continuing");
        }
        if (jiraTickets[selectedIndexJira].end_time !== imsTickets[selectedIndexIMS].end_time) {
            errorList.push("End times don't match, please correct the end times befor continuing");
        }
        return errorList;
    };

    const nextPage = () => {
        if (checkIfValidAndSelectIndex()) {
            setPage(1);
        }
    };

    const renderButtonsPage1 = () => {
        return (
            <EuiFlexGroup>
                <EuiFlexItem grow={false}>
                    <EuiButton onClick={() => redirect("/tickets")}>
                        {intl.formatMessage({ id: I18N_KEY_PREFIX + "cancel" })}
                    </EuiButton>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                    <EuiButton fill onClick={() => nextPage()}>
                        {intl.formatMessage({ id: I18N_KEY_PREFIX + "continue" })}
                    </EuiButton>
                </EuiFlexItem>
            </EuiFlexGroup>
        );
    };

    const renderButtonsPage2 = () => {
        return (
            <EuiFlexGroup>
                <EuiFlexItem grow={false}>
                    <EuiButton onClick={() => setPage(0)}>
                        {intl.formatMessage({ id: I18N_KEY_PREFIX + "back" })}
                    </EuiButton>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                    <EuiButton onClick={() => setPage(1)}>
                        {intl.formatMessage({ id: I18N_KEY_PREFIX + "refresh" })}
                    </EuiButton>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                    <EuiButton disabled={buttonSubmitEnabled} fill={!buttonSubmitEnabled} onClick={() => setPage(1)}>
                        {intl.formatMessage({ id: I18N_KEY_PREFIX + "submit" })}
                    </EuiButton>
                </EuiFlexItem>
            </EuiFlexGroup>
        );
    };

    const renderFirstPage = () => {
        return (
            <EuiPageContentBody style={page !== 0 ? { display: "none" } : {}}>
                <EuiRadioGroup
                    options={radios}
                    idSelected={radioIdSelected}
                    onChange={(id) => onChange(id)}
                    name="radio group"
                    legend={{
                        children: <span>{intl.formatMessage({ id: I18N_KEY_PREFIX + "type" })}</span>,
                    }}
                />
                <EuiSpacer size="xl" />
                <EuiFormRow label={intl.formatMessage({ id: I18N_KEY_PREFIX + "jira_ticket" })}>
                    <EuiComboBox
                        isInvalid={comboJiraInvalid}
                        aria-label="Accessible screen reader label"
                        placeholder="Select a single option"
                        singleSelection={{ asPlainText: true }}
                        options={getLabels(jiraTickets)}
                        selectedOptions={selectedOptionsJira}
                        onChange={(optionId) => onChangeComboJira(optionId)}
                    />
                </EuiFormRow>
                <EuiSpacer size="m" />
                <EuiFormRow label={intl.formatMessage({ id: I18N_KEY_PREFIX + "ims_pw_ticket" })}>
                    <EuiComboBox
                        isInvalid={comboIMSInvalid}
                        aria-label="Accessible screen reader label"
                        placeholder="Select a single option"
                        singleSelection={{ asPlainText: true }}
                        options={getLabels(imsTickets)}
                        selectedOptions={selectedOptionsIMS}
                        onChange={(optionId) => onChangeComboIMS(optionId)}
                    />
                </EuiFormRow>
                <EuiSpacer size="l" />
                {renderButtonsPage1()}
            </EuiPageContentBody>
        );
    };

    const renderSecondPage = () => {
        return (
            <EuiPageContentBody style={page !== 1 ? { display: "none" } : {}}>
                <EuiTitle size="xs">
                    <h4>Start time:</h4>
                </EuiTitle>
                <EuiFieldText
                    prepend={<EuiText size="m">{intl.formatMessage({ id: I18N_KEY_PREFIX + "jira" })}</EuiText>}
                    compressed={false}
                    disabled={false}
                    readOnly={true}
                    value={jiraTickets[selectedIndexJira].start_time}
                    aria-label="text field"
                />
                <EuiSpacer size="s" />
                <EuiFieldText
                    prepend={<EuiText size="m">{intl.formatMessage({ id: I18N_KEY_PREFIX + "ims" })}</EuiText>}
                    compressed={false}
                    disabled={false}
                    readOnly={true}
                    value={imsTickets[selectedIndexIMS].start_time}
                    aria-label="text field"
                />
                <EuiSpacer size="m" />
                {checkTimes().map((item) => (
                    <EuiText key={item} color="danger" size="m">
                        {item}
                    </EuiText>
                ))}
                <EuiSpacer size="m" />
                <EuiTitle size="xs">
                    <h4>End time:</h4>
                </EuiTitle>
                <EuiFieldText
                    prepend={<EuiText size="m">{intl.formatMessage({ id: I18N_KEY_PREFIX + "jira" })}</EuiText>}
                    compressed={false}
                    disabled={false}
                    readOnly={true}
                    value={jiraTickets[selectedIndexJira].end_time}
                    aria-label="text field"
                />
                <EuiSpacer size="s" />
                <EuiFieldText
                    prepend={<EuiText size="m">{intl.formatMessage({ id: I18N_KEY_PREFIX + "ims" })}</EuiText>}
                    compressed={false}
                    disabled={false}
                    readOnly={true}
                    value={imsTickets[selectedIndexIMS].end_time}
                    aria-label="text field"
                />
                <EuiSpacer size="l" />
                {renderButtonsPage2()}
            </EuiPageContentBody>
        );
    };

    return (
        <EuiPage>
            <EuiPanel>
                <EuiTitle size="s">
                    <h2>{intl.formatMessage({ id: I18N_KEY_PREFIX + "create" })}</h2>
                </EuiTitle>
                <EuiSpacer size="l" />
                {renderFirstPage()}
                {renderSecondPage()}
            </EuiPanel>
        </EuiPage>
    );
}

export default injectIntl(CreateServiceTicket);
