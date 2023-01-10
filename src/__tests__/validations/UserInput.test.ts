/*
 * Copyright 2019-2023 SURF.
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

import { inValidVlan } from "validations/UserInput";

const test_vlanrange = (value, expected = true) => {
    const result = inValidVlan(value);
    expect(result).toBe(expected);
};

test("Validate VLAN range", () => {
    test_vlanrange("2, 43-4094", false);
});

test("Validate VLAN range strips", () => {
    test_vlanrange(" 2  , 3  ,  4,  6 - 1994 ", false);
});

test("Validate VLAN range with null", () => {
    test_vlanrange(null);
});

test("Validate invalid format vlan range", () => {
    test_vlanrange("a");
});

test("Validate start > end vlan range", () => {
    test_vlanrange("99-1");
});

test("Validate out of range too low vlan range", () => {
    test_vlanrange("1, 43-4094");
});

test("Validate out of range too high vlan range", () => {
    test_vlanrange("2, 43-4095");
});
