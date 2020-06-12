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

import "./Navigation.scss";

import React, { useEffect, useRef, useState } from "react";
import { Spinner } from "spin.js";

import mySpinner from "../lib/Spin";
import NavigationItem from "./NavigationItem";

function Navigation() {
    const [loading, setLoading] = useState(false);
    const spinnerTarget = useRef();
    const spinnerElement = useRef();

    useEffect(() => {
        mySpinner.onStart = () => setLoading(true);
        mySpinner.onStop = () => setLoading(false);
    }, []);

    useEffect(() => {
        if (loading) {
            if (!spinnerElement.current) {
                spinnerElement.current = new Spinner({
                    lines: 25, // The number of lines to draw
                    length: 12, // The length of each line
                    width: 2, // The line thickness
                    radius: 8, // The radius of the inner circle
                    color: "#4DB3CF", // #rgb or #rrggbb or array of colors
                    top: "25%",
                    position: "fixed"
                }).spin(spinnerTarget.current);
            }
        } else {
            spinnerElement.current = null;
        }
    });

    return (
        <div className="navigation-container">
            <div className="navigation">
                <NavigationItem href="/processes" value="processes" />
                <NavigationItem href="/subscriptions" value="subscriptions" />
                <NavigationItem href="/metadata" value="metadata" />
                <NavigationItem href="/validations" value="validations" />
                <NavigationItem href="/tasks" value="tasks" />
                <NavigationItem href="/prefixes" value="prefixes" />
                <NavigationItem href="/settings" value="settings" />
                <NavigationItem href="/new-process" value="new_process" className="new_process" />
                {loading && <div className="spinner" ref={spinner => (spinnerTarget.current = spinner)} />}
            </div>
        </div>
    );
}
export default Navigation;
