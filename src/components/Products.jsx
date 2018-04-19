import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import debounce from "lodash/debounce";
import {isEmpty, stop} from "../utils/Utils";
import ConfirmationDialog from "../components/ConfirmationDialog";

import "./Products.css";
import DropDownActions from "../components/DropDownActions";
import {setFlash} from "../utils/Flash";
import {renderDateTime} from "../utils/Lookups";
import {deleteProduct, products} from "../api/index";
import FilterDropDown from "./FilterDropDown";

export default class Products extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            products: [],
            filteredProducts: [],
            filterAttributesTag: [],
            filterAttributesType: [],
            query: "",
            actions: {show: false, id: ""},
            sorted: {name: "name", descending: true},
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this,
            confirm: () => this,
            confirmationDialogQuestion: "",
            refresh: true
        };
    }


    componentDidMount() {
        products().then(res => {
            res.forEach(prod => prod.product_blocks_string = (prod.product_blocks || [])
                .map(pb => pb.name).join(", "));
            const newFilterAttributesTag = [];
            const uniqueTags = [...new Set(res.map(p => p.tag))];
            uniqueTags.forEach(tag => newFilterAttributesTag.push({
                name: tag,
                selected: true,
                count: res.filter(p => p.tag === tag).length
            }));
            const newFilterAttributesType = [];
            const uniqueTypes = [...new Set(res.map(p => p.product_type))];
            uniqueTypes.forEach(type => newFilterAttributesType.push({
                name: type,
                selected: true,
                count: res.filter(p => p.product_type === type).length
            }));
            res = res.sort(this.sortBy(this.state.sorted.name));
            this.setState({
                products: res, filteredProducts: res,
                filterAttributesTag: newFilterAttributesTag.filter(attr => attr.count > 0),
                filterAttributesType: newFilterAttributesType.filter(attr => attr.count > 0)
            })
        });
    }

    cancelConfirmation = () => this.setState({confirmationDialogOpen: false});

    editProduct = (product, readOnly = true, newProduct = false, clone = false) => () => {
        const productId = clone ? "clone" : (newProduct ? "new" : product.product_id);
        const cloneId = clone ? `&productId=${product.product_id}` : "";
        this.props.history.push(`/product/${productId}?readOnly=${readOnly}${cloneId}`)
    };

    search = e => {
        const query = e.target.value;
        this.setState({query: query});
        this.delayedSearch(query);
    };

    doSearchAndSort = (query, products, sorted, filterAttributesTag, filterAttributesType) => {
        if (!isEmpty(query)) {
            const queryToLower = query.toLowerCase();
            const searchable = ["name", "description", "tag", "product_type", "status", "crm_prod_id,", "product_blocks_string",
                "create_subscription_workflow_key,", "modify_subscription_workflow_key,", "terminate_subscription_workflow_key"];
            products = products.filter(p =>
                searchable
                    .filter(search => p[search])
                    .map(search => p[search].toLowerCase().indexOf(queryToLower))
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
        const {sorted, filterAttributesTag, filterAttributesType} = this.state;
        this.setState({
            query: query,
            filteredProducts: this.doSearchAndSort(query, products, sorted, filterAttributesTag, filterAttributesType)
        });
    }, 250);

    toggleActions = (product, actions) => e => {
        stop(e);
        const newShow = actions.id === product.product_id ? !actions.show : true;
        this.setState({actions: {show: newShow, id: product.product_id}});
    };

    handleDeleteProduct = product => e => {
        stop(e);
        this.confirmation(I18n.t("metadata.deleteConfirmation", {
                type: "Product",
                name: product.name
            }), () => deleteProduct(product.product_id)
                .then(() => {
                    this.componentDidMount();
                    setFlash(I18n.t("metadata.flash.delete", {name: product.name, type: "Product"}));
                }).catch(err => {
                    if (err.response && err.response.status === 400) {
                        err.response.json().then(json => setFlash(json["error"], "error"));
                    } else {
                        throw err;
                    }
                })
        );
    };

    confirmation = (question, action) => this.setState({
        confirmationDialogOpen: true,
        confirmationDialogQuestion: question,
        confirmationDialogAction: () => {
            this.cancelConfirmation();
            action();
        }
    });


    renderActions = (product, actions) => {
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
            icon: "fa fa-pencil-square-o",
            label: "edit",
            action: this.editProduct(product, false, false)
        };
        const _delete = {
            icon: "fa fa-trash",
            label: "delete",
            action: this.handleDeleteProduct(product),
            danger: true
        };
        const clone = {
            icon: "fa fa-clone",
            label: "clone",
            action: this.editProduct(product, false, true, true)
        };
        const options = [view, edit, _delete, clone];
        return <DropDownActions options={options} i18nPrefix="metadata.products"/>;
    };

    sortBy = name => (a, b) => {
        const aSafe = a[name] || "";
        const bSafe = b[name] || "";
        return typeof aSafe === "string" ? aSafe.toLowerCase().localeCompare(bSafe.toLowerCase()) : aSafe - bSafe;
    };

    sort = name => e => {
        stop(e);
        const sorted = {...this.state.sorted};
        const filteredProducts = [...this.state.filteredProducts].sort(this.sortBy(name));

        sorted.descending = sorted.name === name ? !sorted.descending : false;
        sorted.name = name;
        this.setState({
            filteredProducts: sorted.descending ? filteredProducts.reverse() : filteredProducts,
            sorted: sorted
        });
    };

    filter = name => item => {
        const {products, sorted, query, filterAttributesTag, filterAttributesType} = this.state;
        const newFilterAttributesTag = [...filterAttributesTag];
        if (name === "tag") {
            newFilterAttributesTag.forEach(attr => {
                if (attr.name === item.name) {
                    attr.selected = !attr.selected;
                }
            });
        }
        const newFilterAttributesType = [...filterAttributesType];
        if (name === "type") {
            newFilterAttributesType.forEach(attr => {
                if (attr.name === item.name) {
                    attr.selected = !attr.selected;
                }
            });
        }
        this.setState({
            filterAttributesTag: newFilterAttributesTag,
            filterAttributesType: newFilterAttributesType,
            filteredProducts: this.doSearchAndSort(query, products, sorted, newFilterAttributesTag, newFilterAttributesType)
        });
    };

    sortColumnIcon = (name, sorted) => {
        if (sorted.name === name) {
            return <i className={sorted.descending ? "fa fa-sort-desc" : "fa fa-sort-asc"}></i>
        }
        return <i/>;
    };

    renderProducts(products, actions, sorted) {
        const columns = ["name", "description", "tag", "product_type", "status", "product_blocks_string", "created_at", "actions"];
        const th = index => {
            const name = columns[index];
            return <th key={index} className={name} onClick={this.sort(name)}>
                <span>{I18n.t(`metadata.products.${name}`)}</span>
                {this.sortColumnIcon(name, sorted)}
            </th>
        };
        const tdValues = columns.slice(0, columns.indexOf("created_at"));
        const td = (name, product) => <td key={name} data-label={I18n.t(`metadata.products.${name}`)} className={name}>
            {product[name]}
        </td>;

        if (products.length !== 0) {
            return (
                <table className="products">
                    <thead>
                    <tr>{columns.map((column, index) => th(index))}</tr>
                    </thead>
                    <tbody>
                    {products.map((product, index) =>
                        <tr key={`${product.product_id}_${index}`}
                            onClick={this.editProduct(product, false, false)}>
                            {tdValues.map(tdValue => td(tdValue, product))}
                            <td data-label={I18n.t("metadata.products.created_at")}
                                className="created_at">
                                {renderDateTime(product.created_at)}
                            </td>
                            <td data-label={I18n.t("metadata.products.actions")} className="actions"
                                onClick={this.toggleActions(product, actions)}
                                tabIndex="1" onBlur={() => this.setState({actions: {show: false, id: ""}})}>
                                <i className="fa fa-ellipsis-h"></i>
                                {this.renderActions(product, actions)}
                            </td>
                        </tr>
                    )}
                    <tr>
                        <td className="metadata-results" colSpan={6}>{I18n.t("metadata.results", {type: "Products", count: products.length})}</td>
                    </tr>
                    </tbody>
                </table>
            );
        }
        return <div><em>{I18n.t("metadata.products.no_found")}</em></div>;
    }

    render() {
        const {
            filteredProducts, actions, query, confirmationDialogOpen, confirmationDialogAction,
            confirmationDialogQuestion, sorted, filterAttributesTag, filterAttributesType
        } = this.state;
        return (
            <div className="mod-products">
                <ConfirmationDialog isOpen={confirmationDialogOpen}
                                    cancel={this.cancelConfirmation}
                                    confirm={confirmationDialogAction}
                                    question={confirmationDialogQuestion}/>
                <div className="options">
                    <FilterDropDown items={filterAttributesTag}
                                    filterBy={this.filter("tag")}
                                    label={I18n.t("metadata.products.tag")}/>
                    <FilterDropDown items={filterAttributesType}
                                    filterBy={this.filter("type")}
                                    label={I18n.t("metadata.products.product_type")}/>
                    <section className="search">
                        <input className="allowed"
                               placeholder={I18n.t("metadata.products.searchPlaceHolder")}
                               type="text"
                               onChange={this.search}
                               value={query}/>
                        <i className="fa fa-search"></i>
                    </section>
                    <a className="new button green" onClick={this.editProduct({}, false, true)}>
                        {I18n.t("metadata.products.new")}<i className="fa fa-plus"></i>
                    </a>
                </div>
                <section className="products">
                    {this.renderProducts(filteredProducts, actions, sorted)}
                </section>
            </div>
        );
    }
}

Products.propTypes = {
    history: PropTypes.object.isRequired
};

