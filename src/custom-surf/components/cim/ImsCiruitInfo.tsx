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

import {
    EuiBasicTable,
    EuiButton,
    EuiButtonIcon,
    EuiFlexGroup,
    EuiFlexItem,
    EuiSpacer,
    EuiTable,
    EuiText,
    EuiTitle,
} from "@elastic/eui";
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";
import Select from "react-select";
import ApplicationContext from "utils/ApplicationContext";
import { Option, SortOption, SubscriptionModel } from "utils/types";
import { stop } from "utils/Utils";

import { ImsInfo } from "./ServiceTicketDetailImpactedObjects";

type Column = "customer" | "impact" | "type" | "subscription" | "ims_info" | "impact_override";

interface IProps extends WrappedComponentProps {
    imsInfo: ImsInfo[];
}

const ImsCircuitInfo = ({ imsInfo }: IProps) => {
    const { theme } = useContext(ApplicationContext);
    const columns = [
        {
            field: "ims_circuit_id",
            name: "IMS Id",
            sortable: true,
            truncateText: false,
            width: "10%",
            valign: "top",
        },
        {
            field: "ims_circuit_name",
            name: "Name",
            sortable: true,
            truncateText: false,
            valign: "top",
            // enlarge: true,
        },
        {
            field: "extra_information",
            name: "Extra info",
            sortable: true,
            truncateText: false,
            valign: "top",
            // enlarge: true,
        },
    ];
    return (
        <EuiBasicTable
            compressed={true}
            tableLayout={"fixed"}
            tableCaption="Demo for EuiBasicTable with pagination"
            items={imsInfo}
            // @ts-ignore
            columns={columns}
        />
    );
};

export default injectIntl(ImsCircuitInfo);
