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
import PropTypes from "prop-types";
import Select from "react-select";

import "./ProductSelect.scss";
import { TARGET_CREATE } from "../validations/Products";

export default function ProductSelect({ id, onChange, product, products, disabled }) {
    const options = products.map(aProduct => ({
        value: aProduct.product_id,
        label: aProduct.name,
        workflow: aProduct.workflows.find(wf => wf.target === TARGET_CREATE),
        tag: aProduct.tag,
        productId: aProduct.product_id,
        fixed_inputs: aProduct.fixed_inputs
    }));
    return (
        <Select
            id={id}
            className={`select-product ${options.length > 15 ? "large" : ""}`}
            onChange={onChange}
            options={options}
            value={options.find(option => option.value === product)}
            isSearchable={true}
            placeholder="Search and select a product..."
            isDisabled={disabled || products.length === 0}
        />
    );
}

ProductSelect.propTypes = {
    id: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    products: PropTypes.array.isRequired,
    product: PropTypes.string,
    disabled: PropTypes.bool
};
