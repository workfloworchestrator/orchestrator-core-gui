import React, { HTMLProps, Ref } from "react";
import { BaseField, filterDOMProps } from "uniforms";

import { Override } from "./utils";

export type SubmitFieldProps = Override<
    HTMLProps<HTMLInputElement>,
    {
        disabled?: boolean;
        inputRef?: Ref<HTMLInputElement>;
        value?: string;
    }
>;
const SubmitField = (
    { disabled, inputRef, value, ...props }: SubmitFieldProps,
    { uniforms: { error, state } }: any
) => (
    <input
        disabled={disabled === undefined ? !!(error || state.disabled) : disabled}
        ref={inputRef}
        type="submit"
        {...(value ? { value } : {})}
        {...filterDOMProps(props)}
    />
);

SubmitField.contextTypes = BaseField.contextTypes;

export default SubmitField;
