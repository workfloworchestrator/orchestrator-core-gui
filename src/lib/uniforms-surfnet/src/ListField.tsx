import "./ListField.scss";

import range from "lodash/range";
import React, { Children, HTMLProps, ReactNode, cloneElement, isValidElement } from "react";
import { Override, connectField, filterDOMProps } from "uniforms";

import ListAddField from "./ListAddField";
import ListItemField from "./ListItemField";

filterDOMProps.register("minCount");
filterDOMProps.register("maxCount");
filterDOMProps.register("items");

export type ListFieldProps = Override<
    Omit<HTMLProps<HTMLUListElement>, "onChange">,
    {
        children: ReactNode;
        initialCount?: number;
        itemProps?: {};
        label?: string;
        description?: string;
        name: string;
        value: unknown[];
        error?: boolean;
        showInlineError?: boolean;
        errorMessage?: string;
    }
>;

function List({
    children,
    initialCount = 1,
    itemProps,
    label,
    description,
    name,
    value,
    error,
    showInlineError,
    errorMessage,
    ...props
}: ListFieldProps) {
    return (
        <section>
            <ul {...filterDOMProps(props)} className="list-field">
                {label && (
                    <label>
                        {label}
                        <em>{description}</em>
                    </label>
                )}

                {range(Math.max(value.length, initialCount || 0)).map(itemIndex =>
                    Children.map(children, (child, childIndex) =>
                        isValidElement(child)
                            ? cloneElement(child, {
                                  key: `${itemIndex}-${childIndex}`,
                                  name: child.props.name?.replace("$", "" + itemIndex),
                                  ...itemProps
                              })
                            : child
                    )
                )}

                <ListAddField initialCount={initialCount} name="$" />
            </ul>
            {error && showInlineError && (
                <em className="error">
                    <div className="backend-validation">{errorMessage}</div>
                </em>
            )}
        </section>
    );
}

List.defaultProps = { children: <ListItemField name="$" /> };

export default connectField(List);
