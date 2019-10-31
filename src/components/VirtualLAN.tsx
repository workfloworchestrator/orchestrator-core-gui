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
import I18n from "i18n-js";
import PropTypes from "prop-types";
import { usedVlans } from "../api";
import { isEmpty } from "../utils/Utils";
import { inValidVlan } from "../validations/UserInput";

function getAllNumbersForVlanRange(vlanRange: string) {
    if (vlanRange !== "0" && inValidVlan(vlanRange)) {
        //semantically invalid so we don't validate against the already used ports
        return [];
    }

    if (vlanRange === "") {
        return [];
    }

    return numbersFromGroupedArray(
        vlanRange
            .replace(/ /g, "")
            .split(",")
            .map(sl => sl.split("-").map(Number))
    );
}

function numbersFromGroupedArray(list: number[][]) {
    return list.reduce((acc, boundaries) => {
        const max = boundaries[boundaries.length - 1];
        const min = boundaries[0];
        return acc.concat(Array.from(new Array(max - min + 1), (x, i) => min + i));
    }, []);
}

function groupedArrayFromNumbers(numbers: number[]) {
    numbers = [...numbers].sort((a, b) => a - b);

    // Group by properly incrementing numbers
    let grouped_numbers = numbers.reduce((r: number[][], n) => {
        const lastSubArray: number[] = r[r.length - 1];

        if (!lastSubArray || lastSubArray[lastSubArray.length - 1] !== n - 1) {
            r.push([]);
        }

        r[r.length - 1].push(n);

        return r;
    }, []);

    return grouped_numbers.map(l => (l[0] !== l[l.length - 1] ? [l[0], l[l.length - 1]] : [l[0]]));
}

function vlanRangeFromNumbers(list: number[]) {
    return groupedArrayFromNumbers(list)
        .map(sl => sl.join("-"))
        .join(",");
}

function vlansInUse(vlanRange: string, usedVlans: number[][]) {
    const numbers = getAllNumbersForVlanRange(vlanRange);
    return numbers.filter(num =>
        usedVlans.some(used => (used.length > 1 ? num >= used[0] && num <= used[1] : num === used[0]))
    );
}

interface IProps {
    subscriptionId: string | null;
    vlan: string;
    vlansExtraInUse: string;
    servicePortTag?: string;
    disabled: boolean;
    reportError: (isValid: boolean) => void;
    onChange: (e: React.FormEvent<HTMLInputElement>) => void;
    portMode?: string;
}

interface IState {
    usedVlans: number[];
    vlansInUse: number[];
    missingInIms: boolean;
    invalidFormat: boolean;
}

/**
 * If you want to use this component you have to use the key prop with the subscriptionId as value.
 * See https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
 */
export default class VirtualLAN extends React.PureComponent<IProps> {
    static propTypes: {};
    static defaultProps: {};
    state: IState = {
        usedVlans: [],
        vlansInUse: [],
        missingInIms: false,
        invalidFormat: false
    };

    constructor(props: IProps) {
        super(props);

        if (props.subscriptionId) {
            usedVlans(props.subscriptionId)
                .then(result => {
                    let usedVlans = numbersFromGroupedArray(result);

                    // Filter currently used vlans because they are probably from the current subscription
                    const currentVlans = getAllNumbersForVlanRange(props.vlan);
                    usedVlans = usedVlans.filter(n => !currentVlans.includes(n));

                    this.setState({ usedVlans: usedVlans, missingInIms: false });

                    // Don't validate if disabled (untagged shows as disable but needs validation)
                    if (!props.disabled) {
                        this.validateUsedVlans(props.vlan);
                    }
                })
                .catch(e => {
                    this.setState({ missingInIms: true });
                    this.props.reportError(true);
                });
        }
    }

    validFormat = (vlanRange: string) => {
        const { disabled, vlan } = this.props;

        // If disabled, untagged or empty we don't need syntax validation
        return disabled || vlan === "" || vlan === "0" ? vlanRange === vlan : !inValidVlan(vlanRange);
    };

    validateUsedVlans = (vlanRange: string) => {
        // This gets called onBlur (so we don't validate during typing) or
        // on mount to check if an untagged port is not already used

        const { vlansExtraInUse } = this.props;
        const { usedVlans, missingInIms } = this.state;

        const allUsedVlans = groupedArrayFromNumbers(usedVlans.concat(getAllNumbersForVlanRange(vlansExtraInUse)));
        const invalidFormat = !this.validFormat(vlanRange);

        // Can't check if input is invalid
        let inUse: number[] = [];

        if (!invalidFormat) {
            inUse = vlansInUse(vlanRange, allUsedVlans);
        }

        this.setState({ vlansInUse: inUse, invalidFormat: invalidFormat });
        this.props.reportError(!isEmpty(inUse) || invalidFormat || missingInIms);
    };

    onChangeInternal = (e: React.FormEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;

        if (this.validFormat(target.value)) {
            this.props.onChange(e);
        }
    };

    onBlur = (e: React.FormEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        this.validateUsedVlans(target.value);
    };

    render() {
        const { usedVlans, vlansInUse, missingInIms, invalidFormat } = this.state;
        const { vlan, subscriptionId, disabled, vlansExtraInUse, portMode } = this.props;
        const allUsedVlans = vlanRangeFromNumbers(usedVlans.concat(getAllNumbersForVlanRange(vlansExtraInUse)));
        const placeholder = subscriptionId ? I18n.t("vlan.placeholder") : I18n.t("vlan.placeholder_no_service_port");

        const error = missingInIms
            ? I18n.t("vlan.missingInIms")
            : invalidFormat
            ? I18n.t("vlan.invalid_vlan")
            : !isEmpty(vlansInUse)
            ? vlansInUse.length >= 1 && vlansInUse[0] === 0
                ? I18n.t("vlan.untaggedPortInUse")
                : I18n.t("vlan.vlansInUseError", { vlans: vlansInUse.join(", ") })
            : undefined;
        const message = isEmpty(allUsedVlans)
            ? portMode === "tagged"
                ? I18n.t("vlan.allPortsAvailable")
                : I18n.t("vlan.taggedOnly")
            : I18n.t("vlan.vlansInUse", { vlans: allUsedVlans });
        return (
            <div className="virtual-vlan">
                <input
                    type="text"
                    value={vlan}
                    placeholder={placeholder}
                    disabled={!subscriptionId || disabled || portMode === "untagged"}
                    onChange={this.props.onChange}
                    onBlur={this.onBlur}
                />
                {subscriptionId && !disabled && <em>{message}</em>}
                {error && <em className="error">{error}</em>}
            </div>
        );
    }
}

VirtualLAN.propTypes = {
    onChange: PropTypes.func.isRequired,
    reportError: PropTypes.func.isRequired,
    vlansExtraInUse: PropTypes.string,
    vlan: PropTypes.string,
    subscriptionId: PropTypes.string,
    disabled: PropTypes.bool,
    portMode: PropTypes.string
};

VirtualLAN.defaultProps = {
    vlansExtraInUse: "",
    portMode: ""
};
