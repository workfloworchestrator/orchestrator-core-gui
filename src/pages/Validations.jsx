import React from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";
import {allWorkflows, invalidSubscriptions, dienstafnameSubscriptionCrossCheck, validations} from "../api";

import "./Validations.css";
import ValidationsExplain from "../components/ValidationsExplain";
import CheckBox from "../components/CheckBox";
import ProductValidation from "../components/ProductValidation";
import {isEmpty, stop} from "../utils/Utils";
import SubscriptionValidation from "../components/SubscriptionValidation";
import DienstafnameValidation from "../components/DienstafnameValidation";


export default class Validations extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            validations: [],
            invalidSubscriptions: [],
            dienstafnameSubscriptionMatches: [],
            showExplanation: false,
            hideValid: false,
            hideValidSubscriptionTypes: true,
            tabs: ["workflows", "subscriptions", "dienstafnames"],
            selectedTab: "workflows",
        };
    }

    componentDidMount() {
        Promise.all([validations(), allWorkflows(), dienstafnameSubscriptionCrossCheck()])
            .then(res => {
                this.setState({validations: res[0]});
                const workflows = res[1];
                this.mapWorkflowsToInvalidSubscriptions(workflows);
                this.setState({dienstafnameSubscriptionMatches: res[2]});
            });
    }

    mapWorkflowsToInvalidSubscriptions(workflows) {
        Promise.all(workflows.map(workflow => invalidSubscriptions(workflow.key)))
            .then(results => this.setState({
                    invalidSubscriptions: results.map((res, index) =>
                        ({name: workflows[index].name, subscriptions: res})
                    )})
            )
    }

    onSubscriptionsChange = () => allWorkflows().then(workflows => this.mapWorkflowsToInvalidSubscriptions(workflows));

    switchTab = tab => e => {
        stop(e);
        this.setState({selectedTab: tab});
    };

    renderSubscriptionValidations = (invalidSubscriptions, hideValidSubscriptionTypes) => {
        const filteredSubscriptiops = invalidSubscriptions
            .filter(workflowSubscriptions =>
                !(isEmpty(workflowSubscriptions.subscriptions) && hideValidSubscriptionTypes));
        return <div className="subscriptions">
            <section className="header">
                {this.renderExplain()}
                <section className="options">
                    <CheckBox name="hideValidSubscriptionTypes" value={hideValidSubscriptionTypes}
                              info={I18n.t("validations.hide_valid_subscriptions_types")}
                              onChange={() => this.setState({hideValidSubscriptionTypes: !hideValidSubscriptionTypes})}/>
                </section>
            </section>
            <section className="validations">
                {filteredSubscriptiops.map(ws =>
                        <SubscriptionValidation history={this.props.history}
                                                organisations={this.props.organisations}
                                                products={this.props.products}
                                                subscriptions={ws.subscriptions}
                                                workflow={ws.name}
                                                onChange={this.onSubscriptionsChange}
                                                key={ws.name}/>)}
                {isEmpty(filteredSubscriptiops) &&
                    <div><em>{I18n.t("validations.no_subscriptions")}</em></div>}
            </section>
        </div>;
    };

    renderWorkflowValidations = (validations, hideValid, validationsToShow) =>
        <div className="workflows">
            <section className="header">
                {this.renderExplain()}
                <section className="options">
                    <CheckBox name="hideValid" value={hideValid}
                              info={I18n.t("validations.hide_valids")}
                              onChange={() => this.setState({hideValid: !hideValid})}/>
                </section>
            </section>
            <section className="validations">
                {validationsToShow.map((validation, index) =>
                    <ProductValidation validation={validation} key={index}/>)}
            </section>
        </div>;

    renderDienstafnameValidations = (filteredDienstafnames) => {
        return <div className="dienstafnames">
            <section className="header">
                {this.renderExplain()}
            </section>
            <section className="validations">
                <DienstafnameValidation matches={filteredDienstafnames}/>
                {isEmpty(filteredDienstafnames) &&
                    <div><em>{I18n.t("validations.no_dienstafnames")}</em></div>}
            </section>
        </div>
    };

    renderExplain() {
        return <section className="explain" onClick={() => this.setState({showExplanation: true})}>
            <i className="fa fa-question-circle"></i>
            <span>{I18n.t("validations.help")}</span>
        </section>;
    }

    isValidValidation = validation =>
        (validation.valid && (isEmpty(validation.product) || !isEmpty(validation.mapping)));

    renderTab = (tab, selectedTab) =>
        <span key={tab} className={tab === selectedTab ? "active" : ""}
              onClick={this.switchTab(tab)}>
            {I18n.t(`validations.tabs.${tab}`)}
        </span>;

    renderTabContent = (validations, hideValid, hideValidSubscriptionTypes, selectedTab, validationsToShow, invalidSubscriptions, dienstafnameSubscriptionMatches) => {
        return selectedTab === "workflows" ?
            this.renderWorkflowValidations(validations, hideValid, validationsToShow) :
            selectedTab === "subscriptions" ?
            this.renderSubscriptionValidations(invalidSubscriptions, hideValidSubscriptionTypes) :
            this.renderDienstafnameValidations(dienstafnameSubscriptionMatches)
    };

    render() {
        const {
            validations, showExplanation, hideValid, tabs, selectedTab, invalidSubscriptions,
            hideValidSubscriptionTypes, dienstafnameSubscriptionMatches
        } = this.state;
        const validationsToShow = hideValid ? [...validations]
            .filter(validation => !this.isValidValidation(validation)) : validations;
        return (
            <div className="mod-validations">
                <ValidationsExplain
                    close={() => this.setState({showExplanation: false})}
                    isVisible={showExplanation}
                    isWorkFlows={selectedTab === "workflows"}
                    isSubscriptions={selectedTab === "subscriptions"}/>
                <section className="tabs">
                    {tabs.map(tab => this.renderTab(tab, selectedTab))}
                </section>
                {this.renderTabContent(validations, hideValid, hideValidSubscriptionTypes, selectedTab, validationsToShow,
                    invalidSubscriptions, dienstafnameSubscriptionMatches)}
            </div>
        );
    }
}

Validations.propTypes = {
    history: PropTypes.object.isRequired,
    products: PropTypes.array.isRequired,
    organisations: PropTypes.array.isRequired
};

