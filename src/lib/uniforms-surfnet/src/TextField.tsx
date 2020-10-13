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
import { EuiFieldText, EuiFormRow, EuiText } from "@elastic/eui";
import { isRepeatedField } from "lib/uniforms-surfnet/src/logic/LabelLogic";
import { FieldProps } from "lib/uniforms-surfnet/src/types";
import React from "react";
import { connectField, filterDOMProps } from "uniforms";

export type TextFieldProps = FieldProps<string>;

function Text({
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
    ...props
}: TextFieldProps) {
    const isRepeated: boolean = isRepeatedField(name);
    const labelRender: string = isRepeated ? "" : label;

    return (
        <section {...filterDOMProps(props)} className={`${isRepeated ? "repeated" : ""}`}>
            <EuiFormRow
                label={labelRender}
                labelAppend={<EuiText size="m">{description}</EuiText>}
                error={showInlineError ? errorMessage : false}
                isInvalid={error}
                id={id}
                fullWidth
                hasEmptyLabelSpace
            >
                <EuiFieldText
                    disabled={disabled}
                    name={name}
                    isInvalid={error}
                    onChange={event => onChange(event.target.value)}
                    placeholder={placeholder}
                    type={type}
                    value={value ?? ""}
                    fullWidth
                />
            </EuiFormRow>
        </section>
    );
}

Text.defaultProps = { type: "text" };

export default connectField(Text, { kind: "leaf" });
