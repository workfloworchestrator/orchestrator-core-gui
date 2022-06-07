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

import { isDate } from "date-fns";
import { flatten } from "lodash";
import isEqual from "lodash/isEqual";
import { lazy } from "react";

import { State } from "./types";

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

export function timeStampToDate(timestamp: number) {
    const datetime = new Date(timestamp * 1000);
    const today = new Date();
    if (
        datetime.getFullYear() === today.getFullYear() &&
        datetime.getMonth() === today.getMonth() &&
        datetime.getDay() === today.getDay()
    ) {
        return datetime.toLocaleTimeString("nl-NL").substring(0, 5) + " CET";
    } else {
        return datetime.toLocaleDateString("nl-NL");
    }
}

export function capitalizeFirstLetter(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

export const importPlugin = (plugin: string) =>
    lazy(() => import(`custom/plugins/${plugin}`).catch(() => import(`components/RenderNull`)));

export const stateDelta = (prev: State, curr: State) => {
    const prevOrEmpty = prev ?? {};
    const prevKeys = Object.keys(prevOrEmpty);
    const currKeys = Object.keys(curr);
    const newKeys = currKeys.filter((key) => prevKeys.indexOf(key) === -1 || !isEqual(prevOrEmpty[key], curr[key]));
    const newState = newKeys.sort().reduce((acc: State, key) => {
        if (curr[key] === Object(curr[key]) && !Array.isArray(curr[key]) && prevOrEmpty[key]) {
            acc[key] = stateDelta(prevOrEmpty[key], curr[key]);
        } else {
            acc[key] = curr[key];
        }
        return acc;
    }, {});
    return newState;
};

export function findObjects(obj: Object, targetProp: string) {
    let finalResult: any[] = [];
    function getObject(theObject: any) {
        for (let prop in theObject) {
            if (theObject.hasOwnProperty(prop)) {
                if (prop === targetProp) {
                    finalResult.push(theObject[prop]);
                }
                if (theObject[prop] instanceof Object || theObject[prop] instanceof Array) {
                    getObject(theObject[prop]);
                }
            }
        }
    }

    getObject(obj);
    if (finalResult.length) {
        return flatten(finalResult)
    }
    return [];
}
