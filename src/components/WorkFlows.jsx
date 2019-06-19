import React from "react";
import I18n from "i18n-js";
import debounce from "lodash/debounce";
import { isEmpty, stop } from "../utils/Utils";

import "./Workflows.scss";
import { renderDateTime } from "../utils/Lookups";
import FilterDropDown from "./FilterDropDown";
import { allWorkflowsWithProductTags } from "../api";

export default class WorkFlows extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            workflows: [],
            filteredWorkflows: [],
            filterAttributesProductTag: [],
            filterAttributesTarget: [],
            query: "",
            sorted: { name: "name", descending: true }
        };
    }

    componentDidMount() {
        allWorkflowsWithProductTags().then(res => {
            res.forEach(wf => (wf.product_tags_string = wf.product_tags.join(", ")));
            const newFilterAttributesProductTag = [];
            const uniqueWorkflowTags = res.reduce((acc, wf) => {
                wf.product_tags.forEach(t => acc.add(t));
                return acc;
            }, new Set());
            uniqueWorkflowTags.forEach(tag =>
                newFilterAttributesProductTag.push({
                    name: tag,
                    selected: true,
                    count: res.filter(wf => wf.product_tags.includes(tag)).length
                })
            );
            const newFilterAttributesTarget = [];
            const uniqueTargets = [...new Set(res.map(wf => wf.target))];
            uniqueTargets.forEach(target =>
                newFilterAttributesTarget.push({
                    name: target,
                    selected: true,
                    count: res.filter(wf => wf.target === target).length
                })
            );
            res = res.sort(this.sortBy(this.state.sorted.name));
            this.setState({
                workflows: res,
                filteredWorkflows: res,
                filterAttributesProductTag: newFilterAttributesProductTag.filter(attr => attr.count > 0),
                filterAttributesTarget: newFilterAttributesTarget.filter(attr => attr.count > 0)
            });
        });
    }

    search = e => {
        const query = e.target.value;
        this.setState({ query: query });
        this.delayedSearch(query);
    };

    doSearchAndSort = (query, workflows, sorted, filterAttributesProductTag, filterAttributesTarget) => {
        if (!isEmpty(query)) {
            const queryToLower = query.toLowerCase();
            const searchable = ["name", "description", "target", "product_tags_string"];
            workflows = workflows.filter(p =>
                searchable
                    .filter(search => p[search])
                    .map(search => p[search].toLowerCase().indexOf(queryToLower))
                    .some(indexOf => indexOf > -1)
            );
        }
        workflows = workflows.filter(wf => {
            const filter = filterAttributesProductTag.find(attr => wf.product_tags.includes(attr.name));
            return filter ? filter.selected : true;
        });

        workflows = workflows.filter(wf => {
            const filter = filterAttributesTarget.find(attr => attr.name === wf.target);
            return filter ? filter.selected : true;
        });

        workflows.sort(this.sortBy(sorted.name));
        return sorted.descending ? workflows.reverse() : workflows;
    };

    delayedSearch = debounce(query => {
        const workflows = [...this.state.workflows];
        const { sorted, filterAttributesProductTag, filterAttributesTarget } = this.state;
        this.setState({
            query: query,
            filteredWorkflows: this.doSearchAndSort(
                query,
                workflows,
                sorted,
                filterAttributesProductTag,
                filterAttributesTarget
            )
        });
    }, 250);

    sortBy = name => (a, b) => {
        const aSafe = a[name] || "";
        const bSafe = b[name] || "";
        return typeof aSafe === "string" ? aSafe.toLowerCase().localeCompare(bSafe.toLowerCase()) : aSafe - bSafe;
    };

    sort = name => e => {
        stop(e);
        const sorted = { ...this.state.sorted };
        const filteredWorkflows = [...this.state.filteredWorkflows].sort(this.sortBy(name));

        sorted.descending = sorted.name === name ? !sorted.descending : false;
        sorted.name = name;
        this.setState({
            filteredWorkflows: sorted.descending ? filteredWorkflows.reverse() : filteredWorkflows,
            sorted: sorted
        });
    };

    filter = name => item => {
        const { workflows, sorted, query, filterAttributesProductTag, filterAttributesTarget } = this.state;
        const newFilterAttributesProductTag = [...filterAttributesProductTag];
        if (name === "workflow_tag") {
            newFilterAttributesProductTag.forEach(attr => {
                if (attr.name === item.name) {
                    attr.selected = !attr.selected;
                }
            });
        }
        const newFilterAttributesTarget = [...filterAttributesTarget];
        if (name === "target") {
            newFilterAttributesTarget.forEach(attr => {
                if (attr.name === item.name) {
                    attr.selected = !attr.selected;
                }
            });
        }
        this.setState({
            filterAttributesProductTag: newFilterAttributesProductTag,
            filterAttributesTarget: newFilterAttributesTarget,
            filteredWorkflows: this.doSearchAndSort(
                query,
                workflows,
                sorted,
                newFilterAttributesProductTag,
                newFilterAttributesTarget
            )
        });
    };

    sortColumnIcon = (name, sorted) => {
        if (sorted.name === name) {
            return <i className={sorted.descending ? "fa fa-sort-desc" : "fa fa-sort-asc"} />;
        }
        return <i />;
    };

    renderWorkflows(workflows, actions, sorted) {
        const columns = ["name", "description", "target", "product_tags_string", "created_at"];
        const th = index => {
            const name = columns[index];
            return (
                <th key={index} className={name} onClick={this.sort(name)}>
                    <span>{I18n.t(`metadata.workflows.${name}`)}</span>
                    {this.sortColumnIcon(name, sorted)}
                </th>
            );
        };
        const tdValues = columns.slice(0, columns.indexOf("created_at"));
        const td = (name, workflow) => (
            <td key={name} data-label={I18n.t(`metadata.workflows.${name}`)} className={name}>
                {workflow[name]}
            </td>
        );

        if (workflows.length !== 0) {
            return (
                <table className="workflows">
                    <thead>
                        <tr>{columns.map((column, index) => th(index))}</tr>
                    </thead>
                    <tbody>
                        {workflows.map((workflow, index) => (
                            <tr className={this.workFlowClassName(workflow)} key={`${workflow.workflow_id}_${index}`}>
                                {tdValues.map(tdValue => td(tdValue, workflow))}
                                <td data-label={I18n.t("metadata.workflows.created_at")} className="created_at">
                                    {renderDateTime(workflow.created_at)}
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td className="metadata-results" colSpan={6}>
                                {I18n.t("metadata.results", {
                                    type: "Workflows",
                                    count: workflows.length
                                })}
                            </td>
                        </tr>
                    </tbody>
                </table>
            );
        }
        return (
            <div>
                <em>{I18n.t("metadata.workflows.no_found")}</em>
            </div>
        );
    }
    workFlowClassName = workflow =>
        workflow.target !== "SYSTEM" && workflow.product_tags.length === 0 ? "invalid" : "";

    render() {
        const {
            filteredWorkflows,
            actions,
            query,
            sorted,
            filterAttributesProductTag,
            filterAttributesTarget
        } = this.state;
        return (
            <div className="mod-workflows">
                <div className="options">
                    <FilterDropDown
                        items={filterAttributesProductTag}
                        filterBy={this.filter("workflow_tag")}
                        label={I18n.t("metadata.workflows.tag")}
                    />
                    <FilterDropDown
                        items={filterAttributesTarget}
                        filterBy={this.filter("target")}
                        label={I18n.t("metadata.workflows.target")}
                    />
                    <section className="search">
                        <input
                            className="allowed"
                            placeholder={I18n.t("metadata.workflows.searchPlaceHolder")}
                            type="text"
                            onChange={this.search}
                            value={query}
                        />
                        <i className="fa fa-search" />
                    </section>
                </div>
                <section className="explanation">
                    <p>{I18n.t("metadata.workflows.explanation")}</p>
                </section>
                <section className="workflows">{this.renderWorkflows(filteredWorkflows, actions, sorted)}</section>
            </div>
        );
    }
}
