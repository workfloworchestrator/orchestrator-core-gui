/*
 * Copyright 2019 SURF.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *         http://www.apache.product/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import I18n from "i18n-js";
import get from "lodash/get";
import { createElement, useContext } from "react";
import { connectField, filterDOMProps } from "uniforms";
import { productById } from "utils/Lookups";

import ApplicationContext from "../../../../utils/ApplicationContext";
import SelectField, { SelectFieldProps } from "../SelectField";

export type ProductFieldProps = { inputComponent: typeof SelectField; productIds: string[] } & Omit<
    SelectFieldProps,
    "placeholder" | "transform" | "allowedValues"
>;

filterDOMProps.register("productIds");

function Product({ inputComponent, productIds, ...props }: ProductFieldProps) {
    const all_products = useContext(ApplicationContext).products;

    const products = productIds ? productIds.map(id => productById(id, all_products)) : all_products;

    const productLabelLookup =
        products.reduce<{ [index: string]: string }>(function(mapping, product) {
            mapping[product.product_id] = product.name;
            return mapping;
        }, {}) ?? {};

    return createElement<any>(inputComponent, {
        ...props,
        allowedValues: Object.keys(productLabelLookup),
        transform: (uuid: string) => get(productLabelLookup, uuid, uuid),
        placeholder: I18n.t("forms.widgets.product.placeholder")
    });
}

Product.defaultProps = {
    inputComponent: SelectField
};

export default connectField(Product, { ensureValue: false, includeInChain: false });
