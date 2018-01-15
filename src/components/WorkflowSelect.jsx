import React from "react";
import PropTypes from "prop-types";
import Select from "react-select";

import "react-select/dist/react-select.css";

export default function WorkflowSelect({onChange, workflows, workflow, disabled}) {

    return (
        <Select className="select-workflow"
                onChange={onChange}
                options={workflows.map(wf => ({label: wf.name, value: wf["key"]}))}
                value={workflow}
                searchable={true}
                placeholder="Search and select a workflow..."
                disabled={disabled || workflows.length === 0}/>
    );
}

WorkflowSelect.propTypes = {
    onChange: PropTypes.func.isRequired,
    workflows: PropTypes.array.isRequired,
    workflow: PropTypes.string,
    disabled: PropTypes.bool
};
