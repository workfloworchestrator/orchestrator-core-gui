import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import {
    initialWorkflowInput,
    parentSubscriptions,
    startModificationSubscription,
    startProcess,
    subscriptions,
    validation
} from "../api";
import {isEmpty, stop} from "../utils/Utils";
import {setFlash} from "../utils/Flash";
import ProductSelect from "../components/ProductSelect";
import UserInputForm from "../components/UserInputForm";
import ProductValidation from "../components/ProductValidation";
import "./NewProcess.css";
import {TARGET_CREATE, TARGET_MODIFY} from "../validations/Products";
import SubscriptionSearchSelect from "../components/SubscriptionSearchSelect";
import WorkflowSelect from "../components/WorkflowSelect";
import {isLightPathProduct, isTerminatable} from "../validations/Subscriptions";
import ConfirmationDialog from "../components/ConfirmationDialog";
import {enrichSubscription} from "../utils/Lookups";
import {subscriptionInsyncStatus} from "../api";


export default class NewProcess extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            product: {},
            stepUserInput: [],
            productValidation: {"valid": true, mapping: {}},
            subscriptions: [],
            modifyWorkflows: [],
            modifySubscription: undefined,
            modifyWorkflow: undefined,
            terminateSubscription: undefined,
            notModifiableMessage: undefined,
            notTerminatableMessage: undefined,
            organisationName: undefined,
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this,
            confirm: () => this,
            confirmationDialogQuestion: "",
            started: false
        };
    }

    componentDidMount = () => {
        const {products, preselectedProduct, preselectedOrganisation, organisations} = this.props;
        if (preselectedProduct) {
            const product = products.find(x => x.product_id.toLowerCase() === preselectedProduct.toLowerCase());
            if (product) {
                this.changeProduct({
                    value: product.product_id,
                    workflow: product.workflows.find(wf => wf.target === TARGET_CREATE),
                    ...product
                });
            }
        }
        subscriptions().then(subscriptions => {
            let organisationName = null;
            if (preselectedOrganisation) {
                const org = organisations.find(org => org.uuid === preselectedOrganisation);
                organisationName = org ? org.name : organisationName;
                subscriptions = subscriptions.filter(sub => sub.customer_id === preselectedOrganisation);
            }
            this.setState({subscriptions: subscriptions, organisationName: organisationName});
        });
    };

    validSubmit = (stepUserInput) => {
        if (!isEmpty(this.state.product)) {
            const product = {
                name: "product",
                type: "product",
                value: this.state.product.value,
                tag: this.state.product.tag
            };
            //create a copy to prevent re-rendering
            let processInput = [...stepUserInput];
            processInput.push(product);

            processInput = processInput.reduce((acc, input) => {
                acc[input.name] = input.value;
                return acc;
            }, {});
            startProcess(processInput)
                .then(() => {
                    this.props.history.push(`/processes`);
                    const {products} = this.props;
                    const name = products.find(prod => prod.product_id === this.state.product.value).name;
                    setFlash(I18n.t("process.flash.create", {name: name}));
                });
        }
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

    startNewProcess = e => {
        stop(e);
        const {product} = this.state;
        if (!isEmpty(product)) {
            this.setState({stepUserInput: [], productValidation: {"valid": true, mapping: {}}, product: {}}, () => {
                this.setState({product: product});
                if (product) {
                    Promise.all([validation(product.value), initialWorkflowInput(product.workflow.name, product.productId)]).then(result => {
                        const [productValidation, userInput] = result;
                        const stepUserInput = userInput.filter(input => input.name !== "product");
                        const {preselectedOrganisation, preselectedDienstafname} = this.props;
                        if (preselectedOrganisation) {
                            const organisatieInput = stepUserInput.find(x => x.name === "organisation");
                            if (organisatieInput) {
                                organisatieInput.value = preselectedOrganisation
                            }
                        }
                        if (preselectedDienstafname) {
                            const dienstafnameInput = stepUserInput.find(x => x.name === "dienstafname");
                            if (dienstafnameInput) {
                                dienstafnameInput.value = preselectedDienstafname;
                            }
                        }
                        this.setState({productValidation: productValidation, stepUserInput: stepUserInput, started: true});
                    });
                }
            });
        }
    };

    addContextToSubscription = subscriptionId => {
        const {subscriptions} = this.state;
        const {organisations, products} = this.props;
        const subscription = subscriptions.find(sub => sub.subscription_id === subscriptionId);
        enrichSubscription(subscription, organisations, products);
        return subscription;
    };

    startModifyProcess = e => {
        stop(e);
        const {modifySubscription, modifyWorkflow} = this.state;
        const {preselectedDienstafname} = this.props;
        const subscription = this.addContextToSubscription(modifySubscription);
        const change = I18n.t(`subscription.modify_${modifyWorkflow}`).toLowerCase();
        this.confirmation(I18n.t("subscription.modifyConfirmation", {
                name: subscription.product_name,
                customer: subscription.customer_name,
                change: change
            }),
            () => startModificationSubscription(modifySubscription, {name: modifyWorkflow}, preselectedDienstafname).then(() => {
                this.props.history.push("/processes")
            }));
    };

    startTerminateProcess = e => {
        stop(e);
        const {terminateSubscription} = this.state;
        const subscription = this.addContextToSubscription(terminateSubscription);
        this.confirmation(I18n.t("subscription.terminateConfirmation", {
                name: subscription.product_name,
                customer: subscription.customer_name
            }),
            () => this.props.history.push(`/terminate-subscription?subscription=${subscription.subscription_id}`));
    };

    renderActions = (start, disabled) => {
        return (
            <section className="actions-buttons">
                <a tabIndex={0} className={`button ${disabled ? "grey disabled" : "blue"}`} onClick={start}>
                    {I18n.t("subscription.start")}
                </a>
            </section>
        );
    };

    changeProduct = option => this.setState({stepUserInput: [], productValidation: {"valid": true, mapping: {}}, product: option});

    renderCreateProduct(product, showProductValidation, productValidation, stepUserInput, subscriptions, history,
                        organisations, products, locationCodes, started) {
        return <section className="form-step divider">
            <h3>{I18n.t("process.new_process")}</h3>
            <section className="form-divider">
                <label htmlFor="product">{I18n.t("process.product")}</label>
                <ProductSelect
                    products={this.props.products.filter(prod => !isEmpty(prod.workflows.find(wf => wf.target === TARGET_CREATE)))}
                    onChange={this.changeProduct}
                    product={isEmpty(product) ? undefined : product.value}/>
            </section>
            {showProductValidation &&
            <section>
                <label htmlFor="none">{I18n.t("process.product_validation")}</label>
                <ProductValidation validation={productValidation}/>
            </section>}
            {isEmpty(stepUserInput) && this.renderActions(this.startNewProcess, isEmpty(product))}
            {!isEmpty(stepUserInput) &&
            <UserInputForm stepUserInput={stepUserInput}
                           servicePorts={subscriptions.filter(sub => sub.tag === "MSP" || sub.tag === "SSP")}
                           history={history}
                           organisations={organisations}
                           products={products}
                           locationCodes={locationCodes}
                           product={product}
                           validSubmit={this.validSubmit}/>}
        </section>;
    }

    maybeModifiedMessage = (subscription, relation_info) => {
        let message = "";
        if (!subscription.insync) {
            return I18n.t("subscription.not_in_sync");
        }
        else if (!relation_info.insync) {
            if (!isEmpty(relation_info.locked_childs)) {
                message = message + " " + I18n.t("subscription.locked_child_subscriptions") + " ";
                relation_info.locked_childs.forEach((relation, index, array) => {
                    message = message + relation.description + ((index !== array.length - 1) ? ", " : ".");
                });
            }
            if (!isEmpty(relation_info.locked_parents)) {
                message = message + " " + I18n.t("subscription.locked_parent_subscriptions") + " ";
                relation_info.locked_parents.forEach((relation, index, array) => {
                    message = message + relation.description + ((index !== array.length - 1) ? ", " : ".");
                });
            }
            return I18n.t("subscription.relations_not_in_sync") + message;
        }
        else {
            return null;
        }
    };

    changeModifySubscription = option => {
        const {subscriptions} = this.state;
        const subscription = subscriptions.find(sub => sub.subscription_id === option.value);
        const {products} = this.props;
        const workflows = (option && option.value) ? products.find(prod => prod.product_id === subscription.product_id)
            .workflows.filter(wf => wf.target === TARGET_MODIFY) : [];

        subscriptionInsyncStatus(subscription.subscription_id).then(relation_info => {
                this.setState({notModifiableMessage: this.maybeModifiedMessage(subscription, relation_info)});
            }
        );

        this.setState({
            modifySubscription: option ? option.value : undefined,
            notModifiableMessage: I18n.t("subscription.acquiring_insync_info_about_relations"),
            modifyWorkflows: workflows,
            modifyWorkflow: workflows.length === 1 ? workflows[0].name : this.state.modifyWorkflow
        });
    };

    changeModifyWorkflow = option => {
        this.setState({modifyWorkflow: option ? option.value : undefined});
    };

    maybeTerminatedMessage = (option, relations) => {
        const {subscriptions} = this.state;
        if (option && option.value) {
            const subscription = subscriptions.find(sub => sub.subscription_id === option.value);

            if (!subscription.insync || !relations.insync) {
                if (relations.hasOwnProperty('subscriptions') && relations.subscriptions.length !== 0) {
                    let message =  "There is a one or more related workflow entity out of sync: ";
                    relations.subscriptions.forEach((relation, index, array) => {
                        message = message + relation.description + ((index !== array.length - 1) ? ", " : ".");
                    });
                    return I18n.t("subscription.not_in_sync") + message;
                }
                return I18n.t("subscription.not_in_sync");
            }
            if (subscription.status !== "active") {
                return I18n.t("subscription.no_terminate_invalid_status", {status: subscription.status});
            }
        }
        return null;
    };

    changeTerminateSubscription = option => {
        const {subscriptions} = this.state;
        const subscription = subscriptions.find(sub => sub.subscription_id === option.value);

        if (!isLightPathProduct(subscription)) {
            parentSubscriptions(option.value).then(res => {
                if (!isTerminatable(subscription, res.json)) {
                    this.setState({notTerminatableMessage: I18n.t("subscription.no_termination_parent_subscription")});
                }
            });
        }

        subscriptionInsyncStatus(subscription.subscription_id).then(result => {
            if(!result.insync) {
                this.setState({notTerminatableMessage: this.maybeTerminatedMessage(option, result)});
            }
        });

        this.setState({
            terminateSubscription: option ? option.value : undefined,
            notTerminatableMessage: this.maybeTerminatedMessage(option, false),
        });
    };

    renderModifyProduct = (subscriptions, modifySubscription, modifyWorkflow, products, notModifiableMessage, modifyWorkflows, organisationName) => {
        const noModifyWorkflows = (modifySubscription && modifyWorkflows.length === 0) ? I18n.t("subscription.no_modify_workflow") : null;
        return (
            <section className="form-step divider">
                <h3>{I18n.t("process.modify_subscription")}</h3>
                <section className="form-divider">
                    <label htmlFor="subscription">{I18n.t("process.subscription")}</label>
                    <SubscriptionSearchSelect
                        subscriptions={subscriptions}
                        subscription={modifySubscription}
                        onChange={this.changeModifySubscription}
                        organisation={organisationName}
                    />
                    {notModifiableMessage && <em className="error">{notModifiableMessage}</em>}
                </section>
                <section className="form-divider">
                    <label htmlFor="workflow">{I18n.t("process.workflowSelect")}</label>
                    <WorkflowSelect
                        workflows={modifyWorkflows}
                        workflow={modifyWorkflow}
                        onChange={this.changeModifyWorkflow}
                        placeholder={isEmpty(modifyWorkflows) ? I18n.t("process.workflowsEmptyPlaceholder") : I18n.t("process.workflowsPlaceholder")}
                    />
                    {noModifyWorkflows && <em className="error">{noModifyWorkflows}</em>}
                </section>
                {this.renderActions(this.startModifyProcess, !isEmpty(notModifiableMessage) || !isEmpty(noModifyWorkflows) || isEmpty(modifyWorkflow))}
            </section>
        );
    };

    renderTerminateProduct = (subscriptions, terminateSubscription, notTerminatableMessage, organisationName) => {
        return (
            <section className="form-step divider">
                <h3>{I18n.t("process.terminate_subscription")}</h3>
                <section className="form-divider">
                    <label htmlFor="subscription">{I18n.t("process.subscription")}</label>
                    <SubscriptionSearchSelect
                        subscriptions={subscriptions.filter(sub => sub.status !== "terminated")}
                        subscription={terminateSubscription}
                        onChange={this.changeTerminateSubscription}
                        organisation={organisationName}
                    />
                    {notTerminatableMessage && <em className="error">{notTerminatableMessage}</em>}
                </section>
                {this.renderActions(this.startTerminateProcess, isEmpty(terminateSubscription) || !isEmpty(notTerminatableMessage))}
            </section>
        );
    };

    render() {
        const {
            product, stepUserInput, productValidation, subscriptions, modifySubscription, modifyWorkflow,
            terminateSubscription, notModifiableMessage, notTerminatableMessage, modifyWorkflows,
            organisationName, confirmationDialogOpen, confirmationDialogAction, confirmationDialogQuestion, started
        } = this.state;
        const {organisations, products, locationCodes, history} = this.props;
        const showProductValidation = (isEmpty(productValidation.mapping) || !productValidation.valid) && productValidation.product;
        const showModify = isEmpty(stepUserInput);
        return (
            <div className="mod-new-process">
                <ConfirmationDialog isOpen={confirmationDialogOpen}
                                    cancel={this.cancelConfirmation}
                                    confirm={confirmationDialogAction}
                                    question={confirmationDialogQuestion}/>

                <section className="card">
                    {this.renderCreateProduct(product, showProductValidation, productValidation, stepUserInput,
                        subscriptions, history, organisations, products, locationCodes, started)}
                    {showModify && this.renderModifyProduct(subscriptions, modifySubscription, modifyWorkflow, products, notModifiableMessage, modifyWorkflows, organisationName)}
                    {showModify && this.renderTerminateProduct(subscriptions, terminateSubscription, notTerminatableMessage, organisationName)}
                </section>
            </div>
        );
    }
}

NewProcess.propTypes = {
    history: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    organisations: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired,
    locationCodes: PropTypes.array.isRequired,
    preselectedProduct: PropTypes.string,
    preselectedOrganisation: PropTypes.string,
    preselectedDienstafname: PropTypes.string
};
