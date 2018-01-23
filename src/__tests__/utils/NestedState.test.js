import {lookupValueFromNestedState, findValueFromInputStep} from "../../utils/NestedState";

test("Lookup existing key in process state", () => {
    const value = lookupValueFromNestedState("key", {key: "value"});
    expect(value).toBe("value")
});

test("Lookup non-existing key in process state", () => {
    const value = lookupValueFromNestedState("key", {});
    expect(value).toBe(null);
});

test("Lookup nested key in process state", () => {
    const value = lookupValueFromNestedState("sub.key", {sub: {key: "value"}});
    expect(value).toBe("value")
});

test("Lookup non-existing nested key in process state", () => {
    const value = lookupValueFromNestedState("sub.key.very.deeply.nested", {"nope":"value"});
    expect(value).toBe(null)
});

test("Lookup existing name in user input", () => {
    const value = findValueFromInputStep("name", [{name: "name", value:"value"}]);
    expect(value).toBe("value")
});

test("Lookup non-existing name in user input", () => {
    const value = findValueFromInputStep("name", [{name: "nope", value:"value"}]);
    expect(value).toBe(null);
});

test("Lookup nested name in user input", () => {
    const value = findValueFromInputStep("nested.name", [{name: "nested.name", value:"value"}]);
    expect(value).toBe("value")
});

test("Lookup non-existing nested name in user input", () => {
    const value = findValueFromInputStep("very.deep.nested.name", [{name: "nope", value:"value"}]);
    expect(value).toBe(null)
});
