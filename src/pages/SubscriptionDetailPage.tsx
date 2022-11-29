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

import { EuiPage, EuiPageBody, EuiPanel } from "@elastic/eui";
import SubscriptionDetail from "components/subscriptionDetail/SubscriptionDetail";
import React from "react";
import { RouteComponentProps } from "react-router";

interface MatchParams {
    id: string;
}

interface IProps extends Partial<RouteComponentProps<MatchParams>> {
    subscriptionId?: string;
}

export default function SubscriptionDetailPage({ match }: IProps) {
    return (
        <EuiPage>
            <EuiPageBody component="div">
                <EuiPanel>
                    <SubscriptionDetail subscriptionId={match!.params.id} />
                </EuiPanel>
            </EuiPageBody>
        </EuiPage>
    );
}
