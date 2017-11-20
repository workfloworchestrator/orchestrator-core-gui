import React from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";
import {isEmpty, stop} from "../utils/Utils";
import {validEmailRegExp} from "../validations/Subscriptions";
import {organisationContactsKey, organisationNameKey} from "./OrganisationSelect";
import Autocomplete from "./Autocomplete";
import scrollIntoView from "scroll-into-view";

import "react-select/dist/react-select.css";
import "./ContactPersons.css";

export default class ContactPersons extends React.PureComponent {

    constructor(props, context) {
        super(props, context);
        this.state = {
            errors: {},
            displayAutocomplete: {},
            filteredSuggestions: [],
            selectedItem: -1
        };
    }

    componentWillReceiveProps(nextProps) {
        const newOrg = nextProps.interDependentState[organisationNameKey];
        const currentOrg = this.props.interDependentState[organisationNameKey];
        if (!isEmpty(newOrg) && !(isEmpty(currentOrg)) && newOrg !== currentOrg) {
            this.props.onChange([{email: "", name: "", phone: ""}]);
        }
    };

    componentDidUpdate(prevProps) {
        if (prevProps.persons.length + 1 === this.props.persons.length) {
            this.lastPersonInput.focus();
        }
    }

    validateEmail = index => e => {
        const valid = validEmailRegExp.test(e.target.value);
        const errors = {...this.state.errors};
        errors[index] = !valid;
        this.setState({errors: errors});
    };

    onChangeInternal = (name, index) => e => {
        const persons = [...this.props.persons];
        const value = e.target.value;
        persons[index][name] = value;
        this.props.onChange(persons);

        if (name !== "name") {
            this.setState({displayAutocomplete: {}, selectedItem: -1});
        } else {
            const suggestions = this.props.interDependentState[organisationContactsKey] || [];
            const filteredSuggestions = isEmpty(value) ? [] : suggestions
                .filter(item => item.name.toLowerCase().indexOf(value.toLowerCase()) > -1)
                .filter(item => !persons.some(person => person.email === item.email));
            const newDisplayAutoCompleteState = {};
            newDisplayAutoCompleteState[index] = !isEmpty(filteredSuggestions);
            this.setState({
                displayAutocomplete: newDisplayAutoCompleteState,
                filteredSuggestions: filteredSuggestions,
                selectedItem: -1
            });
        }
    };

    addPerson = () => {
        const persons = [...this.props.persons];
        persons.push({email: "", name: "", phone: ""});
        this.props.onChange(persons);
    };

    removePerson = index => e => {
        stop(e);
        if (index > 0) {
            const persons = [...this.props.persons];
            persons.splice(index, 1);
            this.props.onChange(persons);
        }
    };

    itemSelected = (item, personIndex) => {
        const persons = [...this.props.persons];
        persons[personIndex].name = item.name || "";
        persons[personIndex].email = item.email || "";
        persons[personIndex].phone = item.phone || "";
        this.props.onChange(persons);
        this.setState({displayAutocomplete: {}, selectedItem: -1});
        if (this.personInput) {
            setTimeout(scrollIntoView(this.personInput), 150);
        }
    };

    onAutocompleteKeyDown = personIndex => e => {
        const {selectedItem, filteredSuggestions} = this.state;
        if (isEmpty(filteredSuggestions)) {
            return;
        }
        if (e.keyCode === 40 && selectedItem < (filteredSuggestions.length - 1)) {//keyDown
            stop(e);
            this.setState({selectedItem: (selectedItem + 1)});
        }
        if (e.keyCode === 38 && selectedItem >= 0) {//keyUp
            stop(e);
            this.setState({selectedItem: (selectedItem - 1)});
        }
        if (e.keyCode === 13) {//enter
            if (selectedItem >= 0) {
                stop(e);
                this.itemSelected(filteredSuggestions[selectedItem], personIndex);
            }
        }
        if (e.keyCode === 27) {//escape
            stop(e);
            this.setState({selectedPerson: -1, displayAutocomplete: {}});
        }

    };

    onBlurAutoComplete = e => {
        stop(e);
        setTimeout(() => this.setState({displayAutocomplete: {}}), 350);
    };


    renderPerson = (total, person, index, errors, displayAutocomplete, filteredSuggestions, selectedItem) => {
        const displayAutocompleteInstance = displayAutocomplete[index];
        return <section className="person" key={index}>
            <div className="wrapper autocomplete-container" tabIndex="1"
                 onBlur={this.onBlurAutoComplete}>
                {index === 0 && <label>{I18n.t("contact_persons.name")}</label>}
                <input ref={ref => {
                    if (displayAutocompleteInstance) {
                        this.personInput = ref;
                    } else if (total - 1 === index) {
                        this.lastPersonInput = ref;
                    }}
                }
                       type="text"
                       onChange={this.onChangeInternal("name", index)}
                       value={person.name || ""}
                       onKeyDown={this.onAutocompleteKeyDown(index)}
                       placeholder={I18n.t("contact_persons.namePlaceholder")}
                />
                {displayAutocompleteInstance && <Autocomplete query={person.name}
                                                              className={index === 0 ? "" : "child"}
                                                              itemSelected={this.itemSelected}
                                                              selectedItem={selectedItem}
                                                              suggestions={filteredSuggestions}
                                                              personIndex={index}/>}
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
                {index === 0 && <label>{I18n.t("contact_persons.phone")}</label>}
                <div className="tel">
                    <input type="tel"
                           onChange={this.onChangeInternal("phone", index)}
                           value={person.phone || ""}/>
                    <i className={`fa fa-minus ${index === 0 ? "disabled" : "" }`}
                       onClick={this.removePerson(index)}></i>
                </div>
            </div>
        </section>
    };

    render() {
        const {persons} = this.props;
        const {errors, displayAutocomplete, selectedItem, filteredSuggestions} = this.state;
        return (
            <section className="contact-persons">
                {persons.map((person, index) =>
                    this.renderPerson(persons.length, person, index, errors, displayAutocomplete, filteredSuggestions, selectedItem))}
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


