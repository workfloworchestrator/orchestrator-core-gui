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
export function isRepeatedField(name: string) {
    // Todo write a test
    let isNested: boolean = false;
    if (name.includes(".")) {
        const splittedName: string[] = name.split(".");
        if (splittedName.length > 1 && splittedName.length < 4) {
            if (parseInt(splittedName[1]) > 0) {
                isNested = true;
            }
        } else if (splittedName.length === 4) {
            if (parseInt(splittedName[2]) > 0) {
                isNested = true;
            }
        }
    }
    return isNested;
}
