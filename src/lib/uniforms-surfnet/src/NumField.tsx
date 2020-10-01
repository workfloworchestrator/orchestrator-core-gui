import { FieldProps } from "lib/uniforms-surfnet/src/types";
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
import React from "react";
import NumericInput from "react-numeric-input";
import { connectField, filterDOMProps } from "uniforms";

export type NumFieldProps = FieldProps<
    number,
    { max?: number; min?: number; precision?: number; step?: number },
    NumericInput
>;

function Num({
    disabled,
    id,
    inputRef,
    label,
    description,
    max,
    min,
    precision,
    name,
    onChange,
    placeholder,
    step,
    value,
    error,
    showInlineError,
    errorMessage,
    ...props
}: NumFieldProps) {
    return (
        <div {...filterDOMProps(props)}>
            {label && (
                <label htmlFor={id}>
                    {label}
                    {description && <em>{description}</em>}
                </label>
            )}
            <NumericInput
                id={id}
                name={name}
                ref={inputRef}
                placeholder={placeholder}
                onChange={v => {
                    onChange(v ?? undefined);
                }}
                min={min}
                max={max}
                step={step ?? 1}
                precision={precision ?? 0}
                value={value ?? ""}
                strict={false}
                disabled={disabled}
            />
            {error && showInlineError && (
                <em className="error">
                    <div className="backend-validation">{errorMessage}</div>
                </em>
            )}
        </div>
    );
}

export default connectField(Num, { kind: "leaf" });
