/*
 * Copyright 2019-2023 SURF.
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

import { EuiPage, EuiPageBody } from "@elastic/eui";
import React from "react";
import { FormattedMessage } from "react-intl";

import { errorPageStyling } from "./ErrorPageStyling";

export default function NotFound() {
    return (
        <EuiPage css={errorPageStyling}>
            <EuiPageBody component="div" className="mod-not-found">
                <h1>
                    <FormattedMessage id="not_found.title" />
                </h1>
                <p>
                    <FormattedMessage id="not_found.description" />
                </p>
            </EuiPageBody>
        </EuiPage>
    );
}
