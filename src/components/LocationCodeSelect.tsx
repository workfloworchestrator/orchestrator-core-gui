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
import Select, { ValueType } from "react-select";

import { Option } from "../utils/types";

interface IProps {
    id: string;
    onChange: (option: Option) => void;
    locationCode: string;
    locationCodes: string[];
    disabled?: boolean;
}

export default function LocationCodeSelect({ id, onChange, locationCode, locationCodes, disabled = false }: IProps) {
    if (locationCode && !locationCodes.includes(locationCode)) {
        const toUpperCase = locationCode.toUpperCase();
        locationCode = locationCodes.find(lc => lc.toUpperCase() === toUpperCase)!;
    }

    const options = locationCodes.map(aLocationCode => {
        return { value: aLocationCode, label: aLocationCode };
    });

    const value = options.find(option => option.value === locationCode);

    return (
        <Select
            id={id}
            className="select-locationcode"
            onChange={onChange as (value: ValueType<Option>) => void}
            options={options}
            value={value}
            isSearchable={true}
            isDisabled={disabled || locationCodes.length === 0}
        />
    );
}
