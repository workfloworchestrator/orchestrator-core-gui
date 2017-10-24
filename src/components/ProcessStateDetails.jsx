import React from "react";
import "./ProcessStateDetails.css";
import Highlight from "react-highlight";
import "highlight.js/styles/default.css";
import PropTypes from "prop-types";
import CopyToClipboard from "react-copy-to-clipboard";
import I18n from "i18n-js";
import ReactTooltip from "react-tooltip";
import CheckBox from "./CheckBox";
import Step from "./Step";
import {capitalize, renderDateTime} from "../utils/Lookups";
import {isEmpty} from "../utils/Utils";

export default class ProcessStateDetails extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            raw: false,
            details: true,
            stateChanges: true,
            copiedToClipboard: false
        };
    }

    copiedToClipboard = () => {
        this.setState({copiedToClipboard: true});
        setTimeout(() => this.setState({copiedToClipboard: false}), 5000);
    };

    renderRaw = process => {
        const {copiedToClipboard} = this.state;
        const copiedToClipBoardClassName = copiedToClipboard ? "copied" : "";
        const tooltip = I18n.t(copiedToClipboard ? "process_state.copied" : "process_state.copy");
        const json = JSON.stringify(process, null, 4);
        return (
            <section>
                <CopyToClipboard text={json} onCopy={this.copiedToClipboard}>
                        <span className="copy-to-clipboard-container">
                            <a data-for="copy-to-clipboard" data-tip>
                                <i className={`fa fa-clone ${copiedToClipBoardClassName}`}></i>
                            </a>
                            <ReactTooltip id="copy-to-clipboard" place="right" getContent={[() => tooltip, 500]}/>
                        </span>
                </CopyToClipboard>
                <Highlight className="JSON">
                    {json}
                </Highlight>
            </section>
        )


    };

    renderProcessHeaderInformation = process => {
        const {raw, details, stateChanges} = this.state;
        return (
            <section className="header-information">
                <ul>
                    <li className="process-wording"><h3>{I18n.t("process_state.wording", {
                        product: process.productName,
                        customer: process.customerName
                    })}</h3></li>
                </ul>
                <ul>
                    {!raw && <li className="toggle-details"><CheckBox name="details" value={details}
                                                                      info={I18n.t("process_state.details")}
                                                                      onChange={() => this.setState({details: !details})}/>
                    </li>}
                    {!raw && <li className="toggle-state-changes"><CheckBox name="state-changes" value={stateChanges}
                                                                            info={I18n.t("process_state.stateChanges")}
                                                                            onChange={() => this.setState({stateChanges: !stateChanges})}/>
                    </li>}
                    <li><CheckBox name="raw" value={raw} info={I18n.t("process_state.raw")}
                                  onChange={() => this.setState({raw: !raw})}/></li>
                </ul>
            </section>
        )
    };

    renderSummaryValue = value => typeof value === "string" ? capitalize(value) : renderDateTime(value);


    stateDelta = (prev, curr) => {
        const prevKeys = Object.keys(prev);
        const currKeys = Object.keys(curr);
        const newKeys = currKeys.filter(key => prevKeys.indexOf(key) === -1);
        const newState = newKeys.reduce((acc, key) => {
            acc[key] = curr[key];
            return acc;
        }, {});
        return newState;
    };

    renderStateChanges = (steps, index) => {
        const step = steps[index];
        const status = step.status;
        let json = {};
        switch (status) {
            case "suspend" :
            case "abort" :
                return null;
            case "pending" :
                if (isEmpty(step.form)) {
                    return null;
                }
                json = step.form.reduce((acc, field) => {
                    acc[field.name] = "";
                    return acc;
                },{});
                break;
            case "failed" :
                json = step.state;
                break;
            case "success":
                json = (index !== 0) ? this.stateDelta(steps[index - 1].state, step.state) : step.state;
                break;
            default:
        }
        const formattedJson = JSON.stringify(json, null, 4);
        return (
            <section className="state-changes">
                <section className="state-divider">
                    <i className="fa fa-arrow-left"></i>
                </section>
                <Highlight className="JSON">
                    {formattedJson}
                </Highlight>
            </section>);
    };

    renderProcessOverview = (process, details, stateChanges) => {
        const last = i => i === process.steps.length - 1;
        const summaryKeys = ["status", "assignee", "step", "started", "last_modified"];
        return (
            <section className="process-overview">
                {details && <section className="process-summary">
                    <table>
                        <tbody>
                        {summaryKeys.map(key => <tr key={key}>
                            <td className="title">{I18n.t(`process_state.summary.${key}`)}</td>
                            <td className="value">{this.renderSummaryValue(process[key])}</td>
                        </tr>)}
                        </tbody>
                    </table>

                </section>}
                <section className="steps">
                    {process.steps.map((step, index) => {
                        return (
                            <div key={index} className="details-container">
                                <div className="step-container">
                                    <Step step={step}/>
                                    {!last(index) && <section className="step-divider">
                                        <i className="fa fa-arrow-down"></i>
                                    </section>}
                                </div>
                                {stateChanges && this.renderStateChanges(process.steps, index)}
                            </div>
                        )
                    })}
                </section>
            </section>
        )
    };

    render() {
        const {process} = this.props;
        const {raw, details, stateChanges} = this.state;
        return <section className="process-state-detail">
            {this.renderProcessHeaderInformation(process)}
            {raw ? this.renderRaw(process) : this.renderProcessOverview(process, details, stateChanges)}
        </section>
    }

}

ProcessStateDetails.propTypes = {
    process: PropTypes.object.isRequired
};

