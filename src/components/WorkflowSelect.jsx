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
