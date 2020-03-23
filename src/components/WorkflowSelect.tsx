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

import I18n from "i18n-js";
import React from "react";
import Select, { ValueType } from "react-select";

import { Option } from "../utils/types";

interface Workflow {
    name: string;
}

interface IProps {
    onChange: (option: Option) => void;
    workflows: Workflow[];
    workflow?: string;
    disabled?: boolean;
}

export default class WorkflowSelect extends React.PureComponent<IProps> {
    render() {
        const { onChange, workflows, workflow, disabled } = this.props;

        const options = workflows.map(wf => ({
            label: I18n.t(`workflow.${wf.name}`),
            value: wf.name
        }));

        const value = options.find(option => option.value === workflow);

        return (
            <Select
                className="select-workflow"
                onChange={onChange as (value: ValueType<Option>) => void}
                options={options}
                value={value}
                isSearchable={true}
                placeholder={
                    workflows ? I18n.t("process.workflowsEmptyPlaceholder") : I18n.t("process.workflowsPlaceholder")
                }
                isDisabled={disabled || workflows.length === 0}
            />
        );
    }
}
