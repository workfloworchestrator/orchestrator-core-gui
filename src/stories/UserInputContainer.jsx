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
            started: true,
            product: {
                "value": "efbe1235-93df-49ee-bbba-e51434e0be17",
                "label": "MSP 1G",
                "workflow": {
                    "created_at": 1531342996,
                    "description": "MSP Request",
                    "name": "msp_request",
                    "target": "CREATE",
                    "workflow_id": "5d76a621-6ad6-41f6-b18c-f74a80ab868b"
                },
                "tag": "MSP",
                "productId": "efbe1235-93df-49ee-bbba-e51434e0be17",
                "fixed_inputs": [{
                    "created_at": 1531342997,
                    "fixed_input_id": "e5ceb7f4-2429-4f3e-b021-5151008d0f6f",
                    "name": "port_speed",
                    "product_id": "efbe1235-93df-49ee-bbba-e51434e0be17",
                    "value": "1000"
                }, {
                    "created_at": 1531342997,
                    "fixed_input_id": "700b6510-1915-491f-8619-8dfa332ccca5",
                    "name": "protection_type",
                    "product_id": "efbe1235-93df-49ee-bbba-e51434e0be17",
                    "value": "Unprotected"
                }, {
                    "created_at": 1531342997,
                    "fixed_input_id": "e7de8efa-88ce-4cae-b76b-96603e926bec",
                    "name": "domain",
                    "product_id": "efbe1235-93df-49ee-bbba-e51434e0be17",
                    "value": "SURFNET7"
                }, {
                    "created_at": 1531342997,
                    "fixed_input_id": "a1833621-beb3-408a-a456-8d8578792bc4",
                    "name": "tagged",
                    "product_id": "efbe1235-93df-49ee-bbba-e51434e0be17",
                    "value": "single"
                }, {
                    "created_at": 1531342997,
                    "fixed_input_id": "49fa1095-382b-40e2-ab4c-ecec3e834e43",
                    "name": "redundant",
                    "product_id": "efbe1235-93df-49ee-bbba-e51434e0be17",
                    "value": "False"
                }, {
                    "created_at": 1531342997,
                    "fixed_input_id": "9037fc5c-ae20-40b7-a0d1-02c381eb1f8b",
                    "name": "aggregate",
                    "product_id": "efbe1235-93df-49ee-bbba-e51434e0be17",
                    "value": "False"
                }]
            },
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

    // startNewProcess = () => {
    //     const {product} = this.state;
    //     if (!isEmpty(product)) {
    //         this.setState({stepUserInput: [], productValidation: {"valid": true, mapping: {}}, product: {}}, () => {
    //             this.setState({product: product});
    //             if (product) {
    //                 Promise.all([validation(product.value), initialWorkflowInput(product.workflow.name, product.productId)]).then(result => {
    //                     const [productValidation, userInput] = result;
    //
    //                     const stepUserInput = userInput.filter(input => input.name !== "product");
    //                     const {preselectedOrganisation} = this.props;
    //                     if (preselectedOrganisation) {
    //                         const organisatieInput = stepUserInput.find(x => x.name === "organisation");
    //                         if (organisatieInput) {
    //                             organisatieInput.value = preselectedOrganisation;
    //                             organisatieInput.readonly = true;
    //                         }
    //                     }
    //                     this.setState({
    //                         productValidation: productValidation,
    //                         stepUserInput: stepUserInput,
    //                         started: true
    //                     });
    //                 });
    //             }
    //         });
    //     }
    // };

    addContextToSubscription = subscriptionId => {
        const {subscriptions} = this.state;
        const {organisations, products} = this.props;
        const subscription = subscriptions.find(sub => sub.subscription_id === subscriptionId);
        enrichSubscription(subscription, organisations, products);
        return subscription;
    };

    renderForm(product, stepUserInput, subscriptions, organisations, products, locationCodes, preselectedProduct, formName) {

        // Todo: delegate complete servicePort stuff to UserInput (e.g. determine when a service_port input is used -> and fetch data)
        /*        let showInitialMsps = this.state.showInitialMsps;
                let servicePortsSN7 = subscriptions.filter(
                        sub => sub.status === "initial" || sub.status === "provisioning" || sub.status === "active"
                    ).filter(sub => ((sub.tag === "MSP" || sub.tag === "MSPNL") && (sub.insync || showInitialMsps)) || sub.tag === "SSP");
                let servicePortsSN8 = subscriptions.filter(
                    sub => sub.status === "initial" || sub.status === "provisioning" || sub.status === "active"
                ).filter(sub => ((sub.tag === "SP") && (sub.insync || showInitialMsps)));*/
        return <section className="form-step divider">
            <h1>{formName}</h1>
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
            />
        </section>;
    }

    render() {
        const {product, subscriptions} = this.state;
        const {organisations, stepUserInput, locationCodes, preselectedProduct, products, formName} = this.props;
        return (
            <div className="mod-new-process">
                <section className="card">
                    {this.renderForm(product, stepUserInput, subscriptions, organisations, products, locationCodes, preselectedProduct, formName)}
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
    formName: PropTypes.string.isRequired,
    preselectedProduct: PropTypes.string,
    preselectedOrganisation: PropTypes.string,
    preselectedDienstafname: PropTypes.string,
};
