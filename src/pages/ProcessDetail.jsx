import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import {process, resumeProcess} from "../api";
import {isEmpty, stop} from "../utils/Utils";
import {setFlash} from "../utils/Flash";
import "./ProcessDetail.css";
import "highlight.js/styles/default.css";
import UserInputForm from "../components/UserInputForm";
import ProcessStateDetails from "../components/ProcessStateDetails";
import {organisationNameByUuid, productNameById, productById} from "../utils/Lookups";

export default class ProcessDetail extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            process: {steps: []},
            notFound: false,
            tabs: ["user_input", "process"],
            selectedTab: "process",
            loaded: false,
            stepUserInput: []
        };
    }

    componentWillMount = () => {
        process(this.props.match.params.id)
            .catch(err => {
                if (err.response && err.response.status === 404) {
                    this.setState({notFound: true, loaded: true});
                } else {
                    throw err;
                }
            }).then(processInstance => {
            /**
             * This is the hook to enforce the correct membership for editing the user_input. For now we
             * don't enforce anything.
             * TODO
             */
            const {configuration, currentUser, organisations, products} = this.props;

            processInstance.customerName = organisationNameByUuid(processInstance.customer, organisations);
            processInstance.productName = productNameById(processInstance.product, products);

            const userInputAllowed = (currentUser || currentUser.memberships.find(membership => membership === requiredTeamMembership));

            let stepUserInput = [];
            if (processInstance.status.toLowerCase() === "suspended" && userInputAllowed) {
                const step = processInstance.steps.find(step => step.name === processInstance.step && step.status === "pending");
                stepUserInput = step && step.form;
            }
            const requiredTeamMembership = configuration[processInstance.assignee];
            const tabs = !isEmpty(stepUserInput) ? this.state.tabs : ["process"];
            const selectedTab = !isEmpty(stepUserInput) ? "user_input" : "process";
            //Pre-fill the value of the user_input if the current_state already contains the value
            const state = processInstance.current_state || {};
            if (!isEmpty(state) && !isEmpty(stepUserInput)) {
                stepUserInput.forEach(userInput => userInput.value = state[userInput.name]);
            }
            this.setState({
                process: processInstance, loaded: true, stepUserInput: stepUserInput,
                tabs: tabs, selectedTab: selectedTab, product: productById(processInstance.product, products)
            })
        });
    };

    validSubmit = stepUserInput => {
        const {process} = this.state;
        resumeProcess(process.id, stepUserInput)
            .then(() => {
                this.props.history.push(`/processes`);
                setFlash(I18n.t("process.flash.update", {name: process.workflow_name}));
            });
    };

    switchTab = tab => e => {
        stop(e);
        this.setState({selectedTab: tab});
    };

    renderTabContent = (renderStepForm, selectedTab, process, step, stepUserInput) => {
        const {locationCodes, ieeeInterfaceTypes, products, organisations, multiServicePoints, history} = this.props;
        const product = products.find(prod => prod.identifier === process.product);
        const productName = product.name;

        if (selectedTab === "process") {
            return <section className="card">
                <ProcessStateDetails process={process}/>
            </section>;
        } else {
            return <section className="card">
                <h3>{I18n.t("process.userInput", {name: step.name, product: productName})}</h3>
                <UserInputForm locationCodes={locationCodes} ieeeInterfaceTypes={ieeeInterfaceTypes} stepUserInput={stepUserInput}
                             products={products} organisations={organisations} history={history}
                             multiServicePoints={multiServicePoints} product={product} validSubmit={this.validSubmit}/>
            </section>;
        }
    };

    renderTab = (tab, selectedTab) =>
        <span key={tab} className={tab === selectedTab ? "active" : ""}
              onClick={this.switchTab(tab)}>
            {I18n.t(`process.tabs.${tab}`)}
        </span>
    ;

    render() {
        const {loaded, notFound, process, tabs, stepUserInput, selectedTab} = this.state;
        const step = process.steps.find(step => step.status === "pending");
        const renderNotFound = loaded && notFound;
        const renderContent = loaded && !notFound;
        const renderStepForm = renderContent && !isEmpty(stepUserInput);
        return (
            <div className="mod-process-detail">
                <section className="tabs">
                    {tabs.map(tab => this.renderTab(tab, selectedTab))}
                </section>
                {renderContent && this.renderTabContent(renderStepForm, selectedTab, process, step, stepUserInput)}
                {renderNotFound && <section>{I18n.t("process.notFound")}</section>}
            </div>
        );
    }
}

ProcessDetail.propTypes = {
    history: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    configuration: PropTypes.object.isRequired,
    organisations: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired,
    multiServicePoints: PropTypes.array.isRequired,
    ieeeInterfaceTypes: PropTypes.array.isRequired,
    locationCodes: PropTypes.array.isRequired,
};

