import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import ConfirmationDialog from "../components/ConfirmationDialog";
import "./NewProcess.css";
import {startProcess} from "../api";
import {isEmpty, stop} from "../utils/Utils";
import {setFlash} from "../utils/Flash";
import "./ProcessDetail.css";
import OrganisationSelect from "../components/OrganisationSelect";
import "highlight.js/styles/default.css";
import ProductSelect from "../components/ProductSelect";
import EmailInput from "../components/EmailInput";

export default class NewProcess extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this.setState({confirmationDialogOpen: false}),
            cancelDialogAction: () => this.props.history.push("/processes"),
            leavePage: true,
            errors: {},
            organisation: "",
            product: "",
            emails: []

        };
    }

    cancel = e => {
        stop(e);
        this.setState({confirmationDialogOpen: true});
    };

    submit = e => {
        stop(e);
        const {organisation, product, emails} = this.state;
        if (!isEmpty(organisation) && !isEmpty(product) && !isEmpty(emails)) {
            startProcess({organisation: organisation, product: product, emails: emails.join(",")})
                .then(() => {
                    this.props.history.push(`/processes`);
                    setFlash(I18n.t("process.flash.create", {name: product}));
                });
        }
    };

    changeOrganisation = option => this.setState({organisation: option.value});

    changeProduct = option => this.setState({product: option.value});

    changeEmails = emails => this.setState({emails: emails});

    renderButtons = () => {
        const {organisation, product} = this.state;
        const invalid = isEmpty(organisation) || isEmpty(product);
        return (<section className="buttons">
            <a className="button" onClick={this.cancel}>
                {I18n.t("process.cancel")}
            </a>
            <a tabIndex={0} className={`button ${invalid ? "grey disabled" : "blue"}`} onClick={this.submit}>
                {I18n.t("process.submit")}
            </a>
        </section>);
    };

    render() {
        const {
            confirmationDialogOpen, confirmationDialogAction, cancelDialogAction,
            leavePage, organisation, product, emails
        } = this.state;
        return (
            <div className="mod-new-process">
                <section className="card">
                    <ConfirmationDialog isOpen={confirmationDialogOpen}
                                        cancel={cancelDialogAction}
                                        confirm={confirmationDialogAction}
                                        leavePage={leavePage}/>
                    <section className="form-step">
                        <h3>{I18n.t("process.new_process")}</h3>
                        <section className="form-divider">
                            <label htmlFor="customer">{I18n.t("process.organisation")}</label>
                            <em>{I18n.t("process.organisation_info")}</em>
                            <div className="validity-input-wrapper">
                                <OrganisationSelect organisations={this.props.organisations}
                                                    onChange={this.changeOrganisation}
                                                    organisation={organisation}/>
                            </div>
                        </section>
                        <section className="form-divider">
                            <label htmlFor="email">{I18n.t("process.emails")}</label>
                            <em>{I18n.t("process.emails_info")}</em>
                            <div className="validity-input-wrapper">
                                <EmailInput emails={emails} onChangeEmails={this.changeEmails}
                                            placeholder={""} multipleEmails={true} emailRequired={true}/>
                            </div>
                        </section>
                        <section className="form-divider">
                            <label htmlFor="product">{I18n.t("process.product")}</label>
                            <em>{I18n.t("process.product_info")}</em>
                            <div className="validity-input-wrapper">
                                <ProductSelect products={this.props.products}
                                               onChange={this.changeProduct}
                                               product={product}/>
                            </div>
                        </section>
                        {this.renderButtons()}
                    </section>
                </section>
            </div>
        );
    }
}

NewProcess.propTypes = {
    history: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    organisations: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired
};

