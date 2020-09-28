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
import get from "lodash/get";
import { createElement, useContext } from "react";
import { connectField } from "uniforms";
import ApplicationContext from "utils/ApplicationContext";

export type OrganisationFieldProps = { inputComponent: typeof SelectField } & Omit<
    SelectFieldProps,
    "placeholder" | "transform" | "allowedValues"
>;

function Organisation({ inputComponent = SelectField, name, ...props }: OrganisationFieldProps) {
    const { organisations } = useContext(ApplicationContext);
    const organisationLabelLookup =
        organisations?.reduce<{ [index: string]: string }>(function(mapping, org) {
            mapping[org.uuid] = org.name;
            return mapping;
        }, {}) ?? {};

    return createElement(inputComponent, {
        name: "",
        ...props,
        allowedValues: Object.keys(organisationLabelLookup),
        transform: (uuid: string) => get(organisationLabelLookup, uuid, uuid),
        placeholder: I18n.t("forms.widgets.organisation.placeholder")
    });
}

export default connectField(Organisation);
