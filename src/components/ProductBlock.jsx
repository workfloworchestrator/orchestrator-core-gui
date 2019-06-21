import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import ConfirmationDialog from "./ConfirmationDialog";

import { isEmpty, stop } from "../utils/Utils";
import { getParameterByName } from "../utils/QueryParameters";
import "./ProductBlock.scss";
import { productBlockById, productBlocks, resourceTypes, saveProductBlock } from "../api/index";
import { setFlash } from "../utils/Flash";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import * as moment from "moment";
import { formDate, formInput, formSelect } from "../forms/Builder";
import { deleteProductBlock } from "../api";

export default class ProductBlock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this.setState({ confirmationDialogOpen: false }),
            cancelDialogAction: () => this.props.history.push("/metadata/product_blocks"),
            confirmationDialogQuestion: "",
            leavePage: true,
            errors: {},
            required: ["name", "description"],
            duplicateName: false,
            initial: true,
            isNew: true,
            readOnly: false,
            productBlock: { resource_types: [], status: "active" },
            processing: false,
            resourceTypes: [],
            productBlocks: []
        };
    }

    componentDidMount() {
        const id = this.props.match.params.id;
        if (id !== "new") {
            const readOnly = getParameterByName("readOnly", window.location.search) === "true";
            productBlockById(id).then(res => this.setState({ productBlock: res, isNew: false, readOnly: readOnly }));
        }
        Promise.all([resourceTypes(), productBlocks()]).then(res =>
            this.setState({ resourceTypes: res[0], productBlocks: res[1] })
        );
    }

    cancel = e => {
        stop(e);
        this.setState({
            confirmationDialogOpen: true,
            leavePage: true,
            confirmationDialogAction: () => this.setState({ confirmationDialogOpen: false }),
            cancelDialogAction: () => this.props.history.push("/metadata/product_blocks")
        });
    };

    handleDeleteProductBlock = e => {
        stop(e);
        const { productBlock } = this.state;
        const question = I18n.t("metadata.deleteConfirmation", {
            type: "Product Block",
            name: productBlock.name
        });
        const action = () =>
            deleteProductBlock(productBlock.product_block_id)
                .then(() => {
                    this.props.history.push("/metadata/product_blocks");
                    setFlash(
                        I18n.t("metadata.flash.delete", {
                            type: "Product Block",
                            name: productBlock.name
                        })
                    );
                })
                .catch(err => {
                    if (err.response && err.response.status === 400) {
                        this.setState({ confirmationDialogOpen: false });
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
            cancelDialogAction: () => this.setState({ confirmationDialogOpen: false })
        });
    };

    submit = e => {
        stop(e);
        const { productBlock, processing } = this.state;
        const invalid = this.isInvalid(true) || processing;
        if (!invalid) {
            this.setState({ processing: true });
            saveProductBlock(productBlock).then(() => {
                this.props.history.push("/metadata/product_blocks");
                setFlash(
                    I18n.t(productBlock.product_block_id ? "metadata.flash.updated" : "metadata.flash.created", {
                        type: "Product Block",
                        name: productBlock.name
                    })
                );
            });
        } else {
            this.setState({ initial: false });
        }
    };

    renderButtons = (readOnly, initial, productBlock) => {
        if (readOnly) {
            return (
                <section className="buttons">
                    <button className="button" onClick={() => this.props.history.push("/metadata/product_blocks")}>
                        {I18n.t("metadata.productBlocks.back")}
                    </button>
                </section>
            );
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
                {productBlock.product_block_id && (
                    <button className="button red" onClick={this.handleDeleteProductBlock}>
                        {I18n.t("processes.delete")}
                    </button>
                )}
            </section>
        );
    };

    isInvalid = (markErrors = false) => {
        const { errors, required, productBlock, duplicateName } = this.state;
        const hasErrors = Object.keys(errors).some(key => errors[key]);
        const requiredInputMissing = required.some(attr => isEmpty(productBlock[attr]));
        if (markErrors) {
            const missing = required.filter(attr => isEmpty(productBlock[attr]));
            const newErrors = { ...errors };
            missing.forEach(attr => (newErrors[attr] = true));
            this.setState({ errors: newErrors });
        }

        return hasErrors || requiredInputMissing || duplicateName;
    };

    validateProperty = name => e => {
        const value = e.target.value;
        const errors = { ...this.state.errors };
        const { productBlock } = this.state;
        if (name === "name") {
            const nbr = this.state.productBlocks.filter(p => p.name === value).length;
            const duplicate = productBlock.product_block_id ? nbr === 2 : nbr === 1;
            errors[name] = duplicate;
            this.setState({ duplicateName: duplicate });
        }
        errors[name] = isEmpty(value);
        this.setState({ errors: errors });
    };

    changeProperty = name => e => {
        const { productBlock } = this.state;
        let value;
        if (isEmpty(e) || e._isAMomentObject) {
            value = e;
        } else {
            value = e.target ? e.target.value : e.value;
        }
        productBlock[name] = value;
        this.setState({ productBlock: productBlock });
    };

    addResourceType = option => {
        const { productBlock, resourceTypes } = this.state;
        const newResourceType = resourceTypes.find(rt => rt.resource_type_id === option.value);
        productBlock.resource_types.push(newResourceType);
        this.setState({ productBlock: productBlock });
    };

    removeResourceType = resource_type_id => e => {
        stop(e);
        const { productBlock } = this.state;
        productBlock.resource_types = productBlock.resource_types.filter(
            rt => rt.resource_type_id !== resource_type_id
        );
        this.setState({ productBlock: productBlock });
    };

    renderResourceTypes = (productBlock, resourceTypes, readOnly) => {
        const availableResourceTypes = resourceTypes.filter(
            rt => !productBlock.resource_types.some(pbRt => rt.resource_type_id === pbRt.resource_type_id)
        );
        return (
            <section className="form-divider">
                <label htmlFor="name">{I18n.t("metadata.productBlocks.resourceTypes")}</label>
                <em>{I18n.t("metadata.productBlocks.resourceTypes_info")}</em>
                <div className="child-form">
                    {productBlock.resource_types.map(rt => (
                        <div key={rt.resource_type_id} className="resource-type">
                            <input
                                type="text"
                                id={rt.resource_type_id}
                                name={rt.resource_type_id}
                                value={`${rt.resource_type.toUpperCase()} - ${rt.description}`}
                                disabled={true}
                            />
                            <i className="fa fa-minus" onClick={this.removeResourceType(rt.resource_type_id)} />
                        </div>
                    ))}
                    {!readOnly && (
                        <Select
                            className="select-resource-type"
                            onChange={this.addResourceType}
                            options={availableResourceTypes.map(rt => ({
                                value: rt.resource_type_id,
                                label: `${rt.resource_type.toUpperCase()} - ${rt.description}`
                            }))}
                            isSearchable={true}
                            isClearable={false}
                            placeholder={
                                availableResourceTypes.length > 0
                                    ? I18n.t("metadata.productBlocks.select_add_resource_type")
                                    : I18n.t("metadata.productBlocks.select_no_more_resource_types")
                            }
                            isDisabled={readOnly || availableResourceTypes.length === 0}
                        />
                    )}
                </div>
            </section>
        );
    };

    render() {
        const {
            confirmationDialogOpen,
            confirmationDialogAction,
            cancelDialogAction,
            productBlock,
            leavePage,
            readOnly,
            resourceTypes,
            duplicateName,
            initial,
            confirmationDialogQuestion
        } = this.state;
        const endDate = isEmpty(productBlock.end_date)
            ? null
            : productBlock.end_date._isAMomentObject
            ? productBlock.end_date
            : moment(productBlock.end_date * 1000);
        return (
            <div className="mod-product-block">
                <ConfirmationDialog
                    isOpen={confirmationDialogOpen}
                    cancel={cancelDialogAction}
                    confirm={confirmationDialogAction}
                    leavePage={leavePage}
                    question={confirmationDialogQuestion}
                />
                <section className="card">
                    {formInput(
                        "metadata.productBlocks.name",
                        "name",
                        productBlock.name || "",
                        readOnly,
                        this.state.errors,
                        this.changeProperty("name"),
                        this.validateProperty("name"),
                        duplicateName ? I18n.t("metadata.productBlocks.duplicate_name") : null
                    )}
                    {formInput(
                        "metadata.productBlocks.description",
                        "description",
                        productBlock.description || "",
                        readOnly,
                        this.state.errors,
                        this.changeProperty("description"),
                        this.validateProperty("description")
                    )}
                    {formInput(
                        "metadata.productBlocks.tag",
                        "tag",
                        productBlock.tag || "",
                        readOnly,
                        this.state.errors,
                        this.changeProperty("tag"),
                        () => true
                    )}
                    {formSelect(
                        "metadata.productBlocks.status",
                        this.changeProperty("status"),
                        ["active", "phase out", "pre production", "end of life"],
                        readOnly,
                        productBlock.status || "active"
                    )}
                    {this.renderResourceTypes(productBlock, resourceTypes, readOnly)}
                    {formDate(
                        "metadata.productBlocks.created_at",
                        () => false,
                        true,
                        productBlock.created_at ? moment(productBlock.created_at * 1000) : moment()
                    )}
                    {formDate(
                        "metadata.productBlocks.end_date",
                        this.changeProperty("end_date"),
                        readOnly,
                        endDate,
                        moment().add(100, "years")
                    )}
                    {this.renderButtons(readOnly, initial, productBlock)}
                </section>
            </div>
        );
    }
}

ProductBlock.propTypes = {
    history: PropTypes.object.isRequired
};
