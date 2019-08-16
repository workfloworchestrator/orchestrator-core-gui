import React from "react";
import PropTypes from "prop-types";
import { action } from "@storybook/addon-actions";
import UserInputForm from "../components/UserInputForm";

export default class UserInputContainer extends React.Component {
    render() {
        const { stepUserInput, formName } = this.props;
        return (
            <div className="mod-new-process">
                <section className="card">
                    <section className="form-step divider">
                        <h1>{formName}</h1>
                        <UserInputForm stepUserInput={stepUserInput} validSubmit={action("submit")} />
                    </section>
                </section>
            </div>
        );
    }
}

UserInputContainer.propTypes = {
    stepUserInput: PropTypes.array.isRequired,
    formName: PropTypes.string.isRequired
};

UserInputContainer.defaultProps = {};
