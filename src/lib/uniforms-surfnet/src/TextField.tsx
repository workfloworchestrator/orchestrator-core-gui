import React, { HTMLProps, Ref } from "react";
import { connectField, filterDOMProps } from "uniforms";

import { Override } from "./utils";

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
