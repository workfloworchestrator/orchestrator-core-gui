import { Context, randomIds } from "uniforms";

import createSchema from "./_createSchema";

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
