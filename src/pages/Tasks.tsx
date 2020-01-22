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
import ScrollUpButton from "react-scroll-up-button";

import { abortProcess, deleteProcess, retryProcess, processes } from "../api";
import { isEmpty, stop } from "../utils/Utils";
import ConfirmationDialog from "../components/ConfirmationDialog";
import FilterDropDown from "../components/FilterDropDown";
import DropDownActions from "../components/DropDownActions";
import { setFlash } from "../utils/Flash";
import { renderDateTime } from "../utils/Lookups";
import CheckBox from "../components/CheckBox";
import { actionOptions } from "../validations/Processes";
import ApplicationContext from "../utils/ApplicationContext";
import { Process, FilterAttribute, ShowActions, SortSettings, ProcessWithDetails, prop } from "../utils/types";

import "./Tasks.scss";

interface CustomProcessWithDetails extends ProcessWithDetails {
    product_name: string;
    customer_name: string;
}

interface IState {
    tasks: CustomProcessWithDetails[];
    filteredTasks: CustomProcessWithDetails[];
    query: string;
    actions: ShowActions;
    sorted: SortSettings;
    filterAttributesStatus: FilterAttribute[];
    confirmationDialogOpen: boolean;
    confirmationDialogAction: (e: React.MouseEvent) => void;
    confirm: () => void;
    confirmationDialogQuestion: string;
    refresh: boolean;
    interval?: number;
}

