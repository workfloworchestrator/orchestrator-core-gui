import React from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";
import {validations} from "../api";

import "./Validations.css";
import ValidationsExplain from "../components/ValidationsExplain";
import CheckBox from "../components/CheckBox";
import ProductValidation from "../components/ProductValidation";

export default class Validations extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            validations: [],
            showExplanation: false,
            hideValid: false
        };
    }

    componentDidMount() {
        validations().then(results => this.setState({validations: results}));
    }

    render() {
        const {validations, showExplanation, hideValid} = this.state;
        const validationsToShow = hideValid ? [...validations].filter(validation => !validation.valid) : validations;
        return (
            <div className="mod-validations">
                <ValidationsExplain
                    close={() => this.setState({showExplanation: false})}
                    isVisible={showExplanation}/>
                <section className="header">
                    <section className="explain" onClick={() => this.setState({showExplanation: true})}>
                        <i className="fa fa-question-circle"></i>
                        <span>{I18n.t("validations.help")}</span>
                    </section>
                    <section className="options">
                        <CheckBox name="hideValid" value={hideValid}
                                  info={I18n.t("validations.hide_valids")}
                                  onChange={() => this.setState({hideValid: !hideValid})}/>
                    </section>
                </section>
                <section className="validations">
                    {validationsToShow.map((validation, index) =>
                        <ProductValidation validation={validation} key={index}/>)}
                </section>
            </div>
        );
    }
}

Validations.propTypes = {
    products: PropTypes.array.isRequired
};

