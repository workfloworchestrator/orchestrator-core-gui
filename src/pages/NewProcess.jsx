import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import {
    initialWorkflowInput,
    startModificationSubscription,
    startProcess,
    subscriptionWorkflows,
    subscriptionsWithDetails,
    validation,
    allSubscriptions
} from "../api";
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
import { getQueryParameters } from "../utils/QueryParameters";

export default class NewProcess extends React.Component {
    constructor(props) {
        super(props);
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
        const { products, organisations, location } = this.props;
        let preselectedInput = getQueryParameters(location.search);
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
        // subscriptionsWithDetails().then(subscriptions => {
        //     let organisationName = null;
        //     if (preselectedInput.organisation) {
        //         const org = organisations.find(org => org.uuid === preselectedInput.organisation);
        //         organisationName = org ? org.name : organisationName;
        //     }
        //     this.setState({subscriptions: subscriptions, organisationName: organisationName});
        // });
    };

    refreshSubscriptions = () => {
        subscriptionsWithDetails().then(subscriptions => {
            this.setState({ subscriptions: subscriptions });
        });
    };

    validSubmit = products => stepUserInput => {
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

            let result = startProcess(processInput);
            result.then(() => {
                this.props.history.push(`/processes`);
                const name = products.find(prod => prod.product_id === this.state.product.value).name;
                setFlash(I18n.t("process.flash.create", { name: name }));
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
                            const [productValidation, userInput] = result;

                            const stepUserInput = userInput.filter(input => input.name !== "product");
                            const { preselectedOrganisation } = this.props;
                            if (preselectedOrganisation) {
                                const organisatieInput = stepUserInput.find(x => x.name === "organisation");
                                if (organisatieInput) {
                                    organisatieInput.value = preselectedOrganisation;
                                    organisatieInput.readonly = true;
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
        const { organisations, products } = this.props;
        const subscription = subscriptions.find(sub => sub.subscription_id === subscriptionId);
        enrichSubscription(subscription, organisations, products);
        return subscription;
    };

    startModifyProcess = e => {
        stop(e);
        const { modifySubscription, modifyWorkflow } = this.state;
        const { location } = this.props;
        const preselectedInput = getQueryParameters(location.search);
        const subscription = this.addContextToSubscription(modifySubscription);
        const change = I18n.t(`subscription.modify_${modifyWorkflow}`).toLowerCase();
        this.confirmation(
            I18n.t("subscription.modifyConfirmation", {
                name: subscription.product_name,
                customer: subscription.customer_name,
                change: change
            }),
            () =>
                startModificationSubscription(modifySubscription, modifyWorkflow, preselectedInput.product).then(() => {
                    this.props.history.push("/processes");
                })
        );
    };

    startTerminateProcess = e => {
        stop(e);
        const { terminateSubscription } = this.state;
        const subscription = this.addContextToSubscription(terminateSubscription);
        this.confirmation(
            I18n.t("subscription.terminateConfirmation", {
                name: subscription.product_name,
                customer: subscription.customer_name
            }),
            () => this.props.history.push(`/terminate-subscription?subscription=${subscription.subscription_id}`)
        );
    };

    renderActions = (start, disabled) => {
        return (
            <section className="actions-buttons">
                <button tabIndex={0} className={`button ${disabled ? "grey disabled" : "blue"}`} onClick={start}>
                    {I18n.t("subscription.start")}
                </button>
            </section>
        );
    };

    changeProduct = option => {
        console.log(option);
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
        subscriptions,
        history,
        organisations,
        products,
        locationCodes,
        preselectedProduct
    ) {
        // Todo: delegate complete servicePort stuff to UserInput (e.g. determine when a service_port input is used -> and fetch data)
        /* let showInitialMsps = this.state.showInitialMsps;
        let servicePortsSN7 = subscriptions.filter(
                sub => sub.status === "initial" || sub.status === "provisioning" || sub.status === "active"
            ).filter(sub => ((sub.tag === "MSP" || sub.tag === "MSPNL") && (sub.insync || showInitialMsps)) || sub.tag === "SSP");
        let servicePortsSN8 = subscriptions.filter(
            sub => sub.status === "initial" || sub.status === "provisioning" || sub.status === "active"
        ).filter(sub => ((sub.tag === "SP") && (sub.insync || showInitialMsps)));*/
        return (
            <section className="form-step divider">
                <h3>{I18n.t("process.new_process")}</h3>
                <section className="form-divider">
                    <label htmlFor="product">{I18n.t("process.product")}</label>
                    <ProductSelect
                        products={this.props.products.filter(
                            prod => !isEmpty(prod.workflows.find(wf => wf.target === TARGET_CREATE))
                        )}
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
                    <UserInputForm
                        locationCodes={locationCodes}
                        stepUserInput={stepUserInput}
                        products={products}
                        organisations={organisations}
                        history={history}
                        // Using already loaded subscriptions with enriched .tag info
                        subscriptions={subscriptions}
                        // Preloading servicePorts here
                        // Todo: disable preload en deal with service ports in UserInputForm itself? Now the call is done after start of process: seems fast enough for now
                        preloadServicePortsSN7={true}
                        preloadServicePortsSN8={true}
                        product={product}
                        validSubmit={this.validSubmit(products)}
                        refreshSubscriptions={this.refreshSubscriptions}
                        preselectedInput={getQueryParameters(this.props.location.search)}
                    />
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
                    notTerminatableMessage: I18n.t(workflow.reason, workflow)
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
        const { organisations, locationCodes, history, preselectedProduct, products } = this.props;
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
                        subscriptions,
                        history,
                        organisations,
                        products,
                        locationCodes,
                        preselectedProduct
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
    history: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    organisations: PropTypes.array.isRequired,
    locationCodes: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired,
    preselectedProduct: PropTypes.string,
    preselectedOrganisation: PropTypes.string,
    preselectedDienstafname: PropTypes.string
};
