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

import { EuiDatePicker, EuiFieldText, EuiFormRow, EuiText } from "@elastic/eui";
import { intl } from "locale/i18n";
import moment, { Moment } from "moment";
import React from "react";
import Select, { ValueType } from "react-select";
import { Option } from "utils/types";

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
            <EuiFormRow
                label={intl.formatMessage({ id: i18nKey })}
                labelAppend={<EuiText size="m">{intl.formatMessage({ id: `${i18nKey}_info` })}</EuiText>}
                isInvalid={false}
                fullWidth={true}
            >
                <EuiFieldText
                    id={name}
                    placeholder={name}
                    value={value}
                    fullWidth={true}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={readOnly}
                />
            </EuiFormRow>
            {/*Todo: refactor to use EuiForm error handling*/}
            {errors[name] && <em className="error">{intl.formatMessage({ id: "process.format_error" })}</em>}
            {additionalError && <em className="error">{additionalError}</em>}
        </section>
    );
}

export function formSelect(
    i18nKey: string,
    onChange: (value: ValueType<Option, false>) => void,
    values: (Option | string)[],
    readOnly: boolean,
    selected_value?: string | string[]
) {
    const options: Option[] = !values.length
        ? []
        : typeof values[0] === "string"
        ? (values as string[]).map((val) => ({ value: val, label: val }))
        : (values as Option[]);

    const value = !selected_value ? undefined : options.find((option) => option.value === (selected_value as string));

    return (
        <section className="form-divider">
            <EuiFormRow
                fullWidth={true}
                label={intl.formatMessage({ id: i18nKey })}
                labelAppend={<EuiText size="m">{intl.formatMessage({ id: `${i18nKey}_info` })}</EuiText>}
            >
                <Select<Option, false>
                    className="select-status"
                    onChange={onChange}
                    options={options}
                    isSearchable={false}
                    value={value}
                    isDisabled={readOnly}
                />
            </EuiFormRow>
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
    const date = value ? moment(value) : null;

    const handleChange = (date: Moment) => {
        // internal change function only needed to convert moment to date (so old code is use-able)
        onChange(date.toDate());
    };

    return (
        <section className="form-divider">
            <EuiFormRow
                id={i18nKey}
                label={intl.formatMessage({ id: i18nKey })}
                labelAppend={<EuiText size="m">{intl.formatMessage({ id: `${i18nKey}_info` })}</EuiText>}
                fullWidth={true}
            >
                <EuiDatePicker
                    selected={date}
                    onClear={() => onChange(null)}
                    onChange={handleChange}
                    disabled={readOnly}
                />
            </EuiFormRow>
        </section>
    );
}
