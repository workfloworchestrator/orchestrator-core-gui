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
import { usedVlans as getUsedVlans } from "api";
import { SubscriptionsContext } from "components/subscriptionContext";
import I18n from "i18n-js";
import get from "lodash/get";
import React, { HTMLProps, Ref, useContext, useEffect, useState } from "react";
import { Override, connectField, filterDOMProps, joinName, useForm } from "uniforms";
import ApplicationContext from "utils/ApplicationContext";
import { ServicePort } from "utils/types";
import { isEmpty } from "utils/Utils";
import { inValidVlan } from "validations/UserInput";

import { getPortMode } from "./logic/SubscriptionField";

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

function getVlansInUse(vlanRange: string, usedVlans: number[][]) {
    const numbers = getAllNumbersForVlanRange(vlanRange);
    return numbers.filter(num =>
        usedVlans.some(used => (used.length > 1 ? num >= used[0] && num <= used[1] : num === used[0]))
    );
}

export type VlanFieldProps = Override<
    HTMLProps<HTMLDivElement>,
    {
        disabled: boolean;
        id: string;
        inputRef?: Ref<HTMLInputElement>;
        label: string;
        description?: string;
        name: string;
        onChange(value?: string): void;
        type?: string;
        value: string;
        error?: boolean;
        showInlineError?: boolean;
        errorMessage?: string;
    }
>;

function Vlan({
    disabled,
    id,
    inputRef,
    label,
    description,
    name,
    onChange,
    type,
    value,
    error,
    showInlineError,
    errorMessage,
    ...props
}: VlanFieldProps) {
    const { model } = useForm();
    const { products } = useContext(ApplicationContext);
    const { subscriptions } = useContext(SubscriptionsContext);
    const nameArray = joinName(null, name);
    const subscriptionIdFieldName = joinName(nameArray.slice(0, -1), "subscription_id");
    const completeListFieldName = joinName(nameArray.slice(0, -2));
    const subscriptionId = get(model, subscriptionIdFieldName);
    const completeList: ServicePort[] = get(model, completeListFieldName) || [];
    const vlansExtraInUse = completeList
        .filter(item => item.subscription_id === subscriptionId)
        .filter((_item, index) => index.toString() !== nameArray.slice(-2, -1)[0])
        .map(item => item.vlan)
        .join(",");

    const subscription = get(subscriptions, subscriptionId);
    const portMode = subscription && getPortMode(subscription, products);

    let [usedVlansInIms, setUsedVlansInIms] = useState<number[][]>([]);
    let [missingInIms, setMissingInIms] = useState(false);

    let validFormat = (vlanRange: string) => {
        // If disabled, untagged or empty we don't need syntax validation
        return disabled || value === "" || value === "0" ? vlanRange === value : !inValidVlan(vlanRange);
    };

    let validateUsedVlans = (vlanRange: string) => {
        // This gets called onBlur (so we don't validate during typing) or
        // on mount to check if an untagged port is not already used
        const allUsedVlans = groupedArrayFromNumbers(usedVlans.concat(getAllNumbersForVlanRange(vlansExtraInUse)));
        const invalidFormat = !validFormat(vlanRange);

        // Can't check if input is invalid
        let inUse: number[] = [];

        if (!invalidFormat) {
            inUse = getVlansInUse(vlanRange, allUsedVlans);
        }

        return { vlansInUse: inUse, invalidFormat: invalidFormat };
    };

    useEffect(() => {
        if (subscriptionId) {
            getUsedVlans(subscriptionId)
                .then(result => {
                    setUsedVlansInIms(result);
                    setMissingInIms(false);
                })
                .catch(e => {
                    setMissingInIms(true);
                });
        }
    }, [subscriptionId]);

    let usedVlans = numbersFromGroupedArray(usedVlansInIms);

    // Filter currently used vlans because they are probably from the current subscription
    const currentVlans = getAllNumbersForVlanRange(value);
    usedVlans = usedVlans.filter(n => !currentVlans.includes(n));

    // Don't validate if disabled (untagged shows as disable but needs validation)
    let vlansInUse: number[] = [];
    let invalidFormat = false;
    if (!disabled) {
        const result = validateUsedVlans(value);
        vlansInUse = result.vlansInUse;
        invalidFormat = result.invalidFormat;
    }

    const allUsedVlans = vlanRangeFromNumbers(usedVlans.concat(getAllNumbersForVlanRange(vlansExtraInUse)));
    const placeholder = subscriptionId
        ? I18n.t("forms.widgets.vlan.placeholder")
        : I18n.t("forms.widgets.vlan.placeholderNoServicePort");

    const errorMessageExtra = missingInIms
        ? I18n.t("forms.widgets.vlan.missingInIms")
        : invalidFormat
        ? I18n.t("forms.widgets.vlan.invalidVlan")
        : !isEmpty(vlansInUse)
        ? vlansInUse.length >= 1 && vlansInUse[0] === 0
            ? I18n.t("forms.widgets.vlan.untaggedPortInUse")
            : I18n.t("forms.widgets.vlan.vlansInUseError", { vlans: vlansInUse.join(", ") })
        : undefined;
    const message = isEmpty(allUsedVlans)
        ? portMode === "tagged"
            ? I18n.t("forms.widgets.vlan.allPortsAvailable")
            : I18n.t("forms.widgets.vlan.taggedOnly")
        : I18n.t("forms.widgets.vlan.vlansInUse", { vlans: allUsedVlans });

    return (
        <section {...filterDOMProps(props)}>
            {label && (
                <label htmlFor={id}>
                    {label}
                    {description && <em>{description}</em>}
                </label>
            )}
            <input
                disabled={disabled || portMode !== "tagged"}
                id={id}
                name={name}
                onChange={event => onChange(event.target.value)}
                placeholder={placeholder}
                ref={inputRef}
                type={type}
                value={portMode !== "tagged" ? 0 : value}
                onBlur={e => {
                    const target = e.target as HTMLInputElement;
                    validateUsedVlans(target.value);
                }}
            ></input>
            {subscriptionId && !disabled && <em>{message}</em>}
            {error && showInlineError && (
                <em className="error">
                    <div className="backend-validation">{errorMessage || errorMessageExtra}</div>
                </em>
            )}
        </section>
    );
}

export default connectField(Vlan, { kind: "leaf" });
