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

import { getParameterByName, getQueryParameters } from "utils/QueryParameters";

test("Parameter by name", () => {
    expect(getParameterByName("name", "?name=value")).toBe("value");
});

test("Parameter by name not exists", () => {
    expect(getParameterByName("", undefined)).toBe("");
});

test("Return query parameters as objects", () => {
    const params = getQueryParameters("?vis=zeebaars&huisdier=hond&huisdier=kat");
    expect(params.vis).toBe("zeebaars");
    expect(params.huisdier.length).toBe(2);
});
