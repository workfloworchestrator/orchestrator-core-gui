import React, { HTMLProps } from "react";
import { Override, connectField, filterDOMProps } from "uniforms";

export type LabelFieldProps = Override<
    HTMLProps<HTMLDivElement>,
    {
        id: string;
        label: string;
        name: string;
    }
>;

function Label({ id, name, label, ...props }: LabelFieldProps) {
    return (
        <section {...filterDOMProps(props)}>
            <p id={id} className={`label ${name}`}>
                {label}
            </p>
        </section>
    );
}

export default connectField(Label);
