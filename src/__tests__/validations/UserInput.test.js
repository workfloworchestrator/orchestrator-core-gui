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

import { doValidateUserInput } from "../../validations/UserInput";

const test_vlanrange = (value, expected = true) => {
    const errors = {};
    doValidateUserInput({ type: "vlan_range", name: "t" }, value, errors);
    expect(errors["t"]).toBe(expected);
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

const test_stp = (value, expected = true) => {
    const errors = {};
    doValidateUserInput({ type: "stp", name: "my_stp_input" }, value, errors);
    expect(errors["my_stp_input"]).toBe(expected);
};

test("Validate empty STP", () => {
    test_stp(undefined, true);
    test_stp(null, true);
    test_stp("", true);
});

test("Validate a valid STP", () => {
    test_stp("urn:ogf:network:surfnet.nl:1990:surfnet8:source?vlan=2", false);
});

test("Validate STP with vlan range", () => {
    test_stp("urn:ogf:network:surfnet.nl:1990:surfnet8:source?vlan=2-4095", false);
});

test("Validate STP without vlan label", () => {
    test_stp("urn:ogf:network:surfnet.nl:1990:surfnet8:source", true);
});

test("Validate STP with invalid local part", () => {
    test_stp("urn:ogf:network:surfnet.nl?vlan=2", true);
});

test("Validate STP without urn:ogf:network prefix", () => {
    test_stp("urn:surfnet.nl:1990:surfnet8:source?vlan=2", true);
});

const test_ip_block = (testPattern, expected = true) => {
    const errors = {};
    let value = [{ display_value: testPattern }];
    doValidateUserInput({ type: "ip_blocks", name: "my_ipblock_input" }, value, errors);
    expect(errors["my_ipblock_input"]).toBe(expected);
};
