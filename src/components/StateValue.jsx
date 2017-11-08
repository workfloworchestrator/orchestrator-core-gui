import React from "react";
import PropTypes from "prop-types";

import "./StateValue.css";

export default function StateValue({value = "—"}) {
    return <p className="state-value">{value}</p>;
}

StateValue.propTypes = {
    value: PropTypes.string,
};
