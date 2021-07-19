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
import { ListField, ListItemField, SelectField } from "lib/uniforms-surfnet/src";
import { ListFieldProps } from "lib/uniforms-surfnet/src/ListField";
import { FieldProps } from "lib/uniforms-surfnet/src/types";
import { get } from "lodash";
import React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import ReactSelect from "react-select";
import { connectField, filterDOMProps, joinName, useField, useForm } from "uniforms";
import { Option } from "utils/types";

export type SelectFieldProps = FieldProps<
    string | string[],
    { allowedValues?: string[]; transform?(value: string): string } & WrappedComponentProps
>;

function Select({
    allowedValues = [],
    disabled,
    fieldType,
    id,
    inputRef,
    label,
    description,
    name,
    onChange,
    placeholder,
    readOnly,
    required,
    transform,
    value,
    error,
    showInlineError,
    errorMessage,
    intl,
    ...props
}: SelectFieldProps) {
    const nameArray = joinName(null, name);
    let parentName = joinName(nameArray.slice(0, -1));

    // We cant call useField conditionally so we call it for ourselves if there is no parent
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

            allowedValues = allowedValues.filter((value) => !chosenValues.includes(value));
        }
    }
    const options = allowedValues.map((value: any) => ({
        label: transform ? transform(value) : value,
        value: value,
    }));

    const selectedValue = options.find((option: Option) => option.value === value);

    if (fieldType === Array) {
        return (
            <ListField name={name}>
                <ListItemField name="$">
                    <SelectField name="" transform={transform} allowedValues={allowedValues} />
                </ListItemField>
            </ListField>
        );
    } else {
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
                    <ReactSelect<Option, false>
                        id={id}
                        inputId={`${id}.search`}
                        name={name}
                        onChange={(option) => {
                            if (!readOnly) {
                                onChange(option?.value);
                            }
                        }}
                        options={options}
                        value={selectedValue}
                        isSearchable={true}
                        isClearable={true}
                        placeholder={placeholder || intl.formatMessage({ id: "forms.widgets.select.placeholder" })}
                        isDisabled={disabled || readOnly}
                        required={required}
                        inputRef={inputRef}
                    />
                </EuiFormRow>
            </section>
        );
    }
}

export default connectField(injectIntl(Select), { kind: "leaf" });
