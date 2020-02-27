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

import { abortProcess, deleteProcess, processes, retryProcess } from "api";
import { isEmpty, stop } from "utils/Utils";
import ConfirmationDialog from "components/ConfirmationDialog";
import FilterDropDown from "components/FilterDropDown";
import DropDownActions from "components/DropDownActions";
import { setFlash } from "utils/Flash";
import { organisationNameByUuid, productNameById, renderDateTime } from "utils/Lookups";
import CheckBox from "components/CheckBox";
import { actionOptions } from "validations/Processes";
import ApplicationContext from "utils/ApplicationContext";
import { FilterAttribute, ShowActions, SortSettings, ProcessWithDetails, prop, optionalProp } from "utils/types";

import "./Processes.scss";

interface CustomProcessWithDetails extends ProcessWithDetails {
    product_name: string;
    customer_name: string;
}

type ProcessSortKeys =
    | "assignee"
    | "step"
    | "status"
    | "customer"
    | "product"
    | "workflow_name"
    | "started"
    | "last_modified"
    | "actions";

interface ProcessSortSettings extends SortSettings {
    name: ProcessSortKeys;
}

interface IProps {
    highlight: string;
}

interface IState {
    processes: CustomProcessWithDetails[];
    filteredProcesses: CustomProcessWithDetails[];
    query: string;
    actions: ShowActions;
    sorted: ProcessSortSettings;
    filterAttributesAssignee: FilterAttribute[];
    filterAttributesStatus: FilterAttribute[];
    confirmationDialogOpen: boolean;
    confirmationDialogAction: (e: React.MouseEvent) => void;
    confirm: () => void;
    confirmationDialogQuestion: string;
    refresh: boolean;
    interval?: number;
}

export default class Processes extends React.PureComponent<IProps, IState> {
    context!: React.ContextType<typeof ApplicationContext>;

    state: IState = {
        processes: [],
        filteredProcesses: [],
        query: "",
        actions: { show: false, id: "" },
        sorted: { name: "last_modified", descending: true },
        filterAttributesAssignee: [
            { name: "CHANGES", selected: true, count: 0 },
            { name: "KLANT_SUPPORT", selected: true, count: 0 },
            { name: "NOC", selected: true, count: 0 },
            { name: "SYSTEM", selected: true, count: 0 }
        ],
        filterAttributesStatus: [
            { name: "created", selected: true, count: 0 },
            { name: "failed", selected: true, count: 0 },
            { name: "api_unavailable", selected: true, count: 0 },
            { name: "inconsistent_data", selected: true, count: 0 },
            { name: "aborted", selected: false, count: 0 },
            { name: "completed", selected: false, count: 0 },
            { name: "running", selected: true, count: 0 },
            { name: "suspended", selected: true, count: 0 }
        ],
        confirmationDialogOpen: false,
        confirmationDialogAction: () => this,
        confirm: () => this,
        confirmationDialogQuestion: "",
        refresh: false
    };

    componentDidMount = () => {
        this.refresh();
        // const interval = window.setInterval(this.refresh, 3000);
        // this.setState({ interval: interval });
    };

