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

import { EuiDescriptionList, EuiDescriptionListDescription, EuiDescriptionListTitle, EuiLink } from "@elastic/eui";
import React, { useContext } from "react";
import ApplicationContext from "utils/ApplicationContext";

interface IProps {
    label: string;
    subscription: any;
}

interface SubscriptionInfoRowProps {
    title: string;
    children: React.ReactNode;
}

const SubscriptionInfoRow: React.FC<SubscriptionInfoRowProps> = ({ title, children }) => (
    <EuiDescriptionList>
        <EuiDescriptionListTitle>{title}</EuiDescriptionListTitle>
        <EuiDescriptionListDescription>{children}</EuiDescriptionListDescription>
    </EuiDescriptionList>
);

export default function SubscriptionInfo({ label, subscription }: IProps) {
    const { theme } = useContext(ApplicationContext);

    return (
        <tbody className={theme}>
            <tr>
                <td>{label.toUpperCase()}</td>
                <td colSpan={2}>
                    <SubscriptionInfoRow title="Description">{subscription.description}</SubscriptionInfoRow>
                    <SubscriptionInfoRow title="Product">{subscription.product?.description}</SubscriptionInfoRow>
                    <SubscriptionInfoRow title="Status">{subscription.status}</SubscriptionInfoRow>
                    <SubscriptionInfoRow title="Subscription ID">
                        <EuiLink href={`/subscriptions/${subscription.subscription_id}`} target="_blank">
                            {subscription.subscription_id?.slice(0, 8)}
                        </EuiLink>
                    </SubscriptionInfoRow>
                </td>
            </tr>
        </tbody>
    );
}
