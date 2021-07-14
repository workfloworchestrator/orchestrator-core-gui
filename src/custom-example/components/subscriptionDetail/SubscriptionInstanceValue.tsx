/*
 * Copyright 2019-2020 SURF.
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

import { ApiClient } from "api";
import SubscriptionDetails from "components/subscriptionDetail/SubscriptionDetails";
import { CustomApiClient } from "custom/api";
import { ENV } from "env";
import { isEmpty } from "lodash";
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import ApplicationContext from "utils/ApplicationContext";
import { enrichSubscription, ipamStates, organisationNameByUuid } from "utils/Lookups";
import { IMSEndpoint, IMSService, SubscriptionModel, prop } from "utils/types";
import { applyIdNamingConvention } from "utils/Utils";

function DataTable({ children }: React.PropsWithChildren<{}>) {
    return (
        <table className="detail-block related-subscription">
            <thead />
            <tbody>{children}</tbody>
        </table>
    );
}

function DataRow({
    type,
    label,
    value,
    rawLabel,
}: {
    type: string;
    label: string;
    value: React.ReactNode;
    rawLabel?: React.ReactNode;
}) {
    return (
        <tr>
            <td className={`${applyIdNamingConvention(`${type}-${label}`)}-k`}>
                {rawLabel ?? <FormattedMessage id={`subscription.${type}.${label}`} />}
            </td>
            <td className={`${applyIdNamingConvention(`${type}-${label}`)}-v`}>{value}</td>
        </tr>
    );
}

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

    return (
        <tbody>
            <tr>
                <td>{label.toUpperCase()}</td>
                <td colSpan={isDeleted ? 1 : 2}>
                    <div className="resource-type">
                        {isExternalLinkValue && !isDeleted && (
                            <i className={`fa fa-${icon}-circle`} onClick={toggleCollapsed} />
                        )}
                        {isSubscriptionValue && (
                            <a target="_blank" rel="noopener noreferrer" href={`/subscriptions/${value}`}>
                                {value}
                            </a>
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
    const [data, setData] = useState<any | null | undefined>(undefined);

    // const { organisations, products, apiClient, customApiClient } = useContext(ApplicationContext);
    // const { render, i18nKey, getter } = getExternalTypeData(label, apiClient, customApiClient);
    // const { render, i18nKey, getter } = getExternalTypeData(label, apiClient, customApiClient);

    const isSubscriptionValue = label.endsWith("subscription_id");
    const isExternalLinkValue = false;
    const isDeleted = isExternalLinkValue && data === null;

    // useEffect(() => {
    //     if (data === undefined && !collapsed && isExternalLinkValue) {
    //         getter(value)
    //             .catch((err) => Promise.resolve(null))
    //             .then((data) => {
    //                 if (data && isSubscriptionValue) {
    //                     data.product_id = data.product.product_id;
    //                     enrichSubscription(data as SubscriptionModel, organisations, products);
    //                 }
    //                 setData(data);
    //             });
    //     }
    // }, [data, collapsed, isSubscriptionValue, isExternalLinkValue, getter, value, organisations, products]);

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
