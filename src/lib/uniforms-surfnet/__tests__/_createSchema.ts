import SimpleSchema from "simpl-schema";
import { SimpleSchema2Bridge } from "uniforms-bridge-simple-schema-2";

test("Test suite must contain at least one test", () => {});

export default function createSchema(schema: {}) {
    return new SimpleSchema2Bridge(new SimpleSchema(schema));
}
