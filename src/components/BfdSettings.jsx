import React from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";

import NumericInput from "react-numeric-input";
import CheckBox from "./CheckBox";

export default class BfdSettings extends React.PureComponent {

    changeMultiplier = (valueAsNumber, valueAsString, inputElement) => {
        const {name, value, onChange} = this.props;
        const newValue = {...value, multiplier: valueAsNumber};
        onChange(name, newValue);
    }

    changeMinimumInterval = (valueAsNumber, valueAsString, inputElement) => {
        const {name, value, onChange} = this.props;
        const newValue = {...value, minimum_interval: valueAsNumber};
        onChange(name, newValue);
    }

    changeEnabled = e => {
        const {name, value, onChange} = this.props;
        const isEnabled = e.target.checked;
        const newValue = {...value, enabled: isEnabled};
        onChange(name, newValue);

    }

    render() {
        const {name, value, onChange, readOnly} =  this.props;
        return (
            <div>
               <section key={name} className={`form-divider ${name}`}>
                <CheckBox name={name} value={value.enabled || false}
                    onChange={this.changeEnabled}
                    info={"Enable BFD"}
                    disabled={readOnly}
                />
                {value.enabled &&
                    <React.Fragment>
                        <label>BFD Minimum Interval</label>
                        <NumericInput min={1} max={255000} value={value.minimum_interval} onChange={this.changeMinimumInterval} readOnly={readOnly}/>
                        <label>BFD Multiplier</label>
                        <NumericInput min={1} max={255} value={value.multiplier} onChange={this.changeMultiplier} readOnly={readOnly}/>
                    </React.Fragment>
                }
               </section>
            </div>
        )
    }
}

BfdSettings.propTypes = {
    name: PropTypes.string,
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    readOnly: PropTypes.bool
}
