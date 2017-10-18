import React from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";
import {validations} from "../api";

import "./Validations.css";
import ValidationsExplain from "../components/ValidationsExplain";

export default class Validations extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            validations: [],
            showExplanation: false
        };
    }

    componentDidMount() {
        validations().then(results => this.setState({validations: results}));
    }

    renderValidation = (validation, index) => {
        const iconClassname = validation.valid ? "fa-check" : "fa-exclamation-triangle";
        return <section key={index} className="validation">
            <section className="header">
                <section className="status">
                    <i className={`fa ${iconClassname}`}></i>
                </section>
                <section className="product-info">
                    <table>
                        <tr>
                            <td>{I18n.t("validations.product")}</td>
                            <td>{validation.product.name}</td>
                        </tr>
                        <tr>
                            <td>{I18n.t("validations.description")}</td>
                            <td>{validation.product.description}</td>
                        </tr>
                        <tr>
                            <td>{I18n.t("validations.workflow")}</td>
                            <td>{validation.product.workflow}</td>
                        </tr>
                    </table>
                </section>
            </section>
        </section>

    };

    render() {
        const {validations, showExplanation} = this.state;
        return (
            <div className="mod-validations">

                <ValidationsExplain
                    close={() => this.setState({showExplanation: false})}
                    isVisible={showExplanation}/>
                <section className="explain" onClick={() => this.setState({showExplanation: true})}>
                    <i className="fa fa-question-circle"></i>
                    <span>{I18n.t("validations.help")}</span>
                </section>
                <section className="validations">
                    {validations.map(this.renderValidation)}
                </section>
            </div>
        );
    }
}

Validations.propTypes = {
    products: PropTypes.array.isRequired
};

