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

import { cancel, filterableEndpoint } from "api/filterable";
import { useCallback, useRef, useState } from "react";
import { SortingRule } from "react-table";
import { FilterArgument } from "utils/types";

interface IFetchData {
    (pageIndex: number, pageSize: number, sortBy: SortingRule<string>[], filterBy: FilterArgument[]): void;
}

function useFailedTaskFetcher<T extends object>(endpoint: string): [T[], number, IFetchData] {
    const [pageCount, setPageCount] = useState(0);
    const [data, setData] = useState<T[]>([]);
    /*
     * fetchIdRef is used to track refreshes and prevent older fetches to overwrite data from newer fetches
     * entityTag is generated server side to be able to return 304 when there are no changes
     */
    const fetchIdRef = useRef(0);
    const entityTag = useRef<string | null>(null);
    const fetchData = useCallback(
        (pageIndex, pageSize, sortBy, filterBy) => {
            const fetchId = ++fetchIdRef.current;
            const startRow = pageSize * pageIndex;
            const endRow = startRow + pageSize;

            filterableEndpoint<T>(endpoint, startRow, endRow, sortBy, filterBy, entityTag.current)
                .then(([processes, total, eTag]) => {
                    // Only update the data if this is the latest fetch and processes is not null (in case of 304 NOT MODIFIED).
                    if (fetchId === fetchIdRef.current && processes) {
                        let pages = Math.ceil(total / pageSize);
                        setPageCount(pages);
                        setData(processes);
                        entityTag.current = eTag;
                    }
                })
                .catch((error) => {
                    // don't call dispatch on cancellation, the hook was unmounted.
                });
            return () => {
                fetchIdRef.current = 0;
                entityTag.current = null;
                cancel.cancel();
            }; // clean up prevents state update after mount and 304 on return.
        },
        [endpoint]
    );
    return [data, pageCount, fetchData];
}

export default useFailedTaskFetcher;
