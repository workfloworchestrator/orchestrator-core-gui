import React from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";
import {
    allWorkflowCodeImplementations,
    allWorkflows,
    allWorkflowsWithProductTags,
    fixedInputValidations,
    invalidSubscriptions,
    products,
    validations
} from "../api";

import "./Validations.scss";
import ValidationsExplain from "../components/ValidationsExplain";
import CheckBox from "../components/CheckBox";
import ProductValidation from "../components/ProductValidation";
import {isEmpty, stop} from "../utils/Utils";
import SubscriptionValidation from "../components/SubscriptionValidation";
import FixedInputProductValidation from "../components/FixedInputProductValidation";
import ProductWorkflowsValidation from "../components/ProductWorkflowsValidation";


export default class Validations extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            validations: [],
            invalidSubscriptions: [],
            fixedInputs: [],
            workflowCodeImplementations: [],
            workflows: [],
            products: [],
            showExplanation: false,
            hideValid: false,
            hideValidSubscriptionTypes: true,
            tabs: ["workflows", "fixedInputs", "subscriptions", "productWorkflows"],
            selectedTab: "workflows",
        };
    }

    componentDidMount() {
        const type = this.props.match.params.type;
        this.setState({selectedTab: type});
        Promise.all([validations(), allWorkflows(), fixedInputValidations(), allWorkflowCodeImplementations(),
            products(), allWorkflowsWithProductTags()])
            .then(res => {
                this.setState({
                    validations: res[0],
                    fixedInputs: res[2],
                    workflowCodeImplementations: res[3],
                    products: res[4],
                    workflows: res[5]
                });
                const workflows = res[1];
                this.mapWorkflowsToInvalidSubscriptions(workflows);
            });
    }

    mapWorkflowsToInvalidSubscriptions(workflows) {
        Promise.all(workflows.map(workflow => invalidSubscriptions(workflow.name)))
            .then(results => this.setState({
                    invalidSubscriptions: results.map((res, index) =>
                        ({name: workflows[index].name, subscriptions: res})
                    )
                })
            )
    }

    onSubscriptionsChange = () => allWorkflows().then(workflows => this.mapWorkflowsToInvalidSubscriptions(workflows));

    switchTab = tab => e => {
        stop(e);
        this.setState({selectedTab: tab});
        this.props.history.push(`/validations/${tab}`);
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

    renderFixedInputValidations = (fixedInputValidations) => <div className="fixedInputs">
        <section className="header">
            {this.renderExplain()}
        </section>
        <section className="validations">
            {fixedInputValidations.map((validation, index) =>
                <FixedInputProductValidation key={index} history={this.props.history}
                                             validation={validation}/>)}
            {isEmpty(fixedInputValidations) &&
            <div className={"no-errors"}><em>{I18n.t("validations.no_fixed_inputs")}</em></div>}
        </section>
    </div>;

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


    renderProductWorkflowsValidations = (products, workflowCodeImplementations, workflows) => <div
        className="productWorkflows">
        <section className="header">
            {this.renderExplain()}
        </section>
        <section className="validations">
            <ProductWorkflowsValidation history={this.props.history}
                                        products={products}
                                        workflowCodeImplementations={workflowCodeImplementations}
                                        workflows={workflows}/>
        </section>
    </div>;


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

    renderTabContent = (validations, hideValid, hideValidSubscriptionTypes, selectedTab, validationsToShow,
                        invalidSubscriptions, fixedInputs, products, workflowCodeImplementations,
                        workflows) => {
        return selectedTab === "workflows" ?
            this.renderWorkflowValidations(validations, hideValid, validationsToShow) :
            selectedTab === "subscriptions" ?
                this.renderSubscriptionValidations(invalidSubscriptions, hideValidSubscriptionTypes) :
                selectedTab === "fixedInputs" ?
                    this.renderFixedInputValidations(fixedInputs) :
                    this.renderProductWorkflowsValidations(products, workflowCodeImplementations, workflows)
    };

    render() {
        const {
            validations, showExplanation, hideValid, tabs, selectedTab, invalidSubscriptions,
            hideValidSubscriptionTypes, fixedInputs,
            products, workflowCodeImplementations, workflows
        } = this.state;
        const validationsToShow = hideValid ? [...validations]
            .filter(validation => !this.isValidValidation(validation)) : validations;
        return (
            <div className="mod-validations">
                <ValidationsExplain
                    close={() => this.setState({showExplanation: false})}
                    isVisible={showExplanation}
                    isWorkFlows={selectedTab === "workflows"}
                    isFixedInputs={selectedTab === "fixedInputs"}
                    isSubscriptions={selectedTab === "subscriptions"}/>
                <section className="tabs">
                    {tabs.map(tab => this.renderTab(tab, selectedTab))}
                </section>
                {this.renderTabContent(validations, hideValid, hideValidSubscriptionTypes, selectedTab, validationsToShow,
                    invalidSubscriptions, fixedInputs, products, workflowCodeImplementations,
                    workflows)}
            </div>
        );
    }
}

Validations.propTypes = {
    history: PropTypes.object.isRequired,
    products: PropTypes.array.isRequired,
    organisations: PropTypes.array.isRequired
};

