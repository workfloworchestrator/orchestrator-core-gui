import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import debounce from "lodash/debounce";
import {abortTask, deleteTask, retryTask, tasks} from "../api";
import {isEmpty, stop} from "../utils/Utils";
import ConfirmationDialog from "../components/ConfirmationDialog";

import "./Tasks.css";
import FilterDropDown from "../components/FilterDropDown";
import DropDownActions from "../components/DropDownActions";
import {setFlash} from "../utils/Flash";
import {renderDateTime} from "../utils/Lookups";
import CheckBox from "../components/CheckBox";
import {actionOptions} from "../validations/Processes";

export default class Tasks extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            tasks: [],
            filteredTasks: [],
            query: "",
            actions: {show: false, tid: ""},
            sorted: {name: "last_modified", descending: true},
            filterAttributesStatus: [
                {name: "created", selected: true, count: 0},
                {name: "failed", selected: true, count: 0},
                {name: "aborted", selected: true, count: 0},
                {name: "completed", selected: true, count: 0},
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

    refresh = () => tasks()
        .then(results => {
            const newFilterAttributesStatus = [...this.state.filterAttributesStatus];
            newFilterAttributesStatus.forEach(attr => attr.count = results
                .filter(task => task.last_status === attr.name).length);

            const filteredTasks = this.doSearchAndSortAndFilter("", results, this.state.sorted, newFilterAttributesStatus);

            this.setState({
                tasks: results, filteredTasks: filteredTasks,
                filterAttributesStatus: newFilterAttributesStatus.filter(attr => attr.count > 0)
            })
        });

    componentWillUnmount = () => clearInterval(this.interval);

    toggleRefresh = e => {
        const refresh = e.target.checked;
        this.setState({refresh: refresh});
        if (refresh) {
            this.interval = setInterval(this.refresh, 3000);
        } else {
            clearInterval(this.interval);
        }
    };

    cancelConfirmation = () => this.setState({confirmationDialogOpen: false});

    showTask = task => () => {
        clearInterval(this.interval);
        this.props.history.push("/task/" + task.tid);
    };

    newTask = () => {
        clearInterval(this.interval);
        this.props.history.push("/new-task");
    };

    search = e => {
        const query = e.target.value;
        this.setState({query: query});
        this.delayedSearch(query);
    };

    doSearchAndSortAndFilter = (query, tasks, sorted, filterAttributesStatus) => {
        if (!isEmpty(query)) {
            const queryToLower = query.toLowerCase();
            const searchable = ["created_by", "failed_reason", "last_status", "last_step", "workflow",];
            tasks = tasks.filter(task =>
                searchable.map(search => (task[search] || "").toLowerCase().indexOf(queryToLower))
                    .some(indexOf => indexOf > -1)
            );
        }
        tasks = tasks.filter(task => {
            const statusFilter = filterAttributesStatus.find(attr => attr.name === task.last_status);
            return statusFilter ? statusFilter.selected : true;
        });
        tasks.sort(this.sortBy(sorted.name));
        return sorted.descending ? tasks.reverse() : tasks;
    };

    delayedSearch = debounce(query => {
        const tasks = [...this.state.tasks];
        const {filterAttributesStatus} = this.state;


        this.setState({
            query: query,
            filteredTasks: this.doSearchAndSortAndFilter(query, tasks, this.state.sorted, filterAttributesStatus)
        });
    }, 250);

    toggleActions = (task, actions) => e => {
        stop(e);
        const newShow = actions.tid === task.tid ? !actions.show : true;
        this.setState({actions: {show: newShow, tid: task.tid}});
    };

    handleDeleteTask = task => e => {
        stop(e);
        this.confirmation(I18n.t("tasks.deleteConfirmation", {
                name: task.product_name,
                customer: task.customer_name
            }), () =>
                deleteTask(task.tid).then(() => {
                    this.refresh();
                    setFlash(I18n.t("tasks.flash.delete", {name: task.product_name}));
                })
        );
    };

    handleAbortTask = task => e => {
        stop(e);
        this.confirmation(I18n.t("tasks.abortConfirmation", {
                name: task.product_name,
                customer: task.customer_name
            }), () =>
                abortTask(task.tid).then(() => {
                    this.refresh();
                    setFlash(I18n.t("tasks.flash.abort", {name: task.product_name}));
                })
        );
    };

    handleRetryTask = task => e => {
        stop(e);
        this.confirmation(I18n.t("tasks.retryConfirmation", {
                name: task.product_name,
                customer: task.customer_name
            }), () =>
                retryTask(task.tid).then(() => {
                    this.refresh();
                    setFlash(I18n.t("tasks.flash.retry", {name: task.product_name}));
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


    renderActions = (task, actions) => {
        const actionId = task.tid;
        if (actions.tid !== actionId || (actions.tid === actionId && !actions.show)) {
            return null;
        }
        const options = actionOptions(task, this.showTask(task), this.handleRetryTask(task),
            this.handleDeleteTask(task), this.handleAbortTask(task), "last_status");
        return <DropDownActions options={options} i18nPrefix="tasks"/>;
    };

    sortBy = name => (a, b) => {
        const aSafe = a[name] || "";
        const bSafe = b[name] || "";
        return typeof aSafe === "string" ? aSafe.toLowerCase().localeCompare(bSafe.toLowerCase()) : aSafe - bSafe;
    };

    sort = name => e => {
        stop(e);
        const sorted = {...this.state.sorted};
        const filteredTasks = [...this.state.filteredTasks].sort(this.sortBy(name));

        sorted.descending = sorted.name === name ? !sorted.descending : false;
        sorted.name = name;
        this.setState({
            filteredTasks: sorted.descending ? filteredTasks.reverse() : filteredTasks,
            sorted: sorted
        });
    };

    filter = item => {
        const {tasks, filterAttributesStatus, sorted, query} = this.state;
        const newFilterAttributesStatus = [...filterAttributesStatus];
        newFilterAttributesStatus.forEach(attr => {
            if (attr.name === item.name) {
                attr.selected = !attr.selected;
            }
        });
        this.setState({
            filteredTasks: this.doSearchAndSortAndFilter(query, tasks, sorted, newFilterAttributesStatus),
            filterAttributesStatus: newFilterAttributesStatus
        });
    };

    sortColumnIcon = (name, sorted) => {
        if (sorted.name === name) {
            return <i className={sorted.descending ? "fa fa-sort-desc" : "fa fa-sort-asc"}></i>
        }
        return <i/>;
    };

    renderTasksTable(tasks, actions, sorted) {
        const columns = ["last_step", "last_status", "workflow", "started_at","failed_reason", "last_modified_at", "created_by","actions"];
        const th = index => {
            const name = columns[index];
            return <th key={index} className={name} onClick={this.sort(name)}>
                <span>{I18n.t(`tasks.${name}`)}</span>
                {this.sortColumnIcon(name, sorted)}
            </th>
        };

        if (tasks.length !== 0) {
            return (
                <table className="tasks">
                    <thead>
                    <tr>{columns.map((column, index) => th(index))}</tr>
                    </thead>
                    <tbody>
                    {tasks.map((task, index) =>
                        <tr key={`${task.tid}_${index}`} onClick={this.showTask(task)}
                            className={task.status}>
                            <td data-label={I18n.t("tasks.last_step")} className="last_step">{task.last_step}</td>
                            <td data-label={I18n.t("tasks.last_status")} className="last_status">{task.last_status}</td>
                            <td data-label={I18n.t("tasks.workflow")} className="workflow">{task.workflow}</td>
                            <td data-label={I18n.t("tasks.started_at")}
                                className="started_at">{renderDateTime(task.started_at)}</td>
                            <td data-label={I18n.t("tasks.failed_reason")} className="failed_reason">{task.failed_reason}</td>
                            <td data-label={I18n.t("tasks.last_modified_at")}
                                className="last_modified_at">{renderDateTime(task.last_modified_at)}</td>
                            <td data-label={I18n.t("tasks.created_by")} className="created_by">{task.created_by}</td>
                            <td data-label={I18n.t("tasks.actions")} className="actions"
                                onClick={this.toggleActions(task, actions)}
                                tabIndex="1" onBlur={() => this.setState({actions: {show: false, id: ""}})}>
                                <i className="fa fa-ellipsis-h"></i>
                                {this.renderActions(task, actions)}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            );
        }
        return <div><em>{I18n.t("tasks.no_found")}</em></div>;
    }

    render() {
        const {
            filteredTasks, actions, query, confirmationDialogOpen, confirmationDialogAction,
            confirmationDialogQuestion, sorted, filterAttributesStatus, refresh
        } = this.state;
        return (
            <div className="mod-tasks">
                <ConfirmationDialog isOpen={confirmationDialogOpen}
                                    cancel={this.cancelConfirmation}
                                    confirm={confirmationDialogAction}
                                    question={confirmationDialogQuestion}/>
                <div className="card">
                    <div className="options">
                        <FilterDropDown items={filterAttributesStatus}
                                        filterBy={this.filter}
                                        label={I18n.t("tasks.last_status")}/>
                        <section className="search">
                            <input className="allowed"
                                   placeholder={I18n.t("tasks.searchPlaceHolder")}
                                   type="text"
                                   onChange={this.search}
                                   value={query}/>
                            <i className="fa fa-search"></i>
                        </section>
                        <a className="new button green" onClick={this.newTask}>
                            {I18n.t("tasks.new")}<i className="fa fa-plus"></i>
                        </a>
                    </div>
                </div>
                <section className="refresh">
                    <CheckBox name="refresh" info={I18n.t("tasks.refresh")} value={refresh}
                              onChange={this.toggleRefresh}/>
                </section>
                <section className="tasks">
                    {this.renderTasksTable(filteredTasks, actions, sorted)}
                </section>
            </div>
        );
    }
}

Tasks.propTypes = {
    history: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired
};

