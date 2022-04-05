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

import { EuiInMemoryTable, EuiPageContent, EuiPageContentHeader, EuiSpacer } from "@elastic/eui";
import React from "react";

import ApplicationContext from "../utils/ApplicationContext";
import { ResourceType } from "../utils/types";

interface IState {
    resourceTypes: ResourceType[];
    resourceTypesLoaded: boolean;
    isLoading: boolean;
}

export default class ResourceTypes extends React.Component {
    state: IState = {
        resourceTypes: [],
        resourceTypesLoaded: true,
        isLoading: false,
    };

    componentDidMount() {
        this.context.apiClient.resourceTypes().then((resourceTypes: ResourceType[]) => {
            this.setState({ resourceTypes: resourceTypes, resourceTypesLoaded: false });
        });
    }

    render() {
        const { resourceTypes, resourceTypesLoaded } = this.state;

        const search = {
            box: {
                incremental: true,
                schema: true,
                placeholder: "Search for resource types..",
            },
        };

        const columns = [
            {
                field: "resource_type",
                name: "TYPE",
                sortable: true,
                truncateText: false,
            },
            {
                field: "description",
                name: "DESCRIPTION",
                sortable: true,
                truncateText: false,
                width: "50%",
            },
            {
                field: "resource_type_id",
                name: "RESOURCE ID",
                sortable: true,
                truncateText: false,
            },
        ];

        return (
            <EuiPageContent>
                <EuiPageContentHeader>
                    <EuiSpacer size="l" />
                    <EuiInMemoryTable
                        items={resourceTypes}
                        columns={columns}
                        search={search}
                        pagination={true}
                        sorting={true}
                        loading={resourceTypesLoaded}
                        hasActions={true}
                    />
                </EuiPageContentHeader>
            </EuiPageContent>
        );
    }
}

ResourceTypes.contextType = ApplicationContext;
