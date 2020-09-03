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
        id: "favorites",
        name: (
            <span>
                Favorites &nbsp;
                <EuiIcon type="heart" />
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

    onNodeClick = (item: any) => {
        alert(`Node [${item.label}] was clicked`);
        this.setState({ selectedNode: item.label });
    };

    onPortClick = (item: any) => {
        alert(`Port [${item}] was clicked`);
        this.setState({ selectedPort: item });
    };

    onSubscriptionClick = (item: any) => {
        alert(`Subscription [${item}] was clicked`);
        this.setState({ selectedSubscription: item });
    };

    renderFavorites = () => {
        const columns = [
            {
                field: "description",
                name: "Subscription description",
                sortable: true,
                truncateText: true
            },
            {
                field: "name",
                name: "Custom name",
                truncateText: true,
                sortable: true
            },
            {
                field: "subscription_id",
                name: "",
                width: "40px",
                render: (i: any) => <EuiButtonIcon iconType="popout" onClick={() => alert(`Clicked ${i}`)} />
            }
        ];
        return <EuiInMemoryTable items={[]} columns={columns} pagination={true} sorting={true} search={true} />;
    };

    renderRecentUsed = () => {
        const columns = [
            {
                field: "description",
                name: "Subscription description",
                sortable: true,
                truncateText: true
            },
            {
                field: "workflow",
                name: "Workflow",
                truncateText: true,
                sortable: true
            },
            {
                field: "subscription_id",
                name: "",
                width: "40px",
                render: (i: any) => <EuiButtonIcon iconType="popout" onClick={() => alert(`Clicked ${i}`)} />
            }
        ];
        return <EuiInMemoryTable items={[]} columns={columns} pagination={true} sorting={true} search={true} />;
    };

    renderNodeFilter = () => {
        const { nodesLoaded, selectedNode, autoSuggestNodes, selectedPort, selectedSubscription } = this.state;

        // const nodeLabels = nodesData.map(node => ({ label: node.label }));

        return (
            <EuiForm component="form">
                {selectedNode && autoSuggestNodes && <EuiText>Selected node: {selectedNode}</EuiText>}
                <EuiFormRow label="Node" helpText="Select a node." fullWidth>
                    <>
                        {autoSuggestNodes && (
                            <EuiSuggest
                                status={nodesLoaded ? "unchanged" : "loading"}
                                onInputChange={() => {}}
                                onItemClick={this.onNodeClick}
                                suggestions={[]}
                            />
                        )}
                        {/*{!autoSuggestNodes && (*/}
                        {/*    <EuiSelectable*/}
                        {/*        aria-label="Searchable example"*/}
                        {/*        searchable*/}
                        {/*        listProps={{ bordered: true }}*/}
                        {/*        searchProps={{*/}
                        {/*            "data-test-subj": "selectableSearchHere"*/}
                        {/*        }}*/}
                        {/*        options={nodeLabels}*/}
                        {/*    >*/}
                        {/*        {(list, search) => (*/}
                        {/*            <Fragment>*/}
                        {/*                {search}*/}
                        {/*                {list}*/}
                        {/*            </Fragment>*/}
                        {/*        )}*/}
                        {/*    </EuiSelectable>*/}
                        {/*)}*/}
                    </>
                </EuiFormRow>
                <EuiFormRow label="Port" helpText="Select a physical port." fullWidth>
                    <EuiSuperSelect
                        fullWidth
                        options={[]}
                        valueOfSelected={selectedPort}
                        onChange={value => this.onPortClick(value)}
                        itemLayoutAlign="top"
                        hasDividers
                    />
                </EuiFormRow>
                <EuiFormRow label="Service Port" helpText="Select a service port subscription." fullWidth>
                    <EuiSuperSelect
                        fullWidth
                        options={[]}
                        valueOfSelected={selectedSubscription}
                        onChange={value => this.onSubscriptionClick(value)}
                        itemLayoutAlign="top"
                        hasDividers
                    />
                </EuiFormRow>
                <EuiSpacer />
                <EuiButton type="submit" fill style={{ marginLeft: "600px" }}>
                    Select service port
                </EuiButton>
            </EuiForm>
        );
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
                {selectedTabId === "favorites" && this.renderFavorites()}
                {selectedTabId === "recentUsed" && this.renderRecentUsed()}
                {selectedTabId === "nodeFilter" && this.renderNodeFilter()}
            </>
        );
    }
}

ServicePortSelectorModal.contextType = ApplicationContext;
