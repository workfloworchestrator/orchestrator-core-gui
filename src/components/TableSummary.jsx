import React from "react";
import PropTypes from "prop-types";
import "react-select/dist/react-select.css";

import "./TableSummary.scss";

export default class TableSummary extends React.PureComponent {

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
