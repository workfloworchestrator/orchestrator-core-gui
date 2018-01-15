import React from "react";
import I18n from "i18n-js";
import Select from "react-select";
import DatePickerCustom from "../components/DatePickerCustom";
import DatePicker from "react-datepicker";
import {isEmpty} from "../utils/Utils";
import * as moment from "moment";


export function formInput(i18nKey, name, value, readOnly, errors, onChange, onBlur = () => true, additionalError = null) {
    return (
        <section className="form-divider">
            <label htmlFor={name}>{I18n.t(i18nKey)}</label>
            <em>{I18n.t(`${i18nKey}_info`)}</em>
            <input type="text" id={name} name={name} value={value}
                   onChange={onChange} onBlur={onBlur}
                   disabled={readOnly}/>
            {errors[name] &&
            <em className="error">{I18n.t("process.format_error")}</em>}
            {additionalError &&
            <em className="error">{additionalError}</em>}
        </section>
    )
}

export function formSelect(i18nKey, onChange, values, readOnly, value, clearable = false) {
    const options = isEmpty(values) ? [] : (values[0].label ? values : values.map(val => ({value: val, label: val})));
    return (
        <section className="form-divider">
            <label>{I18n.t(i18nKey)}</label>
            <em>{I18n.t(`${i18nKey}_info`)}</em>
            <Select className="select-status"
                    onChange={onChange}
                    options={options}
                    searchable={false}
                    value={value}
                    clearable={clearable}
                    disabled={readOnly}/>
        </section>
    )
}

export function formDate(i18nKey, onChange, readOnly, value, openToDate = moment()) {
    return (
        <section className="form-divider">
            <label>{I18n.t(i18nKey)}</label>
            <em>{I18n.t(`${i18nKey}_info`)}</em>
            <DatePicker selected={value}
                        isClearable={false}
                        onChange={onChange}
                        openToDate={openToDate}
                        customInput={<DatePickerCustom disabled={readOnly} onClick={onChange} clear={onChange}/>}
                        disabled={readOnly}/>
        </section>
    )
}