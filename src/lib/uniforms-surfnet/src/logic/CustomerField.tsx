/*
 * Copyright 2019-2023 SURF.
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

import SelectField, { SelectFieldProps } from "lib/uniforms-surfnet/src/SelectField";
import get from "lodash/get";
import React, { useContext } from "react";
import { useIntl } from "react-intl";
import { connectField } from "uniforms";
import ApplicationContext from "utils/ApplicationContext";

export type CustomerFieldProps = Omit<SelectFieldProps, "placeholder" | "transform" | "allowedValues">;

function Customer({ name, ...props }: CustomerFieldProps) {
    const intl = useIntl();
    const { organisations } = useContext(ApplicationContext);
    const customerLabelLookup =
        organisations?.reduce<{ [index: string]: string }>(function (mapping, org) {
            mapping[org.uuid] = org.name;
            return mapping;
        }, {}) ?? {};

    return (
        <SelectField
            name=""
            {...props}
            allowedValues={Object.keys(customerLabelLookup)}
            transform={(uuid: string) => get(customerLabelLookup, uuid, uuid)}
            placeholder={intl.formatMessage({ id: "forms.widgets.customer.placeholder" })}
        />
    );
}

export default connectField(Customer);
