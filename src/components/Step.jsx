import React from "react";
import PropTypes from "prop-types";
import {capitalize, renderDateTime} from "../utils/Lookups";
import "./Step.css";

export default class Step extends React.PureComponent {

    render() {
        const {step} = this.props;
        return (
            <section className={`step ${step.status}`}>
                <span className="name">{step.name}</span>
                <span className="status">{capitalize(step.status)}</span>
                {step.executed && <span className="started">{renderDateTime(step.executed)}</span>}
            </section>
        )
    }

}

Step.propTypes = {
    step: PropTypes.object.isRequired
};

