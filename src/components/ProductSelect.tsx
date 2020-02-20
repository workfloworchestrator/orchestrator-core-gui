/*
 * Copyright 2019 SURF.
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
import Select, { ValueType } from "react-select";

import { TARGET_CREATE } from "../validations/Products";
import { Product, Option, FixedInput, Workflow } from "../utils/types";

import "./ProductSelect.scss";

export interface ProductOption extends Option {
    workflow?: Workflow;
    tag: string;
    productId: string;
    fixed_inputs: FixedInput[];
}

interface IProps {
    id: string;
    onChange: (option: ProductOption) => void;
    products: Product[];
    product?: string;
    disabled: boolean;
}

export default function ProductSelect({ id, onChange, products, product, disabled }: IProps) {
    const options: ProductOption[] = products.map((aProduct: Product) => ({
        value: aProduct.product_id,
        label: aProduct.name,
        workflow: aProduct.workflows.find(wf => wf.target === TARGET_CREATE),
        tag: aProduct.tag,
        productId: aProduct.product_id,
        fixed_inputs: aProduct.fixed_inputs
    }));

    const value = options.find(option => option.value === product);

    return (
        <Select
            id={id}
            className={`select-product ${options.length > 15 ? "large" : ""}`}
            onChange={onChange as (value: ValueType<ProductOption>) => void}
            options={options}
            value={value}
            isSearchable={true}
            placeholder="Search and select a product..."
            isDisabled={disabled || products.length === 0}
        />
    );
}
