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
import { Search } from "history";
import {
    QueryParamConfig,
    decodeDelimitedArray,
    decodeDelimitedNumericArray,
    encodeDelimitedArray,
    encodeDelimitedNumericArray,
} from "use-query-params";

export interface LocationSearchHash {
    [index: string]: string[];
}

export interface LocationSearchSquashedHash {
    [index: string]: string[] | string;
}

const QueryParameter = {
    //shameless refactor of https://gist.githubusercontent.com/pduey/2764606/raw/e8b9d6099f1e4161f7dd9f81d71c2c7a1fecbd5b/querystring.js

    searchToHash: function (windowLocationSearch: Search): LocationSearchHash {
        const h: LocationSearchHash = {};
        if (windowLocationSearch === undefined || windowLocationSearch.length < 1) {
            return h;
        }
        const q = windowLocationSearch.slice(1).split("&");
        for (let i = 0; i < q.length; i++) {
            const keyVal = q[i].split("=");
            // replace '+' (alt space) char explicitly since decode does not
            const hkey = decodeURIComponent(keyVal[0]).replace(/\+/g, " ");
            const hval = decodeURIComponent(keyVal[1]).replace(/\+/g, " ");
            if (h[hkey] === undefined) {
                h[hkey] = [];
            }
            h[hkey].push(hval);
        }
        return h;
    },

    hashToSearch: function (newSearchHash: LocationSearchHash) {
        let search = "?";
        for (const key in newSearchHash) {
            if (newSearchHash.hasOwnProperty(key)) {
                for (let i = 0; i < newSearchHash[key].length; i++) {
                    search += search === "?" ? "" : "&";
                    search += encodeURIComponent(key) + "=" + encodeURIComponent(newSearchHash[key][i]);
                }
            }
        }
        return search;
    },
};

export function getParameterByName(name: string, windowLocationSearch: Search) {
    const replacedName = name.replace(/[[]/, "[").replace(/[\]]/, "\\]");
    const regex = new RegExp("[\\?&]" + replacedName + "=([^&#]*)"),
        results = regex.exec(windowLocationSearch);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

export function getQueryParameters(windowLocationSearch: Search): LocationSearchSquashedHash {
    const params = QueryParameter.searchToHash(windowLocationSearch);
    var squashed: LocationSearchSquashedHash = {};
    for (const [key, val] of Object.entries(params)) {
        if (val.length === 1) {
            squashed[key] = val.pop()!;
        } else {
            squashed[key] = val;
        }
    }
    return squashed;
}

export const CommaSeparatedNumericArrayParam: QueryParamConfig<number[] | undefined> = {
    encode: (value?: number[]) => encodeDelimitedNumericArray(value, ","),
    //@ts-ignore
    decode: (strValue: string | string[]) => decodeDelimitedNumericArray(strValue, ","),
};

export const CommaSeparatedStringArrayParam: QueryParamConfig<string[] | undefined> = {
    encode: (value?: string[]) => encodeDelimitedArray(value, ","),
    //@ts-ignore
    decode: (strValue: string | string[]) => decodeDelimitedArray(strValue, ","),
};
