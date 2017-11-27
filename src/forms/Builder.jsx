import React from "react";
import I18n from "i18n-js";
import Select from "react-select";
import DatePickerCustom from "../components/DatePickerCustom";
import DatePicker from "react-datepicker";


export function formInput(i18nKey, name, value, readOnly, errors, onChange, onBlur = () => true ) {
    return (
        <section className="form-divider">
            <label htmlFor={name}>{I18n.t(i18nKey)}</label>
            <em>{I18n.t(`${i18nKey}_info`)}</em>
            <input type="text" id={name} name={name} value={value}
                   onChange={onChange} onBlur={onBlur}
                   disabled={readOnly}/>
            {errors[name] &&
            <em className="error">{I18n.t("process.format_error")}</em>}
        </section>    )
}

export function formSelect(i18nKey, onChange, values, readOnly, value) {
    return (
        <section className="form-divider">
            <label>{I18n.t(i18nKey)}</label>
            <em>{I18n.t(`${i18nKey}_info`)}</em>
            <Select className="select-status"
                    onChange={onChange}
                    options={values.map(val => ({value: val, label: val}))}
                    searchable={false}
                    value={value}
                    clearable={false}
                    disabled={readOnly}/>
        </section>
    )
}

export function formDate(i18nKey, onChange, readOnly, value, isClearable = false) {
    return (
        <section className="form-divider">
            <label>{I18n.t(i18nKey)}</label>
            <em>{I18n.t(`${i18nKey}_info`)}</em>
            <DatePicker selected={value}
                        isClearable={isClearable}
                        onChange={onChange}
                        customInput={<DatePickerCustom disabled={readOnly}/>}
                        disabled={readOnly}/>
        </section>
    )
}