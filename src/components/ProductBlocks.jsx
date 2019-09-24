/*
 * Copyright 2019 SURF.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import React from "react";
import I18n from "i18n-js";
import debounce from "lodash/debounce";
import { isEmpty, stop } from "../utils/Utils";
import ConfirmationDialog from "../components/ConfirmationDialog";

import "./ProductBlocks.scss";
import DropDownActions from "../components/DropDownActions";
import { setFlash } from "../utils/Flash";
import { renderDateTime } from "../utils/Lookups";
import { deleteProductBlock, productBlocks } from "../api/index";
import ApplicationContext from "../utils/ApplicationContext";
export default class ProductBlocks extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            productBlocks: [],
            filteredProductBlocks: [],
            query: "",
            actions: { show: false, id: "" },
            sorted: { name: "name", descending: true },
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this,
            confirm: () => this,
            confirmationDialogQuestion: "",
            refresh: true
        };
    }

    componentDidMount() {
        productBlocks().then(res => {
            res.forEach(
                pb => (pb.resource_types_string = (pb.resource_types || []).map(rt => rt.resource_type).join(", "))
            );
            res = res.sort(this.sortBy(this.state.sorted.name));
            this.setState({ productBlocks: res, filteredProductBlocks: res });
        });
    }

    cancelConfirmation = () => this.setState({ confirmationDialogOpen: false });

    editProductBlock = (productBlock, readOnly = true, newProductBlock = false) => () => {
        this.context.redirect(
            `/product-block/${newProductBlock ? "new" : productBlock.product_block_id}?readOnly=${readOnly}`
        );
    };

    search = e => {
        const query = e.target.value;
        this.setState({ query: query });
        this.delayedSearch(query);
    };

    doSearchAndSort = (query, productBlocks, sorted) => {
        if (!isEmpty(query)) {
            const queryToLower = query.toLowerCase();
            const searchable = ["name", "description", "tag", "status", "resource_types_string"];
            productBlocks = productBlocks.filter(pb =>
                searchable
                    .filter(search => pb[search])
                    .map(search => pb[search].toLowerCase().indexOf(queryToLower))
                    .some(indexOf => indexOf > -1)
            );
        }
        productBlocks.sort(this.sortBy(sorted.name));
        return sorted.descending ? productBlocks.reverse() : productBlocks;
    };

    delayedSearch = debounce(query => {
        const productBlocks = [...this.state.productBlocks];
        this.setState({
            query: query,
            filteredProductBlocks: this.doSearchAndSort(query, productBlocks, this.state.sorted)
        });
    }, 250);

    toggleActions = (productBlock, actions) => e => {
        stop(e);
        const newShow = actions.id === productBlock.product_block_id ? !actions.show : true;
        this.setState({
            actions: { show: newShow, id: productBlock.product_block_id }
        });
    };

    handleDeleteProductBlock = productBlock => e => {
        stop(e);
        this.confirmation(
            I18n.t("metadata.deleteConfirmation", {
                type: "Product Block",
                name: productBlock.name
            }),
            () =>
                deleteProductBlock(productBlock.product_block_id)
                    .then(() => {
                        this.componentDidMount();
                        setFlash(
                            I18n.t("metadata.flash.delete", {
                                name: productBlock.name,
                                type: "Product Block"
                            })
                        );
                    })
                    .catch(err => {
                        if (err.response && err.response.status === 400) {
                            err.response.json().then(json => setFlash(json["error"], "error"));
                        } else {
                            throw err;
                        }
                    })
        );
    };

    confirmation = (question, action) =>
        this.setState({
            confirmationDialogOpen: true,
            confirmationDialogQuestion: question,
            confirmationDialogAction: () => {
                this.cancelConfirmation();
                action();
            }
        });

    renderActions = (productBlock, actions) => {
        const actionId = productBlock.product_block_id;
        if (actions.id !== actionId || (actions.id === actionId && !actions.show)) {
            return null;
        }
        const view = {
            icon: "fa fa-search-plus",
            label: "view",
            action: this.editProductBlock(productBlock, true, false)
        };
        const edit = {
            icon: "fa fa-pencil-square-o",
            label: "edit",
            action: this.editProductBlock(productBlock, false, false)
        };
        const _delete = {
            icon: "fa fa-trash",
            label: "delete",
            action: this.handleDeleteProductBlock(productBlock),
            danger: true
        };
        const options = [view, edit, _delete];
        return <DropDownActions options={options} i18nPrefix="metadata.productBlocks" />;
    };

    sortBy = name => (a, b) => {
        const aSafe = a[name] || "";
        const bSafe = b[name] || "";
        return typeof aSafe === "string" ? aSafe.toLowerCase().localeCompare(bSafe.toLowerCase()) : aSafe - bSafe;
    };

    sort = name => e => {
        stop(e);
        const sorted = { ...this.state.sorted };
        const filteredProductBlocks = [...this.state.filteredProductBlocks].sort(this.sortBy(name));

        sorted.descending = sorted.name === name ? !sorted.descending : false;
        sorted.name = name;
        this.setState({
            filteredProductBlocks: sorted.descending ? filteredProductBlocks.reverse() : filteredProductBlocks,
            sorted: sorted
        });
    };

    filter = item => {
        const { filteredProductBlocks, sorted, query } = this.state;
        this.setState({
            filteredProductBlocks: this.doSearchAndSort(query, filteredProductBlocks, sorted)
        });
    };

    sortColumnIcon = (name, sorted) => {
        if (sorted.name === name) {
            return <i className={sorted.descending ? "fa fa-sort-desc" : "fa fa-sort-asc"} />;
        }
        return <i />;
    };

    renderProductBlocks(productBlocks, actions, sorted) {
        const columns = ["name", "description", "status", "tag", "resource_types", "created_at", "actions"];
        const th = index => {
            const name = columns[index];
            return (
                <th key={index} className={name} onClick={this.sort(name)}>
                    <span>{I18n.t(`metadata.productBlocks.${name}`)}</span>
                    {this.sortColumnIcon(name, sorted)}
                </th>
            );
        };

        if (productBlocks.length !== 0) {
            return (
                <table className="product-blocks">
                    <thead>
                        <tr>{columns.map((column, index) => th(index))}</tr>
                    </thead>
                    <tbody>
                        {productBlocks.map((productBlock, index) => (
                            <tr
                                key={`${productBlock.product_block_id}_${index}`}
                                onClick={this.editProductBlock(productBlock, false, false)}
                                className={productBlock.status}
                            >
                                <td data-label={I18n.t("metadata.productBlocks.name")} className="name">
                                    {productBlock.name}
                                </td>
                                <td data-label={I18n.t("metadata.productBlocks.description")} className="description">
                                    {productBlock.description}
                                </td>
                                <td data-label={I18n.t("metadata.productBlocks.status")} className="status">
                                    {productBlock.status}
                                </td>
                                <td data-label={I18n.t("metadata.productBlocks.tag")} className="tag">
                                    {productBlock.tag}
                                </td>
                                <td
                                    data-label={I18n.t("metadata.productBlocks.resource_types")}
                                    className="resource_types"
                                >
                                    {productBlock.resource_types.map(rt => rt.resource_type).join(", ")}
                                </td>
                                <td data-label={I18n.t("metadata.productBlocks.created_at")} className="started">
                                    {renderDateTime(productBlock.created_at)}
                                </td>
                                <td
                                    data-label={I18n.t("metadata.productBlocks.actions")}
                                    className="actions"
                                    onClick={this.toggleActions(productBlock, actions)}
                                    tabIndex="1"
                                    onBlur={() => this.setState({ actions: { show: false, id: "" } })}
                                >
                                    <i className="fa fa-ellipsis-h" />
                                    {this.renderActions(productBlock, actions)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
        return (
            <div>
                <em>{I18n.t("metadata.productBlocks.no_found")}</em>
            </div>
        );
    }

    render() {
        const {
            filteredProductBlocks,
            actions,
            query,
            confirmationDialogOpen,
            confirmationDialogAction,
            confirmationDialogQuestion,
            sorted
        } = this.state;
        return (
            <div className="mod-product-blocks">
                <ConfirmationDialog
                    isOpen={confirmationDialogOpen}
                    cancel={this.cancelConfirmation}
                    confirm={confirmationDialogAction}
                    question={confirmationDialogQuestion}
                />
                <div className="options">
                    <section className="search">
                        <input
                            className="allowed"
                            placeholder={I18n.t("metadata.productBlocks.searchPlaceHolder")}
                            type="text"
                            onChange={this.search}
                            value={query}
                        />
                        <i className="fa fa-search" />
                    </section>
                    <button className="new button green" onClick={this.editProductBlock({}, false, true)}>
                        {I18n.t("metadata.productBlocks.new")} <i className="fa fa-plus" />
                    </button>
                </div>
                <section className="product-block">
                    {this.renderProductBlocks(filteredProductBlocks, actions, sorted)}
                </section>
            </div>
        );
    }
}

ProductBlocks.propTypes = {};

ProductBlocks.contextType = ApplicationContext;
