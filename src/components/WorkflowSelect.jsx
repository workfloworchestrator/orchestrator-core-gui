import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import Select from "react-select";

import "react-select/dist/react-select.css";

export default function WorkflowSelect({onChange, workflows, workflow, disabled,
                                           placeholder=I18n.t("process.workflowsPlaceholder")}) {

    return (
        <Select className="select-workflow"
                onChange={onChange}
                options={workflows.map(wf => ({label: wf.description, value: wf.name}))}
                value={workflow}
                searchable={true}
                placeholder={placeholder}
                disabled={disabled || workflows.length === 0}/>
    );
}

WorkflowSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    workflows: PropTypes.array.isRequired,
    workflow: PropTypes.string,
    disabled: PropTypes.bool
};
