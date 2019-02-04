import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import "./DienstafnameValidation.scss";

export default class DienstafnameValidation extends React.Component {

    renderDienstafnameTable(dienstafnames) {
        const columns = ["dienst", "dienstafname", "subscription", "statuscode", "dienstcode", "organisatiecode", "organisatienaam"];
        const th = column =>
            <th key={column} className={column}>
                <span>{I18n.t(`dienstafname.${column}`)}</span>
            </th>;
        const td = (dienstafname, attr) =>
            <td key={attr} data-label={I18n.t(`dienstafname.${attr}`)} className={attr}>
                <span>{dienstafname[attr]}</span>
            </td>;
        if (dienstafnames.length !== 0) {
            return (
                <table className="dienstafnames">
                    <thead>
                    <tr>{columns.map(column => th(column))}</tr>
                    </thead>
                    <tbody>
                    {dienstafnames.map((dienstafname, index) =>
                        <tr key={index}>
                            {columns.map(column => td(dienstafname, column))}
                        </tr>
                    )}
                    </tbody>
                </table>
            );
        }
        return <div><em>{I18n.t("validations.no_dienstafnames")}</em></div>;
    }

    renderSubscriptionTable(subscriptions) {
        if (subscriptions.length !== 0) {
            return (
                <table className="subscriptions">
                    <thead>
                    <tr>
                        <th className="subscription"><span>{I18n.t("dienstafname.subscription")}</span></th>
                        <th className="subscription"><span>{I18n.t("dienstafname.description")}</span></th>
                        <th className="subscription"><span>{I18n.t("dienstafname.statuscode")}</span></th>
                        <th className="subscription"><span>{I18n.t("metadata.products.name")}</span></th>
                    </tr>
                    </thead>
                    <tbody>
                    {subscriptions.map(subscription =>
                        <tr key={subscription}>
                            <td data-label={I18n.t("dienstafname.subscription")}
                                className="subscription">
                                <a href={`/subscription/${subscription[0]}`}
                                   target="_blank" rel="noopener noreferrer">{subscription[0]}</a>
                            </td>
                            <td data-label={I18n.t("dienstafname.description")}
                                className="subscription">
                                <span>{subscription[1]}</span>
                            </td>
                            <td data-label={I18n.t("dienstafname.statuscode")}
                                className="subscription">
                                <span>{subscription[2]}</span>
                            </td>
                            <td data-label={I18n.t("metadata.products.name")}
                                className="subscription">
                                <span>{subscription[3]}</span>
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            );
        }
        return <div><em>{I18n.t("validations.no_dienstafnames")}</em></div>;
    }
 

    render() {
        const {matches} = this.props;
        const dienstafnames = matches.dienstafnames_not_in_subscriptions;
        const subscriptions = matches.subscriptions_not_in_dienstafnames;
        return (
            <section className="dienst-afname-validation">
                <h3>{I18n.t("validations.subscription_matches")}</h3>
                <section className="subscriptions">
                    {this.renderSubscriptionTable(subscriptions)}
                </section>
                <h3>{I18n.t("validations.dienstafname_matches")}</h3>
                <section className="dienstafnames">
                    {this.renderDienstafnameTable(dienstafnames)}
                </section>
            </section>
        );
    }
}

DienstafnameValidation.propTypes = {
    history: PropTypes.object.isRequired,
    matches: PropTypes.object.isRequired,
};

