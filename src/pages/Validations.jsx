import React from "react";
import PropTypes from "prop-types";
import {validations} from "../api";

import "./Validations.css";

export default class Validations extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            validations: []
        };
    }

    componentDidMount = () => validations()
        .then(results => this.setState({validations: results}));

    render() {
        const {validations }= this.state;
        return (
            <div className="mod-validations">
                <section className="card validations">
                    {JSON.stringify(validations)}
                </section>
            </div>
        );
    }
}

Validations.propTypes = {
    products: PropTypes.array.isRequired
};

