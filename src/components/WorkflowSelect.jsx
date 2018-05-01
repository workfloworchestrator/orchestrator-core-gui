import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import Select from "react-select";

import "react-select/dist/react-select.css";

export default class WorkflowSelect extends React.PureComponent {

    render() {
        const {onChange, workflows, workflow, disabled} = this.props;
        return <Select className="select-workflow"
                       onChange={onChange}
                       options={workflows.map(wf => ({label: wf.description, value: wf.name}))}
                       value={workflow}
                       searchable={true}
                       placeholder={I18n.t("process.workflowsPlaceholder")}
                       disabled={disabled || workflows.length === 0}/>

    }
}
WorkflowSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    workflows: PropTypes.array.isRequired,
    workflow: PropTypes.string,
    disabled: PropTypes.bool
};
