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

import "pages/NotFound.scss";

import I18n from "i18n-js";
import React from "react";
import { RouteComponentProps } from "react-router";

export default function ServerError(props: RouteComponentProps<{}>) {
    const params = new URLSearchParams(props.location.search.substring(1));
    const customError = params.get("error");

    return (
        <div className="mod-server-error">
            <h1>{I18n.t("server_error.title")}</h1>
            <p>{I18n.t("server_error.description")}</p>
            {customError && <p>Details: {customError}</p>}
        </div>
    );
}
