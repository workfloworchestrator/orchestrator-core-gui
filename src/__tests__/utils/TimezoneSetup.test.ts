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
describe("Timezones", () => {
    it("should always be Europe/Amsterdam", () => {
        expect(new Date(300000000).getTimezoneOffset()).toBe(-60);
    });

    // This test is needed to ensure that your system uses the same locale setting as that of the CI.
    // When this test fails, it means that locally a different timestamp is being used.
    // See, for example, the snapshot for the subscription-detail page.
    it("Formatting should be us-en in test because we run on node with crippeled date support", () => {
        expect(new Date(300000000).toLocaleString("nl-NL")).toBe("4-1-1970 12:20:00");
    });
});
