import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import "./FixedInputProductValidation.scss";

export default class FixedInputProductValidation extends React.Component {
    render() {
        const { history, validation } = this.props;
        return (
            <section className="fixed-input-validation">
                <h3 onClick={() => history.push("/product/" + validation.id)} className="description">
                    {I18n.t("validations.fixedInput.title", { name: validation.name })}
                </h3>
                <table>
                    <thead>
                        <tr>
                            <th className={"name"}>{I18n.t("validations.fixedInput.fixed_input_name")}</th>
                            <th className={"error"}>{I18n.t("validations.fixedInput.fixed_input_error")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {validation.errors.map((error, index) => (
                            <tr key={index}>
                                <td>{error.name}</td>
                                <td>
                                    {I18n.t(`validations.fixedInput.error.${error.error}`, {
                                        value: error.value
                                    })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        );
    }
}

FixedInputProductValidation.propTypes = {
    history: PropTypes.object.isRequired,
    validation: PropTypes.object.isRequired
};
