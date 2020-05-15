import React from "react";
import { BaseField, filterDOMProps, nothing } from "uniforms";

const ErrorsField = ({ children, ...props }: any, { uniforms: { error, schema } }: any) =>
    !error && !children ? (
        nothing
    ) : (
        <div {...filterDOMProps(props)}>
            {children}

            <ul>
                {schema.getErrorMessages(error).map((message: string, index: number) => (
                    <li key={index}>{message}</li>
                ))}
            </ul>
        </div>
    );

ErrorsField.contextTypes = BaseField.contextTypes;

export default ErrorsField;
