import React, { HTMLProps } from "react";
import { connectField, filterDOMProps } from "uniforms";

import { Override } from "./utils";

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

export default connectField(Label, { ensureValue: false, initialValue: false });
