import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import "./NewProcess.css";
import {initialWorkflowInput, startProcess} from "../api";
import {isEmpty} from "../utils/Utils";
import {setFlash} from "../utils/Flash";
import "./ProcessDetail.css";
import "highlight.js/styles/default.css";
import ProductSelect from "../components/ProductSelect";
import ProcessStep from "../components/ProcessStep";

export default class NewProcess extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            product: "",
            stepUserInput: []
        };
    }

    validSubmit = stepUserInput => {
        if (!isEmpty(this.state.product)) {
            const product = {name: "product", type: "product", value: this.state.product};
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
                    const name = products.find(prod => prod.identifier === this.state.product).name;
                    setFlash(I18n.t("process.flash.create", {name: name}));
                });
        }
    };

    changeProduct = option => {
        this.setState({product: option.value});
        if (isEmpty(option.value)) {
            this.setState({stepUserInput: []})
        } else {
            initialWorkflowInput(option.workflow).then(userInput => {
                const withoutProduct = userInput.filter(input => input.name !== "product")
                this.setState({stepUserInput: withoutProduct})
            });
        }
    };

    render() {
        const {product, stepUserInput} = this.state;
        const {organisations, products, ieeeInterfaceTypes, multiServicePoints, history} = this.props;
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
                                               product={product}/>
                            </div>
                        </section>
                        {!isEmpty(stepUserInput) &&
                        <ProcessStep stepUserInput={stepUserInput} multiServicePoints={multiServicePoints}
                                     history={history} organisations={organisations} products={products}
                                     ieeeInterfaceTypes={ieeeInterfaceTypes} validSubmit={this.validSubmit}/>}
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
};

