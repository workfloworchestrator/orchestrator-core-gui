import { isEmpty } from "./Utils";

export function findValueFromInputStep(key, userInputArray) {
    if (isEmpty(key) || isEmpty(userInputArray)) {
        return null;
    }
    const relatedUserInput = userInputArray.find(input => input.name === key);
    return relatedUserInput ? relatedUserInput.value : null;
}