export default class Tasks extends React.PureComponent<{}, IState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            tasks: [],
            filteredTasks: [],
            query: "",
            actions: { show: false, id: "" },
            sorted: { name: "last_modified", descending: true },
            filterAttributesStatus: [
                { name: "created", selected: true, count: 0 },
                { name: "failed", selected: true, count: 0 },
                { name: "aborted", selected: false, count: 0 },
                { name: "completed", selected: false, count: 0 },
                { name: "running", selected: true, count: 0 },
                { name: "suspended", selected: true, count: 0 }
            ],
            confirmationDialogOpen: false,
            confirmationDialogAction: () => {},
            confirm: () => {},
            confirmationDialogQuestion: "",
            refresh: false,
            interval: undefined
        };
    }

    componentDidMount = () => {
        this.refresh();
        // const interval = window.setInterval(this.refresh, 3000);
        // this.setState({ interval: interval });
    };

    refresh = () =>
        processes(true).then(results => {
            const newFilterAttributesStatus = [...this.state.filterAttributesStatus];
            newFilterAttributesStatus.forEach(
                (attr: FilterAttribute) =>
                    (attr.count = results.filter((task: CustomProcessWithDetails) => task.status === attr.name).length)
            );

            results = results.filter((process: Process) => process.assignee === "SYSTEM");

            const filteredTasks = this.doSearchAndSortAndFilter(
                "",
                results,
                this.state.sorted,
                newFilterAttributesStatus
            );

            this.setState({
                tasks: results,
                filteredTasks: filteredTasks,
                filterAttributesStatus: newFilterAttributesStatus.filter((attr: FilterAttribute) => attr.count > 0)
            });
        });

    componentWillUnmount = () => clearInterval(this.state.interval);

    toggleRefresh = (e: React.FormEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        const refresh = target.checked;
        this.setState({ refresh: refresh });
        if (refresh) {
            const interval = window.setInterval(this.refresh, 3000);
            this.setState({ interval: interval });
        } else {
            clearInterval(this.state.interval);
        }
    };

    cancelConfirmation = () => this.setState({ confirmationDialogOpen: false });

    showTask = (task: CustomProcessWithDetails) => () => {
        clearInterval(this.state.interval);
        this.context.redirect("/task/" + task.id);
    };

    newTask = () => {
        clearInterval(this.state.interval);
        this.context.redirect("/new-task");
    };

    runAllTasks = () => {
        this.confirmation(I18n.t("tasks.runallConfirmation"), () => {
            this.state.tasks
                .filter((task: CustomProcessWithDetails) => task.status === "failed")
                .map(task => task.id)
                .forEach(retryProcess);
        });
    };

    search = (e: React.FormEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        const query = target.value;
        this.setState({ query: query });
        this.delayedSearch(query);
    };

    doSearchAndSortAndFilter = (
        query: string,
        tasks: CustomProcessWithDetails[],
        sorted: SortSettings,
        filterAttributesStatus: FilterAttribute[]
    ) => {
        if (!isEmpty(query)) {
            const queryToLower = query.toLowerCase();
            const searchable = ["created_by", "failed_reason", "status", "step", "workflow_name"];
            tasks = tasks.filter(task =>
                searchable
                    .map((search: any) => (prop(task, search) || "").toLowerCase().indexOf(queryToLower))
                    .some(indexOf => indexOf > -1)
            );
        }
        tasks = tasks.filter(task => {
            const statusFilter = filterAttributesStatus.find((attr: FilterAttribute) => attr.name === task.status);
            return statusFilter ? statusFilter.selected : true;
        });
        tasks.sort(this.sortBy(sorted.name));
        return sorted.descending ? tasks.reverse() : tasks;
    };

    delayedSearch = debounce(query => {
        const tasks = [...this.state.tasks];
        const { filterAttributesStatus } = this.state;

        this.setState({
            query: query,
            filteredTasks: this.doSearchAndSortAndFilter(query, tasks, this.state.sorted, filterAttributesStatus)
        });
    }, 250);

    toggleActions = (task: CustomProcessWithDetails, actions: ShowActions) => (e: React.MouseEvent) => {
        stop(e);
        const newShow = actions.id === task.id ? !actions.show : true;
        this.setState({ actions: { show: newShow, id: task.id } });
    };

    handleDeleteTask = (task: CustomProcessWithDetails) => (e: React.MouseEvent) => {
        stop(e);
        this.confirmation(I18n.t("tasks.deleteConfirmation", { name: task.workflow_name }), () =>
            deleteProcess(task.id).then(() => {
                this.refresh();
                setFlash(I18n.t("tasks.flash.delete", { name: task.workflow_name }));
            })
        );
    };

    handleAbortTask = (task: CustomProcessWithDetails) => (e: React.MouseEvent) => {
        stop(e);
        this.confirmation(
            I18n.t("tasks.abortConfirmation", {
                name: task.workflow_name
            }),
            () =>
                abortProcess(task.id).then(() => {
                    this.refresh();
                    setFlash(I18n.t("tasks.flash.abort", { name: task.workflow_name }));
                })
        );
    };

    handleRetryTask = (task: CustomProcessWithDetails) => (e: React.MouseEvent) => {
        stop(e);
        this.confirmation(I18n.t("tasks.retryConfirmation", { name: task.workflow_name }), () =>
            retryProcess(task.id).then(() => {
                this.refresh();
                setFlash(I18n.t("tasks.flash.retry", { name: task.workflow_name }));
            })
        );
    };

    confirmation = (question: string, action: (e: React.MouseEvent) => void) =>
        this.setState({
            confirmationDialogOpen: true,
            confirmationDialogQuestion: question,
            confirmationDialogAction: (e: React.MouseEvent) => {
                this.cancelConfirmation();
                action(e);
            }
        });

    renderActions = (task: CustomProcessWithDetails, actions: ShowActions) => {
        const actionId = task.id;
        if (actions.id !== actionId || (actions.id === actionId && !actions.show)) {
            return null;
        }
        const options = actionOptions(
            task,
            this.showTask(task),
            this.handleRetryTask(task),
            this.handleDeleteTask(task),
            this.handleAbortTask(task)
        );
        return <DropDownActions options={options} i18nPrefix="tasks" />;
    };

    sortBy = (name: any) => (a: CustomProcessWithDetails, b: CustomProcessWithDetails) => {
        const aSafe = prop(a, name) || "";
        const bSafe = prop(b, name) || "";
        return typeof aSafe === "string" ? aSafe.toLowerCase().localeCompare(bSafe.toLowerCase()) : aSafe - bSafe;
    };

    sort = (name: string) => (e: React.MouseEvent) => {
        stop(e);
        const sorted = { ...this.state.sorted };
        const filteredTasks = [...this.state.filteredTasks].sort(this.sortBy(name));

        sorted.descending = sorted.name === name ? !sorted.descending : false;
        sorted.name = name;
        this.setState({
            filteredTasks: sorted.descending ? filteredTasks.reverse() : filteredTasks,
            sorted: sorted
        });
    };

    filter = (item: FilterAttribute) => {
        const { tasks, filterAttributesStatus, sorted, query } = this.state;
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

    sortColumnIcon = (name: string, sorted: SortSettings) => {
        if (sorted.name === name) {
            return <i className={sorted.descending ? "fa fa-sort-desc" : "fa fa-sort-asc"} />;
        }
        return <i />;
    };

    renderTasksTable(tasks: CustomProcessWithDetails[], actions: ShowActions, sorted: SortSettings) {
        const columns = [
            "step",
            "status",
            "workflow_name",
            "started",
            "failed_reason",
            "last_modified",
            "created_by",
            "actions"
        ];
        const th = (index: number) => {
            const name = columns[index];
            return (
                <th key={index} className={name} onClick={this.sort(name)}>
                    <span>{I18n.t(`tasks.${name}`)}</span>
                    {this.sortColumnIcon(name, sorted)}
                </th>
            );
        };

        if (tasks.length !== 0) {
            return (
                <table className="tasks">
                    <thead>
                        <tr>{columns.map((column, index) => th(index))}</tr>
                    </thead>
                    <tbody>
                        {tasks.map((task, index) => (
                            <tr key={`${task.id}_${index}`} onClick={this.showTask(task)} className={task.status}>
                                <td data-label={I18n.t("tasks.step")} className="step">
                                    {task.step}
                                </td>
                                <td data-label={I18n.t("tasks.status")} className="status">
                                    {task.status}
                                </td>
                                <td data-label={I18n.t("tasks.workflow_name")} className="workflow_name">
                                    {task.workflow_name}
                                </td>
                                <td data-label={I18n.t("tasks.started")} className="started">
                                    {renderDateTime(task.started)}
                                </td>
                                <td data-label={I18n.t("tasks.failed_reason")} className="failed_reason">
                                    {task.failed_reason}
                                </td>
                                <td data-label={I18n.t("tasks.last_modified")} className="last_modified">
                                    {renderDateTime(task.last_modified)}
                                </td>
                                <td data-label={I18n.t("tasks.created_by")} className="created_by">
                                    {task.created_by}
                                </td>
                                <td
                                    data-label={I18n.t("tasks.actions")}
                                    className="actions"
                                    onClick={this.toggleActions(task, actions)}
                                    tabIndex={1}
                                    onBlur={() => this.setState({ actions: { show: false, id: "" } })}
                                >
                                    <i className="fa fa-ellipsis-h" />
                                    {this.renderActions(task, actions)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
        return (
            <div>
                <em>{I18n.t("tasks.no_found")}</em>
            </div>
        );
    }

    render() {
        const {
            filteredTasks,
            actions,
            query,
            confirmationDialogOpen,
            confirmationDialogAction,
            confirmationDialogQuestion,
            sorted,
            filterAttributesStatus,
            refresh
        } = this.state;
        return (
            <div className="mod-tasks">
                <ConfirmationDialog
                    isOpen={confirmationDialogOpen}
                    cancel={this.cancelConfirmation}
                    confirm={confirmationDialogAction}
                    question={confirmationDialogQuestion}
                />
                <div className="card">
                    <div className="options">
                        <FilterDropDown
                            items={filterAttributesStatus}
                            filterBy={this.filter}
                            label={I18n.t("tasks.status")}
                        />
                        <section className="search">
                            <input
                                className="allowed"
                                placeholder={I18n.t("tasks.searchPlaceHolder")}
                                type="text"
                                onChange={this.search}
                                value={query}
                            />
                            <i className="fa fa-search" />
                        </section>
                        <button className="new button green" onClick={this.newTask}>
                            {I18n.t("tasks.new")} <i className="fa fa-plus" />
                        </button>
                    </div>
                </div>
                <section className="refresh">
                    <button className="button blue" onClick={this.runAllTasks}>
                        {I18n.t("tasks.runall")}
                        <i className="fa fa-refresh" />
                    </button>
                    <CheckBox
                        name="refresh"
                        info={I18n.t("tasks.refresh")}
                        value={refresh}
                        onChange={this.toggleRefresh}
                    />
                </section>
                <section className="tasks">{this.renderTasksTable(filteredTasks, actions, sorted)}</section>
                <ScrollUpButton />
            </div>
        );
    }
}

Tasks.contextType = ApplicationContext;
