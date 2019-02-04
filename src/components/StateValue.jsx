import React from "react";
import PropTypes from "prop-types";

import "./StateValue.scss";

export default function StateValue({value = "—", className}) {
    return <p className={`state-value ${className}`}>{value}</p>;
}

StateValue.propTypes = {
    value: PropTypes.string,
    className: PropTypes.string,
};
