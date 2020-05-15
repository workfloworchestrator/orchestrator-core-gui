import "./ListField.scss";

import range from "lodash/range";
import React, { Children, HTMLProps, ReactNode, cloneElement } from "react";
import { connectField, filterDOMProps, joinName } from "uniforms";

import ListAddField from "./ListAddField";
import ListItemField from "./ListItemField";
import { Override } from "./utils";

filterDOMProps.register("minCount");
filterDOMProps.register("maxCount");
filterDOMProps.register("items");

export type ListFieldProps<T> = Override<
    HTMLProps<HTMLUListElement>,
    {
        children?: ReactNode;
        initialCount: number;
        itemProps?: {};
        label: string;
        description?: string;
        name: string;
        value: T[];
        error?: boolean;
        showInlineError?: boolean;
        errorMessage?: string;
    }
>;

function List<T>({
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
}: ListFieldProps<T>) {
    const renderFunction = children
        ? (index: number) => (
              <React.Fragment>
                  {Children.map(children as JSX.Element, child =>
                      cloneElement(child, {
                          key: index,
                          label: null,
                          name: joinName(name, child.props.name && child.props.name.replace("$", index))
                      })
                  )}
              </React.Fragment>
          )
        : (index: number) => <ListItemField key={index} label={null} name={joinName(name, index)} {...itemProps} />;

    return (
        <section>
            <ul {...filterDOMProps(props)} className="list-field">
                {label && (
                    <label>
                        {label}
                        <em>{description}</em>
                    </label>
                )}

                {range(Math.max(value.length, initialCount)).map(renderFunction)}

                <ListAddField initialCount={initialCount} name={`${name}.$`} />
            </ul>
            {error && showInlineError && (
                <em className="error">
                    <div className="backend-validation">{errorMessage}</div>
                </em>
            )}
        </section>
    );
}

export default connectField(List, {
    ensureValue: false,
    includeInChain: false
});
