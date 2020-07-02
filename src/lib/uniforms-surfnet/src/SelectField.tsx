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
import I18n from "i18n-js";
import xor from "lodash/xor";
import React from "react";
import ReactSelect, { ValueType } from "react-select";
import { connectField, filterDOMProps } from "uniforms";
import { Option } from "utils/types";

import { FieldProps } from "./types";

const base64: typeof btoa = typeof btoa !== "undefined" ? btoa : x => Buffer.from(x).toString("base64");
const escape = (x: string) => base64(x).replace(/=+$/, "");

export type SelectFieldProps = FieldProps<
    string | string[],
    { allowedValues?: string[]; checkboxes?: boolean; transform?(value: string): string }
>;

function Select({
    allowedValues,
    checkboxes,
    disabled,
    fieldType,
    id,
    inputRef,
    label,
    description,
    name,
    onChange,
    placeholder,
    required,
    transform,
    value,
    error,
    showInlineError,
    errorMessage,
    ...props
}: SelectFieldProps) {
    const options = (allowedValues || []).map((value: any) => ({
        label: transform ? transform(value) : value,
        value: value
    }));

    const selectedValue = options.find((option: Option) => option.value === value);

    return (
        <section {...filterDOMProps(props)}>
            {label && (
                <label htmlFor={id}>
                    {label}
                    <em>{description}</em>
                </label>
            )}
            {/* TODO: Better handling of these props. */}
            {checkboxes || fieldType === Array ? (
                allowedValues!.map((item: any) => (
                    <div key={item}>
                        <input
                            checked={fieldType === Array ? value!.includes(item) : value === item}
                            disabled={disabled}
                            id={`${id}-${escape(item)}`}
                            name={name}
                            onChange={() => {
                                onChange(fieldType === Array ? xor([item], value) : item);
                            }}
                            type="checkbox"
                        />

                        <label htmlFor={`${id}-${escape(item)}`}>{transform ? transform(item) : item}</label>
                    </div>
                ))
            ) : (
                <ReactSelect
                    id={id}
                    name={name}
                    onChange={(option: ValueType<Option>) => {
                        onChange((option as Option | null)?.value);
                    }}
                    options={options}
                    value={selectedValue}
                    isSearchable={true}
                    isClearable={true}
                    placeholder={placeholder || I18n.t("forms.widgets.select.placeholder")}
                    isDisabled={disabled}
                    required={required}
                    inputRef={inputRef}
                />
            )}

            {error && showInlineError && (
                <em className="error">
                    <div className="backend-validation">{errorMessage}</div>
                </em>
            )}
        </section>
    );
}

export default connectField(Select, { kind: "leaf" });
