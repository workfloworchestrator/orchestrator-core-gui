import React from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";
import "react-select/dist/react-select.css";
import Select from "react-select";
import {isEmpty, stop} from "../utils/Utils";
import "./ContactPersons.css";
import {validEmailRegExp} from "../validations/Subscriptions";
import {organisationContactsKey} from "./OrganisationSelect";

export default class ContactPersons extends React.PureComponent {

    constructor(props, context) {
        super(props, context);
        this.state = {
            errors: {},
            contactOptions: []
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.interDependentState) {
            const contacts = nextProps.interDependentState[organisationContactsKey];
            if (contacts) {
                this.setState({contactOptions: contacts.map(contact => {
                    return {value: contact.name, label: contact.name, contact: contact};
                })});
            }
        }
    };


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

    onChangeOptionInternal = (name, index) => option => {
        const persons = [...this.props.persons];
        debugger;
        persons[index][name] = option.value;
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

    renderNameField = (person, index) => {
        const {contactOptions} = this.state;
        if (isEmpty(contactOptions)) {
            return <input type="text"
                          onChange={this.onChangeInternal("name", index)}
                          value={person.name || ""}/>
        }
        return <Select.Creatable className="contact-persons-name"
            onChange={this.onChangeOptionInternal("name", index)}
            options={contactOptions}
            value={person.name || ""}
            searchable={true}
            placeholder="Search and select a contact person..."
            clearable={false}
            multi={false}
        />
    };

    renderPerson = (person, index, errors) => <section className="person" key={index}>
        <div className="wrapper">
            {index === 0 && <label>{I18n.t("contact_persons.name")}</label>}
            {this.renderNameField(person, index)}
        </div>
        <div className="wrapper">
            {index === 0 && <label>{I18n.t("contact_persons.email")}</label>}
            <input type="email"
                   onChange={this.onChangeInternal("email", index)}
                   onBlur={this.validateEmail(index)}
                   value={person.email || ""}/>
            {errors[index] && <em className="error">{I18n.t("contact_persons.invalid_email")}</em>}
        </div>
        <div className="wrapper">
            {index === 0 && <label>{I18n.t("contact_persons.tel")}</label>}
            <div className="tel">
                <input type="tel"
                       onChange={this.onChangeInternal("tel", index)}
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
    onChange: PropTypes.func.isRequired,
    interDependentState: PropTypes.object.isRequired
};


