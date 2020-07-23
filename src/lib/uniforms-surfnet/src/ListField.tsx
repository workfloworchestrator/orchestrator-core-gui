/*
 * Copyright 2019-2020 SURF.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import "./ListField.scss";

import range from "lodash/range";
import React, { Children, cloneElement, isValidElement } from "react";
import { connectField, filterDOMProps } from "uniforms";

import ListAddField from "./ListAddField";
import ListItemField from "./ListItemField";
import { FieldProps } from "./types";

filterDOMProps.register("minCount");
filterDOMProps.register("maxCount");
filterDOMProps.register("items");

export type ListFieldProps = FieldProps<
    any[],
    { initialCount?: number; itemProps?: {}; uniqueItems?: boolean },
    null,
    HTMLUListElement
>;

function List({
    disabled,
    children = <ListItemField name="$" disabled={disabled} />,
    initialCount = 1,
    itemProps,
    label,
    description,
    name,
    value,
    onChange, // Not used on purpose
    error,
    showInlineError,
    errorMessage,
    uniqueItems, // Not used here but inspected by selectfields to determine unique values
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

                {range(Math.max(value?.length ?? 0, initialCount ?? 0)).map(itemIndex =>
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

                <ListAddField initialCount={initialCount} name="$" disabled={disabled} />
            </ul>
            {error && showInlineError && (
                <em className="error">
                    <div className="backend-validation">{errorMessage}</div>
                </em>
            )}
        </section>
    );
}

export default connectField(List);
