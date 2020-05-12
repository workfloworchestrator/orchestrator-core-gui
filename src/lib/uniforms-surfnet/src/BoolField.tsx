import "./BoolField.scss";

import React, { HTMLProps, Ref } from "react";
import { Override, connectField, filterDOMProps } from "uniforms";

export type BoolFieldProps = Override<
    HTMLProps<HTMLDivElement>,
    {
        disabled: boolean;
        id: string;
        inputRef?: Ref<HTMLInputElement>;
        label: string;
        description?: string;
        name: string;
        onChange(value?: boolean): void;
        value?: boolean;
        error?: boolean;
        showInlineError?: boolean;
        errorMessage?: string;
    }
>;

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

export default connectField(Bool);
