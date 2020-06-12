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
import React, { HTMLProps, Ref } from "react";
import { Override, connectField, filterDOMProps } from "uniforms";

export type TextFieldProps = Override<
    HTMLProps<HTMLDivElement>,
    {
        disabled: boolean;
        id: string;
        inputRef?: Ref<HTMLInputElement>;
        label: string;
        description?: string;
        name: string;
        onChange(value?: string): void;
        placeholder: string;
        type?: string;
        value?: string;
        error?: boolean;
        showInlineError?: boolean;
        errorMessage?: string;
    }
>;

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
    return (
        <section {...filterDOMProps(props)}>
            {label && (
                <label htmlFor={id}>
                    {label}
                    {description && <em>{description}</em>}
                </label>
            )}
            <input
                disabled={disabled}
                id={id}
                name={name}
                onChange={event => onChange(event.target.value)}
                placeholder={placeholder}
                ref={inputRef}
                type={type}
                value={value ?? ""}
            ></input>
            {error && showInlineError && (
                <em className="error">
                    <div className="backend-validation">{errorMessage}</div>
                </em>
            )}
        </section>
    );
}

Text.defaultProps = { type: "text" };

export default connectField(Text);
