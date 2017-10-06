import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";
import debounce from "lodash/debounce";
import {processes} from "../api";
import {isEmpty, stop} from "../utils/Utils";
import ConfirmationDialog from "../components/ConfirmationDialog";

import "./Processes.css";

export default class Processes extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            selected: -1,
            processes: [],
            filteredProcesses: [],
            query: "",
            actions: {show: false, id: ""},
            sorted: {name: "assignee", descending: true},
            filterAttributes: [
                {name: "", selected: true, count: 0},
                {name: "", selected: true, count: 0},
                {name: "", selected: true, count: 0},
                {name: "", selected: true, count: 0}
            ],
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this,
            confirm: () => this,
            confirmationDialogQuestion: ""
        };
    }

    componentDidMount = () => processes()
        .then(results => {
            const {organisations} = this.props;
            results.forEach(process => process.customer_name = this.organisationNameByUuid(process.customer, organisations));
            this.setState({processes: results, filteredProcesses: results})
        });

    cancelConfirmation = () => this.setState({confirmationDialogOpen: false});

    showProcess = process => () => this.props.history.push("/process/" + process.id);

    newProcess = () => this.props.history.push("/new-process");

    search = e => {
        const query = e.target.value;
        this.setState({query: query});
        this.delayedSearch(query);
    };

    delayedSearch = debounce(query => {
        let processes = [...this.state.processes];
        if (!isEmpty(query)) {
            const queryToLower = query.toLowerCase();
            const searchable = ["assignee", "step", "customer_name", "product", "workflow_name"];
            processes = processes.filter(process => searchable
                .map(search => process[search].toLowerCase().indexOf(queryToLower))
                .some(indexOf => indexOf > -1)
            );
        }
        this.setState({query: query, filteredProcesses: processes});
    }, 250);

    toggleActions = (process, actions) => e => {
        stop(e);
        const newShow = actions.id === process.id ? !actions.show : true;
        this.setState({actions: {show: newShow, id: process.id}});
    };

    renderActions = (process, actions) => e => {
        return null;
    };

    renderDate = epoch => new Date(epoch * 1000).toLocaleString();

    sortBy = name => (a, b) => {
        const aSafe = a[name] || "";
        const bSafe = b[name] || "";
        return typeof aSafe === "string" ? aSafe.toLowerCase().localeCompare(bSafe.toLowerCase()) : aSafe - bSafe;
    };

    sort = name => e => {
        stop(e);
        const sorted = {...this.state.sorted};
        const filteredProcesses = [...this.state.filteredProcesses].sort(this.sortBy(name));

        sorted.descending = sorted.name === name ? !sorted.descending : true;
        sorted.name = name;
        this.setState({
            filteredProcesses: sorted.descending ? filteredProcesses : filteredProcesses.reverse(),
            sorted: sorted
        });
    };

    organisationNameByUuid = (uuid, organisations) => {
        const organisation = organisations.find(org => org.uuid === uuid);
        return organisation ? organisation.name : uuid;
    };

    sortColumnIcon = (name, sorted) => {
        if (sorted.name === name) {
            return <i className={sorted.descending ? "fa fa-sort-desc" : "fa fa-sort-asc"}></i>
        }
        return <i/>;
    };

    renderProcessesTable(processes, actions, sorted, organisations) {
        const columns = ["assignee", "step", "customer", "product", "workflow_name", "started", "last_modified", "actions"];
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
                        <tr key={`${process.id}_${index}`} onClick={this.showProcess(process)}>
                            <td data-label={I18n.t("processes.assignee")} className="assignee">{process.assignee}</td>
                            <td data-label={I18n.t("processes.step")} className="status">{process.step}</td>
                            <td data-label={I18n.t("processes.customer")}
                                className="customer">{process.customer_name}</td>
                            <td data-label={I18n.t("processes.product")} className="product">{process.product}</td>
                            <td data-label={I18n.t("processes.workflow_name")}
                                className="workflow_name">{process.workflow_name}</td>
                            <td data-label={I18n.t("processes.started")}
                                className="started">{this.renderDate(process.started)}</td>
                            <td data-label={I18n.t("processes.last_modified")}
                                className="product">{this.renderDate(process.last_modified)}</td>
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
            confirmationDialogQuestion, sorted
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
                        <section className="search">
                            <input className="allowed"
                                   placeholder={I18n.t("processes.searchPlaceHolder")}
                                   type="text"
                                   onChange={this.search}
                                   value={query}/>
                            <i className="fa fa-search"></i>
                        </section>
                        <a className="new button green" onClick={this.newProcess}>
                            {I18n.t("processes.new")}<i className="fa fa-plus"></i>
                        </a>
                    </div>
                </div>
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
    organisations: PropTypes.array.isRequired
};

