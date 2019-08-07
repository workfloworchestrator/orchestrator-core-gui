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
