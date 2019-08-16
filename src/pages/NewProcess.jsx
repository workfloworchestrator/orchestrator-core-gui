import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import { initialWorkflowInput, startProcess, subscriptionWorkflows, validation, allSubscriptions } from "../api";
import { isEmpty, stop } from "../utils/Utils";
import { setFlash } from "../utils/Flash";
import ProductSelect from "../components/ProductSelect";
import UserInputForm from "../components/UserInputForm";
import ProductValidation from "../components/ProductValidation";
import "./NewProcess.scss";
import { TARGET_CREATE } from "../validations/Products";
import SubscriptionSearchSelect from "../components/SubscriptionSearchSelect";
import WorkflowSelect from "../components/WorkflowSelect";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { enrichSubscription } from "../utils/Lookups";
import ApplicationContext from "../utils/ApplicationContext";

export default class NewProcess extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            product: {},
            stepUserInput: [],
            productValidation: { valid: true, mapping: {} },
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
            started: false,
            showInitialMsps: false
        };
    }

    componentDidMount = () => {
        const { preselectedInput } = this.props;
        const { products, organisations } = this.context;
        if (preselectedInput.product) {
            const product = products.find(x => x.product_id.toLowerCase() === preselectedInput.product.toLowerCase());
            if (product) {
                this.setState({ product: product });
                this.changeProduct({
                    value: product.product_id,
                    workflow: product.workflows.find(wf => wf.target === TARGET_CREATE),
                    productId: product.product_id,
                    tag: product.tag
                });
            }
        }

        // Todo: refactor this call in endpoint so it load subs with only enriched tag info
        // temp call with all tags -> refactor needed in backend
        allSubscriptions().then(subscriptions => {
            let organisationName = null;
            if (preselectedInput.organisation) {
                const org = organisations.find(org => org.uuid === preselectedInput.organisation);
                organisationName = org ? org.name : organisationName;
            }
            this.setState({
                subscriptions: subscriptions,
                organisationName: organisationName
            });
        });
    };

    validSubmit = products => processInput => {
        if (!isEmpty(this.state.product)) {
            let result = startProcess(this.state.product.workflow.name, processInput);
            result
                .then(() => {
                    this.context.redirect(`/processes`);
                    const name = products.find(prod => prod.product_id === this.state.product.value).name;
                    setFlash(I18n.t("process.flash.create", { name: name }));
                })
                .catch(error => {
                    // Todo: handle 500 and 510 better. On production it will show Error Dialog on dev a stack trace + Error Dialog
                });
            return result;
        }
    };

    cancelConfirmation = () => this.setState({ confirmationDialogOpen: false });

    confirmation = (question, action) =>
        this.setState({
            confirmationDialogOpen: true,
            confirmationDialogQuestion: question,
            confirmationDialogAction: () => {
                this.cancelConfirmation();
                action();
            }
        });

    startNewProcess = () => {
        const { product } = this.state;
        if (!isEmpty(product)) {
            this.setState(
                {
                    stepUserInput: [],
                    productValidation: { valid: true, mapping: {} },
                    product: {}
                },
                () => {
                    this.setState({ product: product });
                    if (product) {
                        Promise.all([
                            validation(product.value),
                            initialWorkflowInput(product.workflow.name, product.productId)
                        ]).then(result => {
                            const [productValidation, stepUserInput] = result;

                            const { preselectedInput } = this.props;

                            const productInput = stepUserInput.find(x => x.name === "product");
                            if (productInput) {
                                productInput.type = "hidden";
                                productInput.value = product.value;
                            }

                            if (preselectedInput.organisation) {
                                const organisatieInput = stepUserInput.find(x => x.name === "organisation");
                                if (organisatieInput) {
                                    organisatieInput.value = preselectedInput.organisation;
                                    organisatieInput.readonly = true;
                                }
                            }

                            if (preselectedInput.prefix) {
                                const prefixInput = stepUserInput.find(x => x.type === "ip_prefix");
                                if (prefixInput) {
                                    prefixInput.value = `${preselectedInput.prefix}/${preselectedInput.prefixlen}`;
                                    prefixInput.readonly = true;
                                    prefixInput.prefix_min = preselectedInput.prefix_min;
                                }
                            }

                            this.setState({
                                productValidation: productValidation,
                                stepUserInput: stepUserInput,
                                started: true
                            });
                        });
                    }
                }
            );
        }
    };

    addContextToSubscription = subscriptionId => {
        const { subscriptions } = this.state;
        const { organisations, products } = this.context;
        const subscription = subscriptions.find(sub => sub.subscription_id === subscriptionId);
        enrichSubscription(subscription, organisations, products);
        return subscription;
    };

    startModifyProcess = e => {
        stop(e);
        const { modifySubscription, modifyWorkflow } = this.state;
        const subscription = this.addContextToSubscription(modifySubscription);
        const change = I18n.t(`subscription.modify_${modifyWorkflow}`).toLowerCase();
        debugger;
        this.confirmation(
            I18n.t("subscription.modifyConfirmation", {
                name: subscription.product.description,
                customer: subscription.customer_name,
                change: change
            }),
            () =>
                startProcess(modifyWorkflow, { subscription_id: modifySubscription }).then(() => {
                    this.context.redirect("/processes");
                })
        );
    };

    startTerminateProcess = e => {
        stop(e);
        const { terminateSubscription } = this.state;
        const subscription = this.addContextToSubscription(terminateSubscription);
        this.confirmation(
            I18n.t("subscription.terminateConfirmation", {
                name: subscription.product.description,
                customer: subscription.customer_name
            }),
            () => this.context.redirect(`/terminate-subscription?subscription=${subscription.subscription_id}`)
        );
    };

    renderActions = (start, disabled) => {
        return (
            <section className="actions-buttons">
                <button
                    type="submit"
                    tabIndex={0}
                    className={`button ${disabled ? "grey disabled" : "blue"}`}
                    onClick={start}
                    name="start-process"
                    id="start-process"
                >
                    {I18n.t("subscription.start")}
                </button>
            </section>
        );
    };

    changeProduct = option => {
        this.setState({
            stepUserInput: [],
            productValidation: { valid: true, mapping: {} },
            product: option,
            showInitialMsps: option.tag === "IP"
        });
    };

    renderCreateProduct(
        product,
        showProductValidation,
        productValidation,
        stepUserInput,
        organisations,
        products,
        locationCodes,
        preselectedProduct
    ) {
        return (
            <section className="form-step divider">
                <h3>{I18n.t("process.new_process")}</h3>
                <section className="form-divider">
                    <label htmlFor="product">{I18n.t("process.product")}</label>
                    <ProductSelect
                        id="select-product"
                        products={this.context.products
                            .filter(prod => !isEmpty(prod.workflows.find(wf => wf.target === TARGET_CREATE)))
                            .filter(prod => prod.status === "active")}
                        onChange={this.changeProduct}
                        product={isEmpty(product) ? undefined : product.value}
                        disabled={!isEmpty(preselectedProduct)}
                    />
                </section>
                {showProductValidation && (
                    <section>
                        <label htmlFor="none">{I18n.t("process.product_validation")}</label>
                        <ProductValidation validation={productValidation} />
                    </section>
                )}
                {isEmpty(stepUserInput) && this.renderActions(this.startNewProcess, isEmpty(product))}
                {!isEmpty(stepUserInput) && (
                    <UserInputForm stepUserInput={stepUserInput} validSubmit={this.validSubmit(products)} />
                )}
            </section>
        );
    }

    changeModifySubscription = products => option => {
        const subscriptionSelected = option && option.value;
        const { subscriptions } = this.state;

        if (subscriptionSelected) {
            const subscription = subscriptions.find(sub => sub.subscription_id === option.value);

            subscriptionWorkflows(subscription.subscription_id).then(workflows => {
                this.setState({
                    notModifiableMessage: workflows.reason ? I18n.t(workflows.reason, workflows) : "",
                    modifyWorkflows: workflows.modify.filter(wf => !wf.reason)
                });
            });
        }

        this.setState({
            modifySubscription: option ? option.value : undefined
        });
    };

    changeModifyWorkflow = option => {
        this.setState({
            modifyWorkflow: option ? option.value : undefined
        });
    };

    changeTerminateSubscription = option => {
        const subscriptionSelected = option && option.value;

        const { subscriptions } = this.state;
        if (subscriptionSelected) {
            const subscription = subscriptions.find(sub => sub.subscription_id === option.value);
            subscriptionWorkflows(subscription.subscription_id).then(workflows => {
                let workflow = workflows.terminate[0];

                this.setState({
                    notTerminatableMessage: workflow.reason ? I18n.t(workflow.reason, workflow) : ""
                });
            });
        }
        this.setState({
            terminateSubscription: option ? option.value : undefined,
            notTerminatableMessage: I18n.t("subscription.acquiring_insync_info_about_relations")
        });
    };

    renderModifyProduct = (
        subscriptions,
        modifySubscription,
        modifyWorkflow,
        products,
        notModifiableMessage,
        modifyWorkflows,
        organisationName
    ) => {
        const noModifyWorkflows =
            modifySubscription && modifyWorkflows.length === 0 ? I18n.t("subscription.no_modify_workflow") : null;
        return (
            <section className="form-step divider">
                <h3>{I18n.t("process.modify_subscription")}</h3>
                <section className="form-divider">
                    <label htmlFor="subscription">{I18n.t("process.subscription")}</label>
                    <SubscriptionSearchSelect
                        id="modify-subscription-search-select"
                        subscriptions={subscriptions.filter(
                            sub =>
                                (sub.status === "active" && sub.insync) ||
                                (sub.status === "provisioning" && sub.insync && sub.tag === "Node") ||
                                sub.status === "migrating"
                        )}
                        subscription={modifySubscription}
                        onChange={this.changeModifySubscription(products)}
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
                        placeholder={
                            isEmpty(modifyWorkflows)
                                ? I18n.t("process.workflowsEmptyPlaceholder")
                                : I18n.t("process.workflowsPlaceholder")
                        }
                    />
                    {noModifyWorkflows && <em className="error">{noModifyWorkflows}</em>}
                </section>
                {this.renderActions(
                    this.startModifyProcess,
                    !isEmpty(notModifiableMessage) || !isEmpty(noModifyWorkflows) || isEmpty(modifyWorkflow)
                )}
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
                        id="terminate-subscription-search-select"
                        subscriptions={subscriptions.filter(sub => sub.status !== "terminated")}
                        subscription={terminateSubscription}
                        onChange={this.changeTerminateSubscription}
                        organisation={organisationName}
                    />
                    {notTerminatableMessage && <em className="error">{notTerminatableMessage}</em>}
                </section>
                {this.renderActions(
                    this.startTerminateProcess,
                    isEmpty(terminateSubscription) || !isEmpty(notTerminatableMessage)
                )}
            </section>
        );
    };

    render() {
        const {
            product,
            stepUserInput,
            productValidation,
            subscriptions,
            modifySubscription,
            modifyWorkflow,
            terminateSubscription,
            notModifiableMessage,
            notTerminatableMessage,
            modifyWorkflows,
            organisationName,
            confirmationDialogOpen,
            confirmationDialogAction,
            confirmationDialogQuestion
        } = this.state;
        const { preselectedInput } = this.props;
        const { organisations, locationCodes, products } = this.context;
        const showProductValidation =
            (isEmpty(productValidation.mapping) || !productValidation.valid) && productValidation.product;
        const showModify = isEmpty(stepUserInput);
        return (
            <div className="mod-new-process">
                <ConfirmationDialog
                    isOpen={confirmationDialogOpen}
                    cancel={this.cancelConfirmation}
                    confirm={confirmationDialogAction}
                    question={confirmationDialogQuestion}
                />

                <section className="card">
                    {this.renderCreateProduct(
                        product,
                        showProductValidation,
                        productValidation,
                        stepUserInput,
                        organisations,
                        products,
                        locationCodes,
                        preselectedInput.product
                    )}
                    {showModify &&
                        this.renderModifyProduct(
                            subscriptions,
                            modifySubscription,
                            modifyWorkflow,
                            products,
                            notModifiableMessage,
                            modifyWorkflows,
                            organisationName
                        )}
                    {showModify &&
                        this.renderTerminateProduct(
                            subscriptions,
                            terminateSubscription,
                            notTerminatableMessage,
                            organisationName
                        )}
                </section>
            </div>
        );
    }
}

NewProcess.propTypes = {
    preselectedInput: PropTypes.object.isRequired
};

NewProcess.contextType = ApplicationContext;
