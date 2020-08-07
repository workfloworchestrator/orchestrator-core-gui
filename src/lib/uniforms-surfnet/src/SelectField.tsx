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
import { get } from "lodash";
import xor from "lodash/xor";
import React from "react";
import ReactSelect, { ValueType } from "react-select";
import { connectField, filterDOMProps, joinName, useField, useForm } from "uniforms";
import { Option } from "utils/types";

import { ListFieldProps } from "./ListField";
import { FieldProps } from "./types";
import { ListField, ListItemField, SelectField } from ".";

export type SelectFieldProps = FieldProps<
    string | string[],
    { allowedValues?: string[]; checkboxes?: boolean; transform?(value: string): string }
>;

function Select({
    allowedValues = [],
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
    const nameArray = joinName(null, name);
    let parentName = joinName(nameArray.slice(0, -1));

    // We cant call useField conditionally so we call it for ourselfs if there is no parent
    if (parentName === "") {
        parentName = name;
    }
    const parent = useField(parentName, {}, { absoluteName: true })[0];
    const { model } = useForm();

    if (parentName !== name) {
        if (parent.fieldType === Array && (parent as ListFieldProps).uniqueItems) {
            const allValues: string[] = get(model, parentName, []);
            const chosenValues = allValues.filter(
                (_item, index) => index.toString() !== nameArray[nameArray.length - 1]
            );

            allowedValues = allowedValues.filter(value => !chosenValues.includes(value));
        }
    }
    const options = allowedValues.map((value: any) => ({
        label: transform ? transform(value) : value,
        value: value
    }));

    const selectedValue = options.find((option: Option) => option.value === value);

    if (!checkboxes && fieldType === Array) {
        return (
            <ListField name={name}>
                <ListItemField name="$">
                    <SelectField name="" transform={transform} />
                </ListItemField>
            </ListField>
        );
    } else {
        return (
            <section {...filterDOMProps(props)}>
                {label && (
                    <label htmlFor={id}>
                        {label}
                        <em>{description}</em>
                    </label>
                )}
                {checkboxes ? (
                    allowedValues!.map((item: any, index: number) => (
                        <div key={item} className="bool-field">
                            <input
                                checked={fieldType === Array ? value!.includes(item) : value === item}
                                disabled={disabled}
                                id={`${id}.${index}`}
                                name={name}
                                onChange={() => {
                                    onChange(fieldType === Array ? xor([item], value) : item);
                                }}
                                type="checkbox"
                            />
                            <label htmlFor={`${id}.${index}`}>
                                <span>
                                    <i className="fa fa-check" />
                                </span>
                            </label>
                            <label className="info" htmlFor={`${id}.${index}`}>
                                {transform ? transform(item) : item}
                            </label>
                        </div>
                    ))
                ) : (
                    <ReactSelect
                        id={id}
                        inputId={`${id}.search`}
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
}

export default connectField(Select, { kind: "leaf" });
