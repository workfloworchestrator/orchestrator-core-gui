import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import {process, resumeProcess, subscriptions_by_tag} from "../api";
import {isEmpty, stop} from "../utils/Utils";
import {setFlash} from "../utils/Flash";
import UserInputForm from "../components/UserInputForm";
import ProcessStateDetails from "../components/ProcessStateDetails";
import {organisationNameByUuid, productById, productNameById} from "../utils/Lookups";
import {abortProcess, deleteProcess, retryProcess, subscriptionIdFromProcessId} from "../api/index";

import "./ProcessDetail.css";
import ConfirmationDialog from "../components/ConfirmationDialog";
import {actionOptions} from "../validations/Processes";

export default class ProcessDetail extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            process: {steps: []},
            notFound: false,
            tabs: ["user_input", "process"],
            selectedTab: "process",
            subscriptionProcessLink: {},
            loaded: false,
            stepUserInput: [],
            multiServicePoints: [],
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this,
            confirm: () => this,
            confirmationDialogQuestion: "",
        };
    }

    componentWillMount = () => {
        process(this.props.match.params.id)
            .then(processInstance => {
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
                });
                Promise.all([subscriptionIdFromProcessId(processInstance.id), subscriptions_by_tag("MSP")])
                .then(res => {
                    this.setState({subscriptionProcessLink: res[0], multiServicePoints: res[1]});
                });
            }).catch(err => {
            if (err.response && err.response.status === 404) {
                this.setState({notFound: true, loaded: true});
            } else {
                throw err;
            }
        });
    };

    handleDeleteProcess = process => e => {
        stop(e);
        this.confirmation(I18n.t("processes.deleteConfirmation", {
                name: process.productName,
                customer: process.customerName
            }), () =>
                deleteProcess(process.id).then(() => {
                    this.props.history.push(`/processes`);
                    setFlash(I18n.t("processes.flash.delete", {name: process.productName}));
                })
        );
    };

    handleAbortProcess = process => e => {
        stop(e);
        this.confirmation(I18n.t("processes.abortConfirmation", {
                name: process.productName,
                customer: process.customerName
            }), () =>
                abortProcess(process.id).then(() => {
                    this.props.history.push(`/processes`);
                    setFlash(I18n.t("processes.flash.abort", {name: process.productName}));
                })
        );
    };

    handleRetryProcess = process => e => {
        stop(e);
        this.confirmation(I18n.t("processes.retryConfirmation", {
                name: process.productName,
                customer: process.customerName
            }), () =>
                retryProcess(process.id).then(() => {
                    this.props.history.push(`/processes`);
                    setFlash(I18n.t("processes.flash.retry", {name: process.productName}));
                })
        );
    };

    cancelConfirmation = () => this.setState({confirmationDialogOpen: false});

    confirmation = (question, action) => this.setState({
        confirmationDialogOpen: true,
        confirmationDialogQuestion: question,
        confirmationDialogAction: () => {
            this.cancelConfirmation();
            action();
        }
    });


    renderActions = process => {
        const options = actionOptions(process, () => false, this.handleRetryProcess(process),
            this.handleDeleteProcess(process), this.handleAbortProcess(process))
            .filter(option => option.label !== "user_input" && option.label !== "details");
        return <section className="process-actions">
            {options.map((option, index) => <a key={index} className={`button ${option.danger ? " red" : " blue"}`}
                                               onClick={option.action}>
                {I18n.t(`processes.${option.label}`)}
            </a>)}
        </section>
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

    renderTabContent = (renderStepForm, selectedTab, process, step, stepUserInput, subscriptionProcessLink, multiServicePoints) => {
        const {locationCodes, ieeeInterfaceTypes, products, organisations, history} = this.props;
        const product = products.find(prod => prod.identifier === process.product);
        const productName = product.name;

        if (selectedTab === "process") {
            return <section className="card">
                {this.renderActions(process)}
                <ProcessStateDetails process={process} subscriptionProcessLink={subscriptionProcessLink}/>
            </section>;
        } else {
            return <section className="card">
                <section className="header-info">
                    <h3>{I18n.t("process.workflow", {name: process.workflow_name})}</h3>
                    <h3>{I18n.t("process.userInput", {name: step.name, product: productName})}</h3>
                </section>
                <UserInputForm locationCodes={locationCodes}
                               ieeeInterfaceTypes={ieeeInterfaceTypes}
                               stepUserInput={stepUserInput}
                               products={products}
                               organisations={organisations}
                               history={history}
                               multiServicePoints={multiServicePoints}
                               product={product}
                               currentState={process.current_state}
                               validSubmit={this.validSubmit}
                               process={process}/>
            </section>;
        }
    };

    renderTab = (tab, selectedTab) =>
        <span key={tab} className={tab === selectedTab ? "active" : ""}
              onClick={this.switchTab(tab)}>
            {I18n.t(`process.tabs.${tab}`)}
        </span>;

    render() {
        const {
            loaded, notFound, process, tabs, stepUserInput, selectedTab, subscriptionProcessLink,
            confirmationDialogOpen, confirmationDialogAction, confirmationDialogQuestion, multiServicePoints
        } = this.state;
        const step = process.steps.find(step => step.status === "pending");
        const renderNotFound = loaded && notFound;
        const renderContent = loaded && !notFound;
        const renderStepForm = renderContent && !isEmpty(stepUserInput);
        return (
            <div className="mod-process-detail">
                <ConfirmationDialog isOpen={confirmationDialogOpen}
                                    cancel={this.cancelConfirmation}
                                    confirm={confirmationDialogAction}
                                    question={confirmationDialogQuestion}/>
                <section className="tabs">
                    {tabs.map(tab => this.renderTab(tab, selectedTab))}
                </section>
                {renderContent && this.renderTabContent(renderStepForm, selectedTab, process, step, stepUserInput,
                    subscriptionProcessLink, multiServicePoints)}
                {renderNotFound && <section className="not-found card"><h1>{I18n.t("process.notFound")}</h1></section>}
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
    ieeeInterfaceTypes: PropTypes.array.isRequired,
    locationCodes: PropTypes.array.isRequired,
};

