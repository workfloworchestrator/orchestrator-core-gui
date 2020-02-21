import axios from "axios";
import { FilterArgument } from "../utils/types";
import { CommaSeparatedStringArrayParam } from "../utils/QueryParameters.js";
import { SortingRule } from "react-table";
import { setFlash } from "../utils/Flash";

var axiosInstance = axios.create({ baseURL: "/api/v2/" });

export const cancel = axios.CancelToken.source();

function getHeaders(eTag?: string | null) {
    const token = localStorage.getItem("access_token");
    const authHeader = token ? { Authorization: `bearer ${token}` } : {};
    const ifNoneMatchHeader = eTag ? { "If-None-Match": eTag } : {};
    return { ...authHeader, ...ifNoneMatchHeader };
}

export function filterableEndpoint(
    path: string,
    startRow: number,
    endRow: number,
    sortBy: SortingRule<string>[],
    filterBy: FilterArgument[],
    eTag?: string | null
) {
    const requestHeaders = getHeaders(eTag);
    const range = CommaSeparatedStringArrayParam.encode([startRow, endRow]);
    const sort = CommaSeparatedStringArrayParam.encode(
        sortBy.map(({ id, desc }) => (desc ? [id, "desc"] : [id, "asc"])).flat()
    );
    const filter = CommaSeparatedStringArrayParam.encode(
        filterBy.map(({ id, values }) => [id, values.join("-")]).flat()
    );
    const extractResponseHeaders = (headers: any) => {
        const etag: string | undefined = headers["etag"];
        const contentRange: string | undefined = headers["content-range"];
        const total = contentRange ? parseInt(contentRange.split("/")[1], 10) : 99;
        return [total, etag];
    };

    return axiosInstance
        .get(path, {
            headers: requestHeaders,
            params: {
                range: range,
                sort: sort,
                filter: filter
            },
            validateStatus: (status: number) => (status >= 200 && status < 300) || status === 304,
            cancelToken: cancel.token
        })
        .then(
            response => {
                switch (response.status) {
                    case 200:
                        return [response.data, ...extractResponseHeaders(response.headers)];
                    case 304:
                        return [null, ...extractResponseHeaders(response.headers)];
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
                        `${error.config.baseURL}${path} returned with HTTP status ${error.response.status}: ${
                            error.response.statusText
                        }`,
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
