import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import ConfirmationDialog from "./ConfirmationDialog";

import {isEmpty, stop} from "../utils/Utils";
import {getParameterByName} from "../utils/QueryParameters";
import {allWorkflows, productBlocks, productById, products, saveProduct} from "../api/index";
import {setFlash} from "../utils/Flash";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import * as moment from "moment";
import {formDate, formInput, formSelect} from "../forms/Builder";

import "./Product.css";

export default class Product extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this.setState({confirmationDialogOpen: false}),
            cancelDialogAction: () => this.props.history.push("/metadata/product_blocks"),
            leavePage: true,
            errors: {},
            isNew: true,
            readOnly: false,
            product: {product_blocks: [], fixed_inputs: [], status: "active", product_type: "Port"},
            processing: false,
            productBlocks: [],
            products: [],
            workflows: [],
            optionalAttributes: ["crm_prod_id"],
            duplicate_name: false
        };
    }

    componentDidMount() {
        const id = this.props.match.params.id;
        if (id !== "new") {
            const readOnly = getParameterByName("readOnly", window.location.search) === "true";
            productById(id).then(res => {
                this.setState({product: res, isNew: false, readOnly: readOnly})
            });
        }
        Promise.all([productBlocks(), allWorkflows(), products()]).then(res => this.setState({
            productBlocks: res[0],
            workflows: res[1],
            products: res[2]
        }));
    }

    cancel = e => {
        stop(e);
        this.setState({confirmationDialogOpen: true});
    };

    submit = e => {
        stop(e);
        const {product, processing} = this.state;
        const invalid = this.isInvalid() || processing;
        if (!invalid) {
            this.setState({processing: true});
            saveProduct(product).then(() => {
                this.props.history.push("/metadata/products");
                setFlash(I18n.t(product.product_id ? "metadata.flash.updated" : "metadata.flash.created",
                    {type: "Product", name: product.name}));
            });

        }
    };

    renderButtons = (readOnly) => {
        if (readOnly) {
            return (<section className="buttons">
                <a className="button" onClick={() => this.props.history.push("/metadata/products")}>
                    {I18n.t("metadata.products.back")}
                </a>
            </section>);
        }
        const invalid = this.isInvalid() || this.state.processing;
        return (<section className="buttons">
            <a className="button" onClick={this.cancel}>
                {I18n.t("process.cancel")}
            </a>
            <a tabIndex={0} className={`button ${invalid ? "grey disabled" : "blue"}`} onClick={this.submit}>
                {I18n.t("process.submit")}
            </a>
        </section>);
    };

    isInvalid = () => Object.keys(this.state.errors).some(key => this.state.errors[key]);

    validateProperty = name => e => {
        const value = e.target.value;
        const errors = {...this.state.errors};
        if (name === "name") {
            const duplicate = this.state.products.some(p => p.name === value);
            errors[name] = duplicate;
            this.setState({duplicate_name: duplicate});
        }
        errors[name] = isEmpty(value);
        this.setState({errors: errors});
    };

    changeProperty = name => e => {
        const {product} = this.state;
        let value;
        if (isEmpty(e) || e._isAMomentObject) {
            value = e;
        } else {
            value = e.target ? e.target.value : e.value;
        }
        product[name] = value;
        this.setState({product: product});
    };

    addProductBlock = option => {
        const {product, productBlocks} = this.state;
        const newProductBlock = productBlocks.find(pb => pb.product_block_id === option.value);
        product.product_blocks.push(newProductBlock);
        this.setState({product: product});
    };

    removeProductBlock = product_block_id => e => {
        stop(e);
        const {product} = this.state;
        product.product_blocks = product.product_blocks.filter(pb => pb.product_block_id !== product_block_id);
        this.setState({productBlock: product});
    };

    addFixedInput = () => {
        const product = {...this.state.product};
        product.fixed_inputs.push({name: "", value: ""});
        this.setState({product: product});
        setTimeout(() => {
            if (this.lastFixedInputName) {
                this.lastFixedInputName.focus();
            }
        }, 250);
    };

    fixedInputNameChanged = (index) => e => {
        const product = {...this.state.product};
        const newName = e.target.value;
        const fixedInput = product.fixed_inputs[index];
        const nameDuplicate = product.fixed_inputs.some(fi => fi.name === newName);
        if (!nameDuplicate) {
            fixedInput.name = newName;
            this.setState({product: product});
        }
    };

    fixedInputValueChanged = (index) => e => {
        const product = {...this.state.product};
        const newValue = e.target.value;
        const fixedInput = product.fixed_inputs[index];
        fixedInput.value = newValue;
        this.setState({product: product});
    };

    removeFixedInput = index => e => {
        stop(e);
        const product = {...this.state.product};
        product.fixed_inputs.splice(index, 1);
        this.setState({product: product});
    };

    workFlowKeys = (type, workflows) => workflows
            .filter(wf => wf.target === type)
            .map(wf => ({label: wf.name, value: wf.key}));

    renderFixedInputs = (product, readOnly) => {
        const fixedInputs = product.fixed_inputs;
        return (
            <section className="form-divider">
                <label>{I18n.t("metadata.products.fixed_inputs")}</label>
                <em>{I18n.t("metadata.products.fixed_inputs_info")}</em>
                <div className="child-form">
                    {fixedInputs.map((fv, index) =>
                        <div key={index} className="fixed-input">
                            <div className="wrapper">
                                {index === 0 && <label>{I18n.t("metadata.products.fixed_inputs_name")}</label>}
                                <input ref={ref => {
                                    if (index === fixedInputs.length - 1) {
                                        this.lastFixedInputName = ref;
                                    }
                                }}
                                       type="text"
                                       value={fv.name} onChange={this.fixedInputNameChanged(index)}
                                       disabled={readOnly}/>
                            </div>
                            <div className="wrapper">
                                {index === 0 && <label>{I18n.t("metadata.products.fixed_inputs_value")}</label>}
                                <input type="text" value={fv.value} onChange={this.fixedInputValueChanged(index)}
                                       disabled={readOnly}/>
                            </div>
                            <i className="fa fa-minus first" onClick={this.removeFixedInput(index)}></i>
                        </div>
                    )}
                    {!readOnly &&
                    <div className="add-fixed-input" onClick={this.addFixedInput}>
                        <i className="fa fa-plus"></i></div>}
                </div>
            </section>);
    };

    renderProductBlocks = (product, productBlocks, readOnly) => {
        const availableProductBlocks = productBlocks
            .filter(pb => !product.product_blocks.some(pPb => pb.product_block_id === pPb.product_block_id));
        return (
            <section className="form-divider">
                <label htmlFor="name">{I18n.t("metadata.products.product_blocks")}</label>
                <em>{I18n.t("metadata.products.product_blocks_info")}</em>
                <div className="child-form">

                    {product.product_blocks.map(pb =>
                        <div key={pb.product_block_id} className="product-block">
                            <input type="text" id={pb.product_block_id} name={pb.product_block_id}
                                   value={`${pb.name.toUpperCase()} - ${pb.description}`}
                                   disabled={true}/>
                            <i className="fa fa-minus" onClick={this.removeProductBlock(pb.product_block_id)}></i>
                        </div>
                    )}
                    {!readOnly && <Select className="select-product-block"
                                          onChange={this.addProductBlock}
                                          options={availableProductBlocks.map(pb => ({
                                              value: pb.product_block_id,
                                              label: `${pb.name.toUpperCase()} - ${pb.description}`
                                          }))}
                                          searchable={true}
                                          clearable={false}
                                          placeholder={availableProductBlocks.length > 0 ?
                                              I18n.t("metadata.products.select_add_product_block") :
                                              I18n.t("metadata.products.select_no_more_product_blocks")}
                                          disabled={readOnly || availableProductBlocks.length === 0}/>}
                </div>
            </section>);
    };

    render() {
        const {
            confirmationDialogOpen, confirmationDialogAction, cancelDialogAction, product,
            leavePage, readOnly, productBlocks, workflows, duplicate_name
        } = this.state;
        return (
            <div className="mod-product">
                <ConfirmationDialog isOpen={confirmationDialogOpen}
                                    cancel={cancelDialogAction}
                                    confirm={confirmationDialogAction}
                                    leavePage={leavePage}/>
                <section className="card">
                    {formInput("metadata.products.name", "name", product.name || "", readOnly,
                        this.state.errors, this.changeProperty("name"), this.validateProperty("name"),
                        duplicate_name ? I18n.t("metadata.products.duplicate_name") : null)}
                    {formInput("metadata.products.description", "description", product.description || "", readOnly,
                        this.state.errors, this.changeProperty("description"), this.validateProperty("description"))}
                    {formInput("metadata.products.tag", "tag", product.tag || "", readOnly,
                        this.state.errors, this.changeProperty("tag"), this.validateProperty("tag"))}
                    {formSelect("metadata.products.product_type", this.changeProperty("product_type"),
                        ["Port", "LightPath", "ELAN"], readOnly, product.product_type || "Port")}
                    {formSelect("metadata.products.status", this.changeProperty("status"),
                        ["active", "phase out", "pre production", "end of life"], readOnly,
                        product.status || "active")}
                    {formInput("metadata.products.crm_prod_id", "crm_prod_id", product.crm_prod_id || "", readOnly,
                        this.state.errors, this.changeProperty("crm_prod_id"), this.validateProperty("crm_prod_id"))}
                    {formSelect("metadata.products.create_subscription_workflow_key",
                        this.changeProperty("create_subscription_workflow_key"),
                        this.workFlowKeys("CREATE", workflows), readOnly,
                        product.create_subscription_workflow_key || undefined, true)}
                    {formSelect("metadata.products.modify_subscription_workflow_key",
                        this.changeProperty("modify_subscription_workflow_key"),
                        this.workFlowKeys("MODIFY", workflows), readOnly,
                        product.modify_subscription_workflow_key || undefined, true)}
                    {formSelect("metadata.products.terminate_subscription_workflow_key",
                        this.changeProperty("terminate_subscription_workflow_key"),
                        this.workFlowKeys("TERMINATE", workflows), readOnly,
                        product.terminate_subscription_workflow_key || undefined, <true></true>)}
                    {this.renderProductBlocks(product, productBlocks, readOnly)}
                    {this.renderFixedInputs(product, readOnly)}
                    {formDate("metadata.products.created_at", () => false, true,
                        product.start_date ? moment(product.start_date) : moment())}
                    {formDate("metadata.products.end_date", this.changeProperty("end_date"), readOnly,
                        product.end_date ? moment(product.end_date) : null, moment().add(100, "years"))}
                    {this.renderButtons(readOnly)}
                </section>
            </div>
        );
    }
}

Product.propTypes = {
    history: PropTypes.object.isRequired
};
