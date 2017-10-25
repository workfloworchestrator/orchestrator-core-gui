import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import "./NewProcess.css";
import {initialWorkflowInput, startProcess, validation} from "../api";
import {isEmpty} from "../utils/Utils";
import {setFlash} from "../utils/Flash";
import "./ProcessDetail.css";
import "highlight.js/styles/default.css";
import ProductSelect from "../components/ProductSelect";
import UserInputForm from "../components/UserInputForm";
import ProductValidation from "../components/ProductValidation";

export default class NewProcess extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            product: {},
            stepUserInput: [],
            productValidation: {"valid": true, mapping: {}}
        };
    }

    componentDidMount = () => {
        const {products, preselectedProduct} = this.props;
        if (preselectedProduct != null) {
            const product = products.find(x => x.identifier === preselectedProduct);
            if (product != null) {
                this.changeProduct(Object.assign({}, {value: product.identifier}, product));
            }
        }
    };

    validSubmit = stepUserInput => {
        if (!isEmpty(this.state.product)) {
            const product = {name: "product", type: "product", value: this.state.product.value, tag: this.state.product.tag};
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
                    const name = products.find(prod => prod.identifier === this.state.product.value).name;
                    setFlash(I18n.t("process.flash.create", {name: name}));
                });
        }
    };

    changeProduct = option => {
        if (isEmpty(option) || isEmpty(option.value)) {
            this.setState({stepUserInput: [], productValidation: {"valid": true, mapping: {}}, product: {}});
        } else {
            this.setState({product: option});
            Promise.all([validation(option.value), initialWorkflowInput(option.workflow)]).then(result => {
                const [productValidation, userInput] = result;
                let stepUserInput = userInput.filter(input => input.name !== "product");
                if (this.props.preselectedOrganisation != null) {
                    const organisationInputIdx = stepUserInput.findIndex(x => x.name === "organisation");
                    if (organisationInputIdx !== -1) {
                        const stepUserInputInit = stepUserInput.slice(0, organisationInputIdx);
                        const stepUserInputTail = stepUserInput.slice(organisationInputIdx + 1);
                        const organisationInput = Object.assign({}, stepUserInput[organisationInputIdx], {value: this.props.preselectedOrganisation});
                        stepUserInput = stepUserInputInit.concat([organisationInput]).concat(stepUserInputTail);
                    }
                }
                this.setState({productValidation: productValidation, stepUserInput: stepUserInput});
            });
        }
    };

    render() {
        const {product, stepUserInput, productValidation} = this.state;
        const {organisations, products, ieeeInterfaceTypes, multiServicePoints, locationCodes, history} = this.props;
        const showProductValidation = (isEmpty(productValidation.mapping) || !productValidation.valid) && productValidation.product;
        return (
            <div className="mod-new-process">
                <section className="card">
                    <section className="form-step">
                        <h3>{I18n.t("process.new_process")}</h3>
                        <section className="form-divider">
                            <label htmlFor="product">{I18n.t("process.product")}</label>
                            <em>{I18n.t("process.product_info")}</em>
                            <div className="validity-input-wrapper">
                                <ProductSelect products={this.props.products}
                                               onChange={this.changeProduct}
                                               product={isEmpty(product) ? undefined : product.value}/>
                            </div>
                        </section>
                        {showProductValidation &&
                        <section>
                            <label htmlFor="none">{I18n.t("process.product_validation")}</label>
                            <ProductValidation validation={productValidation}/>
                        </section>}
                        {!isEmpty(stepUserInput) &&
                        <UserInputForm stepUserInput={stepUserInput}
                                       multiServicePoints={multiServicePoints}
                                       history={history}
                                       organisations={organisations}
                                       products={products}
                                       ieeeInterfaceTypes={ieeeInterfaceTypes}
                                       locationCodes={locationCodes}
                                       product={product}
                                       validSubmit={this.validSubmit}/>}
                    </section>
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
    ieeeInterfaceTypes: PropTypes.array.isRequired,
    multiServicePoints: PropTypes.array.isRequired,
    locationCodes: PropTypes.array.isRequired,
    preselectedProduct: PropTypes.string,
    preselectedOrganisation: PropTypes.string,
};
