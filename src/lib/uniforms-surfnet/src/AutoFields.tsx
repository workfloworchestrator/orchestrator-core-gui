import { ComponentType, createElement } from "react";
import { useForm } from "uniforms";

import AutoField from "./AutoField";

export type AutoFieldsProps = {
    autoField?: ComponentType<{ name: string; className: string; id: string }>;
    element?: ComponentType<{ className: string }> | string;
    fields?: string[];
    omitFields?: string[];
};

export default function AutoFields({ autoField, element, fields, omitFields, ...props }: AutoFieldsProps) {
    const { schema } = useForm();

    return createElement(
        element!,
        { className: "form-step", ...props },
        (fields ?? schema.getSubfields())
            .filter(field => !omitFields!.includes(field))
            .map(field =>
                createElement(autoField!, { key: field, name: field, className: field, id: `input-${field}` })
            )
    );
}

AutoFields.defaultProps = {
    autoField: AutoField,
    element: "section",
    omitFields: []
};
