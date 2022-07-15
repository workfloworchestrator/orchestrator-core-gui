/*
 * Copyright 2019-2022 SURF.
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

import { EuiButton, EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiText, EuiTitle } from "@elastic/eui";
import { tableImpactedObjects } from "custom/components/cim/ServiceTicketDetailImpactedObjectsStyling";
import { ServiceTicketImpactedObjectImpact, ServiceTicketWithDetails } from "custom/types";
import { isDate, isEmpty } from "lodash";
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";
import Select from "react-select";
import ApplicationContext from "utils/ApplicationContext";
import { Option, SortOption, SubscriptionModel } from "utils/types";
import { stop } from "utils/Utils";

type Column = "customer" | "impact" | "type" | "subscription" | "impact_override";

interface IProps extends WrappedComponentProps {
    ticket: ServiceTicketWithDetails;
    updateable: boolean;
    acceptImpactedObjects: () => void;
}

export interface ImpactedObject {
    customer: string;
    impact: ServiceTicketImpactedObjectImpact;
    type: string;
    subscription: string;
    impact_override?: ServiceTicketImpactedObjectImpact;
    subscription_id: string;
    ims_circuit_id: number;
    ims_circuit_name: string;
    extra_information?: string;
}

const options: Option[] = (Object.values(ServiceTicketImpactedObjectImpact) as string[]).map((val) => ({
    value: val,
    label: val,
}));

const columns: Column[] = ["customer", "impact", "type", "subscription", "impact_override"];

const sortBy = (name: Column) => (a: ImpactedObject, b: ImpactedObject) => {
    const aSafe = a[name] || "";
    const bSafe = b[name] || "";
    return typeof aSafe === "string" || typeof bSafe === "string"
        ? (aSafe as string).toLowerCase().localeCompare(bSafe.toString().toLowerCase())
        : aSafe - bSafe;
};

const sortColumnIcon = (name: string, sorted: SortOption) => {
    if (sorted.name === name) {
        return <i className={sorted.descending ? "fas fa-sort-down" : "fas fa-sort-up"} />;
    }
    return <i />;
};

const ServiceTicketDetailImpactedObjects = ({ ticket, updateable, acceptImpactedObjects }: IProps) => {
    const { theme, customApiClient, apiClient } = useContext(ApplicationContext);
    const [impactedObjects, setImpactedObjects] = useState<Array<ImpactedObject>>([]);
    const [editImpactedObject, setEditImpactedObject] = useState<ImpactedObject>();
    const [sortOrder, setSortOrder] = useState<SortOption<Column>>({ name: "subscription", descending: false });

    useEffect(() => {
        getImpactedObjects();
    }, [ticket]);

    const getImpactedObjects = async () => {
        const subscriptions: Record<string, SubscriptionModel> = {};

        // Retrieve each subscription once
        for (const impacted of ticket.impacted_objects) {
            if (impacted.subscription_id in subscriptions) {
                continue;
            }
            subscriptions[impacted.subscription_id] = await apiClient.subscriptionsDetailWithModel(
                impacted.subscription_id
            );
        }

        const newImpactedObjects: ImpactedObject[] = ticket.impacted_objects
            .map((impactedObject) => {
                let subscription = subscriptions[impactedObject.subscription_id];
                return impactedObject.ims_circuits.map((imsCircuit) => {
                    return {
                        customer: impactedObject.owner_customer.customer_name,
                        impact: imsCircuit.impact,
                        type: subscription.product.product_type,
                        subscription: subscription.description,
                        impact_override: imsCircuit.impact_override,
                        subscription_id: impactedObject.subscription_id,
                        ims_circuit_id: imsCircuit.ims_circuit_id,
                        ims_circuit_name: imsCircuit.ims_circuit_name,
                        extra_information: imsCircuit.extra_information,
                    };
                });
            })
            .reduce((a, b) => a.concat(b), []);
        setImpactedObjects(newImpactedObjects);
    };

    const toggleSort = (name: Column) => (e: React.MouseEvent<HTMLTableHeaderCellElement>) => {
        stop(e);
        const newSortOrder = { ...sortOrder };
        newSortOrder.descending = newSortOrder.name === name ? !newSortOrder.descending : false;
        newSortOrder.name = name;
        setSortOrder(newSortOrder);
    };

    const sort = (unsorted: ImpactedObject[]) => {
        const { name, descending } = sortOrder;
        const sorted = unsorted.sort(sortBy(name));
        if (descending) {
            sorted.reverse();
        }
        return sorted;
    };

    const sumbitImpactOverride = async (impactedObject: ImpactedObject): Promise<void> => {
        await customApiClient.cimPatchImpactedObject(
            ticket._id,
            impactedObject.subscription_id,
            impactedObject.ims_circuit_id,
            impactedObject
        );
    };

    const editImpact = (impactedObject: ImpactedObject): (() => void) => {
        return () => updateable && setEditImpactedObject(impactedObject);
    };

    const removeEdit = (): void => {
        setEditImpactedObject(undefined);
    };

    const onChangeImpactOverride = (impactedObject: ImpactedObject) => async (e: any): Promise<void> => {
        let value: any;
        if (isEmpty(e) || isDate(e)) {
            value = e;
        } else {
            // @ts-ignore
            value = e.target ? e.target.value : e.value;
        }
        removeEdit();
        await sumbitImpactOverride(impactedObject);
        setImpactedObjects(
            impactedObjects.map((obj: ImpactedObject) =>
                obj.subscription_id === impactedObject.subscription_id ? { ...obj, impact_override: value } : obj
            )
        );
    };

    const showImpact = (impact: ImpactedObject): any => {
        if (impact === editImpactedObject) {
            return (
                <Select<Option>
                    className="impact-override__select"
                    onChange={onChangeImpactOverride(impact)}
                    onBlur={removeEdit}
                    options={options}
                    isSearchable={false}
                    value={options.filter(
                        (option) => impact.impact_override && option["value"] === impact.impact_override
                    )}
                    isClearable={true}
                    defaultMenuIsOpen={true}
                    autoFocus
                />
            );
        } else if (updateable) {
            return (
                <>
                    <EuiFlexGroup gutterSize="s">
                        <EuiFlexItem grow={false} className="impact-override__text">
                            {impact.impact_override && <EuiText> {impact.impact_override}</EuiText>}
                        </EuiFlexItem>
                        <EuiButtonIcon iconType={"pencil"} size="s" aria-label={"edit"} onClick={editImpact(impact)} />
                    </EuiFlexGroup>
                </>
            );
        }
        return impact.impact_override || "-";
    };

    const th = (name: Column, index: number) => {
        return (
            <th key={index} className={name} onClick={toggleSort(name)}>
                <span>
                    <FormattedMessage id={`tickets.impactedobject.${name}`} />
                </span>
                {sortColumnIcon(name, sortOrder)}
            </th>
        );
    };

    const createImpactObjectValueRow = (item: ImpactedObject) => {
        return (
            <tr key={`${item.subscription_id}-${item.ims_circuit_id}`} className={theme}>
                <td className="customer">{item.customer}</td>
                <td className="impact">{item.impact}</td>
                <td className="type">{item.type}</td>
                <td className="subscription">{item.subscription}</td>
                <td className={"impact-override"}>{showImpact(item)}</td>
            </tr>
        );
    };

    return (
        <>
            <EuiFlexGroup>
                <EuiFlexItem grow={false}>
                    <EuiTitle size="m">
                        <h1>Impacted objects</h1>
                    </EuiTitle>
                </EuiFlexItem>
            </EuiFlexGroup>
            <EuiFlexGroup css={tableImpactedObjects}>
                <table className="ticket-impacted-objects">
                    <thead>
                        <tr>{columns.map((column, index) => th(column, index))}</tr>
                    </thead>
                    <tbody>{sort(impactedObjects).map(createImpactObjectValueRow)}</tbody>
                </table>
            </EuiFlexGroup>
            <EuiSpacer />
            <EuiFlexGroup gutterSize="s" className="buttons">
                <EuiFlexItem>
                    <EuiButton onClick={acceptImpactedObjects} isDisabled={!updateable}>
                        <FormattedMessage id="tickets.action.accept_impact" />
                    </EuiButton>
                </EuiFlexItem>
            </EuiFlexGroup>
        </>
    );
};

export default injectIntl(ServiceTicketDetailImpactedObjects);
