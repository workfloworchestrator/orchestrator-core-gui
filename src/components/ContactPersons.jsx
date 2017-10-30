import React from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";

import {stop} from "../utils/Utils";
import "./ContactPersons.css";

const validEmailRegExp = /^\S+@\S+$/;

export default class ContactPersons extends React.PureComponent {

    constructor(props, context) {
        super(props, context);
        this.state = {
            errors: {}
        };
    }

    validateEmail = index => e => {
        const valid = validEmailRegExp.test(e.target.value);
        const errors = {...this.state.errors};
        errors[index] = !valid;
        this.setState({errors: errors});
    };

    onChangeInternal = (name, index) => e => {
        const persons = [...this.props.persons];
        persons[index][name] = e.target.value;
        this.props.onChange(persons);
    };

    addPerson = () => {
        const persons = [...this.props.persons];
        persons.push({email: "", name: "", tel: ""});
        this.props.onChange(persons);
    };

    removePerson = index => e => {
        stop(e);
        const persons = [...this.props.persons];
        persons.splice(index, 1);
        this.props.onChange(persons);
    };

    renderPerson = (person, index, errors) => <section className="person" key={index}>
        <div className="wrapper">
            {index === 0 && <label>{I18n.t("contact_persons.email")}</label>}
            <input type="email"
                   onChange={this.onChangeInternal("email", index)}
                   onBlur={this.validateEmail(index)}
                   value={person.email || ""}/>
            {errors[index] && <em className="error">{I18n.t("contact_persons.invalid_email")}</em>}
        </div>
        <div className="wrapper">
            {index === 0 && <label>{I18n.t("contact_persons.name")}</label>}
            <input type="text"
                   onChange={this.onChangeInternal("name", index)}
                   onBlur={this.propagateState}
                   value={person.name || ""}/>
        </div>
        <div className="wrapper">
            {index === 0 && <label>{I18n.t("contact_persons.tel")}</label>}
            <div className="tel">
                <input type="tel"
                       onChange={this.onChangeInternal("tel", index)}
                       onBlur={this.propagateState}
                       value={person.tel || ""}/>
                <i className={`fa fa-minus ${index === 0 ? "disabled" : "" }`} onClick={this.removePerson(index)}></i>
            </div>
        </div>
    </section>;

    render() {
        const {persons} = this.props;
        const {errors} = this.state;
        return (
            <section className="contact-persons">
                {persons.map((person, index) => this.renderPerson(person, index, errors))}
                <div className="add-person"><i className="fa fa-plus" onClick={this.addPerson}></i></div>
            </section>
        );
    }

}

ContactPersons.propTypes = {
    persons: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired
};


