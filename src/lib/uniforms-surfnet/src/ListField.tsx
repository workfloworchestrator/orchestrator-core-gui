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
import "lib/uniforms-surfnet/src/ListField.scss";

import ListAddField from "lib/uniforms-surfnet/src/ListAddField";
import ListItemField from "lib/uniforms-surfnet/src/ListItemField";
import { FieldProps } from "lib/uniforms-surfnet/src/types";
import { EuiFormRow, EuiText } from "@elastic/eui";
import range from "lodash/range";
import React, { Children, cloneElement, isValidElement } from "react";
import { connectField, filterDOMProps, joinName, useField } from "uniforms";

filterDOMProps.register("minCount");
filterDOMProps.register("maxCount");
filterDOMProps.register("items");
filterDOMProps.register("uniqueItems");
filterDOMProps.register("outerList");

export type ListFieldProps = FieldProps<
    any[],
    { initialCount?: number; itemProps?: {}; uniqueItems?: boolean },
    null,
    HTMLUListElement
>;

function List({
    disabled,
    children = <ListItemField name="$" disabled={disabled} outerList={false} />,
    initialCount = 1,
    itemProps,
    className = "",
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
    const child = useField(joinName(name, "$"), {}, { absoluteName: true })[0];
    const hasListAsChild = child.fieldType === Array;

    return (
        <section {...filterDOMProps(props)} className={`list-field${hasListAsChild ? " outer-list" : ""}`}>
            <EuiFormRow
                label={label}
                labelAppend={<EuiText size="m">{description}</EuiText>}
                error={showInlineError ? errorMessage : false}
                isInvalid={error}
            >
                <></>
            </EuiFormRow>

            <ul>
                {range(Math.max(value?.length ?? 0, initialCount ?? 0)).map(itemIndex =>
                    Children.map(children, (child, childIndex) =>
                        isValidElement(child)
                            ? cloneElement(child, {
                                  key: `${itemIndex}-${childIndex}`,
                                  name: child.props.name?.replace("$", "" + itemIndex),
                                  outerList: hasListAsChild,
                                  ...itemProps
                              })
                            : child
                    )
                )}

                <ListAddField initialCount={initialCount} name="$" disabled={disabled} outerList={hasListAsChild} />
            </ul>
        </section>
    );
}

export default connectField(List);
