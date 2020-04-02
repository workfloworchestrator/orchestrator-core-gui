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
import Select from "react-select";
import { ValueType } from "react-select/src/types";

import ApplicationContext from "../utils/ApplicationContext";
import { Option, Organization, ServicePortSubscription } from "../utils/types";

interface IProps {
    servicePort?: string | null;
    servicePorts: ServicePortSubscription[];
    disabled: boolean;
    onChange: (value: Option) => void;
}

export default class ServicePortSelect extends React.PureComponent<IProps> {
    context!: React.ContextType<typeof ApplicationContext>;

    label = (servicePort: ServicePortSubscription, organisations?: Organization[]) => {
        const organisation = organisations && organisations.find(org => org.uuid === servicePort.customer_id);
        const organisationName = organisation ? organisation.name : servicePort.customer_id.substring(0, 8);
        const description = servicePort.description || "<No description>";
        const subscription_substring = servicePort.subscription_id.substring(0, 8);
        if (["MSP", "MSPNL", "SSP"].includes(servicePort.product.tag)) {
            const crm_port_id = servicePort.crm_port_id || "<No CRM port ID>";
            return `${crm_port_id} - ${subscription_substring} ${description.trim()} ${organisationName}`;
        } else {
            let portMode;
            if (["MSC", "MSCNL"].includes(servicePort.product.tag)) {
                portMode = "TAGGED";
            } else {
                portMode = servicePort.port_mode ? servicePort.port_mode.toUpperCase() : "<No port_mode>";
            }
            return `${subscription_substring} ${portMode} ${description.trim()} ${organisationName}`;
        }
    };

    render() {
        const { onChange, servicePort, servicePorts, disabled } = this.props;
        const { organisations } = this.context;

        const options = servicePorts
            .map(aServicePort => ({
                value: aServicePort.subscription_id,
                label: this.label(aServicePort, organisations)
            }))
            .sort((x, y) => x.label.localeCompare(y.label));
        const value = options.find(option => option.value === servicePort);

        return (
            <Select
                onChange={onChange as (value: ValueType<Option>) => void}
                options={options}
                value={value}
                isSearchable={true}
                isDisabled={disabled || servicePorts.length === 0}
            />
        );
    }
}

ServicePortSelect.contextType = ApplicationContext;
