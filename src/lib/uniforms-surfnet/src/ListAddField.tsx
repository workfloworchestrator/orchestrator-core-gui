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
import cloneDeep from "lodash/cloneDeep";
import React, { HTMLProps } from "react";
import { Override, connectField, filterDOMProps, joinName, useField } from "uniforms";

export type ListAddFieldProps = Override<
    Omit<HTMLProps<HTMLDivElement>, "onChange">,
    { initialCount?: number; name: string; value: unknown }
>;

function ListAdd({ disabled, name, value, ...props }: ListAddFieldProps) {
    const nameParts = joinName(null, name);
    const parentName = joinName(nameParts.slice(0, -1));
    const parent = useField<{ maxCount?: number }, unknown[]>(parentName, {}, { absoluteName: true })[0];

    const limitNotReached = !disabled && !(parent.maxCount! <= parent.value!.length);

    return (
        <div className="add-item" {...filterDOMProps(props)}>
            <i
                className={`fa fa-plus ${!limitNotReached ? "disabled" : ""}`}
                onClick={() => {
                    if (limitNotReached) parent.onChange(parent.value!.concat([cloneDeep(value)]));
                }}
            />
        </div>
    );
}

export default connectField(ListAdd, { initialValue: false });
