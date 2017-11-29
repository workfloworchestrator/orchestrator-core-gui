import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import debounce from "lodash/debounce";
import {isEmpty, stop} from "../utils/Utils";
import ConfirmationDialog from "../components/ConfirmationDialog";

import "./ResourceTypes.css";
import DropDownActions from "../components/DropDownActions";
import {setFlash} from "../utils/Flash";
import {deleteResourceType, resourceTypes} from "../api/index";

export default class ResourceTypes extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            resourceTypes: [],
            filteredResourceTypes: [],
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
        resourceTypes().then(res => {
            res.forEach(pb => pb.resource_types_string = (pb.resource_types || [])
                .map(rt => rt.resource_type).join(", "));
            this.setState({resourceTypes: res, filteredResourceTypes: res})
        });
    }

    cancelConfirmation = () => this.setState({confirmationDialogOpen: false});

    editResourceType = (resourceType, readOnly = true, newResourceType = false) => () => {
        this.props.history.push(`/resource-type/${newResourceType ? 'new' : resourceType.resource_type_id}?readOnly=${readOnly}`)
    };

    search = e => {
        const query = e.target.value;
        this.setState({query: query});
        this.delayedSearch(query);
    };

    doSearchAndSort = (query, resourceTypes, sorted) => {
        if (!isEmpty(query)) {
            const queryToLower = query.toLowerCase();
            const searchable = ["resource_type", "description"];
            resourceTypes = resourceTypes.filter(pb =>
                searchable
                    .filter(search => pb[search])
                    .map(search => pb[search].toLowerCase().indexOf(queryToLower))
                    .some(indexOf => indexOf > -1)
            );
        }
        resourceTypes.sort(this.sortBy(sorted.name));
        return sorted.descending ? resourceTypes.reverse() : resourceTypes;
    };

    delayedSearch = debounce(query => {
        const resourceTypes = [...this.state.resourceTypes];
        this.setState({
            query: query,
            filteredResourceTypes: this.doSearchAndSort(query, resourceTypes, this.state.sorted)
        });
    }, 250);

    toggleActions = (resourceType, actions) => e => {
        stop(e);
        const newShow = actions.id === resourceType.resource_type_id ? !actions.show : true;
        this.setState({actions: {show: newShow, id: resourceType.resource_type_id}});
    };

    handleDeleteResourceType = resourceType => e => {
        stop(e);
        this.confirmation(I18n.t("metadata.deleteConfirmation", {
                type: "Resource Type",
                name: resourceType.resource_type
            }), () =>
                deleteResourceType(resourceType.resource_type_id)
                    .then(() => {
                        this.componentDidMount();
                        setFlash(I18n.t("metadata.flash.delete", {
                            type: "Resource Type",
                            name: resourceType.resource_type
                        }));
                    }).catch(err => {
                    if (err.response && err.response.status === 400) {
                        debugger;
                        setFlash(err.response.json["error"], "error")
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


    renderActions = (resourceType, actions) => {
        const actionId = resourceType.resource_type_id;
        if (actions.id !== actionId || (actions.id === actionId && !actions.show)) {
            return null;
        }
        const view = {
            icon: "fa fa-search-plus",
            label: "view",
            action: this.editResourceType(resourceType, true, false)
        };
        const edit = {
            icon: "fa fa-pencil-square-o",
            label: "edit",
            action: this.editResourceType(resourceType, false, false)
        };
        const _delete = {
            icon: "fa fa-trash",
            label: "delete",
            action: this.handleDeleteResourceType(resourceType),
            danger: true
        };
        const options = [view, edit, _delete];
        return <DropDownActions options={options} i18nPrefix="metadata.resourceTypes"/>;
    };

    sortBy = name => (a, b) => {
        const aSafe = a[name] || "";
        const bSafe = b[name] || "";
        return typeof aSafe === "string" ? aSafe.toLowerCase().localeCompare(bSafe.toLowerCase()) : aSafe - bSafe;
    };

    sort = name => e => {
        stop(e);
        const sorted = {...this.state.sorted};
        const filteredResourceTypes = [...this.state.filteredResourceTypes].sort(this.sortBy(name));

        sorted.descending = sorted.name === name ? !sorted.descending : false;
        sorted.name = name;
        this.setState({
            filteredResourceTypes: sorted.descending ? filteredResourceTypes.reverse() : filteredResourceTypes,
            sorted: sorted
        });
    };

    filter = item => {
        const {filteredResourceTypes, sorted, query} = this.state;
        this.setState({
            filteredResourceTypes: this.doSearchAndSort(query, filteredResourceTypes, sorted)
        });
    };

    sortColumnIcon = (name, sorted) => {
        if (sorted.name === name) {
            return <i className={sorted.descending ? "fa fa-sort-desc" : "fa fa-sort-asc"}></i>
        }
        return <i/>;
    };

    renderResourceTypes(resourceTypes, actions, sorted) {
        const columns = ["resource_type", "description", "actions"];
        const th = index => {
            const name = columns[index];
            return <th key={index} className={name} onClick={this.sort(name)}>
                <span>{I18n.t(`metadata.resourceTypes.${name}`)}</span>
                {this.sortColumnIcon(name, sorted)}
            </th>
        };

        if (resourceTypes.length !== 0) {
            return (
                <table className="resource-types">
                    <thead>
                    <tr>{columns.map((column, index) => th(index))}</tr>
                    </thead>
                    <tbody>
                    {resourceTypes.map((resourceType, index) =>
                        <tr key={`${resourceType.resource_type_id}_${index}`}
                            onClick={this.editResourceType(resourceType, false, false)}>
                            <td data-label={I18n.t("metadata.resourceTypes.resource_type")} className="resource_type">
                                {resourceType.resource_type}
                            </td>
                            <td data-label={I18n.t("metadata.resourceTypes.description")} className="description">
                                {resourceType.description}
                            </td>
                            <td data-label={I18n.t("metadata.resourceTypes.actions")} className="actions"
                                onClick={this.toggleActions(resourceType, actions)}
                                tabIndex="1" onBlur={() => this.setState({actions: {show: false, id: ""}})}>
                                <i className="fa fa-ellipsis-h"></i>
                                {this.renderActions(resourceType, actions)}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            );
        }
        return <div><em>{I18n.t("metadata.resourceTypes.no_found")}</em></div>;
    }

    render() {
        const {
            filteredResourceTypes, actions, query, confirmationDialogOpen, confirmationDialogAction,
            confirmationDialogQuestion, sorted,
        } = this.state;
        return (
            <div className="mod-resource-types">
                <ConfirmationDialog isOpen={confirmationDialogOpen}
                                    cancel={this.cancelConfirmation}
                                    confirm={confirmationDialogAction}
                                    question={confirmationDialogQuestion}/>
                <div className="options">
                    <section className="search">
                        <input className="allowed"
                               placeholder={I18n.t("metadata.resourceTypes.searchPlaceHolder")}
                               type="text"
                               onChange={this.search}
                               value={query}/>
                        <i className="fa fa-search"></i>
                    </section>
                    <a className="new button green" onClick={this.editResourceType({}, false, true)}>
                        {I18n.t("metadata.resourceTypes.new")}<i className="fa fa-plus"></i>
                    </a>
                </div>
                <section className="resource-type">
                    {this.renderResourceTypes(filteredResourceTypes, actions, sorted)}
                </section>
            </div>
        );
    }
}

ResourceTypes.propTypes = {
    history: PropTypes.object.isRequired
};

