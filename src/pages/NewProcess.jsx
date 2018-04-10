import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import {
    activeAndSyncedSubscriptions,
    initialWorkflowInput,
    startProcess,
    subscriptionsByTags,
    validation
} from "../api";
import {isEmpty} from "../utils/Utils";
import {setFlash} from "../utils/Flash";
import ProductSelect from "../components/ProductSelect";
import UserInputForm from "../components/UserInputForm";
import ProductValidation from "../components/ProductValidation";

import "./NewProcess.css";
import {TARGET_CREATE} from "../validations/Products";

export default class NewProcess extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            product: {},
            stepUserInput: [],
            productValidation: {"valid": true, mapping: {}},
            subscriptions: []
        };
    }

    componentDidMount = () => {
        const {products, preselectedProduct} = this.props;
        if (preselectedProduct) {
            const product = products.find(x => x.product_id === preselectedProduct);
            if (product) {
                this.changeProduct({
                    value: product.product_id,
                    workflow: product.workflows.find(wf => wf.target === TARGET_CREATE),
                    ...product
                });
            }
        }
        activeAndSyncedSubscriptions().then(subscriptions =>  this.setState({subscriptions : subscriptions}));
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

    changeProduct = option => {
        this.setState({stepUserInput: [], productValidation: {"valid": true, mapping: {}}, product: {}}, () => {
            this.setState({product: option});
            if (option) {
                Promise.all([validation(option.value), initialWorkflowInput(option.workflow.name, option.productId)]).then(result => {
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
                        const dienstafnameInput =  stepUserInput.find(x => x.name === "dienstafname");
                        if (dienstafnameInput) {
                            dienstafnameInput.value = preselectedDienstafname;
                        }
                    }
                    this.setState({productValidation: productValidation, stepUserInput: stepUserInput});
                });
            }
        });
    };

    renderCreateProduct(product, showProductValidation, productValidation, stepUserInput, subscriptions, history,
                        organisations, products, locationCodes) {
        return <section className="form-step">
            <h3>{I18n.t("process.new_process")}</h3>
            <section className="form-divider">
                <label htmlFor="product">{I18n.t("process.product")}</label>
                <em>{I18n.t("process.product_info")}</em>
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

    render() {
        const {product, stepUserInput, productValidation, subscriptions} = this.state;
        const {organisations, products, locationCodes, history} = this.props;
        const showProductValidation = (isEmpty(productValidation.mapping) || !productValidation.valid) && productValidation.product;
        const showModify = isEmpty(stepUserInput);
        return (
            <div className="mod-new-process">
                <section className="card">
                    {this.renderCreateProduct(product, showProductValidation, productValidation, stepUserInput,
                        subscriptions, history, organisations, products, locationCodes)}
                        {/*{this.renderModifyProduct(subscriptions, products, locationCodes)}*/}
                        {/*{this.renderTerminateProduct(product, showProductValidation, productValidation, stepUserInput,*/}
                        {/*subscriptions, history, organisations, products, locationCodes)}*/}
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
    preselectedDienstafname: PropTypes.string,
    preselectedSubscription: PropTypes.string,
    preselectedWorkflow: PropTypes.string,
    preselectedWorkflowTarget: PropTypes.string,
};
