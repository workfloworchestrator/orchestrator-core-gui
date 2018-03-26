import React from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";
import {stop} from "../utils/Utils";

import "./MultipleServicePoints.css";
import MultiServicePointSelect from "./ServicePortSelect";
import VirtualLAN from "./VirtualLAN";
import {doValidateUserInput} from "../validations/UserInput";

export default class MultipleMSPs extends React.PureComponent {

    constructor(props, context) {
        super(props, context);
        this.state = {
            errors: {}
        };
    }

    onChangeInternal = (name, index) => e => {
        const msps = [...this.props.msps];
        msps[index][name] = name === "subscription_id" ? (e ? e.value : null) : (e.target ? e.target.value : null);
        this.props.onChange(msps);
    };

    addMSP = () => {
        const msps = [...this.props.msps];
        msps.push({subscription_id: null, vlan: ""});
        this.props.onChange(msps);
    };

    removeMSP = index => e => {
        stop(e);
        if (index > 1) {
            const msps = [...this.props.msps];
            msps.splice(index, 1);
            this.props.onChange(msps);
        }
    };


    validateVlan = index => e => {
        const err = {};
        doValidateUserInput({name: "n", type: "vlan_range"}, e.target.value, err);
        const errors = {...this.state.errors};
        errors[index] = err["n"];
        this.setState({errors: errors});
    };


    renderMSP = (msps, msp, index, errors, availableMSPs, organisations) => {
        const inSelect = availableMSPs.filter(aMsp => aMsp.subscription_id === msp.subscription_id ||
            !msps.some(x => x.subscription_id === aMsp.subscription_id));

        return (<section className="msp" key={index}>
            <div className="wrapper msp-select">
                {index === 0 && <label>{I18n.t("multi_msp.servicePort")}</label>}
                <MultiServicePointSelect key={index} onChange={this.onChangeInternal("subscription_id", index)}
                                         msp={msp.subscription_id}
                                         msps={inSelect}
                                         organisations={organisations}/>
            </div>
            <div className="wrapper">
                {index === 0 && <label>{I18n.t("multi_msp.vlan")}</label>}
                <div className="vlan">
                    <VirtualLAN vlan={msp.vlan} onChange={this.onChangeInternal("vlan", index)}
                                subscriptionIdMSP={msp.subscription_id} onBlur={this.validateVlan(index)}/>
                    <i className={`fa fa-minus ${index < 2 ? "disabled" : "" }`}
                       onClick={this.removeMSP(index)}></i>
                </div>
                {errors[index] && <em className="error">{I18n.t("multi_msp.invalid_vlan")}</em>}
            </div>

        </section>)
    };

    render() {
        const {availableMSPs, msps, organisations} = this.props;
        const {errors} = this.state;
        return (<section className="multiple-mps">
            {msps.map((msp, index) =>
                this.renderMSP(msps, msp, index, errors, availableMSPs, organisations))}
            <div className="add-msp"><i className="fa fa-plus" onClick={this.addMSP}></i></div>
        </section>)
    }
}

MultipleMSPs.propTypes = {
    onChange: PropTypes.func.isRequired,
    availableMSPs: PropTypes.array.isRequired,
    msps: PropTypes.array.isRequired,
    organisations: PropTypes.array.isRequired
};
