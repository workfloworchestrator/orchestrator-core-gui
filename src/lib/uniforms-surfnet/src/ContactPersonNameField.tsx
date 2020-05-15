import { contacts } from "api";
import Autocomplete from "components/Autocomplete";
import I18n from "i18n-js";
import get from "lodash/get";
import React, { HTMLProps, RefObject, useEffect, useState } from "react";
import { BaseField, connectField, filterDOMProps, joinName } from "uniforms";
import { ContactPerson } from "utils/types";

import { isEmpty, stop } from "../../../utils/Utils";
import { Override, UniformContext } from "./utils";

filterDOMProps.register("organisationId", "organisationKey");

export type ContactPersonNameFieldProps = Override<
    HTMLProps<HTMLDivElement>,
    {
        disabled: boolean;
        id: string;
        inputRef: RefObject<HTMLInputElement>;
        label: string;
        description: string;
        name: string;
        onChange(value?: string): void;
        value: string;
        error?: boolean;
        showInlineError?: boolean;
        errorMessage?: string;
        organisationId?: string;
        organisationKey?: string;
    }
>;

function ContactPersonName(
    {
        disabled,
        id,
        inputRef = React.createRef(),
        label,
        description,
        name,
        onChange,
        placeholder,
        value,
        error,
        showInlineError,
        errorMessage,
        organisationId,
        organisationKey,
        ...props
    }: ContactPersonNameFieldProps,
    context: UniformContext
) {
    const { model, onChange: formOnChange } = context?.uniforms ?? { model: {}, onChange: (a, b) => {} };

    const organisationIdValue = organisationId || get(model, organisationKey || "organisation");
    const contactsPersonFieldNameArray = joinName(null, name).slice(0, -1);
    const emailFieldName = joinName(contactsPersonFieldNameArray, "email");
    const phoneFieldName = joinName(contactsPersonFieldNameArray, "phone");
    const contactsFieldName = joinName(contactsPersonFieldNameArray.slice(0, -1));

    let [displayAutocomplete, setDisplayAutocomplete] = useState({});
    let [contactPersons, setContactPersons] = useState<ContactPerson[]>([]);
    let [suggestions, setSuggestions] = useState<ContactPerson[]>([]);
    let [selectedIndex, setSelectedIndex] = useState(-1);

    useEffect(() => {
        if (organisationIdValue) {
            contacts(organisationIdValue).then(setContactPersons);
        }
    }, [organisationIdValue]);

    useEffect(() => {
        // Set focus to the last name component to be created
        inputRef.current?.focus();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    function onChangeInternal(e: React.FormEvent<HTMLInputElement>) {
        stop(e);
        const target = e.target as HTMLInputElement;
        const value = target.value;

        onChange(value);

        const persons: ContactPerson[] = get(model, contactsFieldName);

        const filteredSuggestions = !value
            ? []
            : contactPersons
                  .filter(item => item.name.toLowerCase().indexOf(value.toLowerCase()) > -1)
                  .filter(item => !persons.some(person => person.email === item.email));
        setDisplayAutocomplete(!isEmpty(filteredSuggestions));
        setSuggestions(filteredSuggestions);
    }

    function itemSelected(item: ContactPerson, personIndex: number) {
        onChange(item.name || "");
        formOnChange(emailFieldName, item.email || "");
        formOnChange(phoneFieldName, item.phone || "");
        setDisplayAutocomplete(false);
        setSelectedIndex(-1);
    }

    function onAutocompleteKeyDown(e: React.KeyboardEvent<HTMLElement>) {
        if (!suggestions) {
            return;
        }
        if (e.keyCode === 40 && selectedIndex < suggestions.length - 1) {
            //keyDown
            stop(e);
            setSelectedIndex(selectedIndex++);
        }
        if (e.keyCode === 38 && selectedIndex >= 0) {
            //keyUp
            stop(e);
            setSelectedIndex(selectedIndex--);
        }
        if (e.keyCode === 13) {
            //enter
            if (selectedIndex >= 0) {
                stop(e);
                itemSelected(suggestions[selectedIndex], 0);
            }
        }
        if (e.keyCode === 27) {
            //escape
            stop(e);
            setDisplayAutocomplete(false);
            setSelectedIndex(-1);
        }
    }

    function onBlurAutoComplete(e: React.FocusEvent<HTMLElement>) {
        stop(e);
        setTimeout(() => setDisplayAutocomplete(false), 350);
    }

    return (
        <section {...filterDOMProps(props)}>
            {label && (
                <label htmlFor={id}>
                    {label}
                    {description && <em>{description}</em>}
                </label>
            )}
            <div className="autocomplete-container">
                <input
                    disabled={disabled}
                    id={id}
                    name={name}
                    onChange={onChangeInternal}
                    placeholder={placeholder || I18n.t("forms.widgets.contactPersonName.placeholder")}
                    ref={inputRef}
                    type="text"
                    value={value}
                    onKeyDown={onAutocompleteKeyDown}
                    onBlur={onBlurAutoComplete}
                ></input>
                {displayAutocomplete && (
                    <Autocomplete
                        query={value}
                        itemSelected={itemSelected}
                        selectedItem={selectedIndex}
                        suggestions={suggestions}
                        personIndex={0}
                    />
                )}{" "}
            </div>
            {error && showInlineError && (
                <em className="error">
                    <div className="backend-validation">{errorMessage}</div>
                </em>
            )}
        </section>
    );
}

ContactPersonName.contextTypes = BaseField.contextTypes;

export default connectField(ContactPersonName);
