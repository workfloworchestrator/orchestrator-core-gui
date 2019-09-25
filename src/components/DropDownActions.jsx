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
import PropTypes from "prop-types";
import "./DropDownActions.scss";

export default class DropDownActions extends React.PureComponent {
    render() {
        const { options, i18nPrefix, className } = this.props;
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
}

DropDownActions.propTypes = {
    options: PropTypes.array.isRequired,
    i18nPrefix: PropTypes.string.isRequired,
    className: PropTypes.string
};
