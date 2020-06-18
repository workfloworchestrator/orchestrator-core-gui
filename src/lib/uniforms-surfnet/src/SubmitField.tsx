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
import { Override, filterDOMProps, useForm } from "uniforms";

export type SubmitFieldProps = Override<
    HTMLProps<HTMLInputElement>,
    {
        disabled?: boolean;
        inputRef?: Ref<HTMLInputElement>;
        value?: string;
    }
>;

export default function SubmitField({ disabled, inputRef, value, ...props }: SubmitFieldProps) {
    const { error, state } = useForm();

    return (
        <input
            disabled={disabled === undefined ? !!(error || state.disabled) : disabled}
            ref={inputRef}
            type="submit"
            {...(value ? { value } : {})}
            {...filterDOMProps(props)}
        />
    );
}
