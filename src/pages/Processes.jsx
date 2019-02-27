import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import debounce from "lodash/debounce";
import {abortProcess, deleteProcess, processes, retryProcess} from "../api";
import {isEmpty, stop} from "../utils/Utils";
import ConfirmationDialog from "../components/ConfirmationDialog";

import "./Processes.scss";
import FilterDropDown from "../components/FilterDropDown";
import DropDownActions from "../components/DropDownActions";
import {setFlash} from "../utils/Flash";
import {organisationNameByUuid, productNameById, renderDateTime} from "../utils/Lookups";
import CheckBox from "../components/CheckBox";
import {actionOptions} from "../validations/Processes";

export default class Processes extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            processes: [],
            filteredProcesses: [],
            query: "",
            actions: {show: false, id: ""},
            sorted: {name: "last_modified", descending: true},
            filterAttributesAssignee: [
                {name: "CHANGES", selected: true, count: 0},
                {name: "KLANT_SUPPORT", selected: true, count: 0},
                {name: "NOC", selected: true, count: 0},
                {name: "SYSTEM", selected: true, count: 0}
            ],
            filterAttributesStatus: [
                {name: "created", selected: true, count: 0},
                {name: "failed", selected: true, count: 0},
                {name: "aborted", selected: false, count: 0},
                {name: "completed", selected: false, count: 0},
                {name: "running", selected: true, count: 0},
                {name: "suspended", selected: true, count: 0}
            ],
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this,
            confirm: () => this,
            confirmationDialogQuestion: "",
            refresh: true
        };
    }

    componentDidMount = () => {
        this.refresh();
        this.interval = setInterval(this.refresh, 3000);
    };

    refresh = () => processes()
        .then(results => {
            const {organisations, products} = this.props;
            results.forEach(process => {
                process.customer_name = organisationNameByUuid(process.customer, organisations);
                process.product_name = productNameById(process.product, products);
            });
            const newFilterAttributesAssignee = [...this.state.filterAttributesAssignee];
            newFilterAttributesAssignee.forEach(attr => attr.count = results
                .filter(process => process.assignee === attr.name).length);

            const newFilterAttributesStatus = [...this.state.filterAttributesStatus];
            newFilterAttributesStatus.forEach(attr => attr.count = results
                .filter(process => process.status === attr.name).length);

            const filteredProcesses = this.doSearchAndSortAndFilter(this.state.query, results, this.state.sorted,
                newFilterAttributesAssignee, newFilterAttributesStatus);

            this.setState({
                processes: results, filteredProcesses: filteredProcesses,
                filterAttributesAssignee: newFilterAttributesAssignee.filter(attr => attr.count > 0),
                filterAttributesStatus: newFilterAttributesStatus.filter(attr => attr.count > 0)
            })
        });

    componentWillUnmount = () => clearInterval(this.interval);

    toggleRefresh = e => {
        const refresh = e.target.checked;
        this.setState({refresh : refresh});
        if (refresh) {
            this.interval = setInterval(this.refresh, 3000);
        } else {
            clearInterval(this.interval);
        }
    };

    cancelConfirmation = () => this.setState({confirmationDialogOpen: false});

    showProcess = process => () => {
        clearInterval(this.interval);
        this.props.history.push("/process/" + process.id);
    };

    newProcess = () => {
        clearInterval(this.interval);
        this.props.history.push("/new-process");
    };

    search = e => {
        const query = e.target.value;
        this.setState({query: query});
        this.delayedSearch(query);
    };

    doSearchAndSortAndFilter = (query, processes, sorted, filterAttributesAssignee, filterAttributesStatus) => {
        if (!isEmpty(query)) {
            const queryToLower = query.toLowerCase();
            const searchable = ["assignee", "step", "customer_name", "product_name", "workflow_name"];
            processes = processes.filter(process =>
                searchable.map(search => process[search].toLowerCase().indexOf(queryToLower))
                    .some(indexOf => indexOf > -1)
            );
        }
        processes = processes.filter(process => {
            const assigneeFilter = filterAttributesAssignee.find(attr => attr.name === process.assignee);
            return assigneeFilter ? assigneeFilter.selected : true;
        });
        processes = processes.filter(process => {
            const statusFilter = filterAttributesStatus.find(attr => attr.name === process.status);
            return statusFilter ? statusFilter.selected : true;
        });
        processes.sort(this.sortBy(sorted.name));
        return sorted.descending ? processes.reverse() : processes;
    };

    delayedSearch = debounce(query => {
        const processes = [...this.state.processes];
        const {filterAttributesAssignee} = this.state;
        const {filterAttributesStatus} = this.state;


        this.setState({
            query: query,
            filteredProcesses: this.doSearchAndSortAndFilter(query, processes, this.state.sorted, filterAttributesAssignee, filterAttributesStatus)
        });
    }, 250);

    toggleActions = (process, actions) => e => {
        stop(e);
        const newShow = actions.id === process.id ? !actions.show : true;
        this.setState({actions: {show: newShow, id: process.id}});
    };

    handleDeleteProcess = process => e => {
        stop(e);
        this.confirmation(I18n.t("processes.deleteConfirmation", {
                name: process.product_name,
                customer: process.customer_name
            }), () =>
                deleteProcess(process.id).then(() => {
                    this.refresh();
                    setFlash(I18n.t("processes.flash.delete", {name: process.product_name}));
                })
        );
    };

    handleAbortProcess = process => e => {
        stop(e);
        this.confirmation(I18n.t("processes.abortConfirmation", {
                name: process.product_name,
                customer: process.customer_name
            }), () =>
                abortProcess(process.id).then(() => {
                    this.refresh();
                    setFlash(I18n.t("processes.flash.abort", {name: process.product_name}));
                })
        );
    };

    handleRetryProcess = process => e => {
        stop(e);
        this.confirmation(I18n.t("processes.retryConfirmation", {
                name: process.product_name,
                customer: process.customer_name
            }), () =>
                retryProcess(process.id).then(() => {
                    this.refresh();
                    setFlash(I18n.t("processes.flash.retry", {name: process.product_name}));
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


    renderActions = (process, actions) => {
        const actionId = process.id;
        if (actions.id !== actionId || (actions.id === actionId && !actions.show)) {
            return null;
        }
        let options = actionOptions(process, this.showProcess(process), this.handleRetryProcess(process),
            this.handleDeleteProcess(process), this.handleAbortProcess(process));
        // hotfix to remove delete button
        options = options.filter(option => option.label !== 'delete');
        return <DropDownActions options={options} i18nPrefix="processes"/>;
    };

    sortBy = name => (a, b) => {
        const aSafe = a[name] || "";
        const bSafe = b[name] || "";
        return typeof aSafe === "string" ? aSafe.toLowerCase().localeCompare(bSafe.toLowerCase()) : aSafe - bSafe;
    };

    sort = name => e => {
        stop(e);
        const sorted = {...this.state.sorted};
        const filteredProcesses = [...this.state.filteredProcesses].sort(this.sortBy(name));

        sorted.descending = sorted.name === name ? !sorted.descending : false;
        sorted.name = name;
        this.setState({
            filteredProcesses: sorted.descending ? filteredProcesses.reverse() : filteredProcesses,
            sorted: sorted
        });
    };

    filter = item => {
        const {processes, filterAttributesAssignee, filterAttributesStatus, sorted, query} = this.state;
        const newFilterAttributesAssignee = [...filterAttributesAssignee];
        newFilterAttributesAssignee.forEach(attr => {
            if (attr.name === item.name) {
                attr.selected = !attr.selected;
            }
        });
        const newFilterAttributesStatus = [...filterAttributesStatus];
        newFilterAttributesStatus.forEach(attr => {
            if (attr.name === item.name) {
                attr.selected = !attr.selected;
            }
        });
        this.setState({
            filteredProcesses: this.doSearchAndSortAndFilter(query, processes, sorted, newFilterAttributesAssignee, newFilterAttributesStatus),
            filterAttributesAssignee: newFilterAttributesAssignee,
            filterAttributesStatus: newFilterAttributesStatus
        });
    };

    sortColumnIcon = (name, sorted) => {
        if (sorted.name === name) {
            return <i className={sorted.descending ? "fa fa-sort-desc" : "fa fa-sort-asc"}></i>
        }
        return <i/>;
    };

    renderProcessesTable(processes, actions, sorted) {
        const columns = ["assignee", "step", "status", "customer", "product", "workflow_name", "started", "last_modified", "actions"];
        const th = index => {
            const name = columns[index];
            return <th key={index} className={name} onClick={this.sort(name)}>
                <span>{I18n.t(`processes.${name}`)}</span>
                {this.sortColumnIcon(name, sorted)}
            </th>
        };

        if (processes.length !== 0) {
            return (
                <table className="processes">
                    <thead>
                    <tr>{columns.map((column, index) => th(index))}</tr>
                    </thead>
                    <tbody>
                    {processes.map((process, index) =>
                        <tr key={`${process.id}_${index}`} onClick={this.showProcess(process)}
                            className={process.status}>
                            <td data-label={I18n.t("processes.assignee")} className="assignee">{process.assignee}</td>
                            <td data-label={I18n.t("processes.step")} className="step">{process.step}</td>
                            <td data-label={I18n.t("processes.status")} className="status">{process.status}</td>
                            <td data-label={I18n.t("processes.customer")}
                                className="customer">{process.customer_name}</td>
                            <td data-label={I18n.t("processes.product")} className="product">{process.product_name}</td>
                            <td data-label={I18n.t("processes.workflow_name")}
                                className="workflow_name">{process.workflow_name}</td>
                            <td data-label={I18n.t("processes.started")}
                                className="started">{renderDateTime(process.started)}</td>
                            <td data-label={I18n.t("processes.last_modified")}
                                className="last_modified">{renderDateTime(process.last_modified)}</td>
                            <td data-label={I18n.t("processes.actions")} className="actions"
                                onClick={this.toggleActions(process, actions)}
                                tabIndex="1" onBlur={() => this.setState({actions: {show: false, id: ""}})}>
                                <i className="fa fa-ellipsis-h"></i>
                                {this.renderActions(process, actions)}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            );
        }
        return <div><em>{I18n.t("processes.no_found")}</em></div>;
    }

    render() {
        const {
            filteredProcesses, actions, query, confirmationDialogOpen, confirmationDialogAction,
            confirmationDialogQuestion, sorted, filterAttributesAssignee, filterAttributesStatus, refresh
        } = this.state;
        const {organisations} = this.props;
        return (
            <div className="mod-processes">
                <ConfirmationDialog isOpen={confirmationDialogOpen}
                                    cancel={this.cancelConfirmation}
                                    confirm={confirmationDialogAction}
                                    question={confirmationDialogQuestion}/>
                <div className="card">
                    <div className="options">
                        <FilterDropDown items={filterAttributesAssignee}
                                        filterBy={this.filter}
                                        label={I18n.t("processes.assignee")}/>
                        <FilterDropDown items={filterAttributesStatus}
                                        filterBy={this.filter}
                                        label={I18n.t("processes.status")}/>
                        <section className="search">
                            <input className="allowed"
                                   placeholder={I18n.t("processes.searchPlaceHolder")}
                                   type="text"
                                   onChange={this.search}
                                   value={query}/>
                            <i className="fa fa-search"></i>
                        </section>
                        <button className="new button green" onClick={this.newProcess}>
                            {I18n.t("processes.new")} <i className="fa fa-plus"></i>
                        </button>
                    </div>
                </div>
                <section className="refresh">
                    <CheckBox name="refresh" info={I18n.t("processes.refresh")} value={refresh}
                              onChange={this.toggleRefresh}/>
                </section>
                <section className="processes">
                    {this.renderProcessesTable(filteredProcesses, actions, sorted, organisations)}
                </section>
            </div>
        );
    }
}

Processes.propTypes = {
    history: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    organisations: PropTypes.array.isRequired,
    products: PropTypes.array.isRequired
};
