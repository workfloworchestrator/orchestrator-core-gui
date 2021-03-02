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

import { FieldProps } from "lib/uniforms-surfnet/src/types";
import { intl } from "locale/i18n";
import React from "react";
import { connectField, filterDOMProps, joinName, useField } from "uniforms";

export type ListDelFieldProps = FieldProps<null, { initialCount?: number; itemProps?: {}; outerList?: boolean }>;

// onChange not used on purpose
function ListDel({ disabled, name, id, onChange, outerList = false, ...props }: ListDelFieldProps) {
    const nameParts = joinName(null, name);
    const nameIndex = +nameParts[nameParts.length - 1];
    const parentName = joinName(nameParts.slice(0, -1));
    const parent = useField<{ minCount?: number }, unknown[]>(parentName, {}, { absoluteName: true })[0];

    const limitNotReached = !disabled && !(parent.minCount! >= parent.value!.length);

    return (
        <div
            {...filterDOMProps(props)}
            className="del-item"
            id={`${id}.remove`}
            onClick={() => {
                if (limitNotReached) {
                    const value = parent.value!.slice();
                    value.splice(nameIndex, 1);
                    parent.onChange(value);
                }
            }}
        >
            <i className={`fa fa-minus ${!limitNotReached ? "disabled" : ""}`} />

            <label>{outerList && intl.formatMessage({ id: `forms.fields.${parentName}_del` })}</label>
        </div>
    );
}

export default connectField(ListDel, { initialValue: false, kind: "leaf" });
