import axios from "axios";
import { ProcessV2, FilterArgument }  from "../utils/types";
import { CommaSeparatedStringArrayParam } from "../utils/QueryParameters.js";
import { SortingRule } from "react-table";

//function doFetch(path, options, headers = {}, showErrorDialog = true, validator) {
    //const access_token = localStorage.getItem("access_token");
    //const contentHeaders = {
        //Accept: "application/json",
        //"Content-Type": "application/json",
        //Authorization: `bearer ${access_token}`,
        //...headers
    //};
    //const fetchOptions = Object.assign({}, { headers: contentHeaders }, options, {
        //credentials: "same-origin",
        //redirect: "manual"
    //});

	//return fetch(path, fetchOptions).
//}

//function fetchFilterableWrapper(endpoint) {
    //function fetchFilterable(startRow, endRow, sortBy, filterBy) {
        //const range = `${startRow},${endRow}`;
        //const sort = sortBy.map(({ id, desc }) => `${id},${desc ? "desc" : "asc"}`).join(",");
        //const filter = filterBy.map(({ id, values }) => `${id},${values.join("-")}`).join(",");
        //return fetch(`${endpoint}?range=${range}&sort=${sort}&filter=${filter}`);
    //}
    //return fetchFilterable;
//}

//export const processesFilterable = fetchFilterableWrapper("v2/processes");

var axiosInstance = axios.create();
// axiosInstance.defaults.headers.common["Accept"] = "application/json";
// axiosInstance.defaults.headers.common["Content-Type"] = "application/json";



function getHeaders(eTag?: string | null) {
	const token = localStorage.getItem("access_token")
	const authHeader = token ? { Authorization: `bearer ${token}` } : {};
	const ifNoneMatchHeader = eTag ? { "If-None-Match": eTag } : {};
	return {...authHeader, ...ifNoneMatchHeader}
}


export function filterableEndpoint(path: string, startRow: number, endRow: number, sortBy: SortingRule<string>[], filterBy: FilterArgument[], eTag?: string | null) {
	const requestHeaders = getHeaders(eTag);
        const range = `${startRow},${endRow}`;
        const sort = CommaSeparatedStringArrayParam.encode(sortBy.map(({ id, desc }) => desc ? [id, "desc"] : [id, "asc"]).flat());
        const filter = filterBy.map(({ id, values }) => `${id},${values.join("-")}`).join(",");
	const extractResponseHeaders = (headers: any) => {
		const etag: string | undefined = headers["etag"];
		const contentRange: string | undefined = headers["content-range"];
		const total = contentRange ? parseInt(contentRange.split("/")[1], 10): 99;
		return [total, etag];
	}
	return axiosInstance.get(path, {
		headers: requestHeaders,
		params: {
			range: range,
			sort: sort,
			filter: filter,
		},
		validateStatus: (status: number) => ((status >= 200 && status <300) || (status === 304)),
	}).then(response => {
		switch (response.status) {
			case 200:
				return [response.data, ...extractResponseHeaders(response.headers)];
			case 304:
				return [null, ...extractResponseHeaders(response.headers)];
			default:
				return Promise.reject(response);
		}
	})
}

export const processesFilterable = filterableEndpoint.bind(null, "/api/v2/processes");
