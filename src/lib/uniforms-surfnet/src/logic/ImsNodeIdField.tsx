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

import { getNodesByLocationAndStatus } from "api";
import SelectField, { SelectFieldProps } from "lib/uniforms-surfnet/src/SelectField";
import { intl } from "locale/i18n";
import { get } from "lodash";
import React, { useEffect, useState } from "react";
import { connectField, filterDOMProps } from "uniforms";
import { IMSNode } from "utils/types";

export type ImsNodeIdFieldProps = {
    onChange: (value?: number | undefined) => void;
    value?: number;
    locationCode: string;
    status?: string;
} & Omit<SelectFieldProps, "placeholder" | "transform" | "allowedValues" | "onChange" | "value">;

declare module "uniforms" {
    interface FilterDOMProps {
        locationCode: never;
        status: never;
    }
}
filterDOMProps.register("locationCode", "status");

function ImsNodeId({ name, value, onChange, locationCode, status, ...props }: ImsNodeIdFieldProps) {
    const [loading, setLoading] = useState(true);
    const [nodes, setNodes] = useState<IMSNode[]>([]);

    useEffect(() => {
        if (locationCode) {
            getNodesByLocationAndStatus(locationCode, status ?? "PL")
                .then(setNodes)
                .then(() => setLoading(false));
        }
    }, [locationCode, status]);

    const placeholder =
        loading && locationCode
            ? intl.formatMessage({ id: "forms.widgets.node_select.nodes_loading" })
            : nodes.length
            ? intl.formatMessage({ id: "forms.widgets.node_select.select_node" })
            : intl.formatMessage({ id: "forms.widgets.node_select.no_nodes_placeholder" });

    const imsNodeIdLabelLookup =
        nodes?.reduce<{ [index: string]: string }>(function (mapping, node) {
            mapping[node.id.toString()] = node.name;
            return mapping;
        }, {}) ?? {};

    return (
        <SelectField
            name=""
            {...props}
            allowedValues={Object.keys(imsNodeIdLabelLookup)}
            value={value?.toString()}
            transform={(id: string) => get(imsNodeIdLabelLookup, id, id)}
            onChange={(str: string) => onChange(parseInt(str, 10))}
            placeholder={placeholder}
        />
    );
}

export default connectField(ImsNodeId);
