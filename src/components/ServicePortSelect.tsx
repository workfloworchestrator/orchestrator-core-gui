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
import PropTypes from "prop-types";
import Select from "react-select";
import { ValueType } from "react-select/src/types";
import { isEmpty } from "../utils/Utils";
import { ServicePortSubscription, Organization } from "../utils/types";

interface OptionType {
    value: string;
    label: string;
}

interface IProps {
    servicePort: string | null;
    servicePorts: ServicePortSubscription[];
    organisations: Organization[];
    disabled: boolean;
    onChange: (value: OptionType) => void;
}

export default class ServicePortSelect extends React.PureComponent<IProps> {
    static propTypes: {};

    label = (servicePort: ServicePortSubscription, organisations: Organization[]) => {
        const organisation = organisations.find(org => org.uuid === servicePort.customer_id);
        const organisationName = organisation ? organisation.name : "";
        const description = servicePort.description || "<No description>";
        const subscription_substring = servicePort.subscription_id.substring(0, 8);
        if (["SP", "SPNL"].includes(servicePort.product.tag)) {
            const portMode = isEmpty(servicePort.port_mode) ? "<No port_mode>" : servicePort.port_mode.toUpperCase();
            return `${subscription_substring} ${portMode} ${description.trim()} ${organisationName}`;
        } else {
            const crm_port_id = servicePort.crm_port_id || "<No CRM port ID>";
            return `${crm_port_id} - ${subscription_substring} ${description.trim()} ${organisationName}`;
        }
    };

    render() {
        const { onChange, servicePort, servicePorts, organisations, disabled } = this.props;

        const options = servicePorts
            .map(aServicePort => ({
                value: aServicePort.subscription_id,
                label: this.label(aServicePort, organisations)
            }))
            .sort((x, y) => x.label.localeCompare(y.label));
        const value = options.find(option => option.value === servicePort);

        return (
            <Select
                onChange={onChange as (value: ValueType<OptionType>) => void}
                options={options}
                value={value}
                isSearchable={true}
                isDisabled={disabled || servicePorts.length === 0}
            />
        );
    }
}

ServicePortSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    servicePorts: PropTypes.array.isRequired,
    servicePort: PropTypes.string,
    organisations: PropTypes.array.isRequired,
    disabled: PropTypes.bool
};
