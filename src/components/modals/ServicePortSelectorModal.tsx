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

import {
    EuiButton,
    EuiButtonIcon,
    EuiForm,
    EuiFormRow,
    EuiIcon,
    EuiInMemoryTable,
    EuiSelectable,
    EuiSpacer,
    EuiSuggest,
    EuiSuperSelect,
    EuiTab,
    EuiText
} from "@elastic/eui";
import React, { Fragment } from "react";

import ApplicationContext from "../../utils/ApplicationContext";
import RecentUsedPortSelector from "./components/RecentUsedPortSelector";
import ServicePortSelector from "./components/ServicePortSelector";

// import { favoritesData, nodesData, portsData, recentUsedData, subscriptionsData } from "../utils/filterMockData";

const tabs = [
    {
        id: "nodeFilter",
        name: (
            <span>
                Node filter &nbsp;
                <EuiIcon type="filter" />
            </span>
        ),
        disabled: false
    },
    {
        id: "recentUsed",
        name: (
            <span>
                Recently used &nbsp;
                <EuiIcon type="recentlyViewedApp" />
            </span>
        ),
        disabled: false
    }
];

interface IProps {
    selectedTabId: string;
    showAsLinkList: boolean;
    autoSuggestNodes: boolean;
}

interface IState {
    selectedTabId: string;
    showAsLinkList: boolean;
    nodesLoaded: boolean;
    nodesSaved: boolean;
    selectedNode?: string;
    selectedPort?: string;
    selectedSubscription?: string;
    autoSuggestNodes: boolean;
    physicalPortsLoaded: boolean;
}

export default class ServicePortSelectorModal extends React.PureComponent<IProps, IState> {
    public static defaultProps = {
        selectedTabId: "nodeFilter",
        showAsLinkList: false,
        autoSuggestNodes: false
    };

    constructor(props: IProps) {
        super(props);

        this.state = {
            selectedTabId: this.props.selectedTabId,
            showAsLinkList: this.props.showAsLinkList,
            autoSuggestNodes: this.props.autoSuggestNodes,
            nodesLoaded: false,
            nodesSaved: false,
            selectedNode: undefined,
            selectedPort: undefined,
            selectedSubscription: undefined,
            physicalPortsLoaded: false
        };
        setTimeout(() => {
            this.setState({ nodesLoaded: true });
        }, 1000);
    }

    // onSelectedTabChanged = () => this.setState({ isSwitchChecked: !this.state.isSwitchChecked });
    onSelectedTabChanged = (id: string) => {
        this.setState({ selectedTabId: id });
    };

    render() {
        const { selectedTabId } = this.state;
        const renderTabs = () => {
            return tabs.map((tab, index) => (
                <EuiTab
                    onClick={() => this.onSelectedTabChanged(tab.id)}
                    isSelected={tab.id === selectedTabId}
                    disabled={tab.disabled}
                    key={index}
                >
                    {tab.name}
                </EuiTab>
            ));
        };
        return (
            <>
                {renderTabs()}
                <EuiSpacer size="l" />
                {selectedTabId === "nodeFilter" && <ServicePortSelector subscriptions={[]} />}
                {selectedTabId === "recentUsed" && <RecentUsedPortSelector subscriptions={[]} />}
            </>
        );
    }
}

ServicePortSelectorModal.contextType = ApplicationContext;
