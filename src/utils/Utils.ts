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

import { isDate } from "date-fns";
import escape from "lodash/escape";

export function stop(e: React.SyntheticEvent) {
    if (e !== undefined && e !== null) {
        e.preventDefault();
        e.stopPropagation();
    }
}

export function isEmpty(obj: any) {
    if (obj === undefined || obj === null) {
        return true;
    }
    if (isDate(obj)) {
        return false;
    }
    if (Array.isArray(obj)) {
        return obj.length === 0;
    }
    if (typeof obj === "string") {
        return obj.trim().length === 0;
    }
    if (typeof obj === "object") {
        return Object.keys(obj).length === 0;
    }
    return false;
}

export function escapeDeep(obj: object) {
    if (!isEmpty(obj)) {
        Object.keys(obj).forEach(key => {
            // @ts-ignore
            const val = obj[key];
            if (typeof val === "string") {
                // @ts-ignore
                obj[key] = escape(val);
            } else if (typeof val === "object" || val instanceof Object) {
                escapeDeep(val);
            }
        });
    }
}

export function applyIdNamingConvention(value: string, prefix: string = "") {
    // Convert camel case to snake case with "-" and replace all "_" with "-"
    const result = value
        .split(/(?=[A-Z])/)
        .join("-")
        .replace(/_/g, "-")
        .toLowerCase();
    if (prefix) {
        return `${prefix}-${result}`;
    }
    return result;
}

const UUIDv4RegEx = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
export function isValidUUIDv4(id: string) {
    return UUIDv4RegEx.test(id);
}

export function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
