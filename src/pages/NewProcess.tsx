/*
 * Copyright 2019 SURF.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import React from "react";
import I18n from "i18n-js";
import { startProcess, subscriptionWorkflows, validation, allSubscriptions, catchErrorStatus } from "../api";
import { isEmpty, stop } from "../utils/Utils";
import { setFlash } from "../utils/Flash";
import ProductSelect, { ProductOption } from "../components/ProductSelect";
import ProductValidationComponent from "../components/ProductValidation";
import UserInputFormWizard from "../components/UserInputFormWizard";
import "./NewProcess.scss";
import { TARGET_CREATE } from "../validations/Products";
import SubscriptionSearchSelect from "../components/SubscriptionSearchSelect";
import WorkflowSelect from "../components/WorkflowSelect";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { enrichSubscription } from "../utils/Lookups";
import ApplicationContext from "../utils/ApplicationContext";
import {
    FormNotCompleteResponse,
    InputField,
    Subscription,
    Product,
    Option,
    WorkflowReason,
    ProductValidation
} from "../utils/types";
import { LocationSearchSquashedHash } from "../utils/QueryParameters";

interface PreselectedInput {
    product: string;
    organisation: string;
}

interface IProps {
    preselectedInput: LocationSearchSquashedHash;
}

interface IState {
    product?: ProductOption;
    stepUserInput?: InputField[];
    hasNext?: boolean;
    productValidation?: ProductValidation;
    subscriptions: Subscription[];
    modifyWorkflows: WorkflowReason[];
    modifySubscription?: string;
    modifyWorkflow?: string;
    terminateSubscription?: string;
    notModifiableMessage?: string;
    notTerminatableMessage?: string;
    organisationName?: string | null;
    confirmationDialogOpen: boolean;
    confirmationDialogAction: () => void;
    confirm: () => void;
    confirmationDialogQuestion: string;
    started: boolean;
    showInitialMsps: boolean;
}

export default class NewProcess extends React.Component<IProps, IState> {
    context!: React.ContextType<typeof ApplicationContext>;

    state: IState = {
        hasNext: false,
        subscriptions: [],
        modifyWorkflows: [],
        confirmationDialogOpen: false,
        confirmationDialogAction: () => this,
        confirm: () => this,
        confirmationDialogQuestion: "",
        started: false,
        showInitialMsps: false
    };

    componentDidMount = () => {
        // @ts-ignore
        const preselectedInput: PreselectedInput = this.props.preselectedInput;
        const { products, organisations } = this.context;
        if (preselectedInput.product) {
            const product = products.find(x => x.product_id.toLowerCase() === preselectedInput.product.toLowerCase());
            if (product) {
                this.changeProduct({
                    label: "",
                    value: product.product_id,
                    workflow: product.workflows.find(wf => wf.target === TARGET_CREATE),
                    productId: product.product_id,
                    tag: product.tag,
                    fixed_inputs: product.fixed_inputs
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

    validSubmit = (products: Product[]) => (processInput: {}[]) => {
        if (this.state.product && this.state.product.workflow) {
            return startProcess(this.state.product.workflow.name, [
                { product: this.state.product.productId },
                ...processInput
            ]).then(process => {
                this.context.redirect(`/processes?highlight=${process.id}`);
                const name = products.find(prod => prod.product_id === this.state.product!.value)!.name;
                setFlash(I18n.t("process.flash.create", { name: name, pid: process.id }));
            });
        } else {
            return Promise.reject();
        }
    };

    cancelConfirmation = () => this.setState({ confirmationDialogOpen: false });

    confirmation = (question: string, action: () => void) =>
        this.setState({
            confirmationDialogOpen: true,
            confirmationDialogQuestion: question,
            confirmationDialogAction: () => {
                this.cancelConfirmation();
                action();
            }
        });

    startNewProcess = (e: React.MouseEvent<HTMLButtonElement>) => {
        const { product } = this.state;
        if (product && product.workflow) {
            this.setState(
                {
                    stepUserInput: undefined,
                    productValidation: undefined,
                    product: undefined
                },
                () => {
                    this.setState({ product: product });
                    if (product) {
                        let promise = startProcess(product.workflow!.name, [{ product: product.productId }]);
                        Promise.all([
                            validation(product.value).then(productValidation =>
                                this.setState({
                                    productValidation: productValidation
                                })
                            ),
                            catchErrorStatus<FormNotCompleteResponse>(promise, 510, json => {
                                let stepUserInput = json.form;
                                let hasNext = json.hasNext;

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
                                    stepUserInput: stepUserInput,
                                    hasNext: hasNext
                                });
                            })
                        ]).then(() => {
                            this.setState({
                                started: true
                            });
                        });
                    }
                }
            );
        }
    };

    addContextToSubscription = (subscriptionId?: string) => {
        const { subscriptions } = this.state;
        const { organisations, products } = this.context;
        const subscription = subscriptions.find(sub => sub.subscription_id === subscriptionId)!;
        const subscriptionWithDetails = enrichSubscription(subscription, organisations, products);
        return subscriptionWithDetails;
    };

    startModifyProcess = (e: React.MouseEvent<HTMLButtonElement>) => {
        stop(e);
        const { modifySubscription, modifyWorkflow } = this.state;

        if (!modifyWorkflow) {
            return;
        }

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
                startProcess(modifyWorkflow, [{ subscription_id: modifySubscription }]).then(process => {
                    const pid = process.id;
                    this.context.redirect(`/processes?highlight=${pid}`);
                })
        );
    };

    startTerminateProcess = (e: React.MouseEvent<HTMLButtonElement>) => {
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

    renderActions = (start: (e: React.MouseEvent<HTMLButtonElement>) => void, disabled: boolean) => {
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

    changeProduct = (option: ProductOption) => {
        this.setState({
            stepUserInput: undefined,
            productValidation: undefined,
            product: option,
            showInitialMsps: option.tag === "IP"
        });
    };

    renderCreateProduct(
        product: ProductOption | undefined,
        showProductValidation: boolean,
        productValidation: ProductValidation | undefined,
        stepUserInput: InputField[] | undefined,
        products: Product[],
        preselectedProduct: string
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
                        product={product && product.value}
                        disabled={!isEmpty(preselectedProduct)}
                    />
                </section>
                {showProductValidation && (
                    <section>
                        <label htmlFor="none">{I18n.t("process.product_validation")}</label>
                        <ProductValidationComponent validation={productValidation} />
                    </section>
                )}
                {!stepUserInput && this.renderActions(this.startNewProcess, !product)}
                {stepUserInput && (
                    <UserInputFormWizard
                        stepUserInput={stepUserInput}
                        validSubmit={this.validSubmit(products)}
                        cancel={() => this.context.redirect("/processes")}
                    />
                )}
            </section>
        );
    }

    changeModifySubscription = (products: Product[]) => (option: Option) => {
        const subscriptionSelected = option && option.value;
        const { subscriptions } = this.state;

        if (subscriptionSelected) {
            const subscription = subscriptions.find(sub => sub.subscription_id === option.value)!;

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

    changeModifyWorkflow = (option: Option) => {
        this.setState({
            modifyWorkflow: option && option.value
        });
    };

    changeTerminateSubscription = (option: Option) => {
        const subscriptionSelected = option && option.value;

        const { subscriptions } = this.state;
        if (subscriptionSelected) {
            const subscription = subscriptions.find(sub => sub.subscription_id === option.value)!;
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
        subscriptions: Subscription[],
        modifySubscription: string | undefined,
        modifyWorkflow: string | undefined,
        products: Product[],
        notModifiableMessage: string | undefined,
        modifyWorkflows: WorkflowReason[],
        organisationName?: string | null
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
                                (sub.status === "provisioning" && sub.insync && sub.product.tag === "Node") ||
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

    renderTerminateProduct = (
        subscriptions: Subscription[],
        terminateSubscription?: string,
        notTerminatableMessage?: string,
        organisationName?: string | null
    ) => {
        return (
            <section className="form-step divider">
                <h3>{I18n.t("process.terminate_subscription")}</h3>
                <section className="form-divider">
                    <label htmlFor="terminate-subscription-search-select">{I18n.t("process.subscription")}</label>
                    <SubscriptionSearchSelect
                        id="terminate-subscription-search-select"
                        subscriptions={subscriptions.filter(sub => sub.status !== "terminated")}
                        subscription={terminateSubscription}
                        onChange={this.changeTerminateSubscription}
                        organisation={organisationName}
                    />
                    {notTerminatableMessage && <em className="error">{notTerminatableMessage}</em>}
                </section>
                {this.renderActions(this.startTerminateProcess, !terminateSubscription || !!notTerminatableMessage)}
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
        const { products } = this.context;
        const showProductValidation = !!productValidation && !productValidation.valid && !!productValidation.product;
        const showModify = !stepUserInput;
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
                        products,
                        preselectedInput.product as string
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

NewProcess.contextType = ApplicationContext;
