import { randomIds } from "uniforms";

import { UniformContext, _UniformContext } from "../src/utils";
import createSchema from "./_createSchema";

const randomId = randomIds();

test("Test suite must contain at least one test", () => {});

export default function createContext(schema: {}, context?: Partial<_UniformContext>): { context: UniformContext } {
    return {
        context: {
            uniforms: {
                error: null,
                model: {},
                name: [],
                onChange() {},
                onSubmit() {},

                ...context,

                randomId,
                schema: createSchema(schema),
                state: {
                    changedMap: {},

                    changed: false,
                    submitting: false,
                    disabled: false,
                    label: false,
                    placeholder: false,
                    showInlineError: false,

                    ...(context && context.state)
                }
            }
        }
    };
}
