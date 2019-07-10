import React from "react";
import PropTypes from "prop-types";
import { action } from "@storybook/addon-actions";
import UserInputForm from "../components/UserInputForm";
import { enrichSubscription } from "../utils/Lookups";

export default class UserInputContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            started: true,
            product: {
                value: "efbe1235-93df-49ee-bbba-e51434e0be17",
                label: "MSP 1G",
                workflow: {
                    created_at: 1531342996,
                    description: "MSP Request",
                    name: "msp_request",
                    target: "CREATE",
                    workflow_id: "5d76a621-6ad6-41f6-b18c-f74a80ab868b"
                },
                tag: "MSP",
                productId: "efbe1235-93df-49ee-bbba-e51434e0be17",
                fixed_inputs: [
                    {
                        created_at: 1531342997,
                        fixed_input_id: "e5ceb7f4-2429-4f3e-b021-5151008d0f6f",
                        name: "port_speed",
                        product_id: "efbe1235-93df-49ee-bbba-e51434e0be17",
                        value: "1000"
                    },
                    {
                        created_at: 1531342997,
                        fixed_input_id: "700b6510-1915-491f-8619-8dfa332ccca5",
                        name: "protection_type",
                        product_id: "efbe1235-93df-49ee-bbba-e51434e0be17",
                        value: "Unprotected"
                    },
                    {
                        created_at: 1531342997,
                        fixed_input_id: "e7de8efa-88ce-4cae-b76b-96603e926bec",
                        name: "domain",
                        product_id: "efbe1235-93df-49ee-bbba-e51434e0be17",
                        value: "SURFNET7"
                    },
                    {
                        created_at: 1531342997,
                        fixed_input_id: "a1833621-beb3-408a-a456-8d8578792bc4",
                        name: "tagged",
                        product_id: "efbe1235-93df-49ee-bbba-e51434e0be17",
                        value: "single"
                    },
                    {
                        created_at: 1531342997,
                        fixed_input_id: "49fa1095-382b-40e2-ab4c-ecec3e834e43",
                        name: "redundant",
                        product_id: "efbe1235-93df-49ee-bbba-e51434e0be17",
                        value: "False"
                    },
                    {
                        created_at: 1531342997,
                        fixed_input_id: "9037fc5c-ae20-40b7-a0d1-02c381eb1f8b",
                        name: "aggregate",
                        product_id: "efbe1235-93df-49ee-bbba-e51434e0be17",
                        value: "False"
                    }
                ]
            },
            productValidation: { valid: true, mapping: {} },
            subscriptions: [],
            organisationName: undefined,
            showInitialMsps: false // Todo: needed??
        };
    }

    addContextToSubscription = subscriptionId => {
        const { subscriptions } = this.state;
        const { organisations, products } = this.props;
        const subscription = subscriptions.find(sub => sub.subscription_id === subscriptionId);
        enrichSubscription(subscription, organisations, products);
        return subscription;
    };

    renderForm(
        product,
        stepUserInput,
        subscriptions,
        organisations,
        products,
        locationCodes,
        preselectedProduct,
        formName
    ) {
        return (
            <section className="form-step divider">
                <h1>{formName}</h1>
                <UserInputForm
                    locationCodes={locationCodes}
                    stepUserInput={stepUserInput}
                    products={products}
                    organisations={organisations}
                    history={{}} // Not sure if we need to mock this
                    product={product}
                    validSubmit={action("submit")}
                    currentState={this.props.currentState}
                />
            </section>
        );
    }

    render() {
        const { product, subscriptions } = this.state;
        const { organisations, stepUserInput, locationCodes, preselectedProduct, products, formName } = this.props;
        return (
            <div className="mod-new-process">
                <section className="card">
                    {this.renderForm(
                        product,
                        stepUserInput,
                        subscriptions,
                        organisations,
                        products,
                        locationCodes,
                        preselectedProduct,
                        formName
                    )}
                </section>
            </div>
        );
    }
}

UserInputContainer.propTypes = {
    organisations: PropTypes.array.isRequired,
    locationCodes: PropTypes.array.isRequired,
    stepUserInput: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired,
    formName: PropTypes.string.isRequired,
    preselectedProduct: PropTypes.string,
    preselectedOrganisation: PropTypes.string,
    preselectedDienstafname: PropTypes.string,
    currentState: PropTypes.object
};

UserInputContainer.defaultProps = {
    currentState: {}
};
