/*
 * Copyright 2019-2022 SURF.
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

import { EuiText } from "@elastic/eui";
import EngineSettingsContext from "contextProviders/engineSettingsProvider";
import { useContext } from "react";
import { FormattedMessage } from "react-intl";

import { engineStatusBannerStyling } from "./EngineStatusBannerStyling";

export default function EngineStatusBanner() {
    const { engineStatus } = useContext(EngineSettingsContext);
    const globalStatus = engineStatus.global_status.toLocaleLowerCase();

    return (
        <EuiText css={engineStatusBannerStyling}>
            <FormattedMessage id={`settings.status.engine.${globalStatus}`} />
            <i className={`fa fa-circle engine-status-banner__status ${globalStatus}`}></i>
        </EuiText>
    );
}
