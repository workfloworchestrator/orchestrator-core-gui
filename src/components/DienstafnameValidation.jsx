import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

// import "./DienstafnameValidation.css";

export default class DienstafnameValidation extends React.Component {

    constructor(props) {
        super(props);
        const {matches} = this.props;
        this.state = {
            //FIXME why copy this from the props?
            dienstafnames: matches.dienstafnames_not_in_subscriptions,
            subscriptions: matches.subscriptions_not_in_dienstafnames,
            sorted: {name: "dienstafname", descending: true},
        };
    }

    renderDienstafnameTable(dienstafnames, sorted) {
        const columns = ["dienstafname", "subscription", "statuscode", "dienstcode", "organisatiecode", "organisatienaam"];
        const th = index => {
            const name = columns[index];
            return <th key={index} className={name}>
                <span>{I18n.t(`dienstafname.${name}`)}</span>
            </th>
        };

        if (dienstafnames.length !== 0) {
            return (
                <table className="subscriptions">
                    <thead>
                    <tr>{columns.map((column, index) => th(index))}</tr>
                    </thead>
                    <tbody>
                    {dienstafnames.map((dienstafname, index) =>
                        <tr key={`${dienstafname.dienstafname}_${index}`}>
                            <td data-label={I18n.t("dienstafname.dienstafname")}
                                className="actions"
                                ><span>{dienstafname.dienst}</span></td>
                            <td data-label={I18n.t("dienstafname.subscription")}
                                className="actions"
                                ><span>{dienstafname.subscription}</span></td>
                            <td data-label={I18n.t("dienstafname.statuscode")}
                                className="actions"
                                ><span>{dienstafname.statuscode}</span></td>
                            <td data-label={I18n.t("dienstafname.dienstcode")}
                                className="actions"
                                ><span>{dienstafname.dienstcode}</span></td>
                            <td data-label={I18n.t("dienstafname.organisatiecode")}
                                className="actions"
                                ><span>{dienstafname.organisatiecode}</span></td>
                            <td data-label={I18n.t("dienstafname.organisatienaam")}
                                className="actions"
                                ><span>{dienstafname.organisatienaam}</span></td>
                        </tr>
                    )}
                    </tbody>
                </table>
            );
        }
        return <div><em>{I18n.t("validations.no_dienstafnames")}</em></div>;
    }
 
    renderSubscriptionTable(subscriptions, sorted) {
        const columns = ["subscription",];
        const th = index => {
            const name = columns[index];
            return <th key={index} className={name}>
                <span>{I18n.t(`dienstafname.${name}`)}</span>
            </th>
        };

        if (subscriptions.length !== 0) {
            return (
                <table className="subscriptions">
                    <thead>
                    <tr>{columns.map((column, index) => th(index))}</tr>
                    </thead>
                    <tbody>
                    {subscriptions.map((subscription, index) =>
                        <tr key={`${subscription}_${index}`}>
                            <td data-label={I18n.t("dienstafname.subscription")}
                                className="actions"
                                ><span>{subscription}</span></td>
                        </tr>
                    )}
                    </tbody>
                </table>
            );
        }
        return <div><em>{I18n.t("validations.no_dienstafnames")}</em></div>;
    }
 

    render() {
        const {
            dienstafnames, subscriptions, sorted
        } = this.state;
        return (
            <section>
                <h3>{I18n.t("validations.dienstafname_matches")}</h3>
                <section className="dienstafnames">
                    {this.renderDienstafnameTable(dienstafnames, sorted)}
                </section>
                <h3>{I18n.t("validations.subscription_matches")}</h3>
                <section className="subscriptions">
                    {this.renderSubscriptionTable(subscriptions, sorted)}
                </section>
            </section>
        );
    }
}

DienstafnameValidation.propTypes = {
    matches: PropTypes.object.isRequired,
};

