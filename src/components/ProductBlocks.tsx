/*
 * Copyright 2019-2020 SURF.
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

import "./ProductBlocks.scss";

import ConfirmationDialog from "components/modals/ConfirmationDialog";
import I18n from "i18n-js";
import debounce from "lodash/debounce";
import React from "react";

import { deleteProductBlock, productBlocks } from "../api/index";
import DropDownActions from "../components/DropDownActions";
import ApplicationContext from "../utils/ApplicationContext";
import { setFlash } from "../utils/Flash";
import { renderDateTime } from "../utils/Lookups";
import { ProductBlock, SortOption } from "../utils/types";
import { isEmpty, stop } from "../utils/Utils";

interface Action {
    show: boolean;
    id: string;
}

type Column = "name" | "description" | "status" | "tag" | "resource_types" | "created_at" | "resource_types_string";

interface ProductBlockWithExtra extends ProductBlock {
    resource_types_string: string;
}

interface IState {
    productBlocks: ProductBlockWithExtra[];
    filteredProductBlocks: ProductBlockWithExtra[];
    query: string;
    actions: Action;
    sorted: SortOption<Column>;
    confirmationDialogOpen: boolean;
    confirmationDialogAction: () => void;
    confirm: () => void;
    confirmationDialogQuestion: string;
    refresh: boolean;
}

export default class ProductBlocks extends React.Component<{}, IState> {
    state: IState = {
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

    componentDidMount() {
        productBlocks().then(res => {
            const productBlocks = res
                .map((pb: Partial<ProductBlockWithExtra>) => {
                    pb.resource_types_string = (pb.resource_types || []).map(rt => rt.resource_type).join(", ");
                    return pb as ProductBlockWithExtra;
                })
                .sort(this.sortBy(this.state.sorted.name));
            this.setState({ productBlocks: productBlocks, filteredProductBlocks: productBlocks });
        });
    }

    cancelConfirmation = () => this.setState({ confirmationDialogOpen: false });

    editProductBlock = (
        productBlock: ProductBlockWithExtra | undefined,
        readOnly: boolean = true,
        newProductBlock: boolean = false
    ) => () => {
        this.context.redirect(
            `/product-block/${newProductBlock ? "new" : productBlock!.product_block_id}?readOnly=${readOnly}`
        );
    };

    search = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target: HTMLInputElement = e.target;
        const query = target.value;
        this.setState({ query: query });
        this.delayedSearch(query);
    };

    doSearchAndSort = (query: string, productBlocks: ProductBlockWithExtra[], sorted: SortOption<Column>) => {
        if (!isEmpty(query)) {
            const queryToLower = query.toLowerCase();
            const searchable: Column[] = ["name", "description", "tag", "status", "resource_types_string"];
            productBlocks = productBlocks.filter(pb =>
                searchable
                    .filter(search => pb[search])
                    .map(search => (pb[search] as string).toLowerCase().indexOf(queryToLower))
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

    toggleActions = (productBlock: ProductBlockWithExtra, actions: Action) => (
        e: React.MouseEvent<HTMLTableDataCellElement>
    ) => {
        stop(e);
        const newShow = actions.id === productBlock.product_block_id ? !actions.show : true;
        this.setState({
            actions: { show: newShow, id: productBlock.product_block_id }
        });
    };

    handleDeleteProductBlock = (productBlock: ProductBlockWithExtra) => (e: React.MouseEvent<HTMLButtonElement>) => {
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
                            err.response.json().then((json: { error: string }) => setFlash(json["error"], "error"));
                        } else {
                            throw err;
                        }
                    })
        );
    };

    confirmation = (question: string, action: () => void) =>
        this.setState({
            confirmationDialogOpen: true,
            confirmationDialogQuestion: question,
            confirmationDialogAction: () => {
                this.cancelConfirmation();
                action();
            }
        });

    renderActions = (productBlock: ProductBlockWithExtra, actions: Action) => {
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
            icon: "fa fa-edit",
            label: "edit",
            action: this.editProductBlock(productBlock, false, false)
        };
        const _delete = {
            icon: "fas fa-trash-alt",
            label: "delete",
            action: this.handleDeleteProductBlock(productBlock),
            danger: true
        };
        const options = [view, edit, _delete];
        return <DropDownActions options={options} i18nPrefix="metadata.productBlocks" />;
    };

    sortBy = (name: Column) => (a: ProductBlockWithExtra, b: ProductBlockWithExtra) => {
        const aSafe = a[name] || "";
        const bSafe = b[name] || "";
        return typeof aSafe === "string"
            ? aSafe.toLowerCase().localeCompare((bSafe as string).toLowerCase())
            : (aSafe as number) - (bSafe as number);
    };

    sort = (name: Column) => (e: React.MouseEvent<HTMLTableHeaderCellElement>) => {
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

    sortColumnIcon = (name: Column, sorted: SortOption) => {
        if (sorted.name === name) {
            return <i className={sorted.descending ? "fas fa-sort-down" : "fas fa-sort-up"} />;
        }
        return <i />;
    };

    renderProductBlocks(productBlocks: ProductBlockWithExtra[], actions: Action, sorted: SortOption) {
        const columns: Column[] = ["name", "description", "status", "tag", "resource_types", "created_at"];
        const th = (index: number) => {
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
                        <tr>
                            {columns.map((column, index) => th(index))}
                            <th className="actions">
                                <span>{I18n.t("metadata.productBlocks.actions")}</span>
                            </th>
                        </tr>
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
                                    tabIndex={1}
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
                    <button className="new button green" onClick={this.editProductBlock(undefined, false, true)}>
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

ProductBlocks.contextType = ApplicationContext;
