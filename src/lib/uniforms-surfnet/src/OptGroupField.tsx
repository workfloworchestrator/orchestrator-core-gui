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
import I18n from "i18n-js";
import { AutoField, BoolField } from "lib/uniforms-surfnet/src";
import { FieldProps } from "lib/uniforms-surfnet/src/types";
import React from "react";
import { connectField, filterDOMProps, useField } from "uniforms";

export type OptGroupFieldProps = FieldProps<null, { fields?: any[]; itemProps?: object }>;

filterDOMProps.register("properties");

function OptGroup({
    fields,
    itemProps,
    name,
    onChange, // Not used on purpose
    className = "",
    ...props
}: OptGroupFieldProps) {
    const enabled = useField("enabled", {})[0].value;

    return (
        <section {...filterDOMProps(props)} className={`${className} optgroup-field`}>
            <label>
                {I18n.t(`forms.fields.${name}.title`)}
                <em>{I18n.t(`forms.fields.${name}.info`)}</em>
            </label>

            <BoolField name="enabled" />
            {enabled &&
                fields
                    ?.filter(field => field !== "enabled")
                    .map(field => <AutoField key={field} name={field} {...itemProps} />)}
        </section>
    );
}

export default connectField(OptGroup);
