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

import "./IPPrefix.scss";

import React from "react";
import { IpBlock } from "utils/types";

import IpPrefixTable from "./IpPrefixTable";
import SplitPrefix from "./SplitPrefix";

interface IProps {
    preselectedPrefix?: string;
    prefix_min?: number;
    onChange: (value: string) => void;
}

interface IState {
    selected_prefix_id?: number;
    selected_prefix?: string;
    selected_prefix_state?: number; // decides the range of netmask selection in the SplitPrefix component
}

export default class IPPrefix extends React.PureComponent<IProps> {
    state: IState = {};

    componentDidMount() {
        const { preselectedPrefix } = this.props;
        if (preselectedPrefix) {
            this.setState({ loading: false });
            this.props.onChange(preselectedPrefix);
        }
    }

    selectPrefix = (prefix: IpBlock) => {
        if (prefix.state === 0 || prefix.state === 1) {
            this.setState({
                selected_prefix_id: prefix.id,
                selected_prefix: prefix.prefix,
                selected_prefix_state: prefix.state
            });
        }
        this.props.onChange(prefix.prefix);
    };

    selectIpam = (prefix: string) => {
        this.props.onChange(prefix);
    };

    render() {
        const { selected_prefix_id, selected_prefix, selected_prefix_state } = this.state;
        const { preselectedPrefix, prefix_min } = this.props;

        const usePrefix = preselectedPrefix ?? selected_prefix;
        const [subnet, netmask] = usePrefix?.split("/") ?? ["", ""];
        const usedPrefix_min = prefix_min ?? parseInt(netmask, 10) + (selected_prefix_state === 0 ? 0 : 1);

        return (
            <section className="ipblock-selector">
                <div>
                    {!prefix_min && (
                        <IpPrefixTable onChange={this.selectPrefix} selected_prefix_id={selected_prefix_id} />
                    )}
                    {usePrefix && (
                        <SplitPrefix
                            subnet={subnet}
                            prefixlen={parseInt(netmask, 10)}
                            prefix_min={usedPrefix_min}
                            onChange={this.selectIpam}
                            selected_subnet={usePrefix}
                        />
                    )}
                </div>
            </section>
        );
    }
}
