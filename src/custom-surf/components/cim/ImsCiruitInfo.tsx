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

import { EuiCard, EuiFlexGrid, EuiFlexItem, EuiIcon, EuiLink, EuiPanel, EuiSpacer } from "@elastic/eui";
import { tableImsCircuitInfo } from "custom/components/cim/ImsCircuitInfoStyling";
import { ImsInfo, ServiceTicketContact, ServiceTicketRelatedCustomer } from "custom/types";
import { ENV } from "env";
import React, { useContext } from "react";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";
import ApplicationContext from "utils/ApplicationContext";

type Column = "ims_circuit_id" | "ims_circuit_name" | "extra_info" | "impact";

interface IProps extends WrappedComponentProps {
    imsInfo: ImsInfo[];
    ownerCustomerContacts: ServiceTicketContact[];
    relatedCustomers: ServiceTicketRelatedCustomer[];
}
const columns: Column[] = ["ims_circuit_id", "ims_circuit_name", "extra_info", "impact"];

const ImsCircuitInfo = ({ imsInfo, ownerCustomerContacts, relatedCustomers }: IProps) => {
    const { theme } = useContext(ApplicationContext);

    const th = (name: Column, index: number) => {
        return (
            <th key={index} className={name}>
                <span>
                    <FormattedMessage id={`tickets.impactedobject.${name}`} />
                </span>
            </th>
        );
    };

    const createRow = (item: ImsInfo) => {
        return (
            <tr key={`${item.ims_circuit_id}`} className={`${theme}${item.impact ? " override" : ""}`}>
                <td className="ims_circuit_id">
                    <EuiLink href={ENV.IMS_URL.concat("circuit", "/", item.ims_circuit_id.toString())} target="_blank">
                        {item.ims_circuit_id}
                    </EuiLink>
                </td>
                <td className="ims_circuit_name">{item.ims_circuit_name}</td>
                <td className="extra_information">{item.extra_information}</td>
                <td className="impact">{item.impact}</td>
            </tr>
        );
    };

    const renderContacts = () => {
        return ownerCustomerContacts.map((c, index) => (
            <EuiFlexItem>
                <EuiCard titleSize={"xs"} title={`Contact person ${index + 1}`} description={c.name}>
                    <EuiIcon type={"email"} style={{ marginTop: "-3px" }}></EuiIcon>&nbsp;
                    <a href={c.email}>{c.email}</a>
                </EuiCard>
            </EuiFlexItem>
        ));
    };

    return (
        <EuiPanel css={tableImsCircuitInfo} hasBorder={false} hasShadow={false} color={"transparent"} paddingSize="s">
            <table className="ims-circuit-info">
                <thead>
                    <tr>{columns.map((column, index) => th(column, index))}</tr>
                </thead>
                <tbody>{imsInfo.map(createRow)}</tbody>
            </table>

            <EuiSpacer></EuiSpacer>
            <EuiFlexGrid columns={3}>{renderContacts()}</EuiFlexGrid>
        </EuiPanel>
    );
};

export default injectIntl(ImsCircuitInfo);
