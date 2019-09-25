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
import I18n from "i18n-js";
import PropTypes from "prop-types";
import Select from "react-select";

export default class WorkflowSelect extends React.PureComponent {
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
                onChange={onChange}
                options={options}
                value={value}
                isSearchable={true}
                placeholder={I18n.t("process.workflowsPlaceholder")}
                isDisabled={disabled || workflows.length === 0}
            />
        );
    }
}
WorkflowSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    workflows: PropTypes.array.isRequired,
    workflow: PropTypes.string,
    disabled: PropTypes.bool
};
