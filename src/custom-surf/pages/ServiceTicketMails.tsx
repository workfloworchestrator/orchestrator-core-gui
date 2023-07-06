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
    EuiBadge,
    EuiBasicTable,
    EuiButton,
    EuiButtonIcon,
    EuiFlexGroup,
    EuiFlexItem,
    EuiPage,
    EuiPageBody,
    EuiPanel,
    EuiScreenReaderOnly,
    EuiSpacer,
    EuiTitle,
    RIGHT_ALIGNMENT,
} from "@elastic/eui";
import { HorizontalAlignment } from "@elastic/eui/src/services/alignment";
import EmailMessages from "custom/components/cim/EmailMessages";
import { EmailLog, ServiceTicketWithDetails } from "custom/types";
import { renderIsoDatetime } from "custom/Utils";
import React, { ReactNode, useContext, useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router";
import ApplicationContext from "utils/ApplicationContext";
import { isEmpty } from "utils/Utils";

interface IProps {
    id: string;
}

interface EmailLogWithId extends EmailLog {
    id: string;
}

const ServiceTicketMails = () => {
    const { id } = useParams<IProps>();
    const [itemIdToExpandedRowMap, setItemIdToExpandedRowMap] = useState<{ [key: string]: ReactNode }>({});
    const [showHtml, setShowHtml] = useState(true);

    const [items, setItems] = useState<EmailLogWithId[]>([]);
    const [ticket, setTicket] = useState<ServiceTicketWithDetails>();
    const { customApiClient, redirect } = useContext(ApplicationContext);

    const { isLoading, error } = useQuery<ServiceTicketWithDetails, Error>(
        ["ticket", { id: id }],
        () => customApiClient.cimTicketById(id),
        {
            onSuccess: (data) => {
                const newItems = data.email_logs.reverse();
                setTicket(data);
                setItems(newItems.map((i, index) => ({ id: `item-${index}`, ...i })));
            },
        }
    );

    if (isLoading) {
        return <div>Loading</div>;
    } else if (error) {
        return <div>{error.message}</div>;
    }

    let allExpandedRows: { [key: string]: ReactNode } = {};
    for (const item of items) {
        allExpandedRows[item.id] = <EmailMessages emails={item.emails} showHtml={showHtml} />;
    }

    const toggleExpandAll = () => {
        if (!isEmpty(itemIdToExpandedRowMap)) {
            setItemIdToExpandedRowMap({});
        } else {
            setItemIdToExpandedRowMap(allExpandedRows);
        }
    };

    const toggleDetails = (item: EmailLogWithId) => {
        const itemIdToExpandedRowMapValues = { ...itemIdToExpandedRowMap };
        if (itemIdToExpandedRowMapValues[item.id]) {
            delete itemIdToExpandedRowMapValues[item.id];
        } else {
            itemIdToExpandedRowMapValues[item.id] = <EmailMessages emails={item.emails} showHtml={showHtml} />;
        }
        setItemIdToExpandedRowMap(itemIdToExpandedRowMapValues);
    };

    const align_right: HorizontalAlignment = RIGHT_ALIGNMENT;
    let columns = [
        {
            field: "log_type",
            name: "Log type",
            truncateText: true,
            width: "100",
        },
        {
            field: "id",
            name: "Mails",
            render: (id: string, record: any) => <EuiBadge>{record.emails.length}</EuiBadge>,
            width: "150",
        },
        {
            field: "entry_time",
            name: "Entry time",
            sortable: true,
            render: (entry_time: string, record: any) => renderIsoDatetime(record.entry_time),
            width: "30%",
        },
        {
            align: align_right,
            width: "40px",
            isExpander: true,
            name: (
                <EuiScreenReaderOnly>
                    <span>Expand rows</span>
                </EuiScreenReaderOnly>
            ),
            render: (item: any) => (
                <EuiButtonIcon
                    onClick={() => toggleDetails(item)}
                    aria-label={itemIdToExpandedRowMap[item.id] ? "Collapse" : "Expand"}
                    iconType={itemIdToExpandedRowMap[item.id] ? "arrowUp" : "arrowDown"}
                />
            ),
        },
    ];

    return (
        <EuiPage>
            <EuiPageBody component="div">
                <EuiPanel>
                    <EuiFlexGroup>
                        <EuiFlexItem grow={false}>
                            <EuiTitle size="m">
                                <h1>Service ticket {ticket?.jira_ticket_id} mail log</h1>
                            </EuiTitle>
                        </EuiFlexItem>

                        <EuiFlexItem>
                            <EuiButtonIcon
                                size="m"
                                onClick={toggleExpandAll}
                                iconType={!isEmpty(itemIdToExpandedRowMap) ? "arrowUp" : "arrowDown"}
                            ></EuiButtonIcon>
                        </EuiFlexItem>

                        <EuiFlexItem grow={false}>
                            <EuiButton size="m" onClick={() => redirect(`/tickets/${id}`)} iconType="editorUndo">
                                Back
                            </EuiButton>
                        </EuiFlexItem>
                        <EuiFlexItem grow={false} style={{ minWidth: 140 }}>
                            <EuiButton
                                isSelected={!showHtml}
                                onClick={() => {
                                    setShowHtml(!showHtml);
                                    setItemIdToExpandedRowMap({});
                                }}
                            >
                                {showHtml ? "No" : "Show"} HTML
                            </EuiButton>
                        </EuiFlexItem>
                    </EuiFlexGroup>
                    <EuiSpacer />

                    <EuiBasicTable
                        // @ts-ignore
                        items={items}
                        itemId="id"
                        itemIdToExpandedRowMap={itemIdToExpandedRowMap}
                        isExpandable={true}
                        hasActions={true}
                        columns={columns}
                        isSelectable={false}
                    />
                </EuiPanel>
            </EuiPageBody>
        </EuiPage>
    );
};

export default ServiceTicketMails;
