import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import ConfirmationDialog from "./ConfirmationDialog";

import {isEmpty, stop} from "../utils/Utils";
import {getParameterByName} from "../utils/QueryParameters";
import "./ProductBlock.css";
import {productBlockById, productBlocks, resourceTypes, saveProductBlock} from "../api/index";
import {setFlash} from "../utils/Flash";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import * as moment from "moment";
import {formDate, formInput, formSelect} from "../forms/Builder"


export default class ProductBlock extends React.Component {

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
            productBlock: {resource_types: []},
            processing: false,
            resourceTypes: [],
            productBlocks: []
        };
    }

    componentDidMount() {
        const id = this.props.match.params.id;
        if (id !== "new") {
            const readOnly = getParameterByName("readOnly", window.location.search) === "true";
            productBlockById(id).then(res => this.setState({productBlock: res, isNew: false, readOnly: readOnly}));
        }
        Promise.all([resourceTypes(), productBlocks()])
            .then(res => this.setState({resourceTypes: res[0], productBlocks: res[1]}));
    }

    cancel = e => {
        stop(e);
        this.setState({confirmationDialogOpen: true});
    };

    submit = e => {
        stop(e);
        const {productBlock, processing} = this.state;
        const invalid = this.isInvalid() || processing;
        if (!invalid) {
            this.setState({processing: true});
            saveProductBlock(productBlock).then(() => {
                this.props.history.push("/metadata/product_blocks");
                setFlash(I18n.t(productBlock.product_block_id ? "metadata.flash.updated" : "metadata.flash.created",
                    {type: "Product Block", name: productBlock.name}));
            });

        }
    };

    renderButtons = (readOnly) => {
        if (readOnly) {
            return (<section className="buttons">
                <a className="button" onClick={() => this.props.history.push("/metadata/product_blocks")}>
                    {I18n.t("metadata.productBlocks.back")}
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
            errors[name] = this.state.productBlocks.some(p => p.name === value)
        }
        errors[name] = isEmpty(value);
        this.setState({errors: errors});
    };

    changeProperty = name => e => {
        const {productBlock} = this.state;
        productBlock[name] = e.target ? e.target.value : e.value;
        this.setState({productBlock: productBlock});
    };

    addResourceType = option => {
        const {productBlock, resourceTypes} = this.state;
        const newResourceType = resourceTypes.find(rt => rt.resource_type_id === option.value);
        productBlock.resource_types.push(newResourceType);
        this.setState({productBlock: productBlock});
    };

    removeResourceType = resource_type_id => e => {
        stop(e);
        const {productBlock} = this.state;
        productBlock.resource_types = productBlock.resource_types.filter(rt => rt.resource_type_id !== resource_type_id);
        this.setState({productBlock: productBlock});
    };

    renderResourceTypes = (productBlock, resourceTypes, readOnly) => {
        const availableResourceTypes = resourceTypes
            .filter(rt => !productBlock.resource_types.some(pbRt => rt.resource_type_id === pbRt.resource_type_id));
        return (
            <section className="form-divider">
                <label htmlFor="name">{I18n.t("metadata.productBlocks.resourceTypes")}</label>
                <em>{I18n.t("metadata.productBlocks.resourceTypes_info")}</em>
                <div className="child-form">
                    {productBlock.resource_types.map(rt =>
                        <div key={rt.resource_type_id} className="resource-type">
                            <input type="text" id={rt.resource_type_id} name={rt.resource_type_id}
                                   value={`${rt.resource_type.toUpperCase()} - ${rt.description}`}
                                   disabled={true}/>
                            <i className="fa fa-minus" onClick={this.removeResourceType(rt.resource_type_id)}></i>
                        </div>
                    )}
                    {!readOnly && <Select className="select-resource-type"
                                          onChange={this.addResourceType}
                                          options={availableResourceTypes.map(rt => ({
                                              value: rt.resource_type_id,
                                              label: `${rt.resource_type.toUpperCase()} - ${rt.description}`
                                          }))}
                                          searchable={true}
                                          clearable={false}
                                          placeholder={availableResourceTypes.length > 0 ?
                                              I18n.t("metadata.productBlocks.select_add_resource_type") :
                                              I18n.t("metadata.productBlocksw.select_no_more_resource_types")}
                                          disabled={readOnly || availableResourceTypes.length === 0}/>}
                </div>
            </section>);
    };

    render() {
        const {
            confirmationDialogOpen, confirmationDialogAction, cancelDialogAction, productBlock,
            leavePage, readOnly, resourceTypes
        } = this.state;
        return (
            <div className="mod-product-block">
                <ConfirmationDialog isOpen={confirmationDialogOpen}
                                    cancel={cancelDialogAction}
                                    confirm={confirmationDialogAction}
                                    leavePage={leavePage}/>
                <section className="card">
                    {formInput("metadata.productBlocks.name", "name", productBlock.name || "", readOnly,
                        this.state.errors, this.changeProperty("name"), this.validateProperty("name"))}
                    {formInput("metadata.productBlocks.description", "description", productBlock.description || "", readOnly,
                        this.state.errors, this.changeProperty("description"), this.validateProperty("description"))}
                    {formInput("metadata.productBlocks.tag", "tag", productBlock.tag || "", readOnly,
                        this.state.errors, this.changeProperty("tag"), this.validateProperty("tag"))}
                    {formSelect("metadata.productBlocks.status", this.changeProperty("status"),
                        ["active", "phase out", "pre production", "end of life"], readOnly,
                        productBlock.status || "active")}
                    {this.renderResourceTypes(productBlock, resourceTypes, readOnly)}
                    {formDate("metadata.productBlocks.create_date", () => false, true,
                        productBlock.create_date ? moment(productBlock.create_date) : moment())}
                    {formDate("metadata.productBlocks.end_date", this.changeProperty("end_date"), readOnly,
                        productBlock.end_date ? moment(productBlock.end_date) : moment().add(100, "years"))}
                    {this.renderButtons(readOnly)}
                </section>
            </div>
        );
    }
}

ProductBlock.propTypes = {
    history: PropTypes.object.isRequired
};
