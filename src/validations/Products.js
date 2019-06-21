import { isEmpty } from "../utils/Utils";

export function filterProductsByBandwidth(products, bandwidth) {
    return products.filter(prod => {
        const fixedInputs = prod.fixed_inputs;
        if (fixedInputs && !isEmpty(bandwidth)) {
            const speed = fixedInputs.find(fi => fi.name === "port_speed");
            if (speed && parseInt(speed.value, 10) < parseInt(bandwidth, 10)) {
                return false;
            }
        }
        return true;
    });
}

export const TARGET_CREATE = "CREATE";
export const TARGET_MODIFY = "MODIFY";
export const TARGET_TERMINATE = "TERMINATE";
