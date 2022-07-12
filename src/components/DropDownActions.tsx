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

import { EuiContextMenu } from "@elastic/eui";
import React from "react";
import { FormattedMessage } from "react-intl";
import { Action } from "utils/types";

interface IProps {
    options: Action[];
    i18nPrefix: string;
    className?: string;
}

export default function DropDownActions({ options, i18nPrefix, className }: IProps) {
    const panel: any = {
        id: 0,
        title: "Actions",
        items: [],
    };
    panel.items = options.map((option, index) => {
        return {
            name: <FormattedMessage id={`${i18nPrefix}.${option.label}`} />,
            icon: option.euiIcon,
            onClick: option.action,
        };
    });
    return <EuiContextMenu initialPanelId={0} panels={[panel]} />;
}
