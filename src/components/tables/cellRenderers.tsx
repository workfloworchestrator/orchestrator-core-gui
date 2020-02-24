import React from "react";
import { Organization, Subscription } from "../../utils/types";
import uniq from "lodash/uniq";
import { Cell } from "react-table";

export function renderSubscriptionsCell({ cell }: { cell: Cell }) {
    const subscriptions: Subscription[] = cell.value;
    return subscriptions.map((subscription: Subscription) => {
        return (
            <p key={subscription.subscription_id}>
                <a href={`/subscription/${subscription.subscription_id}`}>{subscription.description}</a>
            </p>
        );
    });
}

export function renderProductsCell({ cell }: { cell: Cell }) {
    const subscriptions: Subscription[] = cell.value;
    return uniq(
        subscriptions.map((subscription: Subscription) => subscription.product.name)
    ).map((product_name, idx) => <p key={`product_${idx}`}>{product_name}</p>);
}

export function renderCustomersCell(organisations: Organization[], abbreviate: boolean) {
    function lookup(uuid: string) {
        const organisation: Organization | undefined = organisations.find(org => org.uuid === uuid);
        return organisation ? (abbreviate ? organisation.abbr : organisation.name) : uuid;
    }
    return function doRenderCustomersCell({ cell }: { cell: Cell }) {
        const subscriptions: Subscription[] = cell.value;
        return uniq(subscriptions.map(subscription => subscription.customer_id))
            .map(lookup)
            .join(", ");
    };
}

export function renderTimestampCell({ cell }: { cell: Cell }) {
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
        <a href={`/process/${pid}`} title={pid}>
            {pid.slice(0, 8)}
        </a>
    );
}

export function renderProductTagCell({ cell }: { cell: Cell }) {
    const subscriptions: Subscription[] = cell.value;
    return uniq(
        subscriptions.map((subscription: Subscription) => {
            return subscription.product.tag;
        })
    ).join(", ");
}
