import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import "./DropDownActions.scss";

export default class DropDownActions extends React.PureComponent {
    render() {
        const { options, i18nPrefix, className } = this.props;
        return (
            <section className={className || "drop-down-actions"}>
                {options.map((option, index) => (
                    <span key={index} onClick={option.action} className={option.danger ? "danger" : ""}>
                        <i className={option.icon} />
                        {I18n.t(`${i18nPrefix}.${option.label}`)}
                    </span>
                ))}
            </section>
        );
    }
}

DropDownActions.propTypes = {
    options: PropTypes.array.isRequired,
    i18nPrefix: PropTypes.string.isRequired,
    className: PropTypes.string
};
