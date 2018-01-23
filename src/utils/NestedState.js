import {isEmpty} from "./Utils";

export function lookupValueFromNestedState(key, state) {
    if (isEmpty(state) || isEmpty(key)) {
        //It is contract to return null as values from process state may not yet be initialized
        return null;
    }
    const parts = key.split(".");
    return parts.reduce((acc, e) => {
        if (isEmpty(acc)) {
            return null;
        }
        return acc[e];
    }, state);
}

export function findValueFromInputStep(key, userInputArray) {
    if (isEmpty(key) || isEmpty(userInputArray)) {
        return null;
    }
    const relatedUserInput = userInputArray.find(input => input.name === key);
    return relatedUserInput ? relatedUserInput.value : null;
}


