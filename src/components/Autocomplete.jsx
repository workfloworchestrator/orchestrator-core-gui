import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import scrollIntoView from "scroll-into-view";

import {isEmpty} from "../utils/Utils";

export default class Autocomplete extends React.PureComponent {

    componentDidUpdate(prevProps) {
        if (this.selectedRow && prevProps.selectedItem !== this.props.selectedItem) {
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
        return  <span>{first}<span className="matched">{middle}</span>{last}</span>;
    };

    itemDescription = (item) => isEmpty(item.description) ? "" : item.description;

    render() {
        const {suggestions, query, selectedItem, itemSelected} = this.props;
        const showSuggestions = (suggestions && suggestions.length > 0);
        return (
            <section className="autocomplete">
                {showSuggestions && <table className="result">
                    <thead>
                    <tr>
                        <th className="name">{I18n.t("teams_autocomplete.name")}</th>
                        <th className="description">{I18n.t("teams.description")}</th>
                        <th className="role"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {suggestions
                        .filter(item => item.name.toLowerCase().indexOf(query.toLowerCase()) > -1)
                        .map((item, index) => (
                                <tr key={index}
                                    className={selectedTeam === index ? "active" : ""}
                                    onClick={() => itemSelected(item)}
                                    ref={ref => {
                                        if (selectedTeam === index) {
                                            this.selectedRow = ref;
                                        }
                                    }}>
                                    <td>{this.itemName(item, query)}</td>
                                    <td>{this.itemDescription(item, index)}</td>
                                    <td className="role">{item.role ? <span>{item.role}</span> :
                                        <span className="join">{I18n.t("teams.join")}</span>}</td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>}
            </section>
        );
    }

}

Autocomplete.propTypes = {
    suggestions: PropTypes.array.isRequired,
    query: PropTypes.string.isRequired,
    selectedItem: PropTypes.number.isRequired,
    itemSelected: PropTypes.func.isRequired
};


