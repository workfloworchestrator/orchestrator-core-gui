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
import I18n from "i18n-js";
import Select from "react-select";
import DatePickerCustom from "../components/DatePickerCustom";
import DatePicker from "react-datepicker";
import { isEmpty } from "../utils/Utils";

export function formInput(
    i18nKey,
    name,
    value,
    readOnly,
    errors,
    onChange,
    onBlur = () => true,
    additionalError = null
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

export function formSelect(i18nKey, onChange, values, readOnly, selected_value, clearable = false, multiple = false) {
    const options = isEmpty(values) ? [] : values[0].label ? values : values.map(val => ({ value: val, label: val }));

    const value = options.find(option => option.value === selected_value);

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

export function formDate(i18nKey, onChange, readOnly, value, openToDate = new Date()) {
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
