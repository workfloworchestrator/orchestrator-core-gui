import axios from "axios";
import { ProcessV2, FilterArgument } from "../utils/types";
import { CommaSeparatedStringArrayParam } from "../utils/QueryParameters.js";
import { SortingRule } from "react-table";
import { setFlash } from "../utils/Flash";

var axiosInstance = axios.create({ baseURL: "/api/" });

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
    const range = `${startRow},${endRow}`;
    const sort = CommaSeparatedStringArrayParam.encode(
        sortBy.map(({ id, desc }) => (desc ? [id, "desc"] : [id, "asc"])).flat()
    );
    const filter = filterBy.map(({ id, values }) => `${id},${values.join("-")}`).join(",");
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
            validateStatus: (status: number) => (status >= 200 && status < 300) || status === 304
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
                var message: string;
                if (error.response) {
                    message = `${error.config.baseURL}${error.config.path} returned with HTTP status ${
                        error.response.status
                    }: ${error.response.statusText}`;
                } else if (error.request) {
                    message = `${error.config.baseURL}${error.config.path} failed with status ${error.request.status}`;
                } else {
                    message = error.message;
                }
                setFlash(message, "error");
                console.log(message);

                return Promise.reject(error);
            }
        );
}

export const processesFilterable = filterableEndpoint.bind(null, "v2/processes");
