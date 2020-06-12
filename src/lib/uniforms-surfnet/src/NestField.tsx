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
import React, { HTMLProps } from "react";
import { Override, connectField, filterDOMProps } from "uniforms";

import AutoField from "./AutoField";

export type NestFieldProps = Override<
    Omit<HTMLProps<HTMLDivElement>, "onChange">,
    {
        fields?: any[];
        itemProps?: object;
        name?: string;
        description?: string;
    }
>;

filterDOMProps.register("properties");

function Nest({ children, fields, itemProps, label, description, name, className, ...props }: NestFieldProps) {
    return (
        <section {...filterDOMProps(props)} className={`${className ?? ""} nest-field`}>
            {label && (
                <label>
                    {label}
                    {description && <em>{description}</em>}
                </label>
            )}

            {children || fields?.map(field => <AutoField key={field} name={field} {...itemProps} />)}
        </section>
    );
}

export default connectField(Nest);
