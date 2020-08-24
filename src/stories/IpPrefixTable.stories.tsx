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

import { action } from "@storybook/addon-actions";
import { number } from "@storybook/addon-knobs";
import fetchMock from "fetch-mock";
import React from "react";

import IpPrefixTable from "../components/inputForms/IpPrefixTable";
import IP_BLOCKS_V6 from "./data/ip_blocks_v6.json";
import IP_BLOCKS from "./data/ip_blocks.json";

export default {
    title: "IpPrefixTable",
    // Needed to match snapshot file to story, should be done by injectFileNames but that does not work
    parameters: {
        fileName: __filename
    }
};

export const Definition = () => {
    fetchMock.restore();
    fetchMock.get("glob:*/api/ipam/prefix_filters", [
        { id: 1, prefix: "10.0.0.0/16", version: 4 },
        { id: 2, prefix: "2010::/32", version: 6 }
    ]);
    fetchMock.get("glob:*/api/ipam/ip_blocks/1", IP_BLOCKS);
    fetchMock.get("glob:*/api/ipam/ip_blocks/2", IP_BLOCKS_V6);

    return (
        <IpPrefixTable
            id="ip_prefix_table"
            name="ip_prefix_table"
            onChange={action("onChange")}
            selected_prefix_id={number("Selected prefix id", 27710)}
        />
    );
};
