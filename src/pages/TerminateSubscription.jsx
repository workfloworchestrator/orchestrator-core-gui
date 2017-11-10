import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import {isEmpty, stop} from "../utils/Utils";
import ContactPersons from "../components/ContactPersons";
import {terminateSubscription} from "../api/index";
import {setFlash} from "../utils/Flash";
import {validEmailRegExp} from "../validations/Subscriptions";
import ReadOnlySubscriptionView from "../components/ReadOnlySubscriptionView";

import "./TerminateSubscription.css";

export default class TerminateSubscription extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            contactPersons: [{email: "", name: "", phone: ""}],
            processing: false,
            interDependentState: {}
        };
    }

    cancel = e => {
        stop(e);
        this.props.history.push("/subscription/" + this.state.subscriptionId);
    };

    renderButtons = () => {
        const {processing, contactPersons} = this.state;
        const invalid = processing || contactPersons.some(x => isEmpty(x.email) || !validEmailRegExp.test(x.email));
        return (<section className="buttons">
            <a className="button" onClick={this.cancel}>
                {I18n.t("terminate_subscription.cancel")}
            </a>
            <a tabIndex={0} className={`button ${invalid ? "grey disabled" : "blue"}`} onClick={this.submit}>
                {I18n.t("terminate_subscription.submit")}
            </a>
        </section>);
    };

    storeInterDependentState = (name, value) => {
        const interDependentState = {...this.state.interDependentState};
        interDependentState[name] = value;
        this.setState({interDependentState: interDependentState});
    };

    submit = () => {
        this.setState({processing: true});
        terminateSubscription({
            subscription_id: this.props.subscriptionId,
            contact_persons: this.state.contactPersons
        }).then(res => {
            this.props.history.push(`/processes`);
            setFlash(I18n.t("process.flash.create", {name: res.pid}));
        });
    };

    changeUserInput = value => {
        this.setState({contactPersons: [...value]});
    };

    render() {
        //TODO use the form_input from workflow to render UserForm
        const {contactPersons} = this.state;
        const {subscriptionId, products, organisations} = this.props;
        return (
            <div className="mod-terminate-subscription">
                <section className="card">
                    <h1>{I18n.t("subscription.terminate")}</h1>
                    <section className="form-step">
                        <ReadOnlySubscriptionView subscriptionId={subscriptionId}
                                                  products={products} organisations={organisations}
                                                  storeInterDependentState={this.storeInterDependentState}/>
                    </section>
                    <section className="form-step">
                        <section className="form-divider">
                            {<label htmlFor="name">{I18n.t("process.contact_persons")}</label>}
                            {<em>{I18n.t("process.contact_persons")}</em>}
                            <ContactPersons persons={contactPersons} onChange={this.changeUserInput}
                                            interDependentState={this.state.interDependentState}/>
                        </section>
                    </section>
                    {this.renderButtons()}
                </section>
            </div>
        );
    }
}

TerminateSubscription.propTypes = {
    history: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    organisations: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired,
    subscriptionId: PropTypes.string
};
