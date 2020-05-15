import React, { HTMLProps, Ref } from "react";
import NumericInput from "react-numeric-input";
import { connectField, filterDOMProps } from "uniforms";

import { Override } from "./utils";

export type NumFieldProps = Override<
    HTMLProps<HTMLDivElement>,
    {
        disabled: boolean;
        id: string;
        inputRef?: Ref<NumericInput>;
        label: string;
        description: string;
        max?: number;
        min?: number;
        precision?: number;
        name: string;
        onChange(value?: number): void;
        placeholder: string;
        step?: number;
        value?: number;
        error?: boolean;
        showInlineError?: boolean;
        errorMessage?: string;
    }
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

export default connectField(Num);
