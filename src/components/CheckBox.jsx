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

import "./CheckBox.scss";

import PropTypes from "prop-types";
import React from "react";

export default class CheckBox extends React.PureComponent {
    componentDidMount() {
        if (this.props.autofocus && this.input !== null) {
            this.input.focus();
        }
    }

    render() {
        const { name, value, readOnly = false, onChange = e => this, info, className = "checkbox" } = this.props;
        return (
            <div className={className}>
                <input type="checkbox" id={name} name={name} checked={value} onChange={onChange} disabled={readOnly} />
                <label htmlFor={name}>
                    <span ref={ref => (this.input = ref)} tabIndex="0">
                        <i className="fa fa-check" />
                    </span>
                </label>
                {info && (
                    <label htmlFor={name} className="info">
                        {info}
                    </label>
                )}
            </div>
        );
    }
}

CheckBox.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.bool,
    onChange: PropTypes.func,
    readOnly: PropTypes.bool,
    info: PropTypes.string,
    className: PropTypes.string,
    autofocus: PropTypes.bool,
    level: PropTypes.string
};
