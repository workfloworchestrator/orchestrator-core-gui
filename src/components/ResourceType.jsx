import React from "react";
import I18n from "i18n-js";
import PropTypes from "prop-types";

import ConfirmationDialog from "./ConfirmationDialog";

import {isEmpty, stop} from "../utils/Utils";
import {getParameterByName} from "../utils/QueryParameters";
import "./ResourceType.scss";
import {resourceType, resourceTypes, saveResourceType} from "../api/index";
import {setFlash} from "../utils/Flash";
import "react-datepicker/dist/react-datepicker.css";
import {formInput} from "../forms/Builder";
import {deleteResourceType} from "../api";


export default class ResourceType extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            confirmationDialogOpen: false,
            confirmationDialogAction: () => this.setState({confirmationDialogOpen: false}),
            cancelDialogAction: () => this.props.history.push("/metadata/resource_types"),
            confirmationDialogQuestion: "",
            leavePage: true,
            errors: {},
            required: ["resource_type", "description"],
            duplicateName: false,
            initial: true,
            isNew: true,
            readOnly: false,
            resourceType: {},
            processing: false,
            resourceTypes: []
        };
    }

    componentDidMount() {
        const id = this.props.match.params.id;
        if (id !== "new") {
            const readOnly = getParameterByName("readOnly", window.location.search) === "true";
            resourceType(id).then(res => this.setState({resourceType: res, isNew: false, readOnly: readOnly}));
        }
        resourceTypes().then(res => this.setState({resourceTypes: res}));
    }

    cancel = e => {
        stop(e);
        this.setState({
            confirmationDialogOpen: true, leavePage: true,
            confirmationDialogAction: () => this.setState({confirmationDialogOpen: false}),
            cancelDialogAction: () => this.props.history.push("/metadata/resource_types")
        });
    };

    handleDeleteResourceType = e => {
        stop(e);
        const {resourceType} = this.state;
        const question = I18n.t("metadata.deleteConfirmation", {
            type: "Resource Type",
            name: resourceType.resource_type
        });
        const action = () => deleteResourceType(resourceType.resource_type_id)
            .then(() => {
                this.props.history.push("/metadata/resource_types");
                setFlash(I18n.t("metadata.flash.delete", {
                    type: "Resource Type",
                    name: resourceType.resource_type
                }));
            }).catch(err => {
                if (err.response && err.response.status === 400) {
                    this.setState({confirmationDialogOpen: false});
                    err.response.json().then(json => setFlash(json["error"], "error"));
                } else {
                    throw err;
                }
            });
        this.setState({
            confirmationDialogOpen: true,
            confirmationDialogQuestion: question,
            leavePage: false,
            confirmationDialogAction: action,
            cancelDialogAction: () => this.setState({confirmationDialogOpen: false})
        });

    };

    submit = e => {
        stop(e);
        const {resourceType, processing} = this.state;
        const invalid = this.isInvalid(true) || processing;
        if (!invalid) {
            this.setState({processing: true});
            saveResourceType(resourceType).then(() => {
                this.props.history.push("/metadata/resource_types");
                setFlash(I18n.t(resourceType.resource_type_id ? "metadata.flash.updated" : "metadata.flash.created",
                    {type: "Resource Type", name: resourceType.resource_type}));
            });

        } else {
            this.setState({initial: false});
        }
    };

    renderButtons = (readOnly, initial, resourceType) => {
        if (readOnly) {
            return (<section className="buttons">
                <a className="button" onClick={() => this.props.history.push("/metadata/resource_types")}>
                    {I18n.t("metadata.resourceTypes.back")}
                </a>
            </section>);
        }
        const invalid = !initial && (this.isInvalid() || this.state.processing);
        return (<section className="buttons">
            <a className="button" onClick={this.cancel}>
                {I18n.t("process.cancel")}
            </a>
            <a tabIndex={0} className={`button ${invalid ? "grey disabled" : "blue"}`} onClick={this.submit}>
                {I18n.t("process.submit")}
            </a>
            {resourceType.resource_type_id && <a className="button red" onClick={this.handleDeleteResourceType}>
                {I18n.t("processes.delete")}
            </a>}
        </section>);
    };

    isInvalid = (markErrors = false) => {
        const {errors, required, resourceType, duplicateName} = this.state;
        const hasErrors = Object.keys(errors).some(key => errors[key]);
        const requiredInputMissing = required.some(attr => isEmpty(resourceType[attr]));
        if (markErrors) {
            const missing = required.filter(attr => isEmpty(resourceType[attr]));
            const newErrors = {...errors};
            missing.forEach(attr => newErrors[attr] = true);
            this.setState({errors: newErrors});
        }
        return hasErrors || requiredInputMissing || duplicateName
    };

    validateProperty = name => e => {
        const value = e.target.value;
        const errors = {...this.state.errors};
        const {resourceType} = this.state;
        if (name === "resource_type") {
            const nbr = this.state.resourceTypes.filter(p => p.resource_type === value).length;
            const duplicate = resourceType.resource_type_id ? nbr === 2 : nbr === 1;
            errors[name] = duplicate;
            this.setState({duplicateName: duplicate});
        }
        errors[name] = isEmpty(value);
        this.setState({errors: errors});
    };

    changeProperty = name => e => {
        const {resourceType} = this.state;
        resourceType[name] = e.target ? e.target.value : e.value;
        this.setState({resourceType: resourceType});
    };

    render() {
        const {
            confirmationDialogOpen, confirmationDialogAction, cancelDialogAction, resourceType,
            leavePage, readOnly, duplicateName, initial, confirmationDialogQuestion
        } = this.state;
        return (
            <div className="mod-resource-type">
                <ConfirmationDialog isOpen={confirmationDialogOpen}
                                    cancel={cancelDialogAction}
                                    confirm={confirmationDialogAction}
                                    leavePage={leavePage}
                                    question={confirmationDialogQuestion}/>
                <section className="card">
                    {formInput("metadata.resourceTypes.resource_type", "resource_type", resourceType.resource_type || "",
                        readOnly, this.state.errors, this.changeProperty("resource_type"), this.validateProperty("resource_type"),
                        duplicateName ? I18n.t("metadata.resourceTypes.duplicate_name") : null)}
                    {formInput("metadata.resourceTypes.description", "description", resourceType.description || "",
                        readOnly, this.state.errors, this.changeProperty("description"), this.validateProperty("description"))}
                    {this.renderButtons(readOnly, initial, resourceType)}
                </section>
            </div>
        );
    }
}

ResourceType.propTypes = {
    history: PropTypes.object.isRequired
};
