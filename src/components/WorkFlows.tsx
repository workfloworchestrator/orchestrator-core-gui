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

import { EuiBadge, EuiIcon, EuiInMemoryTable, EuiPageContent, EuiPageContentHeader, EuiSpacer } from "@elastic/eui";
import React from "react";
import ApplicationContext from "utils/ApplicationContext";
import { renderDateTime } from "utils/Lookups";
import { WorkflowWithProductTags } from "utils/types";

interface IState {
    workFlows: WorkflowWithProductTags[];
    workFlowsLoaded: boolean;
    isLoading: boolean;
}

export default class WorkFlows extends React.Component {
    state: IState = {
        workFlows: [],
        workFlowsLoaded: true,
        isLoading: false,
    };

    componentDidMount() {
        this.context.apiClient.allWorkflowsWithProductTags().then((workFlows: WorkflowWithProductTags) => {
            this.setState({ workFlows: workFlows, workFlowsLoaded: false });
        });
    }

    render() {
        const { workFlows, workFlowsLoaded } = this.state;

        const search = {
            box: {
                incremental: true,
                schema: true,
                placeholder: "Search for workflows..",
            },
        };

        const columns = [
            {
                field: "name",
                name: "DOCS",
                sortable: false,
                truncateText: false,
                render: (name: any) => {
                    // Todo: make configurable
                    return (
                        <a href={`https://docs.automation.surf.net/workflows/${name}/`}>
                            <EuiIcon type={"eye"} />
                        </a>
                    );
                },
                width: "5%",
            },
            {
                field: "name",
                name: "UNIQUE KEY",
                sortable: true,
                truncateText: false,
            },
            {
                field: "description",
                name: "DESCRIPTION",
                sortable: true,
                truncateText: false,
                width: "25%",
            },

            {
                field: "target",
                name: "TARGET",
                sortable: true,
                truncateText: false,
            },
            {
                field: "product_tags",
                name: "PRODUCT TAGS",
                sortable: true,
                truncateText: false,
                render: (product_tags: any) => {
                    const renderPT = product_tags.map((item: any, index: number) => (
                        <EuiBadge key={`product_tag-${index}`} color="primary" isDisabled={false}>
                            {item}
                        </EuiBadge>
                    ));
                    return <div>{renderPT}</div>;
                },
            },
            {
                field: "created_at",
                name: "CREATED ",
                sortable: true,
                truncateText: false,
                render: (created_at: any) => {
                    const renderCA = renderDateTime(created_at);
                    return <div>{renderCA}</div>;
                },
            },
        ];

        return (
            <EuiPageContent>
                <EuiPageContentHeader>
                    <EuiSpacer size="l" />
                    <EuiInMemoryTable
                        items={workFlows}
                        columns={columns}
                        search={search}
                        pagination={true}
                        sorting={true}
                        loading={workFlowsLoaded}
                        hasActions={true}
                    />
                </EuiPageContentHeader>
            </EuiPageContent>
        );
    }
}
WorkFlows.contextType = ApplicationContext;
