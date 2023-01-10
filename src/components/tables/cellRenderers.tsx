/*
 * Copyright 2019-2023 SURF.
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
import uniq from "lodash/uniq";
import { Fragment } from "react";
import { Link } from "react-router-dom";
import { Cell } from "react-table";
import { Organization, Product, Subscription } from "utils/types";

import { cellRenderersStyling } from "./cellRenderersStyling";

export function renderSubscriptionsCell({ cell }: { cell: Cell }) {
    const subscriptions: Subscription[] = cell.value;
    const children = subscriptions.map((subscription: Subscription, index: number) => {
        return (
            <Fragment key={`${subscription.subscription_id}-${index}`}>
                {index !== 0 && <span className={"subscriptions__description-spacer"}>/</span>}
                <Link
                    key={subscription.subscription_id}
                    onClick={(e) => e.stopPropagation()}
                    to={`/subscriptions/${subscription.subscription_id}`}
                >
                    {subscription.description}
                </Link>
            </Fragment>
        );
    });
    return <EuiFlexGroup css={cellRenderersStyling}>{children}</EuiFlexGroup>;
}

export function renderProductsCell({ cell }: { cell: Cell }) {
    const subscriptions: Subscription[] = cell.value;
    return uniq(
        subscriptions.map((subscription: Subscription) => subscription.product.name)
    ).map((product_name, idx) => <p key={`product_${idx}`}>{product_name}</p>);
}

export function renderSubscriptionProductsCell({ cell }: { cell: Cell }) {
    const product: Product = cell.value;
    return product.name;
}

export function renderCustomersCell(organisations: Organization[] | null | undefined, abbreviate: boolean) {
    function lookup(uuid: string) {
        if (organisations === null || organisations === undefined) {
            return intl.formatMessage({ id: abbreviate ? "unavailable_abbreviated" : "unavailable" });
        }
        const organisation: Organization | undefined = organisations.find((org) => org.uuid === uuid);
        return organisation ? (abbreviate ? organisation.abbr : organisation.name) : uuid;
    }

    return function doRenderCustomersCell({ cell }: { cell: Cell }) {
        const subscriptions: Subscription[] = cell.value;
        return uniq(subscriptions.map((subscription) => subscription.customer_id))
            .map(lookup)
            .join(", ");
    };
}

export function renderSubscriptionCustomersCell(organisations: Organization[] | null | undefined, abbreviate: boolean) {
    function lookup(uuid: string) {
        if (organisations === null || organisations === undefined) {
            return intl.formatMessage({ id: abbreviate ? "unavailable_abbreviated" : "unavailable" });
        }
        const organisation: Organization | undefined = organisations.find((org) => org.uuid === uuid);
        return organisation ? (abbreviate ? organisation.abbr : organisation.name) : uuid;
    }

    return function doRenderCustomersCell({ cell }: { cell: Cell }) {
        const customer_id: string = cell.value;
        return lookup(customer_id);
    };
}

export function renderTimestampCell({ cell }: { cell: Cell }) {
    if (!cell.value) {
        return null;
    }
    const timestamp: number = cell.value;

    const datetime = new Date(timestamp * 1000);
    const today = new Date();
    if (
        datetime.getFullYear() === today.getFullYear() &&
        datetime.getMonth() === today.getMonth() &&
        datetime.getDay() === today.getDay()
    ) {
        return datetime.toLocaleTimeString("nl-NL").substring(0, 5) + " CET";
    } else {
        return datetime.toLocaleDateString("nl-NL");
    }
}

export function renderPidCell({ cell }: { cell: Cell }) {
    const pid: string = cell.value;
    return (
        <Link key={pid} onClick={(e) => e.stopPropagation()} to={`/processes/${pid}`} title={pid}>
            {pid.slice(0, 8)}
        </Link>
    );
}

export function renderWorkflowNameCell({ cell }: { cell: Cell }) {
    const name: string = cell.value;
    const pid: string = cell.row.values.hasOwnProperty("pid") ? cell.row.values.pid : undefined;

    return (
        <Link
            id={`process-detail-${pid}`}
            key={pid}
            onClick={(e) => e.stopPropagation()}
            to={`/processes/${pid}`}
            title={name}
        >
            {name}
        </Link>
    );
}

export function renderSubscriptionDescriptionCell({ cell }: { cell: Cell }) {
    const name: string = cell.value;
    const subscription_id: string = cell.row.values.hasOwnProperty("subscription_id")
        ? cell.row.values.subscription_id
        : undefined;
    return (
        <Link
            id={`subscription-detail-${subscription_id}`}
            key={subscription_id}
            onClick={(e) => e.stopPropagation()}
            to={`/subscriptions/${subscription_id}`}
            title={name}
        >
            {name}
        </Link>
    );
}

export function renderSubscriptionIdCell({ cell }: { cell: Cell }) {
    const subscriptionID: string = cell.value;
    return (
        <Link
            key={subscriptionID}
            onClick={(e) => e.stopPropagation()}
            to={`/subscriptions/${subscriptionID}`}
            title={subscriptionID}
        >
            {subscriptionID.slice(0, 8)}
        </Link>
    );
}

export function renderInsyncCell({ cell }: { cell: Cell }) {
    const insync: boolean = cell.value;
    return <i className={`${insync ? "fa fa-check-square" : "far fa-square"}`} />;
}

export function renderProductTagCell({ cell }: { cell: Cell }) {
    const subscriptions: Subscription[] = cell.value;
    return uniq(
        subscriptions.map((subscription: Subscription) => {
            return subscription.product.tag;
        })
    ).join(", ");
}

export function renderSubscriptionTagCell({ cell }: { cell: Cell }) {
    const product: Product = cell.value;
    return product.tag;
}

export function renderCustomersCelliv2(organisations: Organization[] | null | undefined, abbreviate: boolean) {
    function lookup(uuid: string) {
        if (organisations === null || organisations === undefined) {
            return intl.formatMessage({ id: abbreviate ? "unavailable_abbreviated" : "unavailable" });
        }
        const organisation: Organization | undefined = organisations.find((org) => org.uuid === uuid);
        return organisation ? (abbreviate ? organisation.abbr : organisation.name) : uuid;
    }

    return function doRenderCustomersCell({ cell }: { cell: Cell }) {
        const subscriptions: Subscription[] = cell.value;
        return uniq(subscriptions.map((subscription) => subscription.customer_id))
            .map(lookup)
            .join(", ");
    };
}
