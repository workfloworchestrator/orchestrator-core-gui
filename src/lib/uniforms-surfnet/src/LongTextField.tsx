import React, { HTMLProps, Ref } from "react";
import { connectField, filterDOMProps } from "uniforms";

import { Override } from "./utils";

export type LongTextFieldProps = Override<
    HTMLProps<HTMLDivElement>,
    {
        disabled: boolean;
        id: string;
        inputRef?: Ref<HTMLTextAreaElement>;
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

function LongText({
    disabled,
    id,
    inputRef,
    label,
    description,
    name,
    onChange,
    placeholder,
    value,
    error,
    showInlineError,
    errorMessage,
    ...props
}: LongTextFieldProps) {
    return (
        <section {...filterDOMProps(props)}>
            {label && (
                <label htmlFor={id}>
                    {label}
                    {description && <em>{description}</em>}
                </label>
            )}
            <textarea
                disabled={disabled}
                id={id}
                name={name}
                onChange={event => onChange(event.target.value)}
                placeholder={placeholder}
                ref={inputRef}
                value={value ?? ""}
                rows={5}
            />
            {error && showInlineError && (
                <em className="error">
                    <div className="backend-validation">{errorMessage}</div>
                </em>
            )}
        </section>
    );
}

export default connectField(LongText);