    refresh = () =>
        processes().then(processes => {
            const { organisations, products } = this.context;
            let results = processes as CustomProcessWithDetails[];
            results.forEach(process => {
                process.customer_name = organisationNameByUuid(process.customer, organisations);
                process.product_name = productNameById(process.product, products);
            });
            const newFilterAttributesAssignee = [...this.state.filterAttributesAssignee];
            newFilterAttributesAssignee.forEach(
                attr => (attr.count = results.filter(process => process.assignee === attr.name).length)
            );

            const newFilterAttributesStatus = [...this.state.filterAttributesStatus];
            newFilterAttributesStatus.forEach(
                attr => (attr.count = results.filter(process => process.status === attr.name).length)
            );

            const filteredProcesses = this.doSearchAndSortAndFilter(
                this.state.query,
                results,
                this.state.sorted,
                newFilterAttributesAssignee,
                newFilterAttributesStatus
            );

            this.setState({
                processes: results,
                filteredProcesses: filteredProcesses,
                filterAttributesAssignee: newFilterAttributesAssignee,
                filterAttributesStatus: newFilterAttributesStatus
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

    showProcess = (process: ProcessWithDetails) => () => {
        clearInterval(this.state.interval);
        this.context.redirect("/process/" + process.id);
    };

    newProcess = () => {
        clearInterval(this.state.interval);
        this.context.redirect("/new-process");
    };

    search = (e: React.FormEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        const query = target.value;
        this.setState({ query: query });
        this.delayedSearch(query);
    };

    doSearchAndSortAndFilter = (
        query: string,
        processes: CustomProcessWithDetails[],
        sorted: ProcessSortSettings,
        filterAttributesAssignee: FilterAttribute[],
        filterAttributesStatus: FilterAttribute[]
    ) => {
        if (!isEmpty(query)) {
            const queryToLower = query.toLowerCase();
            const searchable: (keyof CustomProcessWithDetails)[] = [
                "assignee",
                "step",
                "customer_name",
                "product_name",
                "workflow_name"
            ];
            processes = processes.filter(process =>
                searchable
                    .map(search => prop(process, search) as string)
                    .filter(s => s != null)
                    .map(search => search.toLowerCase().indexOf(queryToLower))
                    .some(indexOf => indexOf > -1)
            );
        }
        processes = processes.filter(process => {
            const assigneeFilter = filterAttributesAssignee.find(
                (attr: FilterAttribute) => attr.name === process.assignee
            );
            return assigneeFilter ? assigneeFilter.selected : true;
        });
        processes = processes.filter(process => {
            const statusFilter = filterAttributesStatus.find((attr: FilterAttribute) => attr.name === process.status);
            return statusFilter ? statusFilter.selected : true;
        });
        processes.sort(this.sortBy(sorted.name));
        return sorted.descending ? processes.reverse() : processes;
    };

    delayedSearch = debounce(query => {
        const processes = [...this.state.processes];
        const { filterAttributesAssignee } = this.state;
        const { filterAttributesStatus } = this.state;

        this.setState({
            query: query,
            filteredProcesses: this.doSearchAndSortAndFilter(
                query,
                processes,
                this.state.sorted,
                filterAttributesAssignee,
                filterAttributesStatus
            )
        });
    }, 250);

    toggleActions = (process: CustomProcessWithDetails, actions: ShowActions) => (e: React.MouseEvent) => {
        stop(e);
        const newShow = actions.id === process.id ? !actions.show : true;
        this.setState({ actions: { show: newShow, id: process.id } });
    };

    handleDeleteProcess = (process: CustomProcessWithDetails) => (e: React.MouseEvent) => {
        stop(e);
        this.confirmation(
            I18n.t("processes.deleteConfirmation", {
                name: process.product_name,
                customer: process.customer_name
            }),
            () =>
                deleteProcess(process.id).then(() => {
                    this.refresh();
                    setFlash(I18n.t("processes.flash.delete", { name: process.product_name }));
                })
        );
    };

    handleAbortProcess = (process: CustomProcessWithDetails) => (e: React.MouseEvent) => {
        stop(e);
        this.confirmation(
            I18n.t("processes.abortConfirmation", {
                name: process.product_name,
                customer: process.customer_name
            }),
            () =>
                abortProcess(process.id).then(() => {
                    this.refresh();
                    setFlash(I18n.t("processes.flash.abort", { name: process.product_name }));
                })
        );
    };

    handleRetryProcess = (process: CustomProcessWithDetails) => (e: React.MouseEvent) => {
        stop(e);
        this.confirmation(
            I18n.t("processes.retryConfirmation", {
                name: process.product_name,
                customer: process.customer_name
            }),
            () =>
                retryProcess(process.id).then(() => {
                    this.refresh();
                    setFlash(I18n.t("processes.flash.retry", { name: process.product_name }));
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

    renderActions = (process: CustomProcessWithDetails, actions: ShowActions) => {
        const actionId = process.id;
        if (actions.id !== actionId || (actions.id === actionId && !actions.show)) {
            return null;
        }
        let options = actionOptions(
            process,
            this.showProcess(process),
            this.handleRetryProcess(process),
            this.handleDeleteProcess(process),
            this.handleAbortProcess(process)
        );
        // hotfix to remove delete button
        options = options.filter(option => option.label !== "delete");
        return <DropDownActions options={options} i18nPrefix="processes" />;
    };

    sortBy = (name: ProcessSortKeys) => (a: CustomProcessWithDetails, b: CustomProcessWithDetails) => {
        const aSafe: any = optionalProp(a, name) || "";
        const bSafe: any = optionalProp(b, name) || "";
        return typeof aSafe === "string" ? aSafe.toLowerCase().localeCompare(bSafe.toLowerCase()) : aSafe - bSafe;
    };

    sort = (name: ProcessSortKeys) => (e: React.MouseEvent) => {
        stop(e);
        const sorted = { ...this.state.sorted };
        const filteredProcesses = [...this.state.filteredProcesses].sort(this.sortBy(name));

        sorted.descending = sorted.name === name ? !sorted.descending : false;
        sorted.name = name;
        this.setState({
            filteredProcesses: sorted.descending ? filteredProcesses.reverse() : filteredProcesses,
            sorted: sorted
        });
    };

    filter = (item: FilterAttribute) => {
        const { processes, filterAttributesAssignee, filterAttributesStatus, sorted, query } = this.state;
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
            filteredProcesses: this.doSearchAndSortAndFilter(
                query,
                processes,
                sorted,
                newFilterAttributesAssignee,
                newFilterAttributesStatus
            ),
            filterAttributesAssignee: newFilterAttributesAssignee,
            filterAttributesStatus: newFilterAttributesStatus
        });
    };

    sortColumnIcon = (name: string, sorted: SortSettings) => {
        if (sorted.name === name) {
            return <i className={sorted.descending ? "fa fa-sort-desc" : "fa fa-sort-asc"} />;
        }
        return <i />;
    };

    renderProcessesTable(processes: CustomProcessWithDetails[], actions: ShowActions, sorted: SortSettings) {
        const columns: ProcessSortKeys[] = [
            "assignee",
            "step",
            "status",
            "customer",
            "product",
            "workflow_name",
            "started",
            "last_modified",
            "actions"
        ];
        const { highlight } = this.props;
        const th = (index: number) => {
            const name = columns[index];
            return (
                <th key={index} className={name} onClick={this.sort(name)}>
                    <span>{I18n.t(`processes.${name}`)}</span>
                    {this.sortColumnIcon(name, sorted)}
                </th>
            );
        };

        if (processes.length !== 0) {
            return (
                <table className="processes">
                    <thead>
                        <tr>{columns.map((column, index) => th(index))}</tr>
                    </thead>
                    <tbody>
                        {processes.map((process, index) => (
                            <tr
                                id={process.id}
                                key={`${process.id}_${index}`}
                                onClick={this.showProcess(process)}
                                className={process.status}
                            >
                                <td data-label={I18n.t("processes.assignee")} className="assignee">
                                    {process.id === highlight && <i className="fa fa-caret-right" />}
                                    {process.assignee}
                                </td>
                                <td data-label={I18n.t("processes.step")} className="step">
                                    {process.step}
                                </td>
                                <td data-label={I18n.t("processes.status")} className="status">
                                    {process.status.replace("_", " ")}
                                </td>
                                <td data-label={I18n.t("processes.customer")} className="customer">
                                    {process.customer_name}
                                </td>
                                <td data-label={I18n.t("processes.product")} className="product">
                                    {process.product_name}
                                </td>
                                <td data-label={I18n.t("processes.workflow_name")} className="workflow_name">
                                    {process.workflow_name}
                                </td>
                                <td data-label={I18n.t("processes.started")} className="started">
                                    {renderDateTime(process.started)}
                                </td>
                                <td data-label={I18n.t("processes.last_modified")} className="last_modified">
                                    {renderDateTime(process.last_modified)}
                                </td>
                                <td
                                    data-label={I18n.t("processes.actions")}
                                    className="actions"
                                    onClick={this.toggleActions(process, actions)}
                                    tabIndex={1}
                                    onBlur={() => this.setState({ actions: { show: false, id: "" } })}
                                >
                                    <i className="fa fa-ellipsis-h" />
                                    {this.renderActions(process, actions)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
        return (
            <div>
                <em>{I18n.t("processes.no_found")}</em>
            </div>
        );
    }

    render() {
        const {
            filteredProcesses,
            actions,
            query,
            confirmationDialogOpen,
            confirmationDialogAction,
            confirmationDialogQuestion,
            sorted,
            filterAttributesAssignee,
            filterAttributesStatus,
            refresh
        } = this.state;
        return (
            <div className="mod-processes">
                <ConfirmationDialog
                    isOpen={confirmationDialogOpen}
                    cancel={this.cancelConfirmation}
                    confirm={confirmationDialogAction}
                    question={confirmationDialogQuestion}
                />
                <div className="card">
                    <div className="options">
                        <FilterDropDown
                            items={filterAttributesAssignee}
                            filterBy={this.filter}
                            label={I18n.t("processes.assignee")}
                        />
                        <FilterDropDown
                            items={filterAttributesStatus}
                            filterBy={this.filter}
                            label={I18n.t("processes.status")}
                        />
                        <section className="search">
                            <input
                                className="allowed"
                                placeholder={I18n.t("processes.searchPlaceHolder")}
                                type="text"
                                onChange={this.search}
                                value={query}
                            />
                            <i className="fa fa-search" />
                        </section>
                        <button
                            type="submit"
                            name="new-process"
                            id="new-process"
                            className="new button green"
                            onClick={this.newProcess}
                        >
                            {I18n.t("processes.new")} <i className="fa fa-plus" />
                        </button>
                    </div>
                </div>
                <section className="refresh">
                    <CheckBox
                        name="refresh"
                        info={I18n.t("processes.refresh")}
                        value={refresh}
                        onChange={this.toggleRefresh}
                    />
                </section>
                <section className="processes">{this.renderProcessesTable(filteredProcesses, actions, sorted)}</section>
                <ScrollUpButton />
            </div>
        );
    }
}

Processes.contextType = ApplicationContext;
