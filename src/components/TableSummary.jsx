import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import "react-select/dist/react-select.css";

import "./TableSummary.scss";

export default class TableSummary extends React.PureComponent {

    constructor(props) {
        super(props);
    };

    render() {
        const rows = this.props.data.map(row =>
            <tr>
                <td className="label">{row.label}</td>
                <td className="value">{row.value}</td>
            </tr>
        );

        return (
            <section className="table-summary">
                <table>
                    {rows}
                </table>

           </section>
          )
    };
}

TableSummary.propTypes = {
    data: PropTypes.array.isRequired
};
