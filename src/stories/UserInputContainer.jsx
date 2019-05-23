import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import {
    initialWorkflowInput,
    startModificationSubscription,
    startProcess,
    subscriptionWorkflows,
    subscriptionsWithDetails,
    validation, subscriptionsWithTags
} from "../api";
import {isEmpty, stop} from "../utils/Utils";
import {setFlash} from "../utils/Flash";
import ProductSelect from "../components/ProductSelect";
import UserInputForm from "../components/UserInputForm";
import ProductValidation from "../components/ProductValidation";
import {TARGET_CREATE} from "../validations/Products";
import SubscriptionSearchSelect from "../components/SubscriptionSearchSelect";
import WorkflowSelect from "../components/WorkflowSelect";
import ConfirmationDialog from "../components/ConfirmationDialog";
import {enrichSubscription} from "../utils/Lookups";
import {getQueryParameters} from "../utils/QueryParameters";

export default class UserInputContainer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            product: {},
            productValidation: {"valid": true, mapping: {}},
            subscriptions: [],
            organisationName: undefined,
            showInitialMsps: false // Todo: needed??
        };
    }

    componentDidMount = () => {
        const {products, organisations, location} = this.props;

        subscriptionsWithTags().then(subscriptions => {
            let organisationName = null;
            if (preselectedInput.organisation) {
                const org = organisations.find(org => org.uuid === preselectedInput.organisation);
                organisationName = org ? org.name : organisationName;
            }
            this.setState({subscriptions: subscriptions, organisationName: organisationName});
        })
        // subscriptionsWithDetails().then(subscriptions => {
        //     let organisationName = null;
        //     if (preselectedInput.organisation) {
        //         const org = organisations.find(org => org.uuid === preselectedInput.organisation);
        //         organisationName = org ? org.name : organisationName;
        //     }
        //     this.setState({subscriptions: subscriptions, organisationName: organisationName});
        // });
    };

    validSubmit = products => (stepUserInput) => {
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
                    const name = products.find(prod => prod.product_id === this.state.product.value).name;
                    setFlash(I18n.t("process.flash.create", {name: name}));
                });
        }
    };

    startNewProcess = () => {
        const {product} = this.state;
        if (!isEmpty(product)) {
            this.setState({stepUserInput: [], productValidation: {"valid": true, mapping: {}}, product: {}}, () => {
                this.setState({product: product});
                if (product) {
                    Promise.all([validation(product.value), initialWorkflowInput(product.workflow.name, product.productId)]).then(result => {
                        const [productValidation, userInput] = result;

                        const stepUserInput = userInput.filter(input => input.name !== "product");
                        const {preselectedOrganisation} = this.props;
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

    renderCreateProduct(product, stepUserInput, subscriptions, organisations, products, locationCodes, preselectedProduct) {

        // Todo: delegate complete servicePort stuff to UserInput (e.g. determine when a service_port input is used -> and fetch data)
        /*        let showInitialMsps = this.state.showInitialMsps;
                let servicePortsSN7 = subscriptions.filter(
                        sub => sub.status === "initial" || sub.status === "provisioning" || sub.status === "active"
                    ).filter(sub => ((sub.tag === "MSP" || sub.tag === "MSPNL") && (sub.insync || showInitialMsps)) || sub.tag === "SSP");
                let servicePortsSN8 = subscriptions.filter(
                    sub => sub.status === "initial" || sub.status === "provisioning" || sub.status === "active"
                ).filter(sub => ((sub.tag === "SP") && (sub.insync || showInitialMsps)));*/
        return <section className="form-step divider">
            <h3>{I18n.t("process.new_process")}</h3>
            {!isEmpty(stepUserInput) &&
            <UserInputForm
                locationCodes={locationCodes}
                stepUserInput={stepUserInput}
                products={products}
                organisations={organisations}
                history="" // Not sure if we need to mock this

                // Using subscriptions with enriched .tag info
                subscriptions={subscriptions}
                // Preloading servicePorts here
                // Todo: disable preload en deal with service ports in UserInputForm itself? Now the call is done after start of process: seems fast enough for now
                preloadServicePortsSN7={true}
                preloadServicePortsSN8={true}

                product={product}
                validSubmit={this.validSubmit(products)}
                // refreshSubscriptions={this.refreshSubscriptions}
                // preselectedInput={getQueryParameters(this.props.location.search)}
            />}
        </section>;
    }

    render() {
        const {product, stepUserInput, subscriptions} = this.state;
        const {organisations, locationCodes, preselectedProduct, products} = this.props;
        return (
            <div className="mod-new-process">
                <section className="card">
                    {this.renderCreateProduct(product, stepUserInput, subscriptions, organisations, products, locationCodes, preselectedProduct)}
                </section>
            </div>
        );
    }
}

UserInputContainer.propTypes = {
    history: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    organisations: PropTypes.array.isRequired,
    locationCodes: PropTypes.array.isRequired,
    stepUserInput: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired,
    preselectedProduct: PropTypes.string,
    preselectedOrganisation: PropTypes.string,
    preselectedDienstafname: PropTypes.string,
};
