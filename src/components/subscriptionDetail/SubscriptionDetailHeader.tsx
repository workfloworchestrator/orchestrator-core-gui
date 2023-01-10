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

import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiTitle } from "@elastic/eui";

interface IProps {
    viewType: string;
    setViewType: (viewType: string) => void;
    title?: string;
    children?: JSX.Element;
}

const SubscriptionDetailHeader = ({ viewType, setViewType, title, children }: IProps) => (
    <EuiFlexGroup>
        <EuiFlexItem grow={true}>
            <EuiTitle size="m">
                <h1>{title}</h1>
            </EuiTitle>
        </EuiFlexItem>
        {children}
        <EuiFlexItem grow={false}>
            <EuiButton
                id="subscription-detail-viewtype-tree"
                fill={viewType === "tree"}
                iconType="list"
                size="s"
                isSelected={viewType === "tree"}
                onClick={() => setViewType("tree")}
            >
                tree
            </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
            <EuiButton
                id="subscription-detail-viewtype-tabs"
                fill={viewType === "tabs"}
                iconType="tableDensityNormal"
                size="s"
                isSelected={viewType === "tabs"}
                onClick={() => setViewType("tabs")}
            >
                tabs
            </EuiButton>
        </EuiFlexItem>
    </EuiFlexGroup>
);
export default SubscriptionDetailHeader;
