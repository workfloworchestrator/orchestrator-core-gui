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
import Select from "react-select";

import { free_subnets } from "../api";

import "./SplitPrefix.scss";

export default class SplitPrefix extends React.PureComponent {
    constructor(props, context) {
        super(props, context);
        this.state = {
            isValid: true,
            subnets: [],
            desired_prefixlen: 0,
            selected_subnet: ""
        };
    }

    componentDidMount() {
        const { subnet, netmask, prefixlen } = { ...this.props };
        free_subnets(subnet, prefixlen, prefixlen).then(result => {
            let subnets = result.filter(x => parseInt(x.split("/")[1], 10) === prefixlen);
            this.setState({
                subnets: subnets,
                desired_prefixlen: parseInt(netmask, 10),
                selected_subnet: subnet + "/" + netmask,
                loading: false
            });
        });
    }

    changePrefixLength = e => {
        const { subnet, netmask } = { ...this.props };
        const prefixlen = e ? e.value : null;
        if (prefixlen) {
            free_subnets(subnet, netmask, prefixlen).then(result => {
                let subnets = result.filter(x => parseInt(x.split("/")[1], 10) === prefixlen);
                this.setState({
                    subnets: subnets,
                    desired_prefixlen: prefixlen,
                    loading: false,
                    isValid: false
                });
            });
        }
    };

    selectSubnet = e => {
        this.setState({ selected_subnet: e.value, isValid: true });
        this.props.onChange(e.value);
    };

    render() {
        const { subnet, netmask, prefix_min } = this.props;
        const version = subnet.indexOf(":") === -1 ? 4 : 6;
        const max_for_version = version === 4 ? 32 : 64;
        const { desired_prefixlen, selected_subnet } = this.state;
        const prefixlengths = [...Array(max_for_version - prefix_min + 1).keys()].map(x => prefix_min + x);

        const length_options = prefixlengths.map(pl => ({ value: pl, label: pl }));
        const length_value = length_options.find(option => option.value === desired_prefixlen);

        const prefix_options = this.state.subnets.map(sn => ({ label: sn, value: sn }));
        const prefix_value = prefix_options.find(option => option.value === selected_subnet);
        return (
            <section>
                <h3>
                    Selected prefix: {subnet}/{netmask}
                </h3>
                <div>Desired netmask of the new subnet:</div>
                <Select onChange={this.changePrefixLength} options={length_options} value={length_value} />
                {this.state.subnets && (
                    <div>
                        <div>Desired prefix:</div>
                        <Select options={prefix_options} onChange={this.selectSubnet} value={prefix_value} />
                    </div>
                )}
            </section>
        );
    }
}

SplitPrefix.propTypes = {
    subnet: PropTypes.string,
    netmask: PropTypes.string,
    prefixlen: PropTypes.number,
    prefix_min: PropTypes.number,
    onChange: PropTypes.func.isRequired
};
