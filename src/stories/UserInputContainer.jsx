import React from "react";
import PropTypes from "prop-types";
import { action } from "@storybook/addon-actions";
import UserInputForm from "../components/UserInputForm";

export default class UserInputContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            product: {
                value: "efbe1235-93df-49ee-bbba-e51434e0be17",
                productId: "efbe1235-93df-49ee-bbba-e51434e0be17"
            }
        };
    }

    renderForm(product, stepUserInput, formName) {
        return (
            <section className="form-step divider">
                <h1>{formName}</h1>
                <UserInputForm
                    stepUserInput={stepUserInput}
                    product={product}
                    validSubmit={action("submit")}
                    currentState={this.props.currentState}
                />
            </section>
        );
    }

    render() {
        const { product } = this.state;
        const { stepUserInput, formName } = this.props;
        return (
            <div className="mod-new-process">
                <section className="card">{this.renderForm(product, stepUserInput, formName)}</section>
            </div>
        );
    }
}

UserInputContainer.propTypes = {
    stepUserInput: PropTypes.array.isRequired,
    formName: PropTypes.string.isRequired,
    currentState: PropTypes.object
};

UserInputContainer.defaultProps = {
    currentState: {}
};
