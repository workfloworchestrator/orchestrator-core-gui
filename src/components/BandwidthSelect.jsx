import React from "react";
import PropTypes from "prop-types";
import I18n from "i18n-js";

import {isEmpty} from "../utils/Utils";
import {fetchPortSpeedByProduct, fetchPortSpeedBySubscription} from "../api";

export default class BandwidthSelect extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            lowestPortSpeed: "",
            exceedsPortSpeed: false,
            portIdentifiers: []
        }
    }

    portSpeed = (userInput, valueOnly = false) => {
        if (userInput.type === "ssp_product") {
            return valueOnly ? userInput.value : [fetchPortSpeedByProduct(userInput.value)];
        } else if (userInput.type === "multi_msp" || userInput.type === "service_ports") {
            return userInput.value
                .filter(m => !isEmpty(m.subscription_id))
                .map(m => valueOnly ? m.subscription_id : fetchPortSpeedBySubscription(m.subscription_id))
        }
        return valueOnly ? userInput.value : [fetchPortSpeedBySubscription(userInput.value)]
    };

    componentDidMount = (props = this.props) => {
        const inputs = this.portSpeedInputValues(props);
        if (inputs.length > 0) {
            const promises = inputs.map(i => this.portSpeed(i));
            const flattened = promises.reduce((a, b) => a.concat(b), []);
            Promise.all(flattened)
                .then(results => {
                    const lowestPortSpeed = Math.min(...results);
                    const toHigh = this.toHighBandwidth(lowestPortSpeed, this.props.value);
                    this.setState({lowestPortSpeed: lowestPortSpeed, exceedsPortSpeed: toHigh})
                });
        }
    };

    portSpeedInputValues = props => {
        const {stepUserInput, portsKey} = props;
        if (isEmpty(portsKey) || isEmpty(stepUserInput)) {
            return [];
        }
        return portsKey.map(key => stepUserInput.find(i => i.name === key))
            .filter(i => !isEmpty(i))
            .filter(i => !isEmpty(i.value))
            .sort();
    };

    componentWillReceiveProps(nextProps) {
        const next = this.portSpeedInputValues(nextProps).map(i => this.portSpeed(i, true));
        const {portIdentifiers} = this.state;
        if (portIdentifiers.join() === next.join()) {
            //equality
            return;
        }
        this.setState({portIdentifiers: [...next]});
        this.componentDidMount(nextProps);
    }

    validateMaxBandwidth = e => {
        const value = e.target.value;
        const {lowestPortSpeed} = this.state;
        const toHigh = this.toHighBandwidth(lowestPortSpeed, value);
        this.setState({exceedsPortSpeed: toHigh});
        this.props.onBlur(e);
    };

    toHighBandwidth = (lowestPortSpeed, value) => {
        return !isEmpty(lowestPortSpeed) && !isEmpty(value) && parseInt(value, 10) > parseInt(lowestPortSpeed, 10);
    };

    render() {
        const {name, value, onChange, disabled} = this.props;
        const {exceedsPortSpeed, lowestPortSpeed} = this.state;
        return (
            <div>
                <input type="number" id={name} name={name}
                       value={value}
                       onChange={onChange} onBlur={this.validateMaxBandwidth} disabled={disabled}/>
                {exceedsPortSpeed && <em className="error">{I18n.t("bandwidth.invalid", {max: lowestPortSpeed})}</em>}
            </div>
        );
    }

}

BandwidthSelect.propTypes = {
    stepUserInput: PropTypes.array.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string,
    portsKey: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired,
    disabled: PropTypes.bool
};


