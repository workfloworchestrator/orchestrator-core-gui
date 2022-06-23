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

import { EuiFlexGroup } from "@elastic/eui";
import { intl } from "locale/i18n";
import React from "react";
import { FormattedMessage, WrappedComponentProps, injectIntl } from "react-intl";
import ApplicationContext from "utils/ApplicationContext";
import { ServiceTicketWithDetails, SortOption } from "utils/types";
import { stop } from "utils/Utils";

import { tableImpactedObjects } from "./ServiceTicketDetailImpactedObjectsStyling";

type Column = "customer" | "impact" | "type" | "subscription" | "impact_override";

interface IProps extends WrappedComponentProps {
    ticket: ServiceTicketWithDetails;
}

interface ImpactedObject {
    customer: string;
    impact: string;
    type: string;
    subscription: string;
    impact_override: string;
    subscription_id: string;
    ims_circuit_id: number;
}

interface IState {
    impactedObjects: ImpactedObject[];
    sortOrder: SortOption<Column>;
}

class ServiceTicketDetailImpactedObjects extends React.Component<IProps, IState> {
    context!: React.ContextType<typeof ApplicationContext>;
    state: IState = {
        impactedObjects: [],
        sortOrder: { name: "subscription", descending: false },
    };

    async componentDidMount() {
        this.setState({});

        const subs: any = {};
        for (const impacted of this.props.ticket.impacted_objects) {
            if (impacted.subscription_id in subs) {
                continue;
            }
            subs[impacted.subscription_id] = await this.context.apiClient.subscriptionsDetailWithModel(
                impacted.subscription_id
            );
        }
        const impactedObjects = [];
        for (const impacted of this.props.ticket.impacted_objects) {
            const sub = subs[impacted.subscription_id];
            for (const circuit of impacted.ims_circuits) {
                impactedObjects.push({
                    customer: impacted.owner_customer.customer_name,
                    impact: circuit.impact,
                    type: sub.product.product_type,
                    subscription: sub.description,
                    impact_override: circuit.impact_override,
                    subscription_id: impacted.subscription_id,
                    ims_circuit_id: circuit.ims_circuit_id,
                });
            }
        }
        this.setState({ impactedObjects: impactedObjects });
    }

    sortBy = (name: Column) => (a: ImpactedObject, b: ImpactedObject) => {
        const aSafe = a[name] === undefined ? "" : a[name];
        const bSafe = b[name] === undefined ? "" : b[name];
        return typeof aSafe === "string" || typeof bSafe === "string"
            ? (aSafe as string).toLowerCase().localeCompare(bSafe.toString().toLowerCase())
            : aSafe - bSafe;
    };

    toggleSort = (name: Column) => (e: React.MouseEvent<HTMLTableHeaderCellElement>) => {
        stop(e);
        const sortOrder = { ...this.state.sortOrder };
        sortOrder.descending = sortOrder.name === name ? !sortOrder.descending : false;
        sortOrder.name = name;
        this.setState({ sortOrder: sortOrder });
    };

    sort = (unsorted: ImpactedObject[]) => {
        const { name, descending } = this.state.sortOrder;
        const sorted = unsorted.sort(this.sortBy(name));
        if (descending) {
            sorted.reverse();
        }
        return sorted;
    };

    sortColumnIcon = (name: string, sorted: SortOption) => {
        if (sorted.name === name) {
            return <i className={sorted.descending ? "fas fa-sort-down" : "fas fa-sort-up"} />;
        }
        return <i />;
    };

    render() {
        const columns: Column[] = ["customer", "impact", "type", "subscription", "impact_override"];
        const { theme } = this.context;

        const th = (index: number) => {
            const name = columns[index];
            return (
                <th key={index} className={name} onClick={this.toggleSort(name)}>
                    <span>
                        <FormattedMessage id={`tickets.impactedobject.${name}`} />
                    </span>
                    {this.sortColumnIcon(name, this.state.sortOrder)}
                </th>
            );
        };
        const { impactedObjects: impactedCircuits } = this.state;
        // @ts-ignore
        const sortedCircuits = this.sort(impactedCircuits);
        return (
            <EuiFlexGroup css={tableImpactedObjects}>
                <table className="impactedObjects">
                    <thead>
                        <tr>{columns.map((column, index) => th(index))}</tr>
                    </thead>
                    <tbody>
                        {sortedCircuits.map((circuit) => (
                            <tr key={`${circuit.subscription_id}-${circuit.ims_circuit_id}`} className={theme}>
                                <td className="customer">{circuit.customer}</td>
                                <td className="impact">{circuit.impact}</td>
                                <td className="type">{circuit.type}</td>
                                <td className="subscription">{circuit.subscription}</td>
                                <td className="impact_override">{circuit.impact_override}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </EuiFlexGroup>
        );
    }
}
ServiceTicketDetailImpactedObjects.contextType = ApplicationContext;

export default injectIntl(ServiceTicketDetailImpactedObjects);
