import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

export default class UserInputWrapper extends React.Component {
    changeUserInput = (name, value) => {
        const userInput = [...this.state.stepUserInput];
        userInput.find(input => input.name === name).value = value;
    };

    changeStringInput = name => e => {
        const value = e.target.value;
        this.changeUserInput(name, value);
    };

    changeBooleanInput = name => e => {
        const value = e.target.checked;
        this.changeUserInput(name, value);
        this.validateUserInput(name)({ target: { value: value } });
    };

    changeSelectInput = name => option => {
        const value = option ? option.value : null;
        this.changeUserInput(name, value);
        this.validateUserInput(name)({ target: { value: value } });
    };

    render() {
        return <section className="user-input-container">{this.props.render()}</section>;
    }
}

UserInputWrapper.propTypes = {
    name: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired
    // children: PropTypes.objects.isRequired
};
