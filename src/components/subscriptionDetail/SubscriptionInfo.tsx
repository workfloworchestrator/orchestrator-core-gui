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
    EuiDescriptionList,
    EuiDescriptionListDescription,
    EuiDescriptionListTitle,
    EuiFlexGroup,
    EuiFlexItem,
    EuiLink,
} from "@elastic/eui";
import React, { useContext } from "react";
import ApplicationContext from "utils/ApplicationContext";

interface IProps {
    label: string;
    value: any;
}

export default function SubscriptionInfo({ label, value }: IProps) {
    const { theme } = useContext(ApplicationContext);

    return (
        <tbody className={theme}>
            <tr>
                <td>{label.toUpperCase()}</td>
                <td colSpan={2}>
                    <EuiFlexGroup wrap={true}>
                        <EuiFlexItem style={{ minWidth: "400px" }}>
                            <EuiDescriptionList>
                                <EuiDescriptionListTitle>Description</EuiDescriptionListTitle>
                                <EuiDescriptionListDescription>{value.description}</EuiDescriptionListDescription>
                                <EuiDescriptionListTitle>Product</EuiDescriptionListTitle>
                                <EuiDescriptionListDescription>
                                    {value.product?.description}
                                </EuiDescriptionListDescription>
                            </EuiDescriptionList>
                        </EuiFlexItem>
                        <EuiFlexItem style={{ minWidth: "400px" }}>
                            <EuiDescriptionList>
                                <EuiDescriptionListTitle>Status</EuiDescriptionListTitle>
                                <EuiDescriptionListDescription>{value.status}</EuiDescriptionListDescription>
                                <EuiDescriptionListTitle>Subscription ID</EuiDescriptionListTitle>
                                <EuiDescriptionListDescription>
                                    <EuiLink href={`/subscriptions/${value.subscription_id}`}>
                                        {value.subscription_id?.slice(0, 8)}
                                    </EuiLink>
                                </EuiDescriptionListDescription>
                            </EuiDescriptionList>
                        </EuiFlexItem>
                    </EuiFlexGroup>
                </td>
            </tr>
        </tbody>
    );
}
