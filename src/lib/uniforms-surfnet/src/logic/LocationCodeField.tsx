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
import SelectField, { SelectFieldProps } from "lib/uniforms-surfnet/src/SelectField";
import React, { useContext } from "react";
import { connectField, filterDOMProps } from "uniforms";
import ApplicationContext from "utils/ApplicationContext";

export type LocationCodeFieldProps = { locationCodes?: string[] } & Omit<
    SelectFieldProps,
    "placeholder" | "allowedValues"
>;

declare module "uniforms" {
    interface FilterDOMProps {
        locationCodes: never;
    }
}

filterDOMProps.register("locationCodes");

function LocationCode({ name, locationCodes, ...props }: LocationCodeFieldProps) {
    const allLocationCodes = useContext(ApplicationContext).locationCodes || [];

    if (!locationCodes) {
        locationCodes = allLocationCodes;
    }

    return (
        <SelectField
            name=""
            {...props}
            allowedValues={locationCodes}
            placeholder={I18n.t("forms.widgets.locationCode.placeholder")}
        />
    );
}

export default connectField(LocationCode);
