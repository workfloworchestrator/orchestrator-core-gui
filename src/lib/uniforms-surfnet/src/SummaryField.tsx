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
import "lib/uniforms-surfnet/src/SummaryField.scss";

import { FieldProps } from "lib/uniforms-surfnet/src/types";
import React from "react";
import { connectField, filterDOMProps } from "uniforms";
import { isEmpty } from "utils/Utils";

export type SummaryFieldProps = FieldProps<
    null,
    { data?: { headers: string[]; labels: string[]; columns: string[][] } }
>;

// onChange not used on purpose
function Summary({ id, name, label, description, onChange, data, ...props }: SummaryFieldProps) {
    if (!data) {
        return null;
    }

    const { headers, labels, columns } = data;

    const extra_columns_data = columns.filter((item, index) => index !== 0);

    const rows = columns[0].map((row, index) => (
        <tr key={index}>
            {labels && <td className="label">{labels[index]}</td>}
            <td className="value">{row}</td>
            {extra_columns_data &&
                extra_columns_data.map((cell, idx) => (
                    <td className="value" key={idx}>
                        {extra_columns_data[idx][index]}
                    </td>
                ))}
        </tr>
    ));

    const table_header = isEmpty(headers) ? (
        ""
    ) : (
        <tr>
            {labels && <th />}
            {headers.map((header, idx) => (
                <th key={idx}>{header}</th>
            ))}
        </tr>
    );

    return (
        <section {...filterDOMProps(props)}>
            {label && (
                <label htmlFor={id}>
                    {label}
                    {description && <em>{description}</em>}
                </label>
            )}
            <section className="table-summary">
                <table id={id}>
                    <thead>{table_header}</thead>
                    <tbody>{rows}</tbody>
                </table>
            </section>
        </section>
    );
}

export default connectField(Summary, { kind: "leaf" });
