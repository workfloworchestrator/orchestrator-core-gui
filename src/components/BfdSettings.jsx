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
import I18n from "i18n-js";

import NumericInput from "react-numeric-input";
import CheckBox from "./CheckBox";
import { capitalizeFirstLetter } from "../utils/Utils";

export default class BfdSettings extends React.PureComponent {
    changeMultiplier = (valueAsNumber, valueAsString, inputElement) => {
        const { name, value, onChange } = this.props;
        const newValue = { ...value, multiplier: valueAsNumber };
        onChange(name, newValue);
    };

    changeMinimumInterval = (valueAsNumber, valueAsString, inputElement) => {
        const { name, value, onChange } = this.props;
        const newValue = { ...value, minimum_interval: valueAsNumber };
        onChange(name, newValue);
    };

    changeEnabled = e => {
        const { name, onChange } = this.props;
        const isEnabled = e.target.checked;
        const newValue = isEnabled ? { multiplier: 3, minimum_interval: 900, enabled: true } : { enabled: false };
        onChange(name, newValue);
    };

    render() {
        const { name, value, readOnly, errors } = this.props;
        const rootFieldErrors = errors.filter(error => error.loc.length === 1);
        return (
            <div>
                <section key={name} className={`form-divider ${name}`}>
                    <CheckBox
                        name={name}
                        value={(value && value.enabled) || false}
                        onChange={this.changeEnabled}
                        info={I18n.t("bfd_settings.enable")}
                        disabled={readOnly}
                    />
                    {value && value.enabled && (
                        <React.Fragment>
                            <label>{I18n.t("bfd_settings.minimum_interval")}</label>
                            <NumericInput
                                min={1}
                                max={255000}
                                value={value.minimum_interval}
                                onChange={this.changeMinimumInterval}
                                readOnly={readOnly}
                            />

                            {errors
                                .filter(error => error.loc.length === 2 && error.loc[1] === "minimum_interval")
                                .map((error, index) => (
                                    <em className="error" key={index}>
                                        {capitalizeFirstLetter(error.msg)}
                                    </em>
                                ))}

                            <label>{I18n.t("bfd_settings.multiplier")}</label>
                            <NumericInput
                                min={1}
                                max={255}
                                value={value.multiplier}
                                onChange={this.changeMultiplier}
                                readOnly={readOnly}
                            />

                            {errors
                                .filter(error => error.loc.length === 2 && error.loc[1] === "multiplier")
                                .map((error, index) => (
                                    <em className="error" key={index}>
                                        {capitalizeFirstLetter(error.msg)}
                                    </em>
                                ))}
                        </React.Fragment>
                    )}
                </section>

                {rootFieldErrors && (
                    <em className="error root-error">
                        {rootFieldErrors.map((e, index) => (
                            <div key={index}>{capitalizeFirstLetter(e.msg)}.</div>
                        ))}
                    </em>
                )}
            </div>
        );
    }
}

BfdSettings.defaultProps = {
    errors: []
};

BfdSettings.propTypes = {
    name: PropTypes.string,
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    readOnly: PropTypes.bool,
    errors: PropTypes.array
};
