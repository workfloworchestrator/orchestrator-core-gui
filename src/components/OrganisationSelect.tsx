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
import Select, { ValueType, ActionMeta } from "react-select";
import { Organization, Option } from "../utils/types";
import ApplicationContext from "../utils/ApplicationContext";

interface IOrganisationSelectProps {
    id: string;
    onChange: (selected: Option | null, action: ActionMeta) => void;
    organisation: string;
    disabled?: boolean;
    placeholder?: string;
    abbreviate?: boolean;
}

export default class OrganisationSelect extends React.PureComponent<IOrganisationSelectProps> {
    static propTypes: {};
    render() {
        const { id, onChange, organisation, disabled, abbreviate, placeholder } = this.props;
        const { organisations }: { organisations: Organization[] } = this.context;

        const options: Option[] = organisations
            ? organisations.map((org: Organization) => ({
                  value: org.uuid,
                  label: abbreviate ? org.abbr : org.name
              }))
            : [];
        const value = options.find((option: Option) => option.value === organisation);

        if (organisations) {
            return (
                <Select
                    id={id}
                    onChange={(selected: ValueType<Option>, action: ActionMeta) => {
                        if (selected === null) {
                            onChange(null, action);
                        } else if (Array.isArray(selected)) {
                            // This code should only be reached when this multi-select is used, we are not.
                            return;
                        } else {
                            onChange(selected as Option, action);
                        }
                    }}
                    options={options}
                    value={value}
                    isSearchable={true}
                    isClearable={true}
                    placeholder={placeholder || "Search and select a customer..."}
                    isDisabled={disabled || organisations.length === 0}
                />
            );
        } else {
            return (
                <div>
                    <p>CRM unavailable</p>
                </div>
            );
        }
    }
}

OrganisationSelect.propTypes = {
    id: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    organisation: PropTypes.string,
    disabled: PropTypes.bool,
    placeholder: PropTypes.string,
    abbreviate: PropTypes.bool
};

OrganisationSelect.contextType = ApplicationContext;
