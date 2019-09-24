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
import PropTypes from "prop-types";
import I18n from "i18n-js";

import { isEmpty } from "../utils/Utils";
import { fetchPortSpeedBySubscription } from "../api";

export default class BandwidthSelect extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            lowestPortSpeed: "",
            exceedsPortSpeed: false
        };
    }

    componentDidMount = () => {
        this.updateLowestPortSpeed();
    };

    componentDidUpdate(prevProps) {
        if (this.props.servicePorts !== prevProps.servicePorts) {
            this.updateLowestPortSpeed();
        }
    }

    updateLowestPortSpeed = () => {
        const { servicePorts } = this.props;
        if (servicePorts) {
            const promises = servicePorts
                .filter(m => !isEmpty(m.subscription_id))
                .map(m => fetchPortSpeedBySubscription(m.subscription_id));
            const flattened = promises.reduce((a, b) => a.concat(b), []);
            Promise.all(flattened).then(results => {
                const lowestPortSpeed = Math.min(...results);
                const toHigh = this.toHighBandwidth(lowestPortSpeed, this.props.value);
                this.setState({
                    lowestPortSpeed: lowestPortSpeed,
                    exceedsPortSpeed: toHigh
                });
            });
        }
    };

    validateMaxBandwidth = e => {
        const value = e.target.value;
        const { lowestPortSpeed } = this.state;
        const { reportError } = this.props;
        const toHigh = this.toHighBandwidth(lowestPortSpeed, value);
        this.setState({ exceedsPortSpeed: toHigh });
        reportError(toHigh);
    };

    toHighBandwidth = (lowestPortSpeed, value) => {
        return !isEmpty(lowestPortSpeed) && !isEmpty(value) && parseInt(value, 10) > parseInt(lowestPortSpeed, 10);
    };

    render() {
        const { name, value, onChange, disabled } = this.props;
        const { exceedsPortSpeed, lowestPortSpeed } = this.state;
        return (
            <div>
                <input
                    type="number"
                    id={name}
                    name={name}
                    value={value}
                    onChange={e => {
                        this.validateMaxBandwidth(e);
                        onChange(e);
                    }}
                    disabled={disabled}
                />
                {exceedsPortSpeed && <em className="error">{I18n.t("bandwidth.invalid", { max: lowestPortSpeed })}</em>}
            </div>
        );
    }
}

BandwidthSelect.propTypes = {
    servicePorts: PropTypes.array,
    name: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    reportError: PropTypes.func.isRequired,
    disabled: PropTypes.bool
};

BandwidthSelect.defaultProps = {
    servicePorts: []
};
