import React from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";
import CheckBox from "./CheckBox";
import "./CheckBox.css";


export default class NOCConfirm extends React.PureComponent {

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
        const {new_service_built, no_errors, cfm_up, ims_primary, ims_secondary} = this.state;
        const {is_redundant} = this.props;
        //this safe use of an eval statement is bypass of issue by asynchronous value setting of setState
        eval(e.target.name + " = e.target.checked"); // eslint-disable-line no-eval
        let isValid = new_service_built && no_errors && cfm_up && ims_primary && (ims_secondary || !(is_redundant));
        this.props.onChange(isValid);
    };

    render() {
        const {new_service_built, no_errors, cfm_up, client_confirmed} = this.state;
        const {is_redundant, circuits} = this.props;
        const new_service_built_on_network = I18n.t(`process.noc_subtask_confirmation_checks.check_service_built`);
        const iface_no_errors = I18n.t(`process.noc_subtask_confirmation_checks.check_iface_no_errors`);
        const cfm_up_info = I18n.t(`process.noc_subtask_confirmation_checks.check_cfm_up`);
        const client_confirmed_info = I18n.t(`process.noc_subtask_confirmation_checks.check_client_confirmed`);
        const {ims_primary, ims_secondary} = this.state;

        return (
            <section className="NOCConfirm">
                <CheckBox name="new_service_built" onChange={this.onChangeInternal}
                          value={new_service_built} info={new_service_built_on_network} />
                <CheckBox name="no_errors" onChange={this.onChangeInternal} value={no_errors} info={iface_no_errors} />
                <CheckBox name="cfm_up" value={cfm_up} info={cfm_up_info} onChange={this.onChangeInternal} />
                <label>{I18n.t(`process.noc_subtask_confirmation_checks.check_ims_defined`)}</label><br/>
                      {is_redundant && <div><CheckBox className="level_2" name="ims_primary" value={ims_primary}
                                                      info={circuits[0]} onChange={this.onChangeInternal} /> <br />
                          <CheckBox name="ims_secondary" className="level_2" onChange={this.onChangeInternal}
                                    value={ims_secondary} info={circuits[1]} /></div> }
                {!is_redundant && <CheckBox className="level_2" name="ims_primary" value={ims_primary} onChange={this.onChangeInternal}
                                            info={circuits[0]} /> }
                <CheckBox name="client_confirmed" value={client_confirmed} info={client_confirmed_info} />

            </section>
        );
    }

}

NOCConfirm.propTypes = {
    intro_text: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    is_redundant: PropTypes.bool.isRequired,
    circuits: PropTypes.array.isRequired
};


