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
import "./BoolField.scss";

import React from "react";
import { connectField, filterDOMProps } from "uniforms";

import { FieldProps } from "./types";

export type BoolFieldProps = FieldProps<boolean>;

function Bool({
    disabled,
    id,
    inputRef,
    label,
    description,
    name,
    onChange,
    value,
    error,
    showInlineError,
    errorMessage,
    ...props
}: BoolFieldProps) {
    return (
        <section {...filterDOMProps(props)} className="bool-field">
            <input
                checked={value || false}
                disabled={disabled}
                id={id}
                name={name}
                onChange={
                    disabled
                        ? undefined
                        : () => {
                              onChange(!value);
                          }
                }
                ref={inputRef}
                type="checkbox"
            />
            <label htmlFor={id}>
                <span tabIndex={0}>
                    <i className="fa fa-check" />
                </span>
            </label>
            {label && (
                <label className="info" htmlFor={id}>
                    {label}
                </label>
            )}
            {error && showInlineError && (
                <em className="error">
                    <div className="backend-validation">{errorMessage}</div>
                </em>
            )}
        </section>
    );
}

export default connectField(Bool, { kind: "leaf" });
