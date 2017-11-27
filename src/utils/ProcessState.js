export function lookupValueFromProcessState(key, state) {
    const parts = key.split(".");
    return parts.reduce((acc, e) => acc[e], state);
}
