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

import { findValueFromInputStep } from "../../utils/NestedState";

test("Lookup existing name in user input", () => {
    const value = findValueFromInputStep("name", [{ name: "name", value: "value" }]);
    expect(value).toBe("value");
});

test("Lookup non-existing name in user input", () => {
    const value = findValueFromInputStep("name", [{ name: "nope", value: "value" }]);
    expect(value).toBe(null);
});

test("Lookup nested name in user input", () => {
    const value = findValueFromInputStep("nested.name", [{ name: "nested.name", value: "value" }]);
    expect(value).toBe("value");
});

test("Lookup non-existing nested name in user input", () => {
    const value = findValueFromInputStep("very.deep.nested.name", [{ name: "nope", value: "value" }]);
    expect(value).toBe(null);
});
