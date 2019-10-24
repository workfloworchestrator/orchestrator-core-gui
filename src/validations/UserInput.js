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

export function inValidVlan(vlan) {
    const value = vlan || "0";

    const stripped = value.toString().replace(/ /g, "");
    return !/^\d{1,4}(?:-\d{1,4})?(?:,\d{1,4}(?:-\d{1,4})?)*$/.test(stripped) || stripped.split(",").some(inValidRange);
}

const inValidRange = range => {
    if (range.indexOf("-") > -1) {
        const ranges = range.split("-");
        return ranges.some(inValidRange) || parseInt(ranges[0], 10) >= parseInt(ranges[1], 10);
    }
    return range < 2 || range > 4094;
};


