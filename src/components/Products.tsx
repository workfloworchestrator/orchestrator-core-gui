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

import "components/Products.scss";

import { EuiButton, EuiFieldSearch, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { deleteProduct, products } from "api/index";
import DropDownActions from "components/DropDownActions";
import FilterDropDown from "components/FilterDropDown";
import ConfirmationDialog from "components/modals/ConfirmationDialog";
import I18n from "i18n-js";
import debounce from "lodash/debounce";
import React from "react";
import ApplicationContext from "utils/ApplicationContext";
import { setFlash } from "utils/Flash";
import { renderDateTime } from "utils/Lookups";
import { Filter, SortOption, Product as iProduct } from "utils/types";
import { isEmpty, stop } from "utils/Utils";

type Column = "name" | "description" | "tag" | "product_type" | "status" | "product_blocks_string" | "created_at";

interface ProductWithExtra extends iProduct {
    product_blocks_string: string;
}

interface Action {
    show: boolean;
    id: string;
}

interface IState {
    products: ProductWithExtra[];
    filteredProducts: ProductWithExtra[];
    filterAttributesTag: Filter[];
    filterAttributesType: Filter[];
    query: string;
    actions: Action;
    sorted: SortOption<Column>;
    confirmationDialogOpen: boolean;
    confirmationDialogAction: () => void;
    confirm: () => void;
    confirmationDialogQuestion: string;
    refresh: boolean;
}

export default class Products extends React.Component<{}, IState> {
    state: IState = {
        products: [],
        filteredProducts: [],
        filterAttributesTag: [],
        filterAttributesType: [],
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
        products().then(res => {
            const enhancedProducts: ProductWithExtra[] = res.map((prod: Partial<ProductWithExtra>) => {
                prod.product_blocks_string = (prod.product_blocks || []).map(pb => pb.name).join(", ");
                return prod as ProductWithExtra;
            });
            const newFilterAttributesTag: Filter[] = [];
            //@ts-ignore
            const uniqueTags = [...new Set(enhancedProducts.map(p => p.tag))];
            uniqueTags.forEach(tag =>
                newFilterAttributesTag.push({
                    name: tag,
                    selected: true,
                    count: enhancedProducts.filter(p => p.tag === tag).length
                })
            );
            const newFilterAttributesType: Filter[] = [];
            //@ts-ignore
            const uniqueTypes = [...new Set(enhancedProducts.map(p => p.product_type))];
            uniqueTypes.forEach(type =>
                newFilterAttributesType.push({
                    name: type,
                    selected: true,
                    count: enhancedProducts.filter(p => p.product_type === type).length
                })
            );
            const sortedProducts = enhancedProducts.sort(this.sortBy(this.state.sorted.name));
            this.setState({
                products: sortedProducts,
                filteredProducts: sortedProducts,
                filterAttributesTag: newFilterAttributesTag.filter(attr => attr.count > 0),
                filterAttributesType: newFilterAttributesType.filter(attr => attr.count > 0)
            });
        });
    }

    cancelConfirmation = () => this.setState({ confirmationDialogOpen: false });

    editProduct = (
        product: Partial<ProductWithExtra>,
        readOnly: boolean = true,
        newProduct: boolean = false,
        clone: boolean = false
    ) => () => {
        const productId = clone ? "clone" : newProduct ? "new" : product.product_id;
        const cloneId = clone ? `&productId=${product.product_id}` : "";
        this.context.redirect(`/product/${productId}?readOnly=${readOnly}${cloneId}`);
    };

    search = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target: HTMLInputElement = e.target;
        const query = target.value;
        this.setState({ query: query });
        this.delayedSearch(query);
    };

    doSearchAndSort = (
        query: string,
        products: ProductWithExtra[],
        sorted: SortOption<Column>,
        filterAttributesTag: Filter[],
        filterAttributesType: Filter[]
    ) => {
        if (!isEmpty(query)) {
            const queryToLower = query.toLowerCase();
            const searchable: (keyof ProductWithExtra)[] = [
                "name",
                "description",
                "tag",
                "product_type",
                "status",
                "product_blocks_string",
                "create_subscription_workflow_key",
                "modify_subscription_workflow_key",
                "terminate_subscription_workflow_key"
            ];
            products = products.filter(p =>
                searchable
                    .filter(search => p[search])
                    .map(search => (p[search] as string).toLowerCase().indexOf(queryToLower))
                    .some(indexOf => indexOf > -1)
            );
        }
        products = products.filter(p => {
            const filter = filterAttributesTag.find(attr => attr.name === p.tag);
            return filter ? filter.selected : true;
        });

        products = products.filter(p => {
            const filter = filterAttributesType.find(attr => attr.name === p.product_type);
            return filter ? filter.selected : true;
        });

        products.sort(this.sortBy(sorted.name));
        return sorted.descending ? products.reverse() : products;
    };

    delayedSearch = debounce(query => {
        const products = [...this.state.products];
        const { sorted, filterAttributesTag, filterAttributesType } = this.state;
        this.setState({
            query: query,
            filteredProducts: this.doSearchAndSort(query, products, sorted, filterAttributesTag, filterAttributesType)
        });
    }, 250);

    toggleActions = (product: ProductWithExtra, actions: Action) => (e: React.MouseEvent<HTMLTableDataCellElement>) => {
        stop(e);
        const newShow = actions.id === product.product_id ? !actions.show : true;
        this.setState({ actions: { show: newShow, id: product.product_id } });
    };

    handleDeleteProduct = (product: ProductWithExtra) => (e: React.MouseEvent<HTMLButtonElement>) => {
        stop(e);
        this.confirmation(
            I18n.t("metadata.deleteConfirmation", {
                type: "Product",
                name: product.name
            }),
            () =>
                deleteProduct(product.product_id)
                    .then(() => {
                        this.componentDidMount();
                        setFlash(
                            I18n.t("metadata.flash.delete", {
                                name: product.name,
                                type: "Product"
                            })
                        );
                    })
                    .catch(err => {
                        if (err.response && err.response.status === 400) {
                            if (err.response.data) {
                                setFlash(err.response.data.error);
                            }
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

    renderActions = (product: ProductWithExtra, actions: Action) => {
        const actionId = product.product_id;
        if (actions.id !== actionId || (actions.id === actionId && !actions.show)) {
            return null;
        }
        const view = {
            icon: "fa fa-search-plus",
            label: "view",
            action: this.editProduct(product, true, false)
        };
        const edit = {
            icon: "fa fa-edit",
            label: "edit",
            action: this.editProduct(product, false, false)
        };
        const _delete = {
            icon: "fas fa-trash-alt",
            label: "delete",
            action: this.handleDeleteProduct(product),
            danger: true
        };
        const clone = {
            icon: "far fa-clone",
            label: "clone",
            action: this.editProduct(product, false, true, true)
        };
        const options = [view, edit, _delete, clone];
        return <DropDownActions options={options} i18nPrefix="metadata.products" />;
    };

    sortBy = (name: Column) => (a: ProductWithExtra, b: ProductWithExtra) => {
        const aSafe = a[name] || "";
        const bSafe = b[name] || "";
        return typeof aSafe === "string"
            ? aSafe.toLowerCase().localeCompare((bSafe as string).toLowerCase())
            : aSafe - (bSafe as number);
    };

    sort = (name: Column) => (e: React.MouseEvent<HTMLTableHeaderCellElement>) => {
        stop(e);
        const sorted = { ...this.state.sorted };
        const filteredProducts = [...this.state.filteredProducts].sort(this.sortBy(name));

        sorted.descending = sorted.name === name ? !sorted.descending : false;
        sorted.name = name;
        this.setState({
            filteredProducts: sorted.descending ? filteredProducts.reverse() : filteredProducts,
            sorted: sorted
        });
    };

    filter = (name: Column) => (item: Filter) => {
        const { products, sorted, query, filterAttributesTag, filterAttributesType } = this.state;
        const newFilterAttributesTag = [...filterAttributesTag];
        if (name === "tag") {
            newFilterAttributesTag.forEach(attr => {
                if (attr.name === item.name) {
                    attr.selected = !attr.selected;
                }
            });
        }
        const newFilterAttributesType = [...filterAttributesType];
        if (name === "product_type") {
            newFilterAttributesType.forEach(attr => {
                if (attr.name === item.name) {
                    attr.selected = !attr.selected;
                }
            });
        }
        this.setState({
            filterAttributesTag: newFilterAttributesTag,
            filterAttributesType: newFilterAttributesType,
            filteredProducts: this.doSearchAndSort(
                query,
                products,
                sorted,
                newFilterAttributesTag,
                newFilterAttributesType
            )
        });
    };

    sortColumnIcon = (name: Column, sorted: SortOption<Column>) => {
        if (sorted.name === name) {
            return <i className={sorted.descending ? "fas fa-sort-down" : "fas fa-sort-up"} />;
        }
        return <i />;
    };

    renderProducts(products: ProductWithExtra[], actions: Action, sorted: SortOption<Column>) {
        const columns: Column[] = [
            "name",
            "description",
            "tag",
            "product_type",
            "status",
            "product_blocks_string",
            "created_at"
        ];
        const th = (index: number) => {
            const name = columns[index];
            return (
                <th key={index} className={name} onClick={this.sort(name)}>
                    <span>{I18n.t(`metadata.products.${name}`)}</span>
                    {this.sortColumnIcon(name, sorted)}
                </th>
            );
        };
        const tdValues = columns.slice(0, columns.indexOf("created_at"));
        const td = (name: Column, product: ProductWithExtra) => (
            <td key={name} data-label={I18n.t(`metadata.products.${name}`)} className={name}>
                {product[name]}
            </td>
        );

        if (products.length !== 0) {
            return (
                <table className="products">
                    <thead>
                        <tr>
                            {columns.map((column, index) => th(index))}
                            <th className="actions">
                                <span>{I18n.t("metadata.products.actions")}</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product, index) => (
                            <tr
                                key={`${product.product_id}_${index}`}
                                onClick={this.editProduct(product, false, false)}
                            >
                                {tdValues.map(tdValue => td(tdValue, product))}
                                <td data-label={I18n.t("metadata.products.created_at")} className="created_at">
                                    {renderDateTime(product.created_at)}
                                </td>
                                <td
                                    data-label={I18n.t("metadata.products.actions")}
                                    className="actions"
                                    onClick={this.toggleActions(product, actions)}
                                    tabIndex={1}
                                    onBlur={() => this.setState({ actions: { show: false, id: "" } })}
                                >
                                    <i className="fa fa-ellipsis-h" />
                                    {this.renderActions(product, actions)}
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td className="metadata-results" colSpan={6}>
                                {I18n.t("metadata.results", {
                                    type: "Products",
                                    count: products.length
                                })}
                            </td>
                        </tr>
                    </tbody>
                </table>
            );
        }
        return (
            <div>
                <em>{I18n.t("metadata.products.no_found")}</em>
            </div>
        );
    }

    render() {
        const {
            filteredProducts,
            actions,
            query,
            confirmationDialogOpen,
            confirmationDialogAction,
            confirmationDialogQuestion,
            sorted,
            filterAttributesTag,
            filterAttributesType
        } = this.state;
        return (
            <div className="mod-products">
                <ConfirmationDialog
                    isOpen={confirmationDialogOpen}
                    cancel={this.cancelConfirmation}
                    confirm={confirmationDialogAction}
                    question={confirmationDialogQuestion}
                />
                <EuiFlexGroup>
                    <EuiFlexItem>
                        <FilterDropDown
                            items={filterAttributesTag}
                            filterBy={this.filter("tag")}
                            label={I18n.t("metadata.products.tag")}
                        />
                    </EuiFlexItem>
                    <EuiFlexItem>
                        <FilterDropDown
                            items={filterAttributesType}
                            filterBy={this.filter("product_type")}
                            label={I18n.t("metadata.products.product_type")}
                        />
                    </EuiFlexItem>
                    <EuiFlexItem grow={4}>
                        <EuiFieldSearch
                            placeholder={I18n.t("metadata.products.searchPlaceHolder")}
                            value={query}
                            onChange={this.search}
                            isClearable={true}
                            fullWidth
                        />
                    </EuiFlexItem>
                    <EuiFlexItem>
                        <EuiButton
                            onClick={this.editProduct({}, false, true)}
                            color="secondary"
                            iconType="plusInCircle"
                            fill
                        >
                            {I18n.t("metadata.productBlocks.new")}
                        </EuiButton>
                    </EuiFlexItem>
                </EuiFlexGroup>
                <section className="products">{this.renderProducts(filteredProducts, actions, sorted)}</section>
            </div>
        );
    }
}

Products.contextType = ApplicationContext;
