import {isEmpty} from "./Utils";

export function lookupValueFromProcessState(key, state) {
    if (isEmpty(state)) {
        //It is contract to return null as values from process state may not yet be initialized
        return null;
    }
    const parts = key.split(".");
    return parts.reduce((acc, e) => acc[e], state);
}
