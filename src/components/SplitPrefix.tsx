/*
 * Copyright 2019-2020 SURF.
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

import "./SplitPrefix.scss";

import { range } from "lodash";
import React from "react";
import Select, { ValueType } from "react-select";
import { Option } from "utils/types";

import { free_subnets } from "../api";

interface IProps {
    subnet: string;
    prefixlen: number;
    prefix_min: number;
    onChange: (value: string) => void;
    selected_subnet?: string;
}

interface IState {
    isValid: boolean;
    subnets: [];
    desired_prefixlen: number;
}

export default class SplitPrefix extends React.PureComponent<IProps> {
    state: IState = {
        isValid: true,
        subnets: [],
        desired_prefixlen: 0
    };

    componentDidMount() {
        const { subnet, prefixlen } = { ...this.props };
        free_subnets(subnet, prefixlen, prefixlen).then(result => {
            let subnets = result.filter(x => parseInt(x.split("/")[1], 10) === prefixlen);
            this.setState({
                subnets: subnets,
                desired_prefixlen: prefixlen,
                loading: false
            });
        });
    }

    changePrefixLength = (e: ValueType<Option<number>>) => {
        const { subnet, prefixlen } = { ...this.props };
        const desiredPrefixlen = e ? (e as Option<number>).value : null;
        if (desiredPrefixlen) {
            free_subnets(subnet, prefixlen, desiredPrefixlen).then(result => {
                let subnets = result.filter(x => parseInt(x.split("/")[1], 10) === desiredPrefixlen);
                this.setState({
                    subnets: subnets,
                    desired_prefixlen: desiredPrefixlen,
                    loading: false,
                    isValid: false
                });
            });
        }
    };

    selectSubnet = (e: ValueType<Option>) => {
        this.props.onChange((e as Option).value);
    };

    render() {
        const { subnet, prefixlen, prefix_min, selected_subnet } = this.props;
        const version = subnet.indexOf(":") === -1 ? 4 : 6;
        const max_for_version = version === 4 ? 32 : 64;
        const { desired_prefixlen } = this.state;
        const prefixlengths = range(max_for_version - prefix_min + 1).map(x => prefix_min + x);
        const length_options: Option<number>[] = prefixlengths.map(pl => ({ value: pl, label: pl.toString() }));
        const length_value = length_options.find(option => option.value === desired_prefixlen);

        const prefix_options = this.state.subnets.map(sn => ({ label: sn, value: sn }));
        const prefix_value = prefix_options.find(option => option.value === selected_subnet);
        return (
            <section>
                <h3>
                    Selected prefix: {subnet}/{prefixlen}
                </h3>
                <div>Desired netmask of the new subnet:</div>
                <Select
                    id="desired-netmask"
                    onChange={this.changePrefixLength}
                    options={length_options}
                    value={length_value}
                />
                {this.state.subnets && (
                    <div>
                        <div>Desired prefix:</div>
                        <Select
                            id="desired-prefix"
                            options={prefix_options}
                            onChange={this.selectSubnet}
                            value={prefix_value}
                        />
                    </div>
                )}
            </section>
        );
    }
}
