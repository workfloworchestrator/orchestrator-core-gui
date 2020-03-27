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

import "./ProductSelect.scss";

import React from "react";
import Select, { ValueType } from "react-select";

import { Option, Product } from "../utils/types";

interface IProps {
    id: string;
    onChange: (option: Option) => void;
    products: Product[];
    product?: string;
    disabled?: boolean;
    placeholder?: string;
}

export default function ProductSelect({ id, onChange, product, products, disabled, placeholder }: IProps) {
    const options = products.map(aProduct => ({
        value: aProduct.product_id,
        label: aProduct.name
    }));

    const value = options.find(option => option.value === product);

    return (
        <Select
            id={id}
            className={`select-product ${options.length > 15 ? "large" : ""}`}
            onChange={onChange as (value: ValueType<Option>) => void}
            options={options}
            value={value}
            isSearchable={true}
            placeholder={placeholder || "Search and select a product..."}
            isDisabled={disabled || products.length === 0}
        />
    );
}
