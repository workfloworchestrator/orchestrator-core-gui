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

import "./NotFound.scss";

import { EuiPage, EuiPageBody } from "@elastic/eui";
import I18n from "i18n-js";
import React from "react";

export default function NotFound() {
    return (
        <EuiPage>
            <EuiPageBody component="div" className="mod-not-found">
                <h1>{I18n.t("not_found.title")}</h1>
                <p>{I18n.t("not_found.description")}</p>
            </EuiPageBody>
        </EuiPage>
    );
}
