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
import { isEmpty } from "../utils/Utils";
import "./DatePickerCustom.scss";

export default class DatePickerCustom extends React.PureComponent {
    render() {
        const value = this.props.value || "-";
        const { onClick, clear, disabled } = this.props;
        return (
            <div className={disabled ? "date_picker_custom disabled" : "date_picker_custom"}>
                <button onClick={onClick}>{value}</button>
                {!isEmpty(this.props.value) && !disabled && (
                    <span className="clear" onClick={clear}>
                        <i className="fa fa-remove" />
                    </span>
                )}
                <span onClick={this.props.onClick}>
                    <i className="fa fa-calendar" />
                </span>
            </div>
        );
    }
}

DatePickerCustom.propTypes = {
    onClick: PropTypes.func,
    value: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    clear: PropTypes.func,
    disabled: PropTypes.bool
};
