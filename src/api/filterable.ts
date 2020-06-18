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
import { getAuthorizationHeaderValue } from "api";
import axios from "axios";
import { ENV } from "env";
import { SortingRule } from "react-table";
import { setFlash } from "utils/Flash";
import { CommaSeparatedNumericArrayParam, CommaSeparatedStringArrayParam } from "utils/QueryParameters";
import { FilterArgument } from "utils/types";

var axiosInstance = axios.create({ baseURL: ENV.BACKEND_URL + "/api/v2/" });

export const cancel = axios.CancelToken.source();

function getHeaders(eTag?: string | null) {
    const ifNoneMatchHeader = eTag ? { "If-None-Match": eTag } : {};
    return { Authorization: getAuthorizationHeaderValue(), ...ifNoneMatchHeader };
}

interface Params {
    range?: string;
    sort?: string;
    filter?: string;
}

export function filterableEndpoint<T>(
    path: string,
    startRow: number | null,
    endRow: number | null,
    sortBy: SortingRule<string>[] | null,
    filterBy: FilterArgument[],
    eTag?: string | null
) {
    const requestHeaders = getHeaders(eTag);
    let params: Params = {};
    if (startRow !== null && endRow !== null) {
        params["range"] = CommaSeparatedNumericArrayParam.encode([startRow, endRow]) as string;
    }
    if (sortBy !== null) {
        params["sort"] = CommaSeparatedStringArrayParam.encode(
            sortBy.map(({ id, desc }) => (desc ? [id, "desc"] : [id, "asc"])).flat()
        ) as string;
    }
    if (filterBy !== null) {
        params["filter"] = CommaSeparatedStringArrayParam.encode(
            filterBy.map(({ id, values }) => [id, values.join("-")]).flat()
        ) as string;
    }
    const extractResponseHeaders = (headers: any) => {
        const etag: string | undefined = headers["etag"];
        const contentRange: string | undefined = headers["content-range"];
        const total = contentRange ? parseInt(contentRange.split("/")[1], 10) : 99;
        return [total, etag];
    };
    return axiosInstance
        .get(path, {
            headers: requestHeaders,
            params,
            validateStatus: (status: number) => (status >= 200 && status < 300) || status === 304,
            cancelToken: cancel.token
        })
        .then(
            response => {
                switch (response.status) {
                    case 200:
                        return [response.data, ...extractResponseHeaders(response.headers)] as [
                            T[],
                            number,
                            string | null
                        ];
                    case 304:
                        return [null, ...extractResponseHeaders(response.headers)] as [null, number, string | null];
                    default:
                        return Promise.reject(response);
                }
            },
            error => {
                if (axios.isCancel(error)) {
                    console.log(`Request canceled: ${error.message}`);
                    // don't set a message to flash, we are canceled.
                } else if (error.response) {
                    setFlash(
                        `${error.config.baseURL}${path} returned with HTTP status ${error.response.status}: ${error.response.statusText}`,
                        "error"
                    );
                } else if (error.request) {
                    setFlash(`${error.config.baseURL}${path} failed with status ${error.request.status}`, "error");
                } else {
                    setFlash(error.message, "error");
                }

                return Promise.reject(error);
            }
        );
}
