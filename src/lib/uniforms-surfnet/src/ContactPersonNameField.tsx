/*
 * Copyright 2019-2020 SURF.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import { contacts } from "api";
import Autocomplete from "components/Autocomplete";
import I18n from "i18n-js";
import { isFunction } from "lodash";
import get from "lodash/get";
import React, { Ref, useEffect, useState } from "react";
import { connectField, filterDOMProps, joinName, useForm } from "uniforms";
import { ContactPerson } from "utils/types";

import { isEmpty, stop } from "../../../utils/Utils";
import { FieldProps } from "./types";

export type ContactPersonNameFieldProps = FieldProps<string, { organisationId?: string; organisationKey?: string }>;

function ContactPersonName({
    disabled,
    id,
    inputRef = React.createRef() as Ref<HTMLInputElement>,
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
}: ContactPersonNameFieldProps) {
    const { model, onChange: formOnChange } = useForm();

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
        if (!isFunction(inputRef)) {
            inputRef!.current?.focus();
        }
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
                    value={value ?? ""}
                    onKeyDown={onAutocompleteKeyDown}
                    onBlur={onBlurAutoComplete}
                ></input>
                {displayAutocomplete && (
                    <Autocomplete
                        query={value ?? ""}
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

export default connectField(ContactPersonName, { kind: "leaf" });
