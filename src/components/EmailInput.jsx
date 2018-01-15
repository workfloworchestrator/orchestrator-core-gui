import React from "react";
import PropTypes from "prop-types";
import "react-select/dist/react-select.css";

import {isEmpty, stop} from "../utils/Utils";
import {validEmailRegExp} from "../validations/Subscriptions";
import "./EmailInput.css";


export default class EmailInput extends React.PureComponent {

    constructor(props, context) {
        super(props, context);
        this.state = {
            initial: true,
            email: ""
        };
    }

    onFocus = () => {
        const {email} = this.state;
        if (isEmpty(email)) {
            this.setState({initial: true});
        }
    };

    persistEmailIfValid = email => {
        const delimiters = [",", " ", ";"];
        if (!isEmpty(email) && delimiters.some(delimiter => email.indexOf(delimiter) > -1)) {
            const emails = email.replace(/[;\s]/g, ",").split(",").filter(part => part.trim().length > 0 && validEmailRegExp.test(part));
            const uniqueEmails = [...new Set(emails)];
            this.multipleEmailsEntered(uniqueEmails);
        } else if (!isEmpty(email) && validEmailRegExp.test(email.trim())) {
            this.emailSelected(email);
        } else {
            this.setState({initial: isEmpty(email)});
        }
    };

    validateEmail = e => {
        this.setState({initial: false});
        this.persistEmailIfValid(e.target.value);
    };

    onChange = e => {
        const email = e.target.value;
        this.setState({initial: isEmpty(email), email: email});
    };


    multipleEmailsEntered = multipleEmails => {
        const {emails, onChangeEmails} = this.props;
        this.setState({email: "", initial: false});
        const newMails = [...emails].concat(multipleEmails);
        onChangeEmails(newMails);
    };

    onKeyDown = e => {
        if (e.keyCode === 13) {//enter
            this.validateEmail(e);
        }
    };


    emailSelected = email => {
        const {emails, onChangeEmails, multipleEmails} = this.props;
        const newEmail = emails.indexOf(email) < 0;
        this.setState({
            email: multipleEmails ? "" : email, initial: !newEmail
        });
        if (newEmail) {
            onChangeEmails([...emails, email]);
        }
    };

    removeMail = mail => e => {
        stop(e);
        const emails = [...this.props.emails];
        emails.splice(emails.indexOf(mail), 1);
        this.props.onChangeEmails(emails);
    };

    render() {
        const {emails, multipleEmails, placeholder, disabled} = this.props;
        const {email} = this.state;

        return (
            <section className="email-input">
                {!disabled &&
                    <input placeholder={placeholder}
                           type="email"
                           onChange={this.onChange}
                           onFocus={this.onFocus}
                           onBlur={this.validateEmail}
                           value={email}
                           onKeyDown={this.onKeyDown}
                    />
                }

                {multipleEmails && <section className="email_tags">
                    {emails.map(mail =>
                        <div key={mail} className="email_tag">
                            <span>{mail}</span>
                            {disabled ?
                                <span className="disabled"><i className="fa fa-envelope"></i></span> :
                                <span onClick={this.removeMail(mail)}><i className="fa fa-remove"></i></span>}
                        </div>)}
                </section>}
            </section>
        );
    }

}

EmailInput.propTypes = {
    emails: PropTypes.array.isRequired,
    placeholder: PropTypes.string.isRequired,
    onChangeEmails: PropTypes.func.isRequired,
    multipleEmails: PropTypes.bool
};


