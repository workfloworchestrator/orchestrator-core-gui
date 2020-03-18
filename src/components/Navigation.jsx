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

import { Spinner } from "spin.js";
import mySpinner from "../lib/Spin";

import { NavLink } from "react-router-dom";

import "./Navigation.scss";

export default class Navigation extends React.PureComponent {
    constructor() {
        super();
        this.state = {
            loading: false
        };
    }

    componentWillMount() {
        mySpinner.onStart = () => this.setState({ loading: true });
        mySpinner.onStop = () => this.setState({ loading: false });
    }

    componentDidUpdate() {
        if (this.state.loading) {
            if (!this.spinner) {
                this.spinner = new Spinner({
                    lines: 25, // The number of lines to draw
                    length: 12, // The length of each line
                    width: 2, // The line thickness
                    radius: 8, // The radius of the inner circle
                    color: "#4DB3CF", // #rgb or #rrggbb or array of colors
                    top: "25%",
                    position: "fixed"
                }).spin(this.spinnerNode);
            }
        } else {
            this.spinner = null;
        }
    }

    renderItem(href, value, className = "") {
        return (
            <NavLink className={className} activeClassName="active" to={href}>
                {I18n.t("navigation." + value)}
            </NavLink>
        );
    }

    renderSpinner() {
        return this.state.loading ? <div className="spinner" ref={spinner => (this.spinnerNode = spinner)} /> : null;
    }

    render() {
        return (
            <div className="navigation-container">
                <div className="navigation">
                    {this.renderItem("/processes", "processes")}
                    {this.renderItem("/subscriptions", "subscriptions")}
                    {this.renderItem("/metadata/products", "metadata")}
                    {this.renderItem("/validations/workflows", "validations")}
                    {this.renderItem("/tasks", "tasks")}
                    {this.renderItem("/prefixes", "prefixes")}
                    {this.renderItem("/settings", "settings")}
                    {this.renderItem("/new-process", "new_process", "new_process")}
                    {this.renderSpinner()}
                </div>
            </div>
        );
    }
}
