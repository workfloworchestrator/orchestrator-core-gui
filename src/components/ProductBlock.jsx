import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import ConfirmationDialog from "./ConfirmationDialog";

import {isEmpty, stop} from "../utils/Utils";
import {getParameterByName} from "../utils/QueryParameters";
import "./ProductBlock.css";
import {productBlock, resourceTypes, saveProductBlock} from "../api/index";
import {setFlash} from "../utils/Flash";
import Select from "react-select";

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
            productBlock: {},
            processing: false,
            resourceTypes: []
        };
    }

    componentDidMount() {
        const id = this.props.match.params.id;
        if (id !== "new") {
            const readOnly = getParameterByName("readOnly", window.location.search) === "true";
            productBlock(id).then(res => this.setState({productBlock: res, isNew: false, readOnly: readOnly}));
        }
        resourceTypes().then(res => this.setState({resourceTypes: res}));
    }

    cancel = e => {
        stop(e);
        this.setState({confirmationDialogOpen: true});
    };

    submit = e => {
        stop(e);
        const {productBlock, processing} = this.state;
        if (this.validate(productBlock) && !processing) {
            this.setState({processing: true});
            saveProductBlock(productBlock).then(res => {
                this.props.history.push("/metadata/product_blocks");
                setFlash(I18n.t("metadata.flash.created", {name: productBlock.name}));
            });

        }
    };

    renderButtons = () => {
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
        errors[name] = isEmpty(value);
        this.setState({errors: errors});
    };

    changeProperty = name => e => {
        const {productBlock} = this.state;
        productBlock[name] = e.target.value;
        this.setState({productBlock: productBlock});
    };

    addResourceType = option => {
        console.log("TODO");
    }

    renderResourceType = (productBlock, resourceTypes, readOnly) => {
        const avaliableResourceTypes = resourceTypes
            .filter(rt => !productBlock.resource_types.some(pbRt => rt.resource_type_id === pbRt.resource_type_id));
        return <section className="form-divider">
            <label htmlFor="name">{I18n.t("metadata.productBlocks.resourceTypes")}</label>
            <em>{I18n.t("metadata.productBloks.resourceTypes_info")}</em>

                {productBlock.resource_types.map(rt =>
                    <div className="resource-type">
                    <input type="text" id={rt.resource_type_id} name={rt.resource_type_id}
                           value={rt.resource_type}
                           disabled={true}/>
                    <i className="fa fa-minus" onClick={this.removeResourceType(rt.resource_type_id)}></i>
                    </div>
                )}
            <Select className="select-resource-type"
                    onChange={this.addResourceType}
                    options={avaliableResourceTypes.map(rt => ({value: rt.resource_type_id, label: rt.resource_type}))}
                    searchable={true}
                    placeholder="Add a Resource Type..."
                    disabled={readOnly || avaliableResourceTypes.length === 0}/>
        </section>
    } ;

    render() {
        const {
            confirmationDialogOpen, confirmationDialogAction, cancelDialogAction, productBlock,
            leavePage, readOnly
        } = this.state;
        return (
            <div className="mod-product-block">
                <ConfirmationDialog isOpen={confirmationDialogOpen}
                                    cancel={cancelDialogAction}
                                    confirm={confirmationDialogAction}
                                    leavePage={leavePage}/>
                <section className="card">
                    <section className="form-divider">
                        <label htmlFor="name">{I18n.t("metadata.productBlocks.name")}</label>
                        <em>{I18n.t("metadata.productBloks.name_info")}</em>
                        <input type="text" id="name" name="name" value={productBlock.name}
                               onChange={this.changeProperty("name")} onBlur={this.validateProperty("name")}
                               disabled={readOnly}/>
                        {this.state.errors["name"] &&
                        <em className="error">{I18n.t("process.format_error")}</em>}
                    </section>
                    <section className="form-divider">
                        <label htmlFor="description">{I18n.t("metadata.productBlocks.description")}</label>
                        <em>{I18n.t("metadata.productBloks.description_info")}</em>
                        <input type="text" id="description" name="description" value={productBlock.description}
                               onChange={this.changeProperty("description")}
                               onBlur={this.validateProperty("description")}
                               disabled={readOnly}/>
                        {this.state.errors["description"] &&
                        <em className="error">{I18n.t("process.format_error")}</em>}
                    </section>
                    {!readOnly && this.renderButtons()}
                </section>
            </div>
        );
    }
}

ProductBlock.propTypes = {
    history: PropTypes.object.isRequired
};
