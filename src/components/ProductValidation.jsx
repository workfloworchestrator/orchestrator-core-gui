import React from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";

import "./ProductValidation.css";
import {capitalize} from "../utils/Lookups";
import {isEmpty} from "../utils/Utils";

export default class ProductValidation extends React.PureComponent {

    renderError = (error, index, productName) => {
        const blockMissing = error.error === "block_missing";
        const blockName = blockMissing ? error.name : error.block;
        const errorName = I18n.t("validations.error_name", {name: blockName});
        const errorDescription = blockMissing ?
            I18n.t("validations.block_missing", {name: blockName, product: productName}) :
            I18n.t("validations.resource_type_missing", {name: error.name, block: blockName});
        return (
            <tr key={index}>
                <td dangerouslySetInnerHTML={{__html: errorName}}
                    className="name"></td>
                <td dangerouslySetInnerHTML={{__html: errorDescription}}
                    className="description"></td>
            </tr>
        );
    };
    renderErrors = (errors, productName) => <section className="product-errors">
        <table>
            <thead>
            <tr>
                <th colSpan="2">{I18n.t("validations.errors")}</th>
            </tr>
            </thead>
            <tbody>
            {errors.map((error, index) => this.renderError(error, index, productName))}
            </tbody>
        </table>

    </section>;

    renderResourceType = (key, value, index) => <tr key={`${key}_${index}`}>
        {index === 0 && <td className="title">{I18n.t("validations.resource_type")} </td>}
        {index === 1 && <td className="resource-type-sub">{I18n.t("validations.resource_type_sub")}</td>}
        {index > 1 && <td></td>}
        <td className="resource-type"><span className="workflow-resource-id">{key}</span>
            <i className="fa fa-arrow-right"></i>
            <span className="resource-type-id">{value}</span>
        </td>
    </tr>;

    renderProductBlock = (mapping, name) => {
        const resourceTypes = mapping[name];
        //resourceTypes is an array of Objects we want to flatten to one keys-values Object
        const resourceTypesContainer = {};
        resourceTypes.reduce((acc, rt) => {
            Object.keys(rt).reduce((innerAcc, key) => {
                innerAcc[key] = rt[key];
                return innerAcc;
            }, resourceTypesContainer);
            return resourceTypesContainer;
        }, resourceTypesContainer);

        let resourceTypeKeys = Object.keys(resourceTypesContainer);
        return (
            <tbody className="product-block" key={name}>
            <tr>
                <td className="title">{I18n.t("validations.product_block")}</td>
                <td className="product-block-name">{name}</td>
            </tr>
            {resourceTypeKeys.map((key, index) =>
                this.renderResourceType(key, resourceTypesContainer[key], index))}
            {resourceTypeKeys.length === 1 && <tr>
                <td className="resource-type-sub">{I18n.t("validations.resource_type_sub")}</td>
                <td></td>
            </tr>}
            </tbody>
        )
    };

    renderMapping = (mapping, workflowName) => {
        const productsBlocks = Object.keys(mapping);
        const hasMapping = !isEmpty(productsBlocks);
        return <section className="product-mapping">
            <table>
                <thead>
                <tr>
                    <th colSpan="2" className="validations-mapping-title">
                        <i className="fa fa-cog"></i>{I18n.t("validations.mapping")}
                    </th>
                </tr>
                </thead>
                {hasMapping && productsBlocks.map(block => this.renderProductBlock(mapping, block))}
                {!hasMapping && <tr>
                    <td colSpan={2} className="no-mapping">{I18n.t("validations.no_mapping", {name: workflowName})}</td>
                </tr>}
            </table>

        </section>;
    };

    renderProductInfo = validation => <section className="product-info">
        <table>
            <thead>
            <tr>
                <th colSpan="2">{I18n.t("validations.product")}</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td className="title">{I18n.t("validations.name")}</td>
                <td>{validation.product.name}</td>
            </tr>
            <tr>
                <td className="title">{I18n.t("validations.description")}</td>
                <td>{validation.product.description}</td>
            </tr>
            <tr>
                <td className="title">{I18n.t("validations.workflow")}</td>
                <td>{validation.product.workflow}</td>
            </tr>
            <tr>
                <td className="title">{I18n.t("validations.valid")}</td>
                <td>{capitalize(validation.valid.toString())}</td>
            </tr>
            </tbody>
        </table>
    </section>;


    render() {
        const {validation} = this.props;
        const iconClassname = validation.valid ? "fa-check" : "fa-exclamation-triangle";
        return (
            <section className="validation-container">
                <section className="validation">
                    <section className="status">
                        <i className={`fa ${iconClassname}`}></i>
                    </section>
                    {this.renderProductInfo(validation)}
                    {this.renderMapping(validation.mapping, validation.product.workflow)}
                </section>
                {!isEmpty(validation.errors) && this.renderErrors(validation.errors, validation.product.name)}
            </section>);
    }
}

ProductValidation.propTypes = {
    validation: PropTypes.object.isRequired
};

