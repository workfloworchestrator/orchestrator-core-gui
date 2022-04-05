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

import React from "react";
import ApplicationContext, { ApplicationContextInterface } from "utils/ApplicationContext";

test("Test suite must contain at least one test", () => {});

// See https://github.com/enzymejs/enzyme/issues/2073#issuecomment-565736674
export default function withApplicationContext(
    component: JSX.Element,
    appContext: Partial<ApplicationContextInterface> = {}
) {
    return (
        <ApplicationContext.Provider value={appContext as ApplicationContextInterface}>
            {component}
        </ApplicationContext.Provider>
    );
}
