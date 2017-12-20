import {lookupValueFromNestedState} from "../../utils/NestedState";

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
