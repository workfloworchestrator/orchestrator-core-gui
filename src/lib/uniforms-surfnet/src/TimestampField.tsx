import { EuiDatePicker, EuiFormRow, EuiText } from "@elastic/eui";
import { FieldProps } from "lib/uniforms-surfnet/src/types";
import moment from "moment";
/*
 * Copyright 2019-2022 SURF.
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
import { connectField, filterDOMProps } from "uniforms";

// const DateConstructor = (typeof global === "object" ? global : window).Date;
// const dateFormat = (value?: Date) => value?.toISOString().slice(0, -8);

export type TimestampFieldProps = FieldProps<number, { max?: number; min?: number }>;

function TimestampField({
    disabled,
    id,
    inputRef,
    label,
    description,
    max,
    min,
    name,
    onChange,
    readOnly,
    placeholder,
    value,
    error,
    showInlineError,
    errorMessage,
    ...props
}: TimestampFieldProps) {
    return (
        <div {...filterDOMProps(props)}>
            <EuiFormRow
                label={label}
                labelAppend={<EuiText size="m">{description}</EuiText>}
                error={showInlineError ? errorMessage : false}
                isInvalid={error}
                id={id}
                fullWidth
            >
                <EuiDatePicker
                    selected={value ? moment.unix(value) : null}
                    // @ts-ignore
                    value={value ? moment.unix(value) : null}
                    // @ts-ignore
                    onChange={(event) => {
                        // alert(event);
                        onChange(event?.unix());
                    }}
                    showTimeSelect={true}
                    // Todo: come up with a smart way to set this to NL for SURF
                    dateFormat="DD-MM-YYYY HH:mm"
                    timeFormat="HH:mm"
                    locale="nl-nl"
                />
            </EuiFormRow>
        </div>
    );
}

export default connectField(TimestampField, { kind: "leaf" });
