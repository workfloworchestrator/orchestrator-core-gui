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

import { isEmpty } from "./Utils";
import { Organization, SubscriptionWithDetails, Product } from "./types";

export function organisationNameByUuid(uuid: string, organisations: Organization[]) {
    const organisation = organisations.find(org => org.uuid === uuid);
    return organisation ? organisation.name : uuid;
}

export function enrichSubscription(
    subscription: Partial<SubscriptionWithDetails>,
    organisations: Organization[],
    products: Product[]
) {
    subscription.customer_name = organisationNameByUuid(subscription.customer_id!, organisations);
    subscription.product = productById(subscription.product_id!, products);
    subscription.end_date_epoch = subscription.end_date ? new Date(subscription.end_date).getTime() : 0;
    subscription.start_date_epoch = subscription.start_date ? new Date(subscription.start_date).getTime() : 0;
}

export function productNameById(id: string, products: Product[]): string {
    const product = productById(id, products);
    return product ? product.name : id;
}

export function productTagById(id: string, products: Product[]): string {
    const product = productById(id, products);
    return product ? product.tag : id;
}

export function productById(id: string, products: Product[]): Product {
    return products.find(prod => prod.product_id === id)!;
}

export function renderDateTime(epoch: number) {
    return isEmpty(epoch) ? "" : new Date(epoch * 1000).toLocaleString("nl-NL") + " CET";
}

export function renderDate(epoch: number) {
    return isEmpty(epoch) ? "" : new Date(epoch * 1000).toLocaleDateString("nl-NL") + " CET";
}

export function capitalize(s: string) {
    return isEmpty(s) ? "" : s.charAt(0).toUpperCase() + s.slice(1);
}

// prefix states are returned as int by IPAM. At each index of the array below the state label is returned.
// The unused states are set to null
// Free and Failed are fake states for frontend use only
// 0 Free 1 Allocated  2 (Expired) 3 Planned 4 (Reserved) 5 (Suspend)
export const ipamStates = ["Free", "Allocated", null, "Planned", null, null];

// AFI returned by IPAM as index in this array returns IPv4 for 4 and IPv6 for 6 and "N/A" for other cases
//                             0      1      2      3      4       5      6
export const familyFullName = ["N/A", "N/A", "N/A", "N/A", "IPv4", "N/A", "IPv6"];

export function ipAddressToNumber(ipAddress: string) {
    const octets = ipAddress.split(".");
    if (octets.length === 4) {
        return (
            parseInt(octets[0], 10) * 16777216 +
            parseInt(octets[1], 10) * 65536 +
            parseInt(octets[2], 10) * 256 +
            parseInt(octets[3], 10)
        );
    } else {
        const hextets = ipAddress.split(":");
        var power;
        var result = 0;
        for (power = 128 - 16; hextets.length > 0; power = power - 16) {
            var hextet = parseInt(hextets[0], 16);
            if (!isNaN(hextet)) {
                result += hextet * 2 ** power;
            }
            hextets.shift();
        }
        return result;
    }
}
