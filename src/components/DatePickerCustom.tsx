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

import "./DatePickerCustom.scss";

import React from "react";

interface IProps {
    onClick: (event: React.MouseEvent<HTMLSpanElement | HTMLButtonElement>) => void;
    value?: object | string;
    clear: (event: React.MouseEvent<HTMLSpanElement>) => void;
    disabled?: boolean;
}

export default class DatePickerCustom extends React.PureComponent<IProps> {
    render() {
        const { onClick, clear, disabled, value = "-" } = this.props;
        return (
            <div className={disabled ? "date_picker_custom disabled" : "date_picker_custom"}>
                <button onClick={onClick}>{value}</button>
                {value !== "-" && !disabled && (
                    <span className="clear" onClick={clear}>
                        <i className="fas fa-times" />
                    </span>
                )}
                <span onClick={onClick}>
                    <i className="fas fa-calendar-alt" />
                </span>
            </div>
        );
    }
}
