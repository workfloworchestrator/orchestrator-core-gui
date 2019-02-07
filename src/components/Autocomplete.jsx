import React from "react";
import PropTypes from "prop-types";
import scrollIntoView from "scroll-into-view";

import "./Autocomplete.scss";
import {isEmpty} from "../utils/Utils";

export default class Autocomplete extends React.PureComponent {

    componentDidUpdate(prevProps) {
        if (this.selectedRow && prevProps.selectedItem !== this.props.selectedItem && !isEmpty(this.props.suggestions)) {
            scrollIntoView(this.selectedRow);
        }
    }

    itemName = (item, query) => {
        const name = item.name;
        const nameToLower = name.toLowerCase();
        const indexOf = nameToLower.indexOf(query.toLowerCase());
        const first = name.substring(0, indexOf);
        const middle = name.substring(indexOf, indexOf + query.length);
        const last = name.substring(indexOf + query.length);
        return <span>{first}<span className="matched">{middle}</span>{last}</span>;
    };

    render() {
        const {suggestions, query, selectedItem, personIndex, itemSelected, className} = this.props;
        if (isEmpty(suggestions)) {
            return null;
        }
        return (
            <section className={`autocomplete ${className || ""}`}>
                <table className="result">
                    <tbody>
                    {suggestions
                        .map((item, index) => (
                                <tr key={index}
                                    className={selectedItem === index ? "active" : ""}
                                    onClick={() => itemSelected(item, personIndex)}
                                    ref={ref => {
                                        if (selectedItem === index) {
                                            this.selectedRow = ref;
                                        } else if (suggestions.length - 1 === index) {
                                            this.lastRow = ref;
                                        }
                                    }}>
                                    <td>{this.itemName(item, query)}</td>
                                    <td>{item.email || ""}</td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </section>
        );
    }

}

Autocomplete.propTypes = {
    suggestions: PropTypes.array.isRequired,
    query: PropTypes.string.isRequired,
    selectedItem: PropTypes.number,
    personIndex: PropTypes.number.isRequired,
    itemSelected: PropTypes.func.isRequired,
    className: PropTypes.string,
};


