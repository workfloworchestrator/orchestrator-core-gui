import axios from "axios";
import { SortingRule } from "react-table";
import { setFlash } from "utils/Flash";
import { CommaSeparatedNumericArrayParam, CommaSeparatedStringArrayParam } from "utils/QueryParameters";
import { FilterArgument } from "utils/types";

var axiosInstance = axios.create({ baseURL: "/api/v2/" });

export const cancel = axios.CancelToken.source();

function getHeaders(eTag?: string | null) {
    const token = localStorage.getItem("access_token");
    const authHeader = token ? { Authorization: `bearer ${token}` } : {};
    const ifNoneMatchHeader = eTag ? { "If-None-Match": eTag } : {};
    return { ...authHeader, ...ifNoneMatchHeader };
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
