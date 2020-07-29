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
import React from "react";
import DatePicker from "react-datepicker";
import Select, { ValueType } from "react-select";
import { Option } from "utils/types";

import DatePickerCustom from "../components/DatePickerCustom";

export function formInput<T extends { [index: string]: any }>(
    i18nKey: string,
    name: Extract<keyof T, string>,
    value: string,
    readOnly: boolean,
    errors: Partial<Record<Extract<keyof T, string>, boolean>>,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
    onBlur: (event: React.FocusEvent<HTMLInputElement>) => void = () => true,
    additionalError?: string
) {
    return (
        <section className="form-divider">
            <label htmlFor={name}>{I18n.t(i18nKey)}</label>
            <em>{I18n.t(`${i18nKey}_info`)}</em>
            <input
                type="text"
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                disabled={readOnly}
            />
            {errors[name] && <em className="error">{I18n.t("process.format_error")}</em>}
            {additionalError && <em className="error">{additionalError}</em>}
        </section>
    );
}

export function formSelect(
    i18nKey: string,
    onChange: (value: ValueType<Option>) => void,
    values: (Option | string)[],
    readOnly: boolean,
    selected_value?: string | string[],
    clearable = false,
    multiple = false
) {
    const options: Option[] = !values.length
        ? []
        : typeof values[0] === "string"
        ? (values as string[]).map(val => ({ value: val, label: val }))
        : (values as Option[]);

    const value = !selected_value
        ? undefined
        : multiple
        ? ((selected_value as string[])
              .map(value => options.find(option => option.value === value))
              .filter(value => !!value) as ReadonlyArray<Option>)
        : options.find(option => option.value === (selected_value as string));

    return (
        <section className="form-divider">
            <label>{I18n.t(i18nKey)}</label>
            <em>{I18n.t(`${i18nKey}_info`)}</em>
            <Select
                className="select-status"
                onChange={onChange}
                options={options}
                isSearchable={false}
                value={value}
                isClearable={clearable}
                isDisabled={readOnly}
                isMulti={multiple}
            />
        </section>
    );
}

export function formDate(
    i18nKey: string,
    onChange: (value: Date | React.MouseEvent<HTMLSpanElement | HTMLButtonElement> | null) => void,
    readOnly: boolean,
    value: Date | null,
    openToDate = new Date()
) {
    return (
        <section className="form-divider">
            <label>{I18n.t(i18nKey)}</label>
            <em>{I18n.t(`${i18nKey}_info`)}</em>
            <DatePicker
                selected={value}
                isClearable={false}
                onChange={onChange}
                openToDate={openToDate}
                customInput={<DatePickerCustom disabled={readOnly} onClick={onChange} clear={() => onChange(null)} />}
                disabled={readOnly}
            />
        </section>
    );
}
