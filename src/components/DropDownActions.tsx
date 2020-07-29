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

import "./DropDownActions.scss";

import I18n from "i18n-js";
import React from "react";
import { Action } from "utils/types";

interface IProps {
    options: Action[];
    i18nPrefix: string;
    className?: string;
}

export default function DropDownActions({ options, i18nPrefix, className }: IProps) {
    return (
        <section className={className || "drop-down-actions"}>
            {options.map((option, index) => (
                <span key={index} onClick={option.action} className={option.danger ? "danger" : ""}>
                    <i className={option.icon} />
                    {I18n.t(`${i18nPrefix}.${option.label}`)}
                </span>
            ))}
        </section>
    );
}
