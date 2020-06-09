/*
 * Copyright 2019 SURF.
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

import React from "react";

import TableSummary from "../components/TableSummary";

export default {
    title: "TableSummary",
    // Needed to match snapshot file to story, should be done bij injectFileNames but that does not work
    parameters: {
        fileName: __filename
    }
};

export const Definition = () => (
    <TableSummary
        data={{
            labels: ["Label1", "Label 2", "Label 3"],
            columns: [["value1", "value2", "value3 with slightly longer text"]]
        }}
    />
);
export const SummaryWithHeaders = () => (
    <TableSummary
        data={{
            headers: ["Old Values", "New Values"],
            columns: [
                ["value1", "value2", "value3"],
                ["new value1", "new value2", "new value3"]
            ]
        }}
    />
);

SummaryWithHeaders.story = {
    name: "Summary with headers"
};

export const SummaryWithDefinitionAndHeaders = () => (
    <TableSummary
        data={{
            labels: ["Label1", "Label 2", "Label 3"],
            headers: ["Old Values", "New Values"],

            columns: [
                ["value1", "value2", "value3"],
                ["new value1", "new value2", "new value3"]
            ]
        }}
    />
);

SummaryWithDefinitionAndHeaders.story = {
    name: "Summary with definition and headers"
};
