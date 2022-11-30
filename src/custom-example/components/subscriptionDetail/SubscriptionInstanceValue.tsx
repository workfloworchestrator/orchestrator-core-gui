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

import { EuiButtonIcon, EuiCopy, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import React, { useContext, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useQuery } from "react-query";
import ApplicationContext from "utils/ApplicationContext";

function SubscriptionInstanceValueRow({
    label,
    value,
    isSubscriptionValue,
    isDeleted,
    isExternalLinkValue,
    toggleCollapsed,
    type,
    children,
}: React.PropsWithChildren<{
    label: string;
    value: string;
    isSubscriptionValue: boolean;
    isDeleted: boolean;
    isExternalLinkValue: boolean;
    toggleCollapsed: () => void;
    type: string;
}>) {
    const icon = children ? "minus" : "plus";
    const { apiClient, theme } = useContext(ApplicationContext);

    const { isLoading: subscriptionIsLoading, error: subscriptionError, data: subscriptionData } = useQuery(
        ["subscription", { id: isSubscriptionValue ? value : "disabled" }],
        () => apiClient.subscriptionsDetailWithModel(value),
        {
            enabled: isSubscriptionValue,
        }
    );

    const subscriptionLink =
        isSubscriptionValue && !subscriptionIsLoading && !subscriptionError
            ? `${subscriptionData?.description} (${value})`
            : value;

    return (
        <tbody className={theme}>
            <tr>
                <td>{label.toUpperCase()}</td>
                <td colSpan={isDeleted ? 1 : 2}>
                    <div className="resource-type">
                        {isExternalLinkValue && !isDeleted && (
                            <i className={`fa fa-${icon}-circle`} onClick={toggleCollapsed} />
                        )}
                        {isSubscriptionValue && (
                            <EuiFlexGroup alignItems={"center"}>
                                <EuiFlexItem grow={false}>
                                    <a target="_blank" rel="noopener noreferrer" href={`/subscriptions/${value}`}>
                                        {subscriptionLink}
                                    </a>
                                </EuiFlexItem>
                                <EuiCopy textToCopy={value}>
                                    {(copy) => <EuiButtonIcon iconType={"copyClipboard"} onClick={copy} />}
                                </EuiCopy>
                            </EuiFlexGroup>
                        )}

                        {!isSubscriptionValue && <span>{value.toString()}</span>}
                    </div>
                </td>
                {isDeleted && (
                    <td>
                        <em className="error">
                            <FormattedMessage id={`subscription.${type}.removed`} />
                        </em>
                    </td>
                )}
            </tr>
            {children && isExternalLinkValue && !isDeleted && (
                <tr className="related-subscription">
                    <td className="whitespace" />
                    <td className="related-subscription-values" colSpan={2}>
                        {children}
                    </td>
                </tr>
            )}
        </tbody>
    );
}

interface IProps {
    label: string;
    value: string;
}

export default function SubscriptionInstanceValue({ label, value }: IProps) {
    const [collapsed, setCollapsed] = useState(true);
    const [data] = useState<any | null | undefined>(undefined);

    const isSubscriptionValue = label.endsWith("subscription_id");
    const isExternalLinkValue = false;
    const isDeleted = isExternalLinkValue && data === null;

    return (
        <SubscriptionInstanceValueRow
            label={label}
            value={value}
            isSubscriptionValue={isSubscriptionValue}
            isDeleted={isDeleted}
            isExternalLinkValue={isExternalLinkValue}
            toggleCollapsed={() => setCollapsed(!collapsed)}
            type={label}
        >
            {!!data && !collapsed && data}
        </SubscriptionInstanceValueRow>
    );
}
