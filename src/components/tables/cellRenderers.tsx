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

import { EuiListGroup } from "@elastic/eui";
import ProcessTableModal from "components/modals/ProcessTableCellModal";
import { intl } from "locale/i18n";
import uniq from "lodash/uniq";
import moment from "moment-timezone";
import { Link } from "react-router-dom";
import { Cell } from "react-table";
import { Organization, Product, Subscription } from "utils/types";

const LIST_MAX_LENGTH = 3; // Max length of lists before they're converted to modals

/**
 * _formatModalButtonTitle - Formats the button title properly
 * adding (s) for pluralization.
 *
 * @param title {string} the modal button title
 * @returns a properly formatted title
 */
const _formatModalButtonTitle = (title: string) => {
    return `${title.replace("(s)", "")}(s)`;
};

export function renderSubscriptionsCell({ cell }: { cell: Cell }) {
    const subscriptions: Subscription[] = cell.value;
    const { Header } = cell?.column;
    const subscriptionList = (
        <EuiListGroup
            listItems={subscriptions.map((subscription: Subscription) => {
                return {
                    label: subscription.description,
                    href: `/subscriptions/${subscription.subscription_id}`,
                };
            })}
            color="primary"
            size="s"
        />
    );

    return subscriptions.length > LIST_MAX_LENGTH ? (
        <ProcessTableModal
            title={`${Header}`}
            buttonTitle={_formatModalButtonTitle(`Show ${subscriptions.length} ${Header}`)}
        >
            {subscriptionList}
        </ProcessTableModal>
    ) : (
        <>{subscriptionList}</>
    );
}

export function renderProductsCell({ cell }: { cell: Cell }) {
    const subscriptions: Subscription[] = cell.value;
    const { Header } = cell?.column;
    const productNames = uniq(subscriptions.map((subscription: Subscription) => subscription.product.name)).map(
        (product_name, idx) => {
            return {
                label: product_name,
            };
        }
    );

    const productNamesList = <EuiListGroup listItems={productNames} size="s" />;

    return productNames.length > LIST_MAX_LENGTH ? (
        <ProcessTableModal
            title={`${Header}`}
            buttonTitle={_formatModalButtonTitle(`Show ${productNames.length} ${Header}`)}
        >
            {productNamesList}
        </ProcessTableModal>
    ) : (
        <>{productNamesList}</>
    );
}

export function renderSubscriptionProductsCell({ cell }: { cell: Cell }) {
    const product: Product = cell.value;
    return product.name;
}

export function renderCustomersCell(organisations: Organization[] | null | undefined, abbreviate: boolean) {
    function lookup(uuid: string) {
        if (organisations === null || organisations === undefined) {
            return intl.formatMessage({
                id: abbreviate ? "unavailable_abbreviated" : "unavailable",
            });
        }
        const organisation: Organization | undefined = organisations.find((org) => org.uuid === uuid);
        return organisation ? (abbreviate ? organisation.abbr : organisation.name) : uuid;
    }

    return function doRenderCustomersCell({ cell }: { cell: Cell }) {
        const subscriptions: Subscription[] = cell.value;
        const { Header } = cell?.column;
        const customerIds = uniq(subscriptions.map((subscription) => subscription.customer_id)).map(lookup);
        const customerIdsList = (
            <EuiListGroup
                listItems={customerIds.map((customerId) => {
                    return {
                        label: customerId,
                    };
                })}
                size="s"
            />
        );

        return customerIds.length > LIST_MAX_LENGTH ? (
            <ProcessTableModal
                title={`${Header}`}
                buttonTitle={_formatModalButtonTitle(`Show ${customerIds.length} ${Header}`)}
            >
                {customerIdsList}
            </ProcessTableModal>
        ) : (
            <>{customerIdsList}</>
        );
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

export function renderTimestampCell({ cell }: { cell: Cell }): string | null {
    // Convert timestamp to ISO8601-like format.
    // Example:
    //   2023-07-12 15:16:32 CEST
    // if the date is in the past, only the ISO date string will be returned.
    if (!cell.value) {
        return null;
    }
    // get milliseconds for unix timestamp
    const time = moment(cell.value * 1000);
    // get timezone from translations object
    const timezone = intl.formatMessage({ id: "locale.timezone" });
    // if time is more than 24hr ago, show only date string
    const format = moment().diff(time, "hours") >= 24 ? "y-MM-DD" : "y-MM-DD HH:mm:ss z";

    return time.tz(timezone).format(format);
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
