import {lookupValueFromProcessState} from "../../utils/ProcessState";

test("Lookup existing key in process state", () => {
    const value = lookupValueFromProcessState("key", {key: "value"});
    expect(value).toBe("value")
});

test("Lookup non-existing key in process state", () => {
    const value = lookupValueFromProcessState("key", {});
    expect(value).toBe(null);
});

test("Lookup nested key in process state", () => {
    const value = lookupValueFromProcessState("sub.key", {sub: {key: "value"}})
    expect(value).toBe("value")
});
