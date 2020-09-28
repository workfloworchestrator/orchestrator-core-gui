import createSchema from "lib/uniforms-surfnet/__tests__/_createSchema";
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
import { Context, randomIds } from "uniforms";

test("Test suite must contain at least one test", () => {});

const randomId = randomIds();

export default function createContext(schema: {} = {}, context?: Partial<Context<{}>>): { context: Context<{}> } {
    return {
        context: {
            changed: false,
            changedMap: {},
            error: null,
            model: {},
            name: [],
            onChange() {},
            onSubmit() {},
            randomId,
            submitting: false,
            validating: false,
            ...context,
            schema: createSchema(schema),
            state: {
                disabled: false,
                label: false,
                placeholder: false,
                showInlineError: false,
                ...context?.state
            }
        }
    };
}
