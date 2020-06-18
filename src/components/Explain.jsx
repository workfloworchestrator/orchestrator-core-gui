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
import "./Explain.scss";

import PropTypes from "prop-types";
import React from "react";

export default class Explain extends React.PureComponent {
    componentWillReceiveProps(nextProps) {
        if (this.props.isVisible === false && nextProps.isVisible === true) {
            setTimeout(() => this.main.focus(), 50);
        }
    }

    render() {
        const { close, isVisible, render, title } = this.props;
        const className = isVisible ? "" : "hide";

        return (
            <div className={`explain-container ${className}`} onBlur={close} ref={ref => (this.main = ref)}>
                <section className="container">
                    <section className="title">
                        <p>{title}</p>
                        <button type="submit" id="close-explain-container" className="close" onClick={close}>
                            <i className="fas fa-times" />
                        </button>
                    </section>
                    <section className="details">{render()}</section>
                </section>
            </div>
        );
    }
}

Explain.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    close: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired
};
