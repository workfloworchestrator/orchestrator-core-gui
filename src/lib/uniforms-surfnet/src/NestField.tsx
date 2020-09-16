import { EuiText } from "@elastic/eui";
import AutoField from "lib/uniforms-surfnet/src/AutoField";
import { FieldProps } from "lib/uniforms-surfnet/src/types";
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
import React from "react";
import { connectField, filterDOMProps } from "uniforms";

export type NestFieldProps = FieldProps<null, { fields?: any[]; itemProps?: object }>;

declare module "uniforms" {
    interface FilterDOMProps {
        properties: never;
    }
}
filterDOMProps.register("properties");

function Nest({
    children,
    fields,
    itemProps,
    label,
    description,
    name,
    onChange, // Not used on purpose
    className = "",
    ...props
}: NestFieldProps) {
    return (
        <section {...filterDOMProps(props)} className={`${className} nest-field`}>
            {label && (
                <>
                    <label className="euiFormLabel euiFormRow__label">{label}</label>
                    <EuiText size="m">{description}</EuiText>
                </>
            )}

            {children || fields?.map(field => <AutoField key={field} name={field} {...itemProps} />)}
        </section>
    );
}

export default connectField(Nest);
