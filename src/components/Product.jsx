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
import CheckBox from "../components/CheckBox";
import "./Product.scss";
import {deleteProduct, fixedInputConfiguration, productStatuses, productTags, productTypes} from "../api";
import {TARGET_CREATE, TARGET_MODIFY, TARGET_TERMINATE} from "../validations/Products";

const TAG_LIGHTPATH = "LightPath";

export default class Product extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this.setState({confirmationDialogOpen: false}),
            cancelDialogAction: () => this.props.history.push("/metadata/products"),
            confirmationDialogQuestion: "",
            leavePage: true,
            errors: {},
            required: ["name", "description", "status", "product_type", "tag"],
            initial: true,
            readOnly: false,
            product: {
                product_blocks: [], fixed_inputs: [], workflows: [],
                status: "active", product_type: "Port", tag: "LightPath"
            },
            processing: false,
            productBlocks: [],
            products: [],
            workflows: [],
            tags: [],
            types: [],
            statuses: [],
            duplicateName: false,
            allowedFixedInputs: [],
            fixedInputConf: {"by_tag": {}, "fixed_inputs": {}}
        };
    }

    componentDidMount() {
        const id = this.props.match.params.id;
        const isExistingProduct = id !== "new";
        if (isExistingProduct) {
            const readOnly = getParameterByName("readOnly", window.location.search) === "true";
            const clone = id === "clone";
            productById(clone ? getParameterByName("productId", window.location.search) : id).then(product => {
                if (clone) {
                    delete product.name;
                    delete product.product_id;
                    delete product.created_at;
                    (product.fixed_inputs || []).forEach(fixedInput => {
                        delete fixedInput.created_at;
                        delete fixedInput.fixed_input_id;
                        delete fixedInput.product_id;
                    });
                }
                this.setState({product: product, readOnly: readOnly});
                this.fetchAllConstants(product.tag);
            });
        } else {
            this.fetchAllConstants(TAG_LIGHTPATH);
        }

    }

    fetchAllConstants = productTag =>
        Promise.all([productBlocks(), allWorkflows(), products(), productTags(), productTypes(), productStatuses(), fixedInputConfiguration()])
            .then(res => this.setState({
                    productBlocks: res[0],
                    workflows: res[1],
                    products: res[2],
                    tags: res[3],
                    types: res[4],
                    statuses: res[5],
                    fixedInputConf: res[6],
                    allowedFixedInputs: this.determineAllowedFixedInputs(productTag, res[6])
                })
            );

    determineAllowedFixedInputs = (productTag, fixedInputConf) => {
        const ourTag = Object.keys(fixedInputConf.by_tag).find(tag => tag === productTag);
        if (isEmpty(ourTag)) {
            return this.state.allowedFixedInputs
        }
        const inputs = fixedInputConf.by_tag[ourTag].map(fi => {
            const name = Object.keys(fi)[0];
            const required = fi[name];
            const cfi = fixedInputConf.fixed_inputs.find(f => f.name === name);
            cfi.required = required;
            return cfi;
        });
        return inputs;

    };

    cancel = e => {
        stop(e);
        this.setState({
            confirmationDialogOpen: true, leavePage: true,
            confirmationDialogAction: () => this.setState({confirmationDialogOpen: false}),
            cancelDialogAction: () => this.props.history.push("/metadata/products")
        });
    };

    handleDeleteProduct = e => {
        stop(e);
        const {product} = this.state;
        const question = I18n.t("metadata.deleteConfirmation", {
            type: "Product",
            name: product.name
        });
        const action = () => deleteProduct(product.product_id)
            .then(() => {
                this.props.history.push("/metadata/products");
                setFlash(I18n.t("metadata.flash.delete", {name: product.name, type: "Product"}));
            }).catch(err => {
                if (err.response && err.response.status === 400) {
                    this.setState({confirmationDialogOpen: false});
                    err.response.json().then(json => setFlash(json["error"], "error"));
                } else {
                    throw err;
                }
            });
        this.setState({
            confirmationDialogOpen: true,
            confirmationDialogQuestion: question,
            leavePage: false,
            confirmationDialogAction: action,
            cancelDialogAction: () => this.setState({confirmationDialogOpen: false})
        });
    };

    submit = e => {
        stop(e);
        const {product, processing} = this.state;
        const invalid = this.isInvalid(true) || processing;
        if (!invalid) {
            this.setState({processing: true});
            saveProduct(product).then(() => {
                this.props.history.push("/metadata/products");
                setFlash(I18n.t(product.product_id ? "metadata.flash.updated" : "metadata.flash.created",
                    {type: "Product", name: product.name}));
            });
        } else {
            this.setState({initial: false});
        }
    };

    renderButtons = (readOnly, initial, product) => {
        if (readOnly) {
            return (<section className="buttons">
                <button className="button" onClick={() => this.props.history.push("/metadata/products")}>
                    {I18n.t("metadata.products.back")}
                </button>
            </section>);
        }
        const invalid = !initial && (this.isInvalid() || this.state.processing);
        return (
            <section className="buttons">
                <button className="button" onClick={this.cancel}>
                    {I18n.t("process.cancel")}
                </button>
                <button tabIndex={0} className={`button ${invalid ? "grey disabled" : "blue"}`} onClick={this.submit}>
                    {I18n.t("process.submit")}
                </button>
                {product.product_id && <button className="button red" onClick={this.handleDeleteProduct}>
                    {I18n.t("processes.delete")}
                </button>}
            </section>
        );
    };

    isInvalid = (markErrors = false) => {
        const {errors, required, product, duplicateName} = this.state;
        const hasErrors = Object.keys(errors).some(key => errors[key]);
        const requiredInputMissing = required.some(attr => isEmpty(product[attr]));
        if (markErrors) {
            const missing = required.filter(attr => isEmpty(product[attr]));
            const newErrors = {...errors};
            missing.forEach(attr => newErrors[attr] = true);
            this.setState({errors: newErrors});
        }
        return hasErrors || requiredInputMissing || duplicateName;
    };

    validateProperty = name => e => {
        const value = e.target.value;
        const errors = {...this.state.errors};
        const {product} = this.state;
        if (name === "name") {
            const nbr = this.state.products.filter(p => p.name === value).length;
            const duplicate = product.product_id ? nbr === 2 : nbr === 1;
            errors[name] = duplicate;
            this.setState({duplicateName: duplicate});
        }
        errors[name] = isEmpty(value);
        this.setState({errors: errors});
    };

    changeWorkflow = (target, multi = false) => option => {
        const {product, workflows} = this.state;
        const otherWorkflows = product.workflows.filter(wf => wf.target !== target);
        if (isEmpty(option)) {
            product.workflows = [...otherWorkflows];
        } else if (multi) {
            const names = option.map(opt => opt.value);
            product.workflows = workflows.filter(wf => names.indexOf(wf.name) > -1).concat(otherWorkflows);
        } else {
            product.workflows = [workflows.find(wf => wf.name === option.value)].concat(otherWorkflows);
        }
        this.setState({product: product});
    };


    changeProperty = name => e => {
        const {product, fixedInputConf} = this.state;
        let value;
        if (isEmpty(e) || e._isAMomentObject) {
            value = e;
        } else {
            value = e.target ? e.target.value : e.value;
        }
        product[name] = value;
        this.setState({product: product});
        if (name === "tag") {
            this.determineAllowedFixedInputs(value, fixedInputConf)
        }
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

    addFixedInput = allowedFixedInputs => option => {
        const product = {...this.state.product};
        const fi = allowedFixedInputs.find(fi => fi.name === option.value);
        product.fixed_inputs.push({name: fi.name, value: fi.values[0]});
        this.setState({product: product});
    };

    fixedInputValueChanged = (index) => option => {
        const product = {...this.state.product};
        const newValue = option.value;
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
        .map(wf => ({label: wf.description, value: wf.name}));

    workFlowByTarget = (product, target, multiValues = false) => {
        const workflows = product.workflows.filter(wf => wf.target === target).map(wf => wf.name);
        return multiValues ? workflows : isEmpty(workflows) ? undefined : workflows[0];
    };

    renderSingleFixedInput = (fixedInput, index, allowedFixedInputs, readOnly) => {
        const fixedInputConf = allowedFixedInputs.find(fi => fi.name === fixedInput.name);
        const values = fixedInputConf ? fixedInputConf.values : [];
        const required = fixedInputConf ? fixedInputConf.required : true;
        return (
            <div key={index} className="fixed-input">
                <div className="wrapper">
                    {index === 0 && <label>{I18n.t("metadata.products.fixed_inputs_name")}</label>}
                    <input type="text"
                           value={fixedInput.name}
                           disabled={true}/>
                </div>
                <div className="wrapper">
                    {index === 0 && <label>{I18n.t("metadata.products.fixed_inputs_value")}</label>}
                    <Select className="select-fixed-input-value"
                            onChange={this.fixedInputValueChanged(index)}
                            options={values.map(val => ({value: val, label: val}))}
                            searchable={false}
                            value={fixedInput.value}
                            clearable={false}
                            disabled={readOnly}/>
                </div>
                {!required && <i className="fa fa-minus first" onClick={this.removeFixedInput(index)}></i>}
            </div>

        );
    };

    renderFixedInputs = (product, readOnly) => {
        const fixedInputs = product.fixed_inputs;
        const {allowedFixedInputs} = this.state;
        const availableFixedInputs = allowedFixedInputs
            .filter(afi => !fixedInputs.some(fi => afi.name === fi.name));
        return (
            <section className="form-divider">
                <label>{I18n.t("metadata.products.fixed_inputs")}</label>
                <em>{I18n.t("metadata.products.fixed_inputs_info")}</em>
                <div className="child-form">
                    {fixedInputs.map((fv, index) => this.renderSingleFixedInput(fv, index, allowedFixedInputs, readOnly))}

                    {!readOnly && <Select className="select-fixed-input"
                                          onChange={this.addFixedInput(allowedFixedInputs)}
                                          options={availableFixedInputs.map(fi => ({
                                              value: fi.name,
                                              label: fi.name
                                          }))}
                                          searchable={false}
                                          clearable={false}
                                          placeholder={availableFixedInputs.length > 0 ?
                                              I18n.t("metadata.products.select_add_fixed_input") :
                                              I18n.t("metadata.products.select_no_more_fixed_inputs")}
                                          disabled={readOnly || availableFixedInputs.length === 0}/>}
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

    renderHasDienstAfname = (has_dienstafname_value, readOnly) => {
       return (
           <div>
           <label htmlFor="name">{I18n.t("metadata.products.has_dienstafname")}</label>
               <em>{I18n.t("metadata.products.has_dienstafname_info")}</em>
               <CheckBox value={has_dienstafname_value || false} name="has_dienstafname" readOnly={readOnly} onChange={this.changeHasDienstafname}/>
           </div>
       )
    };

    changeHasDienstafname = e => {
        const {product} = this.state;
        const value = e.target.checked;
        product.has_dienstafname = value
        this.setState({product: product});
    };


    render() {
        const {
            confirmationDialogOpen, confirmationDialogAction, cancelDialogAction, product,
            leavePage, readOnly, productBlocks, workflows, duplicateName, initial,
            confirmationDialogQuestion, tags, types, statuses
        } = this.state;
        const endDate = isEmpty(product.end_date) ? null : product.end_date._isAMomentObject ?
            product.end_date : moment(product.end_date * 1000);
        return (
            <div className="mod-product">
                <ConfirmationDialog isOpen={confirmationDialogOpen}
                                    cancel={cancelDialogAction}
                                    confirm={confirmationDialogAction}
                                    leavePage={leavePage}
                                    question={confirmationDialogQuestion}/>
                <section className="card">
                    {formInput("metadata.products.name", "name", product.name || "", readOnly,
                        this.state.errors, this.changeProperty("name"), this.validateProperty("name"),
                        duplicateName ? I18n.t("metadata.products.duplicate_name") : null)}
                    {formInput("metadata.products.description", "description", product.description || "", readOnly,
                        this.state.errors, this.changeProperty("description"), this.validateProperty("description"))}
                    {formSelect("metadata.products.tag", this.changeProperty("tag"),
                        tags, readOnly, product.tag || TAG_LIGHTPATH)}
                    {formSelect("metadata.products.product_type", this.changeProperty("product_type"),
                        types, readOnly, product.product_type || "Port")}
                    {formSelect("metadata.products.status", this.changeProperty("status"),
                        statuses, readOnly,
                        product.status || "active")}
                    {this.renderHasDienstAfname(product.has_dienstafname, false)}
                    {formSelect("metadata.products.create_subscription_workflow_key",
                        this.changeWorkflow(TARGET_CREATE),
                        this.workFlowKeys(TARGET_CREATE, workflows), readOnly,
                        this.workFlowByTarget(product, TARGET_CREATE), true)}
                    {formSelect("metadata.products.modify_subscription_workflow_key",
                        this.changeWorkflow(TARGET_MODIFY, true),
                        this.workFlowKeys(TARGET_MODIFY, workflows), readOnly,
                        this.workFlowByTarget(product, TARGET_MODIFY, true), true, true)}
                    {formSelect("metadata.products.terminate_subscription_workflow_key",
                        this.changeWorkflow(TARGET_TERMINATE),
                        this.workFlowKeys(TARGET_TERMINATE, workflows), readOnly,
                        this.workFlowByTarget(product, TARGET_TERMINATE), true)}
                    {this.renderProductBlocks(product, productBlocks, readOnly)}
                    {this.renderFixedInputs(product, readOnly)}
                    {formDate("metadata.products.created_at", () => false, true,
                        product.created_at ? moment(product.created_at * 1000) : moment())}
                    {formDate("metadata.products.end_date", this.changeProperty("end_date"), readOnly,
                        endDate, moment().add(100, "years"))}
                    {this.renderButtons(readOnly, initial, product)}
                </section>
            </div>
        );
    }
}

Product.propTypes = {
    history: PropTypes.object.isRequired
};
