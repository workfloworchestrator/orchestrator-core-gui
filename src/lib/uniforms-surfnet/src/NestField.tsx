import React, { HTMLProps } from "react";
import { connectField, filterDOMProps, injectName, joinName } from "uniforms";

import AutoField from "./AutoField";
import { Override } from "./utils";

export type NestFieldProps = Override<
    Omit<HTMLProps<HTMLDivElement>, "onChange">,
    {
        fields?: any[];
        itemProps?: object;
        name: string;
        description?: string;
    }
>;

filterDOMProps.register("properties");

function Nest({ children, fields, itemProps, label, description, name, className, ...props }: NestFieldProps) {
    return (
        <section {...filterDOMProps(props)} className={`${className ?? ""} nest-field`}>
            {label && (
                <label>
                    {label}
                    {description && <em>{description}</em>}
                </label>
            )}

            {children
                ? injectName(name, children as JSX.Element | JSX.Element[])
                : fields?.map(field => <AutoField key={field} name={joinName(name, field)} {...itemProps} />)}
        </section>
    );
}

export default connectField(Nest, { includeInChain: false });
