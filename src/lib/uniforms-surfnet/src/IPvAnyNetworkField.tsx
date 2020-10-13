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

import { EuiFormRow, EuiText } from "@elastic/eui";
import IPPrefixTable from "components/inputForms/IpPrefixTable";
import SplitPrefix from "components/inputForms/SplitPrefix";
import { FieldProps } from "lib/uniforms-surfnet/src/types";
import React, { useState } from "react";
import { connectField, filterDOMProps } from "uniforms";
import { IpBlock } from "utils/types";

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
            <EuiFormRow
                label={label}
                labelAppend={<EuiText size="m">{description}</EuiText>}
                error={showInlineError ? errorMessage : false}
                isInvalid={error}
                id={id}
                fullWidth
            >
                <section className="ipblock-selector">
                    <div id={id}>
                        {!prefixMin && (
                            <IPPrefixTable
                                id={id}
                                name={name}
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
                                id={id}
                                name={name}
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
            </EuiFormRow>
        </section>
    );
}

IPvAnyNetwork.defaultProps = { type: "text" };

export default connectField(IPvAnyNetwork, { kind: "leaf" });
