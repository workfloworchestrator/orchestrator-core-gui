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

import { paginatedSubscriptions } from "../api";
import { SortingRule, Filter } from "react-table";
import { Subscription } from "./types";

const encodeValue = (string: string) => {
    return encodeURIComponent(string.replace(/,/g, "_"));
};

export const requestSubscriptionData = (
    pageSize: number,
    page: number,
    sorted: SortingRule[],
    filtered: Filter[]
): Promise<{ rows: Subscription[]; pages: number }> => {
    console.log(`Requesting data -> Page: ${page}, pageSize: ${pageSize}`);
    // console.log(filtered);
    // console.log(sorted);
    // Todo: log filter and sort OBJECTS also

    const filter_parameters = filtered
        .map(item => {
            return `${item.id},${encodeValue(item.value)}`;
        })
        .join(",");
    const sort_parameters = sorted
        .map(item => {
            return `${item.id},${item.desc ? "desc" : "asc"}`;
        })
        .join(",");

    const paginate_query = `${page * (pageSize - 1)},${pageSize - 1 + page * (pageSize - 1)}`;
    const sort_query = sorted.length > 0 ? sort_parameters : "";
    const filter_query = filtered.length > 0 ? filter_parameters : "";

    return paginatedSubscriptions(paginate_query, sort_query, filter_query).then((results: Subscription[]) => {
        const res = {
            rows: results,
            pages: 99 // todo: get it from header
        };
        return res;
    });
};
