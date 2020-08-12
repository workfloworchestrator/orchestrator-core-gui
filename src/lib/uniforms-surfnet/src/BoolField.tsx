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
import "lib/uniforms-surfnet/src/BoolField.scss";

import { EuiFormRow, EuiText } from "@elastic/eui";
import { FieldProps } from "lib/uniforms-surfnet/src/types";
import React from "react";
import { connectField, filterDOMProps } from "uniforms";

export type BoolFieldProps = FieldProps<boolean>;

function Bool({
    disabled,
    id,
    inputRef,
    className = "",
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
        <section {...filterDOMProps(props)} className={`${className} bool-field`}>
            <EuiFormRow
                label={label}
                labelAppend={<EuiText size="m">{description}</EuiText>}
                error={showInlineError ? errorMessage : false}
                isInvalid={error}
                fullWidth
            >
                <>
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
                </>
            </EuiFormRow>
        </section>
    );
}

export default connectField(Bool, { kind: "leaf" });
