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

import { EuiTab } from "@elastic/eui";
import I18n from "i18n-js";
import React from "react";
import { useLocation } from "react-router";
import { Link } from "react-router-dom";

function NavigationItem({ href, value, className = "" }) {
    const location = useLocation();
    return (
        <EuiTab isSelected={location.pathname.startsWith(`/${value}`)} className="navigation-tab">
            <Link to={href}>{I18n.t("navigation." + value)}</Link>
        </EuiTab>
    );
}
export default NavigationItem;
