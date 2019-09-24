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

export function actionOptions(prefix, selectPrefix, statusProperty = "state") {
    //TODO scope on the context of logged in-user
    const select = {
        icon: "fa fa-search-plus",
        label: "select",
        action: selectPrefix
    };
    let options = [];
    const status = prefix[statusProperty];
    switch (status) {
        case 1:
            options = [];
            break;
        case 2:
            options = [];
            break;
        case 3: //Free
            options = [select];
            break;
        default:
            throw new Error(`Unknown status: ${status}`);
    }
    return options;
}
