import React from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";
import CheckBox from "./CheckBox";
import "./CheckBox.css";


export default class NOCNetworkConfirm extends React.PureComponent {

    constructor(props, context) {
        super(props, context);
        this.state = {
            new_service_built: false,
            no_errors: false,
            cfm_up: false,
            ims_primary: false,
            ims_secondary: false
        };
    }

    onChangeInternal = e => {
        this.setState({[e.target.name] : e.target.checked});
        const {LR2_built, LPE_renamed} = this.state;
        //this safe use of an eval statement is bypass of issue by asynchronous value setting of setState
        eval(e.target.name + " = e.target.checked"); // eslint-disable-line no-eval
        let isValid = LR2_built && LPE_renamed;
        this.props.onChange(isValid);
    };

    render() {
        const {LR2_built, LPE_renamed} = this.state;
        const {jira_ticket_uri} = this.props;
        const LR2_built_info = I18n.t(`process.noc_upgrade_redundant_confirmation_LR2_built_info`);
        const LPE_renamed_info = I18n.t(`process.noc_upgrade_redundant_confirmation_LPE_renamed_info`);

        return (
            <section className="NOCConfirm">
                <label>{I18n.t(`process.noc_upgrade_redundant_confirmation_intro`)}</label>
                <a href={jira_ticket_uri} target="_blank">{jira_ticket_uri}</a>
                <label>{I18n.t(`process.noc_upgrade_redundant_confirmation_steps_intro`)}</label><br/>
                <CheckBox name="LR2_built" onChange={this.onChangeInternal} value={LR2_built} info={LR2_built_info} />
                <CheckBox name="LPE_renamed" onChange={this.onChangeInternal} value={LPE_renamed} info={LPE_renamed_info} />
            </section>
        );
    }

}

NOCNetworkConfirm.propTypes = {
    intro_text: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    jira_ticket_uri: PropTypes.string.isRequired
};


