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

import React, { useState } from "react";
import { connectField, filterDOMProps } from "uniforms";

import IPPrefixTable from "../../../components/IpPrefixTable";
import SplitPrefix from "../../../components/SplitPrefix";
import { IpBlock } from "../../../utils/types";
import { FieldProps } from "./types";

export type IPvAnyNetworkFieldProps = FieldProps<string, { prefixMin?: number }>;

function IPvAnyNetwork({
    disabled,
    id,
    inputRef,
    label,
    description,
    name,
    onChange,
    placeholder,
    type,
    value,
    error,
    showInlineError,
    errorMessage,
    prefixMin,
    ...props
}: IPvAnyNetworkFieldProps) {
    const [selectedPrefix, setSelectedPrefix] = useState<IpBlock | undefined>(undefined);

    const usePrefix = selectedPrefix?.prefix ?? value;
    const [subnet, netmask] = usePrefix?.split("/") ?? ["", ""];
    const usedPrefixMin = prefixMin ?? parseInt(netmask, 10) + (selectedPrefix?.state === 0 ? 0 : 1);

    return (
        <section {...filterDOMProps(props)}>
            {label && (
                <label htmlFor={id}>
                    {label}
                    {description && <em>{description}</em>}
                </label>
            )}
            <section className="ipblock-selector">
                <div id={id}>
                    {!prefixMin && (
                        <IPPrefixTable
                            onChange={(prefix: IpBlock) => {
                                if (prefix.state === 0 || prefix.state === 1) {
                                    setSelectedPrefix(prefix);
                                }
                                onChange(prefix.prefix);
                            }}
                            selected_prefix_id={selectedPrefix?.id}
                        />
                    )}
                    {usePrefix && (
                        <SplitPrefix
                            subnet={subnet}
                            prefixlen={parseInt(netmask, 10)}
                            prefixMin={usedPrefixMin}
                            onChange={(prefix: string) => {
                                onChange(prefix);
                            }}
                            selectedSubnet={usePrefix}
                        />
                    )}
                </div>
            </section>
            {error && showInlineError && (
                <em className="error">
                    <div className="backend-validation">{errorMessage}</div>
                </em>
            )}
        </section>
    );
}

IPvAnyNetwork.defaultProps = { type: "text" };

export default connectField(IPvAnyNetwork, { kind: "leaf" });
